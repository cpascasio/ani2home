// backend/middleware/selectiveAuth.js
// Fixed version that properly fetches user data from Firestore

const { admin } = require("../config/firebase-config");
const SecurityLogger = require("../../utils/SecurityLogger");

// Helper function to authenticate and fetch full user data
const authenticateAndFetchUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      await SecurityLogger.logAuthAttempt("MISSING_TOKEN", {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        success: false,
        failureReason: "No authorization header provided",
        metadata: { endpoint: req.originalUrl },
      });

      return {
        success: false,
        status: 401,
        message: "Authentication required",
      };
    }

    const token = authHeader.split(" ")[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Fetch full user document from Firestore
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      await SecurityLogger.logAuthAttempt("USER_NOT_FOUND", {
        userId: decodedToken.uid,
        email: decodedToken.email,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        success: false,
        failureReason: "User document not found in database",
      });

      return {
        success: false,
        status: 401,
        message: "Authentication failed",
      };
    }

    const userData = userDoc.data();

    // Log successful authentication
    await SecurityLogger.logAuthAttempt("TOKEN_VALIDATION_SUCCESS", {
      userId: decodedToken.uid,
      email: decodedToken.email,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      success: true,
      metadata: {
        endpoint: req.originalUrl,
        isStore: userData.isStore || false,
        isAdmin: userData.isAdmin || false,
      },
    });

    // Set both Firebase token data AND Firestore user data
    req.user = decodedToken;
    req.userData = userData;

    return { success: true };
  } catch (error) {
    await SecurityLogger.logAuthAttempt("TOKEN_VALIDATION_FAILED", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      success: false,
      failureReason: error.message,
      metadata: {
        endpoint: req.originalUrl,
        errorType: error.code || "unknown",
      },
    });

    return {
      success: false,
      status: 401,
      message: "Authentication failed",
    };
  }
};

// Fixed selective auth middleware
const selectiveAuth = async (req, res, next) => {
  // Allow all GET requests without authentication
  if (req.method === "GET") {
    return next();
  }

  // Special case: create-user endpoint only needs Firebase auth (not full user doc)
  if (req.method === "POST" && req.path === "/create-user") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: true,
          message: "Authentication required",
          timestamp: new Date().toISOString(),
        });
      }

      const token = authHeader.split(" ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch (error) {
      return res.status(401).json({
        error: true,
        message: "Authentication failed",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // For all other POST, PUT, DELETE, PATCH requests - require full authentication
  const authResult = await authenticateAndFetchUser(req, res);

  if (!authResult.success) {
    return res.status(authResult.status).json({
      error: true,
      message: authResult.message,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Fixed selective auth for store - properly checks isStore from Firestore
const selectiveAuthForStore = async (req, res, next) => {
  // Allow all GET requests without authentication
  if (req.method === "GET") {
    return next();
  }

  // For non-GET requests, authenticate and fetch full user data
  const authResult = await authenticateAndFetchUser(req, res);

  if (!authResult.success) {
    return res.status(authResult.status).json({
      error: true,
      message: authResult.message,
      timestamp: new Date().toISOString(),
    });
  }

  // NOW properly check isStore from Firestore data
  const userData = req.userData;

  if (!userData || !userData.isStore) {
    // Log access control failure
    await SecurityLogger.logAccessControlFailure({
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      resource: "store_functions",
      permission: "store_access",
      userPermissions: userData
        ? userData.isAdmin
          ? ["admin"]
          : ["basic_user"]
        : ["none"],
      endpoint: req.originalUrl,
      method: req.method,
    });

    return res.status(403).json({
      error: true,
      message: "Store access required",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Fixed selective auth for admin - properly checks isAdmin from Firestore
const selectiveAuthForAdmin = async (req, res, next) => {
  // Allow all GET requests without authentication
  if (req.method === "GET") {
    return next();
  }

  // For non-GET requests, authenticate and fetch full user data
  const authResult = await authenticateAndFetchUser(req, res);

  if (!authResult.success) {
    return res.status(authResult.status).json({
      error: true,
      message: authResult.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Check isAdmin from Firestore data
  const userData = req.userData;

  if (!userData || !userData.isAdmin) {
    // Log access control failure
    await SecurityLogger.logAccessControlFailure({
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      resource: "admin_functions",
      permission: "admin_access",
      userPermissions: userData
        ? userData.isStore
          ? ["store_user"]
          : ["basic_user"]
        : ["none"],
      endpoint: req.originalUrl,
      method: req.method,
    });

    return res.status(403).json({
      error: true,
      message: "Administrator access required",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

module.exports = {
  selectiveAuth,
  selectiveAuthForStore,
  selectiveAuthForAdmin, // New admin version
  authenticateAndFetchUser, // Export for reuse
};
