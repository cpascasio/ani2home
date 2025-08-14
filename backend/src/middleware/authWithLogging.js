const { admin } = require("../config/firebase-config");
const SecurityLogger = require("../../utils/SecurityLogger");

const authenticateWithLogging = async (req, res, next) => {
  const ipAddress = req.ip;
  const userAgent = req.get("User-Agent");
  const endpoint = req.originalUrl;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      await SecurityLogger.logAuthAttempt("MISSING_TOKEN", {
        ipAddress,
        userAgent,
        success: false,
        failureReason: "No authorization header provided",
        metadata: { endpoint },
      });

      return res.status(401).json({
        error: true,
        message: "Authentication required",
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user data
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    const userData = userDoc.data();

    if (!userData) {
      await SecurityLogger.logAuthAttempt("USER_NOT_FOUND", {
        userId: decodedToken.uid,
        email: decodedToken.email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "User document not found in database",
      });

      return res.status(401).json({
        error: true,
        message: "Authentication failed",
        timestamp: new Date().toISOString(),
      });
    }

    // Log successful authentication
    await SecurityLogger.logAuthAttempt("TOKEN_VALIDATION_SUCCESS", {
      userId: decodedToken.uid,
      email: decodedToken.email,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        endpoint,
        isStore: userData.isStore || false,
      },
    });

    req.user = decodedToken;
    req.userData = userData;
    next();
  } catch (error) {
    await SecurityLogger.logAuthAttempt("TOKEN_VALIDATION_FAILED", {
      ipAddress,
      userAgent,
      success: false,
      failureReason: error.message,
      metadata: {
        endpoint,
        errorType: error.code || "unknown",
      },
    });

    res.status(401).json({
      error: true,
      message: "Authentication failed",
      timestamp: new Date().toISOString(),
    });
  }
};

// Store access control with logging
const requireStoreWithLogging = async (req, res, next) => {
  const userData = req.userData;
  const userId = req.user?.uid;

  if (!userData?.isStore) {
    await SecurityLogger.logAccessControlFailure({
      userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      resource: "store_functions",
      permission: "store_access",
      userPermissions: ["basic_user"],
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

module.exports = {
  authenticateWithLogging,
  requireStoreWithLogging,
};
