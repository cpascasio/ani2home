const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const productSchema = require("../models/productModels");

// ✅ KEEP ORIGINAL LOGGING AND ADD SECURITY LOGGER
const { logger, logToFirestore } = require("../config/firebase-config");
const SecurityLogger = require("../../utils/SecurityLogger");

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
      // ✅ ADD SECURITY LOGGING FOR ERRORS
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: `Product not found: ${req.params.productId}`,
        severity: "low",
        metadata: { productId: req.params.productId },
      });

      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product.data());
  } catch (error) {
    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "medium",
      description: "Error getting product",
      metadata: { error: error.message, productId: req.params.productId },
    });

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
    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "medium",
      description: "Error getting user products",
      metadata: { error: error.message, targetUserId: req.params.userId },
    });

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
      // ✅ ADD SECURITY LOGGING FOR ERRORS
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: `Product with seller details not found: ${req.params.productId}`,
        severity: "low",
        metadata: { productId: req.params.productId },
      });

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
    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "medium",
      description: "Error getting product with seller details",
      metadata: { error: error.message, productId: req.params.productId },
    });

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
    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "medium",
      description: "Error getting seller products",
      metadata: { error: error.message, sellerId: req.params.sellerId },
    });

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
    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "medium",
      description: "Error getting all products",
      metadata: { error: error.message },
    });

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
    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "medium",
      description: "Error getting products by category",
      metadata: { error: error.message, category: categ },
    });

    console.error("Error getting products:", error);
    res.status(500).send("Error getting products");
  }
});

// Route to create a new product
router.post("/create-product", async (req, res) => {
  const { error, value } = productSchema.validate(req.body, {
    stripUnknown: true, // ✅ ADD THIS to remove unknown fields like 'id'
  });

  // Add these fields to the value
  if (!error) {
    value.dateAdded = new Date().toISOString();
    value.rating = 0;
    value.totalSales = 0;
  }

  if (error) {
    // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
    await SecurityLogger.logValidationFailure({
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      fieldName: error.details[0].path.join("."),
      rule: error.details[0].type,
      error: error.details[0].message,
    });

    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Check if pictures exist and is an array
    if (value.pictures) {
      const uploadPromises = value.pictures.map(async (picture) => {
        const result = await cloudinary.uploader.upload(picture, {
          folder: "ani2home",
          resource_type: "image", // Optional: if you have an upload preset
        });
        return result.secure_url;
      });

      // Wait for all uploads to complete
      value.pictures = await Promise.all(uploadPromises);
    }

    const newProductRef = db.collection("products").doc();
    await newProductRef.set(value);

    // ✅ KEEP ORIGINAL LOGGING
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
      resource: `products/${newProductRef.id}`,
      status: "success",
      details: {
        message: "Product created successfully",
        productId: newProductRef.id,
      },
    };

    logger.info(logData); // Log to console/file
    await logToFirestore(logData); // Log to Firestore

    // ✅ ADD SECURITY LOGGING FOR SUCCESS
    await SecurityLogger.logSecurityEvent("PRODUCT_CREATED", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Product created successfully",
      severity: "low",
      metadata: {
        productId: newProductRef.id,
        productName: value.productName,
        category: value.category,
        storeId: value.storeId,
        price: value.price,
        stock: value.stock,
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      product: {
        ...value,
        productId: newProductRef.id, // Include the document ID
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // ✅ KEEP ORIGINAL LOGGING
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
      userId: req.user?.uid || "unknown", // Include the user ID who attempted to create the product
      action: "create_product",
      resource: "products",
      status: "failed",
      error: error.message,
    };

    logger.error(logData); // Log to console/file
    await logToFirestore(logData); // Log to Firestore

    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("PRODUCT_CREATION_FAILED", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Product creation failed",
      metadata: {
        error: error.message,
        productName: value?.productName,
        storeId: value?.storeId,
      },
    });

    res.status(500).send("Error creating product");
  }
});

