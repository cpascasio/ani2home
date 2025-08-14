const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const orderDetailSchema = require("../models/orderDetailsModels");
const { logger, logToFirestore } = require("../config/firebase-config");

// ✅ ADD SECURITY LOGGER - same as authRoutes.js, cart.js, and order.js
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

// get order details - ADMIN ONLY (this endpoint returns ALL order details)
router.get("/", async (req, res) => {
  try {
    // Security: Check if user is admin - this endpoint exposes ALL order details
    if (!req.user || !req.user.isAdmin) {
      const errorMsg =
        "Unauthorized: Admin access required for all order details";

      // ✅ ADD SECURITY LOGGING FOR UNAUTHORIZED ADMIN ACCESS
      await SecurityLogger.logAccessControlFailure({
        userId: req.user?.uid || null,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: "orderDetails/all",
        permission: "admin_access",
        userPermissions: req.user ? ["basic_user"] : [],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    const snapshot = await db.collection("orderDetails").get();
    const orderDetails = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL ADMIN ACCESS
    await SecurityLogger.logSecurityEvent("ORDER_DETAILS_ADMIN_ACCESS", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Admin accessed all order details",
      severity: "low",
      metadata: {
        orderDetailsCount: orderDetails.length,
        action: "get_all_order_details",
      },
    });

    // ✅ ADD AUDIT LOGGING
    const logData = createLogData(
      req.user.uid,
      "get_all_order_details",
      "orderDetails/all",
      "success",
      { orderDetailsCount: orderDetails.length }
    );

    logger.info(logData);
    await logToFirestore(logData);

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Error getting order details:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error retrieving all order details",
      metadata: { error: error.message },
    });

    res.status(500).send("Error getting order details");
  }
});

// ✅ ADD NEW ENDPOINT: Get order details for a specific order (with user validation)
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    // First, verify the order exists and get its userId
    const orderDoc = await db.collection("orders").doc(orderId).get();

    if (!orderDoc.exists) {
      // ✅ ADD SECURITY LOGGING FOR ORDER NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: req.user?.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Order not found for order details access",
        severity: "medium",
        metadata: { orderId, action: "get_order_details" },
      });

      return res.status(404).json({
        message: "Order not found",
        state: "error",
      });
    }

    const orderData = orderDoc.data();

    // Security: Check if the requesting user matches the order owner or is admin
    if (req.user.uid !== orderData.userId && !req.user.isAdmin) {
      const errorMsg =
        "Unauthorized: Cannot access another user's order details";

      // ✅ ADD SECURITY LOGGING FOR UNAUTHORIZED ORDER DETAILS ACCESS
      await SecurityLogger.logAccessControlFailure({
        userId: req.user.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: `orderDetails/order/${orderId}`,
        permission: "order_details_access",
        userPermissions: ["basic_user"],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    // Get order details for this specific order
    const snapshot = await db
      .collection("orderDetails")
      .where("orderId", "==", orderId)
      .get();

    const orderDetails = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL ORDER DETAILS ACCESS
    await SecurityLogger.logSecurityEvent("ORDER_DETAILS_ACCESSED", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Order details accessed successfully",
      severity: "low",
      metadata: {
        orderId: orderId,
        orderUserId: orderData.userId,
        orderDetailsCount: orderDetails.length,
        action: "get_order_details",
      },
    });

    // ✅ ADD AUDIT LOGGING
    const logData = createLogData(
      req.user.uid,
      "get_order_details",
      `orderDetails/order/${orderId}`,
      "success",
      {
        orderId: orderId,
        orderDetailsCount: orderDetails.length,
        orderUserId: orderData.userId,
      }
    );

    logger.info(logData);
    await logToFirestore(logData);

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Error getting order details:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error retrieving order details",
      metadata: { error: error.message, orderId },
    });

    res.status(500).send("Error getting order details");
  }
});

