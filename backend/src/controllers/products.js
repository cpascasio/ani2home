const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const {
   productCreateValidation,
   productUpdateValidation,
   productIdParamValidation,
 } = require("../models/productModels");
 const { authorize } = require("../middleware");
const { logger, logToFirestore } = require("../config/firebase-config");

// Firestore database reference
const db = admin.firestore();

// Route to get product detail
router.get("/:productId", async (req, res) => {
  try {
    const { error } = productIdParamValidation.validate(req.params.productId);
    if (error) {
      return res.status(400).json({ message: "Invalid productId", details: error.details });
    }

    const doc = await db.collection("products").doc(req.params.productId).get();
    if (!doc.exists) return res.status(404).json({ message: "Product not found" });

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error getting product:", err);
    res.status(500).send("Error getting product");
  }
});


// route to get products given userId
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
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).send("Error getting products");
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
    productData.id = productDoc.id; // Add the document ID to the product data

    const sellerDoc = await db
      .collection("users")
      .doc(productData.storeId)
      .get();
    res.json({ product: productData, seller: sellerDoc.data() });
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).send("Error getting product");
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
    res.json({ products, seller: sellerDoc.data() });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).send("Error getting products");
  }
});

// Route to get all products
router.get("/", async (req, res) => {
  try {
    const products = [];
    const snapshot = await db.collection("products").get();
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).send("Error getting products");
  }
});

// Route to get products category
router.get("/category/:categ", async (req, res) => {
  const { categ } = req.params;
  console.log("Received category:", categ); // Added for debugging
  try {
    const products = [];
    let snapshot;

    if (categ === "fruits" || categ === "Fruits") {
      snapshot = await db
        .collection("products")
        .where("category", "==", "Fruit")
        .get();
      console.log("Fetched fruits"); // Added for debugging
    } else if (categ === "vegetables" || categ === "Vegetables") {
      snapshot = await db
        .collection("products")
        .where("category", "==", "Vegetable")
        .get();
      console.log("Fetched vegetables"); // Added for debugging
    } else if (categ === "artisanal food" || categ === "Artisanal Food") {
      snapshot = await db
        .collection("products")
        .where("category", "==", "Artisinal Food")
        .get();
      console.log("Fetched artisinal food"); // Added for debugging
    } else {
      snapshot = await db.collection("products").get();
      console.log("Fetched all products"); // Added for debugging
    }

    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).send("Error getting products");
  }
});

// Route to create a new product
router.post(
  "/create-product",
  authorize({ requireAuth: true, roles: ["seller","admin"], anyOfPermissions: ["products:create"] }),
  async (req, res) => {
    try {
      // Strict validation (reject unknowns, collect all issues)
      const { error, value } = productCreateValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: false,
      });
      if (error) {
        return res.status(400).json({ message: "Invalid input data", state: "error", details: error.details });
      }

      // Ownership (seller can only create for their own store)
      if (!req.user?.admin && value.storeId !== req.user?.uid) {
        return res.status(403).json({ message: "Forbidden", state: "error" });
      }

      // Optional: upload pictures (supports https:// and data:image/*)
      if (Array.isArray(value.pictures) && value.pictures.length > 0) {
        const uploaded = await Promise.all(
          value.pictures.map(async (imgStr) => {
            const result = await cloudinary.uploader.upload(imgStr, {
              folder: "ani2home",
              resource_type: "image",
            });
            return result.secure_url;
          })
        );
        value.pictures = uploaded;
      }

      // Server‑controlled fields AFTER validation
      value.dateAdded = new Date().toISOString();
      value.rating = 0;
      value.totalSales = 0;

      const ref = db.collection("products").doc();
      await ref.set(value);

      const logData = {
        timestamp: new Date().toISOString(),
        action: "create_product",
        resource: `products/${ref.id}`,
        status: "success",
        userId: req.user?.uid || "unknown",
        details: { productId: ref.id, storeId: value.storeId },
      };
      logger.info(logData); await logToFirestore(logData);

      return res.status(201).json({
        message: "Product created successfully",
        product: { ...value, productId: ref.id },
      });
    } catch (err) {
      const logData = {
        timestamp: new Date().toISOString(),
        action: "create_product",
        resource: "products",
        status: "failed",
        userId: req.user?.uid || "unknown",
        error: err.message,
      };
      logger.error(logData); await logToFirestore(logData);
      return res.status(500).send("Error creating product");
    }
  }
);


