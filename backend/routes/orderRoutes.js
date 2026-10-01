const express = require("express");

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// SEND ORDER EVENT TO N8N
// ======================================================

const sendOrderToN8n = async (orderId) => {
  try {
    if (!process.env.N8N_ORDER_WEBHOOK_URL) {
      console.log(
        "N8N_ORDER_WEBHOOK_URL is not configured."
      );

      return;
    }

    const order = await Order.findById(
      orderId
    ).populate(
      "user",
      "name email"
    );

    if (!order) {
      console.error(
        "Could not find order for n8n event."
      );

      return;
    }

    const payload = {
      event: "ORDER_CREATED",

      order: {
        id: order._id.toString(),

        createdAt:
          order.createdAt,

        status:
          order.orderStatus,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        subtotal:
          order.subtotal,

        deliveryCharge:
          order.deliveryCharge,

        total:
          order.total
      },

      customer: {
        id:
          order.user?._id?.toString() || null,

        name:
          order.user?.name || "Customer",

        email:
          order.user?.email || null
      },

      items: order.items.map(
        (item) => ({
          productId:
            item.product.toString(),

          name:
            item.name,

          quantity:
            item.quantity,

          price:
            item.price,

          total:
            item.price *
            item.quantity
        })
      )
    };

    const response = await fetch(
      process.env.N8N_ORDER_WEBHOOK_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify(
          payload
        )
      }
    );

    if (!response.ok) {
      console.error(
        `n8n webhook returned ${response.status}`
      );

      return;
    }

    console.log(
      "Order event successfully sent to n8n ✅"
    );

  } catch (error) {
    console.error(
      "n8n order automation error:",
      error.message
    );
  }
};


// ======================================================
// CREATE ORDER
// ======================================================

router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        items,
        shippingAddress,
        paymentMethod
      } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({
          message:
            "Your cart is empty."
        });
      }

      if (!shippingAddress) {
        return res.status(400).json({
          message:
            "Shipping address is required."
        });
      }

      // Fetch products from MongoDB
      // instead of trusting frontend prices.
      const productIds =
        items.map(
          (item) => item.product
        );

      const products =
        await Product.find({
          _id: {
            $in: productIds
          }
        });

      let subtotal = 0;

      const orderItems = [];

      for (
        const item of items
      ) {
        const product =
          products.find(
            (product) =>
              product._id.toString() ===
              item.product
          );

        if (!product) {
          return res.status(404).json({
            message:
              "One of the products no longer exists."
          });
        }

        if (
          item.quantity < 1 ||
          item.quantity >
            product.stock
        ) {
          return res.status(400).json({
            message:
              `${product.name} does not have enough stock.`
          });
        }

        subtotal +=
          product.price *
          item.quantity;

        orderItems.push({
          product:
            product._id,

          name:
            product.name,

          image:
            product.image,

          price:
            product.price,

          quantity:
            item.quantity
        });
      }

      const deliveryCharge = 0;

      const total =
        subtotal +
        deliveryCharge;

      const order =
        await Order.create({
          user:
            req.userId,

          items:
            orderItems,

          shippingAddress,

          subtotal,

          deliveryCharge,

          total,

          paymentMethod:
            paymentMethod ||
            "COD",

          paymentStatus:
            "PENDING",

          orderStatus:
            "PLACED"
        });

      // Reduce stock
      for (
        const item of items
      ) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock:
                -item.quantity
            }
          }
        );
      }

      // ------------------------------------------
      // SEND EVENT TO N8N
      // ------------------------------------------

      // We intentionally do not await this.
      // If n8n is unavailable, the order still succeeds.
      sendOrderToN8n(
        order._id
      );

      res.status(201).json({
        message:
          "Order placed successfully.",

        order
      });

    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create order."
      });
    }
  }
);


// ======================================================
// GET MY ORDERS
// ======================================================

router.get(
  "/my-orders",
  authMiddleware,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          user: req.userId
        }).sort({
          createdAt: -1
        });

      res.json(
        orders
      );

    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch orders."
      });
    }
  }
);