// ✅ ADD NEW ENDPOINT: Get order details for a specific user's orders
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Security: Check if the requesting user matches the target user or is admin
    if (req.user.uid !== userId && !req.user.isAdmin) {
      const errorMsg =
        "Unauthorized: Cannot access another user's order details";

      // ✅ ADD SECURITY LOGGING FOR UNAUTHORIZED USER ORDER DETAILS ACCESS
      await SecurityLogger.logAccessControlFailure({
        userId: req.user.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: `orderDetails/user/${userId}`,
        permission: "user_order_details_access",
        userPermissions: ["basic_user"],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    // Get all orders for this user first
    const ordersSnapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .get();

    if (ordersSnapshot.empty) {
      // ✅ ADD SECURITY LOGGING FOR NO ORDERS FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: req.user.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "No orders found for user order details access",
        severity: "low",
        metadata: { targetUserId: userId, action: "get_user_order_details" },
      });

      return res.status(200).json([]); // Return empty array if no orders
    }

    // Get all order IDs for this user
    const orderIds = ordersSnapshot.docs.map((doc) => doc.id);

    // Get all order details for these orders
    const orderDetailsPromises = orderIds.map((orderId) =>
      db.collection("orderDetails").where("orderId", "==", orderId).get()
    );

    const orderDetailsSnapshots = await Promise.all(orderDetailsPromises);

    // Flatten all order details
    const allOrderDetails = [];
    orderDetailsSnapshots.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        allOrderDetails.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    });

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL USER ORDER DETAILS ACCESS
    await SecurityLogger.logSecurityEvent("USER_ORDER_DETAILS_ACCESSED", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "User order details accessed successfully",
      severity: "low",
      metadata: {
        targetUserId: userId,
        orderCount: orderIds.length,
        orderDetailsCount: allOrderDetails.length,
        action: "get_user_order_details",
      },
    });

    // ✅ ADD AUDIT LOGGING
    const logData = createLogData(
      req.user.uid,
      "get_user_order_details",
      `orderDetails/user/${userId}`,
      "success",
      {
        targetUserId: userId,
        orderCount: orderIds.length,
        orderDetailsCount: allOrderDetails.length,
      }
    );

    logger.info(logData);
    await logToFirestore(logData);

    res.status(200).json(allOrderDetails);
  } catch (error) {
    console.error("Error getting user order details:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error retrieving user order details",
      metadata: { error: error.message, targetUserId: userId },
    });

    res.status(500).send("Error getting user order details");
  }
});

// post route for order details
router.post("/create-order-details", async (req, res) => {
  try {
    const { error, value: orderDetails } = orderDetailSchema.validate(req.body);

    console.log("Request Body:", req.body); // Log the request body
    console.log("Validation Result:", orderDetails); // Log the validation result

    if (error) {
      console.error("Validation Error:", error.details[0].message); // Log the validation error

      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        userId: req.user?.uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "orderDetails",
        rule: "schema_validation",
        error: "Invalid input data for creating order details",
      });

      return res.status(400).json({ error: error.details[0].message });
    }

    // Security: Verify that the order exists and the user has permission to add details
    if (orderDetails.orderId) {
      const orderDoc = await db
        .collection("orders")
        .doc(orderDetails.orderId)
        .get();

      if (!orderDoc.exists) {
        // ✅ ADD SECURITY LOGGING FOR INVALID ORDER REFERENCE
        await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
          userId: req.user?.uid,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          description: "Order not found for order details creation",
          severity: "medium",
          metadata: {
            orderId: orderDetails.orderId,
            action: "create_order_details",
          },
        });

        return res.status(404).json({
          message: "Order not found",
          state: "error",
        });
      }

      const orderData = orderDoc.data();

      // Security: Check if the requesting user matches the order owner or is admin
      if (req.user.uid !== orderData.userId && !req.user.isAdmin) {
        const errorMsg =
          "Unauthorized: Cannot create order details for another user's order";

        // ✅ ADD SECURITY LOGGING FOR UNAUTHORIZED ORDER DETAILS CREATION
        await SecurityLogger.logAccessControlFailure({
          userId: req.user.uid,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          resource: `orderDetails/create/${orderDetails.orderId}`,
          permission: "order_details_creation",
          userPermissions: ["basic_user"],
          endpoint: req.originalUrl,
          method: req.method,
        });

        return res.status(403).json({
          message: "Access denied",
          state: "error",
        });
      }
    }

    const newOrderDetailRef = db.collection("orderDetails").doc();
    await newOrderDetailRef.set(orderDetails);

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL ORDER DETAILS CREATION
    await SecurityLogger.logSecurityEvent("ORDER_DETAILS_CREATED", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Order details created successfully",
      severity: "low",
      metadata: {
        orderDetailId: newOrderDetailRef.id,
        orderId: orderDetails.orderId || null,
        productId: orderDetails.productId || null,
        action: "create_order_details",
      },
    });

    // ✅ ADD AUDIT LOGGING
    const logData = createLogData(
      req.user?.uid || "system",
      "create_order_details",
      `orderDetails/${newOrderDetailRef.id}`,
      "success",
      {
        orderDetailId: newOrderDetailRef.id,
        orderId: orderDetails.orderId || null,
        productId: orderDetails.productId || null,
      }
    );

    logger.info(logData);
    await logToFirestore(logData);

    res.status(201).json({
      message: "Order details created successfully",
      orderDetails: orderDetails,
      orderDetailId: newOrderDetailRef.id,
    });
  } catch (error) {
    console.error("Error creating order details:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error creating order details",
      metadata: { error: error.message },
    });

    res.status(500).send("Error creating order details");
  }
});

module.exports = router;
