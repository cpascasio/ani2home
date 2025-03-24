const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const placeOrderSchema = require("../models/placeOrderModels");
const orderDetailsSchema = require("../models/orderDetailsModels");
const orderSchema = require("../models/orderModels");
const { logger, logToFirestore } = require("../config/firebase-config");
//const productRoutes = require('express').Router();

// Firestore database reference
const db = admin.firestore();

router.post("/place-order", async (req, res) => {
  console.log("Request body:", req.body); // Log the incoming request body

  try {
    // Validate the request body
    const { error, value } = placeOrderSchema.validate(req.body);
    if (error) {
      console.error("Validation Error:", error.details[0].message); // Log validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    console.log("Validated request body:", value); // Log the validated request body

    // Destructure req.body to separate items and the rest of the data
    const { items, ...order } = value;

    // Create a new order in Firestore
    const newOrderRef = db.collection("orders").doc();
    await newOrderRef.set(order);
    const orderId = newOrderRef.id;

    console.log("Order created in Firestore with ID:", orderId); // Log the order ID

    // Map items to include the orderId
    const orderDetails = items.map((item) => {
      return { ...item, orderId: orderId };
    });

    console.log("Order details with orderId:", orderDetails); // Log the order details

    // Validate each item in the order details
    let validationErrors = [];
    orderDetails.forEach((item, index) => {
      const { error, value } = orderDetailsSchema.validate(item);
      if (error) {
        console.error(
          `Validation Error in item ${index}:`,
          error.details[0].message
        ); // Log item validation error
        validationErrors.push(`Item ${index}: ${error.details[0].message}`);
      } else {
        // Update the item with validated values if needed
        orderDetails[index] = value;
      }
    });

    if (validationErrors.length > 0) {
      console.error("Validation errors in order details:", validationErrors); // Log all validation errors
      return res.status(400).json({ errors: validationErrors });
    }

    // Create a batch to write order details to Firestore
    const batch = db.batch();
    orderDetails.forEach((orderDetail) => {
      const orderDetailRef = db.collection("orderDetails").doc();
      batch.set(orderDetailRef, orderDetail);
    });

    await batch.commit(); // Commit the batch
    console.log("Order details written to Firestore"); // Log successful batch commit

    // Log the successful order creation
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
      orderId: orderId,
      action: "place_order",
      resource: `orders/${orderId}`,
      status: "success",
      userId: value.userId,
    };

    logger.info(logData); // Log to your logging system
    await logToFirestore(logData); // Log to Firestore if needed

    // Send success response
    res.status(201).json({
      message: "Order created successfully",
      order: order,
      orderDetails: orderDetails,
      orderId: orderId,
    });

    console.log("Order creation completed successfully"); // Log successful completion
  } catch (error) {
    console.error("Error in /place-order:", error); // Log the error

    // Log the error to Firestore
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

    logger.error(errorLogData); // Log to your logging system
    await logToFirestore(errorLogData); // Log to Firestore if needed

    // Send error response
    res.status(500).json({
      message: "Error creating order",
      error: error.message || "Unknown error",
    });
  }
});

// route for post order
router.post("/create-order", async (req, res) => {
  const { error, value } = orderSchema.validate(req.body);

  if (error) {
    console.error("Validation Error:", error.details[0].message); // Log the validation error
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newOrderRef = db.collection("orders").doc();
    await newOrderRef.set(value);
    const orderId = newOrderRef.id;
    res.status(201).json({
      message: "Order created successfully",
      order: value,
      orderId: orderId,
    });
    console.log("Order Id from order route: ", orderId);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Error creating order");
  }
});

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
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).send("Error getting orders");
  }
});

module.exports = router;
