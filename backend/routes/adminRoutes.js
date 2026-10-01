const express = require("express");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalProducts =
        await Product.countDocuments();

      const totalCustomers =
        await User.countDocuments({
          role: "CUSTOMER"
        });

      const totalOrders =
        await Order.countDocuments();

      const paidOrders =
        await Order.find({
          paymentStatus: "PAID"
        });

      const totalRevenue =
        paidOrders.reduce(
          (sum, order) =>
            sum + order.total,
          0
        );

      const pendingOrders =
        await Order.countDocuments({
          orderStatus: {
            $in: [
              "PLACED",
              "PROCESSING"
            ]
          }
        });

      res.json({
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue,
        pendingOrders
      });

    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load dashboard statistics."
      });
    }
  }
);


// ======================================================
// GET ALL PRODUCTS
// ======================================================

router.get(
  "/products",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const products =
        await Product.find().sort({
          createdAt: -1
        });

      res.json(products);

    } catch (error) {
      console.error(
        "Fetch admin products error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch products."
      });
    }
  }
);


// ======================================================
// ADD PRODUCT
// ======================================================

router.post(
  "/products",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        price,
        category,
        brand,
        image,
        description,
        stock
      } = req.body;

      if (
        !name ||
        price === undefined ||
        !category ||
        !brand ||
        !image ||
        !description
      ) {
        return res.status(400).json({
          message:
            "Please provide all required product details."
        });
      }

      if (Number(price) < 0) {
        return res.status(400).json({
          message:
            "Price cannot be negative."
        });
      }

      if (
        stock !== undefined &&
        Number(stock) < 0
      ) {
        return res.status(400).json({
          message:
            "Stock cannot be negative."
        });
      }

      const product =
        await Product.create({
          name: name.trim(),
          price: Number(price),
          category: category.trim(),
          brand: brand.trim(),
          image: image.trim(),
          description: description.trim(),
          stock:
            stock === undefined
              ? 10
              : Number(stock)
        });

      res.status(201).json({
        message:
          "Product created successfully.",
        product
      });

    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create product."
      });
    }
  }
);


// ======================================================
// UPDATE PRODUCT
// ======================================================

router.put(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        price,
        category,
        brand,
        image,
        description,
        stock
      } = req.body;

      if (
        !name ||
        price === undefined ||
        !category ||
        !brand ||
        !image ||
        !description ||
        stock === undefined
      ) {
        return res.status(400).json({
          message:
            "Please provide all product details."
        });
      }

      if (Number(price) < 0) {
        return res.status(400).json({
          message:
            "Price cannot be negative."
        });
      }

      if (Number(stock) < 0) {
        return res.status(400).json({
          message:
            "Stock cannot be negative."
        });
      }

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          {
            name: name.trim(),
            price: Number(price),
            category: category.trim(),
            brand: brand.trim(),
            image: image.trim(),
            description: description.trim(),
            stock: Number(stock)
          },
          {
            new: true,
            runValidators: true
          }
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found."
        });
      }

      res.json({
        message:
          "Product updated successfully.",
        product
      });

    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update product."
      });
    }
  }
);


// ======================================================
// DELETE PRODUCT
// ======================================================

router.delete(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found."
        });
      }

      res.json({
        message:
          "Product deleted successfully."
      });

    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete product."
      });
    }
  }
);


// ======================================================
// GET ALL CUSTOMERS
// ======================================================

router.get(
  "/customers",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const customers =
        await User.find({
          role: "CUSTOMER"
        })
          .select("-password")
          .sort({
            createdAt: -1
          });

      res.json(customers);

    } catch (error) {
      console.error(
        "Fetch customers error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch customers."
      });
    }
  }
);


// ======================================================
// GET ALL ORDERS
// ======================================================

router.get(
  "/orders",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const orders =
        await Order.find()
          .populate(
            "user",
            "name email"
          )
          .sort({
            createdAt: -1
          });

      res.json(orders);

    } catch (error) {
      console.error(
        "Fetch admin orders error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch orders."
      });
    }
  }
);

// Get recent AI order intelligence
router.get("/ai-insights", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      aiInsight: { $ne: null }
    })
      .populate("user", "name email")
      .sort({ "aiInsight.generatedAt": -1 })
      .limit(20)
      .select(
        "_id createdAt total orderStatus paymentStatus items user aiInsight"
      );

    res.json(orders);
  } catch (error) {
    console.error("Get AI insights error:", error);

    res.status(500).json({
      message: "Failed to fetch AI order insights."
    });
  }
});

module.exports = router;