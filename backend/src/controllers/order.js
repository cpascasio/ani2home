const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const placeOrderSchema = require("../models/placeOrderModels");
const orderDetailsSchema = require("../models/orderDetailsModels");
const orderSchema = require("../models/orderModels");
const { logger, logToFirestore } = require("../config/firebase-config");

// Firestore database reference
const db = admin.firestore();

router.post("/place-order", async (req, res) => {
  console.log("Request body:", req.body);

  try {
    // 1) Strict validation (reject unknown fields; do not sanitize)
    const { error, value } = placeOrderSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false, // do NOT drop unknowns — reject instead
    });
    if (error) {
      console.error("Validation Error:", error.details);
      return res.status(400).json({
        message: "Invalid input data",
        state: "error",
        details: error.details,
      });
    }

    const { userId, sellerId, items, deliveryAddress, note, paymentOption } = value;

    // 2) Ownership: caller must match order.userId
    if (!req.user || req.user.uid !== userId) {
      const msg = "Access denied: cannot place an order for another user";
      console.error(msg);
      return res.status(403).json({ message: msg, state: "error" });
    }

    // 3) Server-side verification & totals (never trust client totals/prices)
    let subtotal = 0;
    const orderItems = [];

    // fetch product docs in parallel
    const productDocs = await Promise.all(
      items.map((it) => db.collection("products").doc(it.productId).get())
    );

    for (let i = 0; i < items.length; i++) {
      const reqItem = items[i];
      const snap = productDocs[i];

      if (!snap.exists) {
        return res.status(400).json({
          message: `Product not found: ${reqItem.productId}`,
          state: "error",
        });
      }

      const product = snap.data();

      // Enforce product belongs to the seller for this order
      if (product.storeId !== sellerId) {
        return res.status(400).json({
          message: `Product ${reqItem.productId} does not belong to seller ${sellerId}`,
          state: "error",
        });
      }

      // Stock check (if you maintain stock)
      if (typeof product.stock === "number" && product.stock < reqItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${reqItem.productId}`,
          state: "error",
        });
      }

      // Use server price only
      const unitPrice = Number(product.price || 0);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({
          message: `Invalid price for ${reqItem.productId}`,
          state: "error",
        });
      }

      const lineTotal = unitPrice * reqItem.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: reqItem.productId,
        quantity: reqItem.quantity,
        unitPrice,
        lineTotal,
        snapshot: {
          productName: product.productName,
          category: product.category,
          isKilo: product.isKilo,
        },
        _productRef: snap.ref, // hold for stock decrement later
        _currentStock: product.stock,
      });
    }

    // 4) Server-controlled amounts (don’t trust client)
    const shippingFee = 0;             // compute here if you have rules/lalamove quotes
    const totalPrice = subtotal + shippingFee;
    const status = "pending";          // force initial status server-side

    // 5) Create order + orderDetails atomically
    const batch = db.batch();
    const orderRef = db.collection("orders").doc();
    const nowISO = new Date().toISOString();

    const orderDoc = {
      orderId: orderRef.id,
      userId,
      sellerId,
      status,
      subtotal,
      shippingFee,
      totalPrice,
      deliveryAddress,
      note: note || "",
      paymentOption,
      createdAt: nowISO,
      updatedAt: nowISO,
    };

    batch.set(orderRef, orderDoc);

    orderItems.forEach((it) => {
      const detailRef = db.collection("orderDetails").doc();
      batch.set(detailRef, {
        orderId: orderRef.id,
        userId,
        sellerId,
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        snapshot: it.snapshot,
        createdAt: nowISO,
      });
    });

    // Optional: decrement stock (best effort; if you need strict consistency use a transaction)
    orderItems.forEach((it) => {
      if (typeof it._currentStock === "number") {
        const newStock = it._currentStock - it.quantity;
        batch.update(it._productRef, { stock: newStock < 0 ? 0 : newStock });
      }
    });

    await batch.commit();

    // 6) Audit log
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
      orderId: orderRef.id,
      action: "place_order",
      resource: `orders/${orderRef.id}`,
      status: "success",
      userId,
      details: { itemCount: orderItems.length, subtotal, shippingFee, totalPrice },
    };

    logger.info(logData);
    await logToFirestore(logData);

    // 7) Response
    return res.status(201).json({
      message: "Order created successfully",
      order: orderDoc,
      orderDetails: orderItems.map(({ snapshot, _productRef, _currentStock, ...rest }) => rest),
      orderId: orderRef.id,
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
      userId: req.user?.uid || "unknown",
    };

    logger.error(errorLogData);
    await logToFirestore(errorLogData);

    return res.status(500).json({
      message: "Error creating order",
      state: "error",
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

// Endpoint to get order by document ID
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params; // Get the orderId from the request parameters

  try {
    // Fetch the order document by orderId from the Firestore orders collection
    const orderDocRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      // If the document doesn't exist, return a 404
      return res
        .status(404)
        .json({ message: `Order with ID ${orderId} not found` });
    }

    // If document exists, send back the order data along with its documentId
    const orderData = { orderId: orderDoc.id, ...orderDoc.data() };
    res.status(200).json(orderData); // Respond with the order details
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).send("Error getting order by ID");
  }
});

module.exports = router;
