const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found."
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required."
      });
    }

    req.admin = user;

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    res.status(500).json({
      message: "Failed to verify admin access."
    });
  }
};

module.exports = adminMiddleware;