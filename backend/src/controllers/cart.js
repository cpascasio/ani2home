const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const { logger, logToFirestore } = require("../config/firebase-config");
const Joi = require("joi");

const cartSchema = require("../models/cartModels");

// Firestore database reference
const db = admin.firestore();

// Enhanced validation schemas for security
const addToCartSchema = Joi.object({
  userId: Joi.string().required().min(1).max(128),
  sellerId: Joi.string().required().min(1).max(128),
  productId: Joi.string().required().min(1).max(128),
  quantity: Joi.number().integer().min(1).max(999).required(),
});

const removeFromCartSchema = Joi.object({
  userId: Joi.string().required().min(1).max(128),
  productId: Joi.string().required().min(1).max(128),
});

const removeSellerItemsSchema = Joi.object({
  userId: Joi.string().required().min(1).max(128),
  sellerId: Joi.string().required().min(1).max(128),
});

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

// GET /api/cart/:userId - Get user's cart with authentication check
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Security: Check if the requesting user matches the cart owner
    if (req.user.uid !== userId) {
      const errorMsg = "Unauthorized: Cannot access another user's cart";

      const logData = createLogData(
        req.user.uid,
        "unauthorized_cart_access",
        `cart/${userId}`,
        "failed",
        { requestedUserId: userId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    const doc = await db.collection("cart").doc(userId).get();

    if (!doc.exists) {
      const logData = createLogData(
        userId,
        "get_cart",
        `cart/${userId}`,
        "success",
        { message: "Cart not found, returning empty cart" }
      );

      await logToFirestore(logData);
      logger.info(logData);

      return res.json([]); // Return empty array instead of 404
    }

    const cartData = doc.data().cart || [];
    console.log("🚀 ~ router.get ~ cartData:", cartData);

    // Fetch seller details for each cart item
    const cartWithSellerDetails = await Promise.all(
      cartData.map(async (item) => {
        try {
          const sellerDoc = await db
            .collection("users")
            .doc(item.sellerId)
            .get();
          const sellerData = sellerDoc.exists ? sellerDoc.data() : null;
          return {
            ...item,
            seller: sellerData,
          };
        } catch (error) {
          console.error(`Error fetching seller ${item.sellerId}:`, error);
          return {
            ...item,
            seller: null,
          };
        }
      })
    );

    const logData = createLogData(
      userId,
      "get_cart",
      `cart/${userId}`,
      "success",
      { itemCount: cartWithSellerDetails.length }
    );

    await logToFirestore(logData);
    logger.info(logData);

    res.json(cartWithSellerDetails);
  } catch (error) {
    console.error("Error getting cart:", error);

    const logData = createLogData(
      req.user?.uid || "unknown",
      "get_cart",
      `cart/${userId}`,
      "failed",
      {},
      error
    );

    await logToFirestore(logData);
    logger.error(logData);

    res.status(500).json({
      message: "Error retrieving cart",
      state: "error",
    });
  }
});

