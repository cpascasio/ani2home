// backend/middleware/auth.js
// This is the ONLY auth middleware file you need

const { admin } = require("../config/firebase-config");

const authenticateUser = async (req, res, next) => {
  try {
    console.log("🔍 [AUTH] Starting authentication for:", req.method, req.url);

    const authHeader = req.headers.authorization;
    console.log("🔍 [AUTH] Auth header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ [AUTH] No valid authorization header");
      return res.status(401).json({
        message: "Authentication token required",
        state: "error",
        code: "MISSING_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log(
      "🔍 [AUTH] Token extracted (first 50 chars):",
      token.substring(0, 50) + "..."
    );
    console.log("🔍 [AUTH] Token length:", token.length);

    try {
      console.log("🔍 [AUTH] Attempting Firebase token verification...");

      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token, true); // checkRevoked = true

      console.log("✅ [AUTH] Token verified successfully!");
      console.log("🔍 [AUTH] Decoded token user ID:", decodedToken.uid);
      console.log("🔍 [AUTH] Decoded token email:", decodedToken.email);
      console.log(
        "🔍 [AUTH] Token issued at:",
        new Date(decodedToken.iat * 1000).toISOString()
      );
      console.log(
        "🔍 [AUTH] Token expires at:",
        new Date(decodedToken.exp * 1000).toISOString()
      );

      // Add user info to request
      req.user = decodedToken;
      req.userId = decodedToken.uid;

      console.log(
        "✅ [AUTH] Authentication successful, proceeding to next middleware"
      );
      next();
    } catch (tokenError) {
      console.error("❌ [AUTH] Token verification failed!");
      console.error("❌ [AUTH] Error code:", tokenError.code);
      console.error("❌ [AUTH] Error message:", tokenError.message);
      console.error("❌ [AUTH] Full error:", tokenError);

      // Provide specific error codes for frontend handling
      let errorCode = "INVALID_TOKEN";
      let message = "Invalid authentication token";

      if (tokenError.code === "auth/id-token-expired") {
        errorCode = "TOKEN_EXPIRED";
        message = "Authentication token has expired";
        console.log("🕐 [AUTH] Token expired");
      } else if (tokenError.code === "auth/id-token-revoked") {
        errorCode = "TOKEN_REVOKED";
        message = "Authentication token has been revoked";
        console.log("🚫 [AUTH] Token revoked");
      } else if (tokenError.code === "auth/project-not-found") {
        console.log("🏗️ [AUTH] Firebase project not found - check config");
      } else if (tokenError.code === "auth/invalid-id-token") {
        console.log("🔍 [AUTH] Invalid token format");
      }

      return res.status(401).json({
        message,
        state: "error",
        code: errorCode,
      });
    }
  } catch (error) {
    console.error("❌ [AUTH] Authentication middleware error:", error);
    console.error("❌ [AUTH] Error stack:", error.stack);
    return res.status(500).json({
      message: "Authentication service error",
      state: "error",
      code: "AUTH_SERVICE_ERROR",
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
