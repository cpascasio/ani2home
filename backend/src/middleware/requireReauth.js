// backend/src/middleware/requireReauth.js - Enhanced version for multiple auth providers

const admin = require("firebase-admin");

const requireReauth = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
        state: "error",
      });
    }

    // Verify the token
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user data from Firebase Auth to check provider
    const userRecord = await admin.auth().getUser(userId);
    const userProviders = userRecord.providerData;

    // Get user document from Firestore
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();
    const userEmail = userData.email || decodedToken.email;

    // Determine authentication provider
    let authProvider = "unknown";
    if (userProviders.length > 0) {
      authProvider = userProviders[0].providerId; // "google.com", "password", etc.
    }

    console.log(
      `🔍 Re-auth check for user ${userId} with provider: ${authProvider}`
    );

    // Handle different authentication providers
    switch (authProvider) {
      case "google.com":
        // For Google OAuth users, check token freshness more strictly
        // Google users don't have passwords, so we rely on fresh authentication
        const tokenIssuedAt = decodedToken.iat * 1000; // Convert to milliseconds
        const twoMinutesAgo = Date.now() - 2 * 60 * 1000; // 2 minutes for OAuth (shorter than password)

        if (tokenIssuedAt < twoMinutesAgo) {
          return res.status(401).json({
            message:
              "Recent authentication required for this sensitive operation. Please re-authenticate and try again.",
            state: "error",
            code: "FRESH_AUTH_REQUIRED",
            authProvider: "google.com",
          });
        }

        console.log(
          "✅ Google OAuth user re-authentication successful (fresh token)"
        );
        break;

      case "password":
        // For email/password users, require current password AND check token freshness
        if (!currentPassword) {
          return res.status(400).json({
            message: "Current password is required for this operation",
            state: "error",
            code: "CURRENT_PASSWORD_REQUIRED",
            authProvider: "password",
          });
        }

        // Check token freshness (5 minutes for password users)
        const passwordTokenIssuedAt = decodedToken.iat * 1000;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

        if (passwordTokenIssuedAt < fiveMinutesAgo) {
          return res.status(401).json({
            message:
              "Recent authentication required. Please log out and log back in, then try again within 5 minutes.",
            state: "error",
            code: "RECENT_AUTH_REQUIRED",
            authProvider: "password",
          });
        }

        // Note: We can't verify the password directly with Firebase Admin SDK
        // The password verification happens during the re-authentication on the frontend
        // If they got a fresh token, we can trust the password was verified
        console.log(
          "✅ Email/password user re-authentication successful (fresh token + password provided)"
        );
        break;

      default:
        return res.status(400).json({
          message: `Unsupported authentication provider: ${authProvider}`,
          state: "error",
          code: "UNSUPPORTED_AUTH_PROVIDER",
        });
    }

    // Log the re-authentication attempt
    await admin
      .firestore()
      .collection("auditLogs")
      .add({
        timestamp: admin.firestore.Timestamp.now(),
        userId: userId,
        action: "critical_operation_reauth_attempt",
        email: userEmail,
        authProvider: authProvider,
        endpoint: req.originalUrl,
        method: req.method,
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "unknown",
        tokenIssuedAt: new Date(decodedToken.iat * 1000),
      });

    console.log(
      `✅ Re-authentication successful for critical operation (${authProvider})`
    );

    // Add user info to request for use in route handlers
    req.user = decodedToken;
    req.userData = userData;
    req.authProvider = authProvider;

    next();
  } catch (error) {
    console.error("❌ Re-authentication failed:", error);

    // Log failed re-authentication
    try {
      await admin
        .firestore()
        .collection("auditLogs")
        .add({
          timestamp: admin.firestore.Timestamp.now(),
          action: "critical_operation_reauth_failed",
          endpoint: req.originalUrl,
          method: req.method,
          error: error.message,
          ipAddress: req.ip || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
        });
    } catch (logError) {
      console.error("Failed to log re-authentication failure:", logError);
    }

    return res.status(401).json({
      message: "Re-authentication failed",
      state: "error",
      code: "REAUTH_FAILED",
    });
  }
};

module.exports = requireReauth;
