const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);


// ======================================================
// REGISTER
// ======================================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Please provide name, email and password."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters."
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists."
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "CUSTOMER"
    });

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(201).json({
      message:
        "Registration successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      message:
        "Registration failed."
    });
  }
});


// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please provide email and password."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password."
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account uses Google login. Please continue with Google."
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      message:
        "Login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message:
        "Login failed."
    });
  }
});


// ======================================================
// GOOGLE LOGIN
// ======================================================

router.get("/google", (req, res) => {
  const authUrl =
    googleClient.generateAuthUrl({
      access_type: "offline",

      scope: [
        "openid",
        "email",
        "profile"
      ],

      prompt: "select_account"
    });

  res.redirect(authUrl);
});


// ======================================================
// GOOGLE CALLBACK
// ======================================================

router.get(
  "/google/callback",
  async (req, res) => {
    try {
      const {
        code
      } = req.query;

      if (!code) {
        return res.redirect(
          "http://localhost:5173/login?error=google_login_failed"
        );
      }

      const {
        tokens
      } =
        await googleClient.getToken(code);

      const ticket =
        await googleClient.verifyIdToken({
          idToken: tokens.id_token,
          audience:
            process.env.GOOGLE_CLIENT_ID
        });

      const payload =
        ticket.getPayload();

      const {
        sub: googleId,
        email,
        name,
        picture
      } = payload;

      if (!email) {
        return res.redirect(
          "http://localhost:5173/login?error=no_google_email"
        );
      }

      let user =
        await User.findOne({
          email: email.toLowerCase()
        });

      // Create new Google user
      if (!user) {
        user = await User.create({
          name:
            name || "TechNest User",

          email:
            email.toLowerCase(),

          googleId,

          avatar:
            picture || null,

          password: null,

          role: "CUSTOMER"
        });
      }

      // Connect Google to existing account
      else if (!user.googleId) {
        user.googleId = googleId;

        user.avatar =
          picture || user.avatar;

        await user.save();
      }

      const token =
        jwt.sign(
          {
            userId: user._id
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );

      res.redirect(
        `http://localhost:5173/login?token=${encodeURIComponent(
          token
        )}`
      );

    } catch (error) {
      console.error(
        "Google OAuth error:",
        error
      );

      res.redirect(
        "http://localhost:5173/login?error=google_login_failed"
      );
    }
  }
);


// ======================================================
// GET CURRENT USER
// ======================================================

router.get(
  "/me",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.userId
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found."
        });
      }

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        }
      });

    } catch (error) {
      console.error(
        "Fetch current user error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch user."
      });
    }
  }
);


module.exports = router;