router.patch("/internal/ai-insight", async (req, res) => {
  try {
    const secret = req.headers["x-n8n-secret"];

    if (!secret || secret !== process.env.N8N_INTERNAL_SECRET) {
      return res.status(401).json({
        message: "Unauthorized."
      });
    }

    const {
      orderId,
      customerType,
      purchaseIntent,
      complementaryCategories,
      customerInsight,
      adminRecommendation,
      orderPriority
    } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "orderId is required."
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    order.aiInsight = {
      customerType: customerType || null,
      purchaseIntent: purchaseIntent || null,
      complementaryCategories: Array.isArray(complementaryCategories)
        ? complementaryCategories
        : [],
      customerInsight: customerInsight || null,
      adminRecommendation: adminRecommendation || null,
      orderPriority: ["LOW", "NORMAL", "HIGH"].includes(orderPriority)
        ? orderPriority
        : "NORMAL",
      generatedAt: new Date()
    };

    await order.save();

    res.json({
      message: "AI order insight saved successfully.",
      orderId: order._id,
      aiInsight: order.aiInsight
    });
  } catch (error) {
    console.error("Save AI insight error:", error);

    res.status(500).json({
      message: "Failed to save AI order insight."
    });
  }
});
// ======================================================
// GET SINGLE ORDER
// ======================================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const order = await Order.findById(
        req.params.id
      ).populate(
        "user",
        "name email"
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found."
        });
      }

      if (
        order.user._id.toString() !==
        req.userId
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to view this order."
        });
      }

      res.json(order);

    } catch (error) {
      console.error(
        "Get order error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch order."
      });
    }
  }
);

// ======================================================
// SIMULATED ONLINE PAYMENT
// ======================================================

router.patch(
  "/:id/simulate-payment",
  authMiddleware,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          message:
            "Order not found."
        });
      }

      if (
        order.user.toString() !==
        req.userId
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to update this order."
        });
      }

      if (
        order.paymentMethod !==
        "ONLINE"
      ) {
        return res.status(400).json({
          message:
            "This order does not use online payment."
        });
      }

      const {
        paymentResult
      } = req.body;

      if (
        ![
          "SUCCESS",
          "FAILED",
          "CANCELLED"
        ].includes(
          paymentResult
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid payment result."
        });
      }

      // ------------------------------------------
      // ALREADY PAID
      // ------------------------------------------

      if (
        order.paymentStatus ===
        "PAID"
      ) {
        return res.json({
          message:
            "Payment already completed.",

          order
        });
      }

      // ------------------------------------------
      // ALREADY CANCELLED
      // ------------------------------------------

      if (
        order.orderStatus ===
        "CANCELLED"
      ) {
        return res.status(400).json({
          message:
            "This order has already been cancelled."
        });
      }

      // ------------------------------------------
      // SUCCESS
      // ------------------------------------------

      if (
        paymentResult ===
        "SUCCESS"
      ) {
        order.paymentStatus =
          "PAID";

        order.orderStatus =
          "PLACED";

        await order.save();

        return res.json({
          message:
            "Payment successful.",

          order
        });
      }

      // ------------------------------------------
      // FAILED / CANCELLED
      // ------------------------------------------

      if (
        !order.stockRestored
      ) {
        for (
          const item of
          order.items
        ) {
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock:
                  item.quantity
              }
            }
          );
        }

        order.stockRestored =
          true;
      }

      // ------------------------------------------
      // FAILED PAYMENT
      // ------------------------------------------

      if (
        paymentResult ===
        "FAILED"
      ) {
        order.paymentStatus =
          "FAILED";

        order.orderStatus =
          "CANCELLED";
      }

      // ------------------------------------------
      // CANCELLED PAYMENT
      // ------------------------------------------

      if (
        paymentResult ===
        "CANCELLED"
      ) {
        order.paymentStatus =
          "PENDING";

        order.orderStatus =
          "CANCELLED";
      }

      await order.save();

      return res.json({
        message:
          paymentResult ===
          "FAILED"
            ? "Payment failed."
            : "Payment cancelled.",

        order
      });

    } catch (error) {
      console.error(
        "Payment simulation error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to process payment."
      });
    }
  }
);


module.exports = router;