// PUT /api/cart/remove-seller-items - Remove all items from a specific seller
router.put("/remove-seller-items/", async (req, res) => {
  try {
    // Input validation
    const { error, value } = removeSellerItemsSchema.validate(req.body);
    if (error) {
      const logData = createLogData(
        req.user?.uid || "unknown",
        "remove_seller_items",
        "cart/validation",
        "failed",
        { validationErrors: error.details },
        "Invalid input data"
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(400).json({
        message: "Invalid input data",
        state: "error",
        details: error.details,
      });
    }

    const { userId, sellerId } = value;

    // Security: Check if the requesting user matches the cart owner
    if (req.user.uid !== userId) {
      const errorMsg = "Unauthorized: Cannot modify another user's cart";

      const logData = createLogData(
        req.user.uid,
        "unauthorized_cart_modification",
        `cart/${userId}`,
        "failed",
        { requestedUserId: userId, sellerId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    console.log(`Removing seller ${sellerId} items from user ${userId}'s cart`);

    // Get the user's cart document
    const cartDocRef = db.collection("cart").doc(userId);
    const cartDoc = await cartDocRef.get();

    if (!cartDoc.exists) {
      const errorMsg = "Cart not found for user";
      console.log(errorMsg);

      const logData = createLogData(
        userId,
        "remove_seller_items",
        `cart/${userId}`,
        "failed",
        { sellerId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(404).json({
        message: errorMsg,
        state: "error",
      });
    }

    // Get current cart data
    const cartData = cartDoc.data().cart || [];
    console.log("Current cart data:", cartData);

    // Filter out the seller's items
    const updatedCart = cartData.filter((item) => item.sellerId !== sellerId);
    console.log("Updated cart data:", updatedCart);

    // Update the cart document
    await cartDocRef.update({ cart: updatedCart });

    // Log success
    const successMsg = `Successfully removed seller ${sellerId} items from cart`;
    console.log(successMsg);

    const logData = createLogData(
      userId,
      "remove_seller_items",
      `cart/${userId}`,
      "success",
      {
        sellerId,
        itemsRemoved: cartData.length - updatedCart.length,
        updatedCartLength: updatedCart.length,
      }
    );

    await logToFirestore(logData);
    logger.info(logData);

    res.json({
      message: successMsg,
      state: "success",
      updatedCart,
    });
  } catch (error) {
    console.error("Error removing seller items from cart:", error);

    const logData = createLogData(
      req.user?.uid || "unknown",
      "remove_seller_items",
      "cart/error",
      "failed",
      { requestBody: req.body },
      error
    );

    await logToFirestore(logData);
    logger.error(logData);

    res.status(500).json({
      message: "Error removing seller items from cart",
      state: "error",
    });
  }
});

// GET /api/cart/:userId/:sellerId - Get cart items for specific seller
router.get("/:userId/:sellerId", async (req, res) => {
  try {
    const { userId, sellerId } = req.params;

    // Security: Check if the requesting user matches the cart owner
    if (req.user.uid !== userId) {
      const errorMsg = "Unauthorized: Cannot access another user's cart";

      const logData = createLogData(
        req.user.uid,
        "unauthorized_cart_access",
        `cart/${userId}/${sellerId}`,
        "failed",
        { requestedUserId: userId, sellerId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    const userCartDoc = await db.collection("cart").doc(userId).get();

    if (!userCartDoc.exists) {
      return res.status(404).json({
        message: "Cart not found",
        state: "error",
      });
    }

    const cartData = userCartDoc.data().cart || [];
    const filteredCart = cartData.filter((item) => item.sellerId === sellerId);

    console.log("Filtered cart:", filteredCart);

    const logData = createLogData(
      userId,
      "get_seller_cart",
      `cart/${userId}/${sellerId}`,
      "success",
      { itemCount: filteredCart.length }
    );

    await logToFirestore(logData);
    logger.info(logData);

    res.json(filteredCart);
  } catch (error) {
    console.error("Error getting cart:", error);

    const logData = createLogData(
      req.user?.uid || "unknown",
      "get_seller_cart",
      `cart/${req.params.userId}/${req.params.sellerId}`,
      "failed",
      {},
      error
    );

    await logToFirestore(logData);
    logger.error(logData);

    res.status(500).json({
      message: "Error retrieving cart",
      state: "error",
    });
  }
});

// GET /api/cart/checkout/:userId/:sellerId - Get checkout data for specific seller
router.get("/checkout/:userId/:sellerId", async (req, res) => {
  const { sellerId, userId } = req.params;

  try {
    // Security: Check if the requesting user matches the cart owner
    if (req.user.uid !== userId) {
      const errorMsg = "Unauthorized: Cannot access another user's cart";

      const logData = createLogData(
        req.user.uid,
        "unauthorized_checkout_access",
        `cart/checkout/${userId}/${sellerId}`,
        "failed",
        { requestedUserId: userId, sellerId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    const value = await db.collection("cart").doc(userId).get();

    if (!value.exists) {
      return res.status(404).json({
        message: "Cart not found",
        state: "error",
      });
    }

    // Check .cart[].sellerId === sellerId and return cart[].items
    const cart = value.data().cart.filter((item) => item.sellerId === sellerId);

    if (cart.length > 0) {
      const result = cart[0]; // Get the first element
      console.log("Cart:", result);

      // Check the productId of each item in the cart and get the price from the products collection
      for (let item of result.items) {
        const product = await db
          .collection("products")
          .doc(item.productId)
          .get();
        // Add all product details to the item
        item.product = product.exists ? product.data() : null;
      }

      // Check user details get the address.lat and lng
      const user = await db.collection("users").doc(sellerId).get();
      result.seller = user.exists ? user.data() : null;

      const logData = createLogData(
        userId,
        "get_checkout_data",
        `cart/checkout/${userId}/${sellerId}`,
        "success",
        { sellerId, itemCount: result.items.length }
      );

      await logToFirestore(logData);
      logger.info(logData);

      res.json(result);
    } else {
      const logData = createLogData(
        userId,
        "get_checkout_data",
        `cart/checkout/${userId}/${sellerId}`,
        "failed",
        { sellerId },
        "No items found for the given sellerId"
      );

      await logToFirestore(logData);
      logger.error(logData);

      res.status(404).json({
        message: "No items found for the given seller",
        state: "error",
      });
    }
  } catch (error) {
    console.error("Error getting cart items:", error);

    const logData = createLogData(
      req.user?.uid || "unknown",
      "get_checkout_data",
      `cart/checkout/${userId}/${sellerId}`,
      "failed",
      {},
      error
    );

    await logToFirestore(logData);
    logger.error(logData);

    res.status(500).json({
      message: "Error retrieving checkout data",
      state: "error",
    });
  }
});

// POST /api/cart/add-to-cart - Add item to cart
router.post("/add-to-cart", async (req, res) => {
  try {
    // Input validation
    const { error, value } = addToCartSchema.validate(req.body);
    if (error) {
      const logData = createLogData(
        req.user?.uid || "unknown",
        "add_to_cart",
        "cart/validation",
        "failed",
        { validationErrors: error.details, requestBody: req.body },
        "Invalid input data"
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(400).json({
        message: "Invalid input data",
        state: "error",
        details: error.details,
      });
    }

    const { userId, sellerId, productId, quantity } = value;

    console.log("Request body:", req.body);

    // Security: Check if the requesting user matches the cart owner
    if (req.user.uid !== userId) {
      const errorMsg = "Unauthorized: Cannot modify another user's cart";

      const logData = createLogData(
        req.user.uid,
        "unauthorized_cart_modification",
        `cart/${userId}`,
        "failed",
        { requestedUserId: userId, sellerId, productId, quantity },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    // Verify product exists and is active
    const productDoc = await db.collection("products").doc(productId).get();
    if (!productDoc.exists) {
      const errorMsg = "Product not found";

      const logData = createLogData(
        userId,
        "add_to_cart",
        `cart/${userId}`,
        "failed",
        { productId, sellerId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(404).json({
        message: errorMsg,
        state: "error",
      });
    }

    const productData = productDoc.data();

    // Check if product belongs to the specified seller
    if (productData.sellerId !== sellerId) {
      const errorMsg = "Product does not belong to the specified seller";

      const logData = createLogData(
        userId,
        "add_to_cart",
        `cart/${userId}`,
        "failed",
        { productId, sellerId, actualSellerId: productData.sellerId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(400).json({
        message: errorMsg,
        state: "error",
      });
    }

    // Verify seller exists and is active
    const sellerDoc = await db.collection("users").doc(sellerId).get();
    if (!sellerDoc.exists || !sellerDoc.data().isStore) {
      const errorMsg = "Seller not found or not a store";

      const logData = createLogData(
        userId,
        "add_to_cart",
        `cart/${userId}`,
        "failed",
        { sellerId, productId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(404).json({
        message: errorMsg,
        state: "error",
      });
    }

    const userCartDoc = await db.collection("cart").doc(userId).get();
    console.log(
      "User cart doc:",
      userCartDoc.exists ? userCartDoc.data() : "No cart found"
    );

    let cartData = [];
    if (userCartDoc.exists) {
      cartData = userCartDoc.data().cart || [];
    }

    console.log("Current cart data:", cartData);

    let sellerExists = false;

    if (cartData.length > 0) {
      for (let seller of cartData) {
        if (seller.sellerId === sellerId) {
          sellerExists = true;

          let productExists = false;

          for (let item of seller.items) {
            if (item.productId === productId) {
              // Product already exists, increment quantity
              item.quantity += quantity;
              productExists = true;
              break;
            }
          }

          if (!productExists) {
            // Product doesn't exist under this seller, add new item
            seller.items.push({ productId, quantity });
          }

          break; // Break after processing the matched seller
        }
      }
    }

    if (!sellerExists) {
      cartData.push({
        sellerId,
        items: [{ productId, quantity }],
      });
    }

    console.log("Updated cart data:", cartData);

    await db
      .collection("cart")
      .doc(userId)
      .set({ cart: cartData }, { merge: true });

    console.log("Cart updated in Firestore");

    const logData = createLogData(
      userId,
      "add_to_cart",
      `cart/${userId}`,
      "success",
      {
        sellerId,
        productId,
        quantity,
        cartItemCount: cartData.length,
      }
    );

    logger.info(logData);
    await logToFirestore(logData);

    res.status(201).json({
      message: "Product added to cart successfully",
      state: "success",
      cart: cartData,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);

    const logData = createLogData(
      req.user?.uid || "unknown",
      "add_to_cart",
      "cart/error",
      "failed",
      { requestBody: req.body },
      error
    );

    logger.error(logData);
    await logToFirestore(logData);

    res.status(500).json({
      message: "Error adding product to cart",
      state: "error",
    });
  }
});

// DELETE /api/cart/remove-from-cart - Remove item from cart
router.delete("/remove-from-cart", async (req, res) => {
  try {
    // Input validation
    const { error, value } = removeFromCartSchema.validate(req.body);
    if (error) {
      const logData = createLogData(
        req.user?.uid || "unknown",
        "remove_from_cart",
        "cart/validation",
        "failed",
        { validationErrors: error.details, requestBody: req.body },
        "Invalid input data"
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(400).json({
        message: "Invalid input data",
        state: "error",
        details: error.details,
      });
    }

    const { userId, productId } = value;

    console.log("Request body:", req.body);

    // Security: Check if the requesting user matches the cart owner
    if (req.user.uid !== userId) {
      const errorMsg = "Unauthorized: Cannot modify another user's cart";

      const logData = createLogData(
        req.user.uid,
        "unauthorized_cart_modification",
        `cart/${userId}`,
        "failed",
        { requestedUserId: userId, productId },
        errorMsg
      );

      await logToFirestore(logData);
      logger.error(logData);

      return res.status(403).json({
        message: "Access denied",
        state: "error",
      });
    }

    // Get the user's cart document
    const userDocRef = db.collection("cart").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      const logData = createLogData(
        userId,
        "remove_from_cart",
        `cart/${userId}`,
        "failed",
        { productId },
        "Cart not found"
      );

      logger.error(logData);
      await logToFirestore(logData);

      return res.status(404).json({
        message: "Cart not found",
        state: "error",
      });
    }

    const cartData = userDoc.data().cart || [];

    console.log("Cart Data:", cartData);

    // Log each item's details for debugging
    cartData.forEach((cartEntry, index) => {
      console.log(`Cart Entry ${index + 1}:`, cartEntry);
      console.log("Seller ID:", cartEntry.sellerId);
      cartEntry.items.forEach((item, itemIndex) => {
        console.log(`  Item ${itemIndex + 1}:`, item);
        console.log("    Product ID:", item.productId);
        console.log("    Quantity:", item.quantity);
      });
    });

    // Filter out the item with the matching productId
    const updatedCart = cartData
      .map((cartEntry) => {
        return {
          ...cartEntry,
          items: cartEntry.items.filter((item) => item.productId !== productId),
        };
      })
      .filter((cartEntry) => cartEntry.items.length > 0);

    console.log("Updated Cart Data:", updatedCart);

    // Update the user's cart document
    await userDocRef.update({ cart: updatedCart });

    console.log("Product removed from cart:", productId);

    const logData = createLogData(
      userId,
      "remove_from_cart",
      `cart/${userId}`,
      "success",
      {
        productId,
        updatedCartLength: updatedCart.length,
      }
    );

    logger.info(logData);
    await logToFirestore(logData);

    res.json({
      message: "Product removed from cart",
      state: "success",
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);

    const logData = createLogData(
      req.user?.uid || "unknown",
      "remove_from_cart",
      "cart/error",
      "failed",
      { requestBody: req.body },
      error
    );

    logger.error(logData);
    await logToFirestore(logData);

    res.status(500).json({
      message: "Error removing product from cart",
      state: "error",
    });
  }
});

module.exports = router;
