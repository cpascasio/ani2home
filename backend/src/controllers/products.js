// backend/src/controllers/products.js
const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const productSchema = require("../models/productModels");
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

// ---------- SPECIFIC GET ROUTES FIRST (avoid shadowing) ----------

// Route to get products given userId
router.get("/user/:userId", async (req, res) => {
  try {
    const products = [];
    const snapshot = await db
      .collection("products")
      .where("storeId", "==", req.params.userId)
      .get();

    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    return res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).send("Error getting products");
  }
});

// Route to get the product detail given productId and the seller details
router.get("/product/:productId", async (req, res) => {
  try {
    const productDoc = await db
      .collection("products")
      .doc(req.params.productId)
      .get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productData = productDoc.data();
    productData.id = productDoc.id;

    const sellerDoc = await db
      .collection("users")
      .doc(productData.storeId)
      .get();

    return res.json({ product: productData, seller: sellerDoc.data() || null });
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).send("Error getting product");
  }
});

// Route to get the products of a specific seller and the seller details
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const products = [];
    const snapshot = await db
      .collection("products")
      .where("storeId", "==", req.params.sellerId)
      .get();

    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    const sellerDoc = await db
      .collection("users")
      .doc(req.params.sellerId)
      .get();

    return res.json({ products, seller: sellerDoc.data() || null });
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).send("Error getting products");
  }
});

// Route to get products category
router.get("/category/:categ", async (req, res) => {
  const { categ } = req.params;
  try {
    const products = [];
    let snapshot;

    if (categ.toLowerCase() === "fruits") {
      snapshot = await db.collection("products").where("category", "==", "Fruit").get();
    } else if (categ.toLowerCase() === "vegetables") {
      snapshot = await db.collection("products").where("category", "==", "Vegetable").get();
    } else if (categ.toLowerCase() === "artisanal food") {
      snapshot = await db.collection("products").where("category", "==", "Artisinal Food").get();
    } else {
      snapshot = await db.collection("products").get();
    }

    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    return res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).send("Error getting products");
  }
});

// ---------- GENERAL GET ROUTES AFTER SPECIFICS ----------

// Route to get all products
router.get("/", async (req, res) => {
  try {
    const products = [];
    const snapshot = await db.collection("products").get();
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).send("Error getting products");
  }
});

// Route to get product detail (single ID) — keep last among GETs to avoid shadowing
router.get("/:productId", async (req, res) => {
  try {
    const product = await db
      .collection("products")
      .doc(req.params.productId)
      .get();

    if (!product.exists) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product.data());
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).send("Error getting product");
  }
});

// ---------- CREATE / UPDATE / DELETE ----------

// Route to create a new product
router.post("/create-product", async (req, res) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) return badRequest(res, error);

  try {
    // Server-controlled fields only after validation
    value.dateAdded = new Date().toISOString();
    value.rating = 0;
    value.totalSales = 0;

    // If pictures are provided and you want to upload base64 -> Cloudinary:
    if (value.pictures) {
      const uploadPromises = value.pictures.map(async (picture) => {
        const result = await cloudinary.uploader.upload(picture, {
          folder: "ani2home",
          resource_type: "image",
        });
        return result.secure_url;
      });

      value.pictures = await Promise.all(uploadPromises);
    }

    const newProductRef = db.collection("products").doc();
    await newProductRef.set(value);

    // Log the successful product creation
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
      action: "create_product",
      resource: `products/${newProductRef.id}`,
      status: "success",
      details: {
        message: "Product created successfully",
        productId: newProductRef.id,
      },
    };

    logger.info(logData);
    await logToFirestore(logData);

    return res.status(201).json({
      message: "Product created successfully",
      product: {
        ...value,
        productId: newProductRef.id,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // Log the error
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
      userId: req.user?.uid || "unknown",
      action: "create_product",
      resource: "products",
      status: "failed",
      error: error.message,
    };

    logger.error(logData);
    await logToFirestore(logData);

    return res.status(500).send("Error creating product");
  }
});

// Route to update a product (use :productId param)
router.put("/:productId", async (req, res) => {
  const { productId } = req.params;

  // Validate the payload fields only; ID comes from params
  const { error, value } = productSchema.validate(req.body);
  if (error) return badRequest(res, error);

  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found", state: "error" });
    }

    // Fetch old values
    const oldData = productDoc.data();

    // Update Firestore document with the new values
    await productRef.update(value);

    // Compare old and new values
    const changes = {};
    for (const key in value) {
      if (value[key] !== oldData[key]) {
        changes[key] = {
          old: oldData[key],
          new: value[key],
        };
      }
    }

    // Log the successful update
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
      action: "update_product",
      resource: `products/${productId}`,
      status: "success",
      details: {
        message: "Product updated successfully",
        productId,
        changes,
      },
    };

    logger.info(logData);
    await logToFirestore(logData);

    return res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);

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
      action: "update_product",
      resource: `products/${productId}`,
      status: "failed",
      error: error.message,
    };

    logger.error(logData);
    await logToFirestore(logData);

    return res.status(500).send("Error updating product");
  }
});

// Route to delete a product
router.delete("/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found", state: "error" });
    }

    await productRef.delete();

    // Log the successful deletion
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
      action: "delete_product",
      resource: `products/${productId}`,
      status: "success",
      details: {
        message: "Product deleted successfully",
        productId,
      },
    };

    logger.info(logData);
    await logToFirestore(logData);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);

    // Log the error
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
      userId: req.headers["x-user-id"] || "unknown",
      action: "delete_product",
      resource: `products/${productId}`,
      status: "failed",
      error: error.message,
    };

    logger.error(logData);
    await logToFirestore(logData);

    return res.status(500).send("Error deleting product");
  }
});

module.exports = router;
