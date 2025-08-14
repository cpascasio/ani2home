// backend/src/controllers/order.js
const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const placeOrderSchema = require("../models/placeOrderModels");
const orderDetailsSchema = require("../models/orderDetailsModels");
const orderSchema = require("../models/orderModels");
const { logger, logToFirestore } = require("../config/firebase-config");

// ✅ ADD SECURITY LOGGER - same as authRoutes.js and cart.js
const SecurityLogger = require("../../utils/SecurityLogger");

// Firestore database reference
const db = admin.firestore();

// Helper function to create standardized log data
const createLogData = (
  userId,
  action,
  resource,
  status,
  details = {},
  error = null
) => {
  return {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    status,
    details,
    ...(error && { error: error.message || error }),
  };
};

router.post("/place-order", async (req, res) => {
  console.log("Request body:", req.body);

  try {
    const { error, value } = placeOrderSchema.validate(req.body);
    if (error) {
      console.error("Validation Error:", error.details[0].message); // Log validation error

      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        userId: req.user?.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "placeOrder",
        rule: "schema_validation",
        error: "Invalid input data for placing order",
      });

      return res.status(400).json({ error: error.details[0].message });
    }

    console.log("Validated request body:", value); // Log the validated request body

    // Security: Check if the requesting user matches the order owner
    if (req.user.uid !== value.userId) {
      const errorMsg = "Unauthorized: Cannot place order for another user";

      // ✅ ADD SECURITY LOGGING FOR UNAUTHORIZED ORDER PLACEMENT
      await SecurityLogger.logAccessControlFailure({
        userId: req.user.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: `orders/${value.userId}`,
        permission: "order_creation",
        userPermissions: ["basic_user"],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    // Destructure req.body to separate items and the rest of the data
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
      console.error("Validation errors in order details:", validationErrors); // Log all validation errors

      // ✅ ADD SECURITY LOGGING FOR ORDER DETAILS VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        userId: req.user?.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "orderDetails",
        rule: "schema_validation",
        error: "Invalid order details data",
      });

      return res.status(400).json({ errors: validationErrors });
    }

    // Create a batch to write order details to Firestore
    const batch = db.batch();
    orderDetails.forEach((orderDetail) => {
      const orderDetailRef = db.collection("orderDetails").doc();
      batch.set(orderDetailRef, orderDetail);
    });

    await batch.commit();
    console.log("Order details written to Firestore");

    // Log the successful order creation
    const logData = createLogData(
      value.userId,
      "place_order",
      `orders/${orderId}`,
      "success",
      {
        orderId: orderId,
        itemCount: orderDetails.length,
        totalAmount: order.totalAmount || 0,
      }
    );

    logger.info(logData);
    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL ORDER PLACEMENT
    await SecurityLogger.logSecurityEvent("ORDER_PLACED", {
      userId: value.userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Order placed successfully",
      severity: "low",
      metadata: {
        orderId: orderId,
        itemCount: orderDetails.length,
        totalAmount: order.totalAmount || 0,
        sellerId: order.sellerId || "unknown",
        action: "place_order",
      },
    });

    // Send success response
    res.status(201).json({
      message: "Order created successfully",
      order,
      orderDetails,
      orderId,
    });
  } catch (error) {
    console.error("Error in /place-order:", error);

    // Log the error to Firestore
    const errorLogData = createLogData(
      req.user?.uid || "unknown",
      "place_order",
      "orders",
      "error",
      {},
      error
    );

    logger.error(errorLogData);
    await logToFirestore(errorLogData);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error placing order",
      metadata: { error: error.message },
    });

    // Send error response
    res.status(500).json({
      message: "Error creating order",
      error: error.message || "Unknown error",
    });
  }
});

