// backend/src/controllers/order.js
const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const placeOrderSchema = require("../models/placeOrderModels");
const orderDetailsSchema = require("../models/orderDetailsModels");
const orderSchema = require("../models/orderModels");
const { logger, logToFirestore } = require("../config/firebase-config");

// Firestore database reference
const db = admin.firestore();

// Helper for consistent 400 responses (matches cart error shape)
const badRequest = (res, error) =>
  res.status(400).json({
    message: "Invalid input data",
    state: "error",
    details: error.details || [{ message: error.message }],
  });

// ---------- SPECIFIC ROUTES FIRST (avoid shadowing) ----------

// POST /api/orders/place-order - Checkout (strict validation like cart)
router.post("/place-order", async (req, res) => {
  console.log("Request body:", req.body);

  try {
    const { error, value } = placeOrderSchema.validate(req.body);
    if (error) {
      console.error("Validation Error:", error);
      return badRequest(res, error);
    }

    console.log("Validated request body:", value);
    const { items, ...order } = value;

    // Create a new order in Firestore
    const newOrderRef = db.collection("orders").doc();
    await newOrderRef.set(order);
    const orderId = newOrderRef.id;

    console.log("Order created in Firestore with ID:", orderId);

    // Map items to include the orderId and validate each against orderDetails model
    const orderDetails = items.map((item) => ({ ...item, orderId }));
    const validationErrors = [];

    orderDetails.forEach((item, index) => {
      const { error: itemError, value: validItem } = orderDetailsSchema.validate(item);
      if (itemError) {
        console.error(`Validation Error in item ${index}:`, itemError.details[0].message);
        validationErrors.push(`Item ${index}: ${itemError.details[0].message}`);
      } else {
        orderDetails[index] = validItem;
      }
    });

    if (validationErrors.length > 0) {
      console.error("Validation errors in order details:", validationErrors);
      return res.status(400).json({
        message: "Invalid order items",
        state: "error",
        details: validationErrors.map((m) => ({ message: m })),
      });
    }

    // Create a batch to write order details to Firestore
    const batch = db.batch();
    orderDetails.forEach((orderDetail) => {
      const orderDetailRef = db.collection("orderDetails").doc();
      batch.set(orderDetailRef, orderDetail);
    });

    await batch.commit();
    console.log("Order details written to Firestore");

    // Log success
    const logData = {
      timestamp: new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date()),
      orderId,
      action: "place_order",
      resource: `orders/${orderId}`,
      status: "success",
      userId: value.userId,
    };

    logger.info(logData);
    await logToFirestore(logData);

    return res.status(201).json({
      message: "Order created successfully",
      order,
      orderDetails,
      orderId,
    });
  } catch (error) {
    console.error("Error in /place-order:", error);

    const errorLogData = {
      timestamp: new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date()),
      action: "place_order",
      resource: "orders",
      status: "error",
      error: error.message || "Unknown error",
    };

    logger.error(errorLogData);
    await logToFirestore(errorLogData);

    return res.status(500).json({
      message: "Error creating order",
      error: error.message || "Unknown error",
    });
  }
});

// POST /api/orders/create-order - Non-checkout path (strict as well)
router.post("/create-order", async (req, res) => {
  const { error, value } = orderSchema.validate(req.body);

  if (error) {
    console.error("Validation Error:", error);
    return badRequest(res, error);
  }

  try {
    const newOrderRef = db.collection("orders").doc();
    await newOrderRef.set(value);
    const orderId = newOrderRef.id;

    res.status(201).json({
      message: "Order created successfully",
      order: value,
      orderId,
    });
    console.log("Order Id from order route: ", orderId);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Error creating order");
  }
});

// GET /api/orders/order/:orderId - Get order by document ID
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const orderDocRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: `Order with ID ${orderId} not found` });
    }

    const orderData = { orderId: orderDoc.id, ...orderDoc.data() };
    return res.status(200).json(orderData);
  } catch (error) {
    console.error("Error getting order by ID:", error);
    return res.status(500).send("Error getting order by ID");
  }
});

// ---------- GENERIC ROUTE LAST (avoid shadowing) ----------

// GET /api/orders/:userId - Get user's orders
router.get("/:userId", async (req, res) => {
  try {
    const snapshot = await db
      .collection("orders")
      .where("userId", "==", req.params.userId)
      .get();

    const orders = snapshot.docs.map((doc) => ({
      orderId: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);
    return res.status(500).send("Error getting orders");
  }
});

module.exports = router;
