// backend/middleware/auth.js
// This is the ONLY auth middleware file you need

const admin = require("firebase-admin");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if user exists and is active in Firestore
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    // Check if account is disabled or locked
    if (userData.isDisabled) {
      throw new Error("Account is disabled");
    }

    // Check if account is currently locked
    if (
      userData.accountLockedUntil &&
      new Date(userData.accountLockedUntil) > new Date()
    ) {
      return res.status(423).json({
        message: "Account is temporarily locked",
        state: "error",
      });
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email,
      isStore: userData.isStore || false,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    // Fail securely (Requirement 2.1.2)
    res.status(401).json({
      message: "Please authenticate",
      state: "error",
    });
  }
};

// Optional: Middleware to check if user is a store/seller
const requireStore = async (req, res, next) => {
  if (!req.user || !req.user.isStore) {
    return res.status(403).json({
      message: "Store access required",
      state: "error",
    });
  }
  next();
};

// Optional: Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(req.user.uid)
      .get();

    const userData = userDoc.data();

    if (!userData.isAdmin) {
      return res.status(403).json({
        message: "Admin access required",
        state: "error",
      });
    }

    next();
  } catch (error) {
    res.status(403).json({
      message: "Admin access required",
      state: "error",
    });
  }
};

module.exports = {
  authenticateUser,
  requireStore,
  requireAdmin,
};