// POST /api/orders/create-order - Non-checkout path (strict as well)
router.post("/create-order", async (req, res) => {
  try {
    const { error, value } = orderSchema.validate(req.body);

    if (error) {
      console.error("Validation Error:", error.details[0].message); // Log the validation error

      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        userId: req.user?.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "createOrder",
        rule: "schema_validation",
        error: "Invalid input data for creating order",
      });

      return res.status(400).json({ error: error.details[0].message });
    }

    // Security: Check if the requesting user matches the order owner
    if (req.user.uid !== value.userId) {
      const errorMsg = "Unauthorized: Cannot create order for another user";

      // ✅ ADD SECURITY LOGGING FOR UNAUTHORIZED ORDER CREATION
      await SecurityLogger.logAccessControlFailure({
        userId: req.user.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: `orders/${value.userId}`,
        permission: "order_creation",
        userPermissions: ["basic_user"],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    const newOrderRef = db.collection("orders").doc();
    await newOrderRef.set(value);
    const orderId = newOrderRef.id;

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL ORDER CREATION
    await SecurityLogger.logSecurityEvent("ORDER_CREATED", {
      userId: value.userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Order created successfully",
      severity: "low",
      metadata: {
        orderId: orderId,
        action: "create_order",
      },
    });

    res.status(201).json({
      message: "Order created successfully",
      order: value,
      orderId,
    });
    console.log("Order Id from order route: ", orderId);
  } catch (error) {
    console.error("Error creating order:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error creating order",
      metadata: { error: error.message },
    });

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
    const { userId } = req.params;

    // Security: Check if the requesting user matches the order owner or is admin
    if (req.user.uid !== userId && !req.user.isAdmin) {
      const errorMsg = "Unauthorized: Cannot access another user's orders";

      // ✅ ADD SECURITY LOGGING FOR UNAUTHORIZED ORDER ACCESS
      await SecurityLogger.logAccessControlFailure({
        userId: req.user.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: `orders/${userId}`,
        permission: "order_access",
        userPermissions: ["basic_user"],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    const snapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .get();

    const orders = snapshot.docs.map((doc) => ({
      orderId: doc.id,
      ...doc.data(),
    }));

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL ORDER ACCESS
    await SecurityLogger.logSecurityEvent("ORDERS_ACCESSED", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "User orders accessed successfully",
      severity: "low",
      metadata: {
        targetUserId: userId,
        orderCount: orders.length,
        action: "get_user_orders",
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error retrieving user orders",
      metadata: { error: error.message },
    });

    res.status(500).send("Error getting orders");
  }
});

// Endpoint to get order by document ID
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params; // Get the orderId from the request parameters

  try {
    // Fetch the order document by orderId from the Firestore orders collection
    const orderDocRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      // ✅ ADD SECURITY LOGGING FOR ORDER NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: req.user?.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Order not found",
        severity: "medium",
        metadata: { orderId, action: "get_order_by_id" },
      });

      // If the document doesn't exist, return a 404
      return res
        .status(404)
        .json({ message: `Order with ID ${orderId} not found` });
    }

    const orderData = orderDoc.data();

    // Security: Check if the requesting user matches the order owner or is admin
    if (req.user.uid !== orderData.userId && !req.user.isAdmin) {
      const errorMsg = "Unauthorized: Cannot access another user's order";

      // ✅ ADD SECURITY LOGGING FOR UNAUTHORIZED ORDER ACCESS
      await SecurityLogger.logAccessControlFailure({
        userId: req.user.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: `orders/${orderId}`,
        permission: "order_access",
        userPermissions: ["basic_user"],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL ORDER ACCESS
    await SecurityLogger.logSecurityEvent("ORDER_ACCESSED", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Order accessed successfully",
      severity: "low",
      metadata: {
        orderId: orderId,
        orderUserId: orderData.userId,
        action: "get_order_by_id",
      },
    });

    // If document exists, send back the order data along with its documentId
    const responseData = { orderId: orderDoc.id, ...orderData };
    res.status(200).json(responseData); // Respond with the order details
  } catch (error) {
    console.error("Error getting order by ID:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error retrieving order by ID",
      metadata: { error: error.message, orderId },
    });

    res.status(500).send("Error getting order by ID");
  }
});

module.exports = router;
