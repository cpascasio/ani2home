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
    const product = await db
      .collection("products")
      .doc(req.params.productId)
      .get();
    if (!product.exists) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product.data());
  } catch (error) {
    console.error("Error getting product:", error);
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
    const { error, value } = productCreateValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Invalid input data",
        state: "error",
        details: error.details,
      });
    }

    if (!req.user?.admin && value.storeId !== req.user?.uid) {
      return res.status(403).json({ message: "Forbidden", state: "error" });
    }

    value.dateAdded = new Date().toISOString();
    value.rating = 0;
    value.totalSales = 0;

    try {
      if (Array.isArray(value.pictures) && value.pictures.length) {
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
        details: { message: "Product created successfully", productId: newProductRef.id },
      };

      logger.info(logData);
      await logToFirestore(logData);

      res.status(201).json({
        message: "Product created successfully",
        product: { ...value, productId: newProductRef.id },
      });
    } catch (error) {
      console.error("Error creating product:", error);

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

      res.status(500).send("Error creating product");
    }
  }
);

// Route to update a product
router.put(
  "/:productId",
  authorize({ requireAuth: true, roles: ["seller","admin"], anyOfPermissions: ["products:update"] }),
  async (req, res) => {
    // Validate path param
    const { error: pidErr } = productIdParamValidation.validate(req.params.productId);
    if (pidErr) {
      return res.status(400).json({ message: "Invalid productId", details: pidErr.details });
    }

    // Strict body validation (partial allowed; reject unknown fields)
    const { error, value } = productUpdateValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Invalid input data",
        state: "error",
        details: error.details,
      });
    }

    try {
      const productId = req.params.productId;
      const productRef = db.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({ message: "Product not found", state: "error" });
      }

      // Ownership (fail securely)
      const oldData = productDoc.data();
      if (!req.user?.admin && oldData.storeId !== req.user?.uid) {
        return res.status(403).json({ message: "Forbidden", state: "error" });
      }

      // Update Firestore document with the validated values
      await productRef.update(value);

      // Compare old and new for logging (optional)
      const changes = {};
      for (const key of Object.keys(value)) {
        if (value[key] !== oldData[key]) {
          changes[key] = { old: oldData[key], new: value[key] };
        }
      }

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

      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("Error updating product:", error);

      const productId = req.params.productId; // for logging
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

      res.status(500).send("Error updating product");
    }
  }
);

// Route to delete a product
router.delete("/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    // Check if the product exists
    if (!productDoc.exists) {
      return res
        .status(404)
        .json({ message: "Product not found", state: "error" });
    }

    // Delete the product
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
        productId: productId,
      },
    };

    logger.info(logData); // Log to console/file
    await logToFirestore(logData); // Log to Firestore

    res.status(200).json({ message: "Product deleted successfully" });
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
      userId: req.headers["x-user-id"] || "unknown", // Extract userId from the headers
      action: "delete_product",
      resource: `products/${productId}`,
      status: "failed",
      error: error.message,
    };

    logger.error(logData); // Log to console/file
    await logToFirestore(logData); // Log to Firestore

    res.status(500).send("Error deleting product");
  }
});

module.exports = router;