// Route to update a product
router.put(
  "/:productId",
  authorize({ requireAuth: true, roles: ["seller","admin"], anyOfPermissions: ["products:update"] }),
  async (req, res) => {
    try {
      // Validate path param
      const { error: pidErr } = productIdParamValidation.validate(req.params.productId);
      if (pidErr) {
        return res.status(400).json({ message: "Invalid productId", details: pidErr.details });
      }

      // Strict body validation (partial allowed; reject unknown)
      const { error, value } = productUpdateValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: false,
      });
      if (error) {
        return res.status(400).json({ message: "Invalid input data", state: "error", details: error.details });
      }

      const ref = db.collection("products").doc(req.params.productId);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ message: "Product not found", state: "error" });

      const current = doc.data();

      // Ownership (seller can only update their own product)
      if (!req.user?.admin && current.storeId !== req.user?.uid) {
        return res.status(403).json({ message: "Forbidden", state: "error" });
      }

      // If pictures provided, upload and replace
      if (value.pictures) {
        const uploaded = await Promise.all(
          value.pictures.map(async (imgStr) => {
            const result = await cloudinary.uploader.upload(imgStr, {
              folder: "ani2home",
              resource_type: "image",
            });
            return result.secure_url;
          })
        );
        value.pictures = uploaded;
      }

      await ref.update(value);

      // Diff for audit
      const changes = {};
      for (const k of Object.keys(value)) {
        if (value[k] !== current[k]) changes[k] = { old: current[k], new: value[k] };
      }

      const logData = {
        timestamp: new Date().toISOString(),
        action: "update_product",
        resource: `products/${req.params.productId}`,
        status: "success",
        userId: req.user?.uid || "unknown",
        details: { productId: req.params.productId, changes },
      };
      logger.info(logData); await logToFirestore(logData);

      return res.status(200).json({ message: "Product updated successfully" });
    } catch (err) {
      const logData = {
        timestamp: new Date().toISOString(),
        action: "update_product",
        resource: `products/${req.params.productId}`,
        status: "failed",
        userId: req.user?.uid || "unknown",
        error: err.message,
      };
      logger.error(logData); await logToFirestore(logData);
      return res.status(500).send("Error updating product");
    }
  }
);


// Route to delete a product
router.delete(
  "/:productId",
  authorize({ requireAuth: true, roles: ["seller","admin"], anyOfPermissions: ["products:update"] }),
  async (req, res) => {
    try {
      const { error: pidErr } = productIdParamValidation.validate(req.params.productId);
      if (pidErr) {
        return res.status(400).json({ message: "Invalid productId", details: pidErr.details });
      }

      const ref = db.collection("products").doc(req.params.productId);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ message: "Product not found", state: "error" });

      const current = doc.data();

      // Ownership
      if (!req.user?.admin && current.storeId !== req.user?.uid) {
        return res.status(403).json({ message: "Forbidden", state: "error" });
      }

      await ref.delete();

      const logData = {
        timestamp: new Date().toISOString(),
        action: "delete_product",
        resource: `products/${req.params.productId}`,
        status: "success",
        userId: req.user?.uid || "unknown",
        details: { productId: req.params.productId },
      };
      logger.info(logData); await logToFirestore(logData);

      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
      const logData = {
        timestamp: new Date().toISOString(),
        action: "delete_product",
        resource: `products/${req.params.productId}`,
        status: "failed",
        userId: req.user?.uid || "unknown",
        error: err.message,
      };
      logger.error(logData); await logToFirestore(logData);
      return res.status(500).send("Error deleting product");
    }
  }
);

module.exports = router;