// Route to update a product (UPDATED VERSION)
router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  const { error, value } = productSchema.validate(req.body, {
    stripUnknown: true, // ✅ ADD THIS to remove unknown fields like 'id'
  });

  console.log("Request body:", value);
  console.log("Product ID from params:", productId);

  if (error) {
    // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
    await SecurityLogger.logValidationFailure({
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      fieldName: error.details[0].path.join("."),
      rule: error.details[0].type,
      error: error.details[0].message,
    });

    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      // ✅ ADD SECURITY LOGGING FOR NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: req.user?.uid || null,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: `Product not found for update: ${productId}`,
        severity: "medium",
        metadata: { productId },
      });

      return res
        .status(404)
        .json({ message: "Product not found", state: "error" });
    }

    // Fetch the old values
    const oldData = productDoc.data();

    // ✅ ADD AUTHORIZATION CHECK: User can only update their own products
    if (oldData.storeId !== req.user?.uid) {
      await SecurityLogger.logAccessControlFailure({
        userId: req.user?.uid || null,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: `products/${productId}`,
        permission: "product_update",
        userPermissions: ["product_owner"],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        error: true,
        message: "You can only update your own products",
        timestamp: new Date().toISOString(),
      });
    }

    // ✅ HANDLE PICTURE UPLOADS (copied from create route)
    if (
      value.pictures &&
      Array.isArray(value.pictures) &&
      value.pictures.length > 0
    ) {
      // Check if pictures are base64 strings (new uploads) or URLs (existing pictures)
      const uploadPromises = value.pictures.map(async (picture) => {
        // If it's already a URL (existing picture), keep it
        if (typeof picture === "string" && picture.startsWith("http")) {
          return picture;
        }

        // If it's a base64 string (new upload), upload to cloudinary
        if (typeof picture === "string" && picture.startsWith("data:")) {
          const result = await cloudinary.uploader.upload(picture, {
            folder: "ani2home",
            resource_type: "image",
          });
          return result.secure_url;
        }

        return picture; // fallback
      });

      // Wait for all uploads to complete
      value.pictures = await Promise.all(uploadPromises);
    }

    // Update Firestore document with the new values
    await productRef.update(value);

    // Compare old and new values
    const changes = {};
    for (const key in value) {
      if (JSON.stringify(value[key]) !== JSON.stringify(oldData[key])) {
        changes[key] = {
          old: oldData[key],
          new: value[key],
        };
      }
    }

    // ✅ KEEP ORIGINAL LOGGING
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
      userId: req.user?.uid || "unknown", // ✅ Fixed: use req.user.uid
      action: "update_product",
      resource: `products/${productId}`,
      status: "success",
      details: {
        message: "Product updated successfully",
        productId: productId,
        changes, // Include old and new values
      },
    };

    logger.info(logData);
    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SUCCESS
    await SecurityLogger.logSecurityEvent("PRODUCT_UPDATED", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Product updated successfully",
      severity: "low",
      metadata: {
        productId,
        productName: value.productName || oldData.productName,
        changes: Object.keys(changes),
        changeCount: Object.keys(changes).length,
      },
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: {
        ...value,
        productId: productId,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);

    // ✅ KEEP ORIGINAL LOGGING
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
      userId: req.user?.uid || "unknown", // ✅ Fixed: use req.user.uid
      action: "update_product",
      resource: `products/${productId}`,
      status: "failed",
      error: error.message,
    };

    logger.error(logData);
    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("PRODUCT_UPDATE_FAILED", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Product update failed",
      metadata: {
        error: error.message,
        productId,
      },
    });

    res.status(500).send("Error updating product");
  }
});

// Route to delete a product
router.delete("/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    // Check if the product exists
    if (!productDoc.exists) {
      // ✅ ADD SECURITY LOGGING FOR NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: req.user?.uid || null,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: `Product not found for deletion: ${productId}`,
        severity: "medium",
        metadata: { productId },
      });

      return res
        .status(404)
        .json({ message: "Product not found", state: "error" });
    }

    const productData = productDoc.data();

    // ✅ ADD AUTHORIZATION CHECK: User can only delete their own products
    if (productData.storeId !== req.user?.uid) {
      await SecurityLogger.logAccessControlFailure({
        userId: req.user?.uid || null,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        resource: `products/${productId}`,
        permission: "product_delete",
        userPermissions: ["product_owner"],
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        error: true,
        message: "You can only delete your own products",
        timestamp: new Date().toISOString(),
      });
    }

    // Delete the product
    await productRef.delete();

    // ✅ KEEP ORIGINAL LOGGING
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

    // ✅ ADD SECURITY LOGGING FOR SUCCESS
    await SecurityLogger.logSecurityEvent("PRODUCT_DELETED", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Product deleted successfully",
      severity: "medium", // Deletions are more significant than updates
      metadata: {
        productId,
        productName: productData.productName,
        category: productData.category,
        storeId: productData.storeId,
      },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);

    // ✅ KEEP ORIGINAL LOGGING
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
      action: "delete_product",
      resource: `products/${productId}`,
      status: "failed",
      error: error.message,
    };

    logger.error(logData); // Log to console/file
    await logToFirestore(logData); // Log to Firestore

    // ✅ ADD SECURITY LOGGING FOR ERRORS
    await SecurityLogger.logSecurityEvent("PRODUCT_DELETION_FAILED", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Product deletion failed",
      metadata: {
        error: error.message,
        productId,
      },
    });

    res.status(500).send("Error deleting product");
  }
});

module.exports = router;
