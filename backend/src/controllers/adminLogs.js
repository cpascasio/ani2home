const express = require("express");
const SecurityLogger = require("../../utils/SecurityLogger");
const { admin } = require("../config/firebase-config");
// ❌ Remove these imports - not needed anymore
// const { authenticateWithLogging } = require("../middleware/authWithLogging");
// const { requireAdmin } = require("../middleware/auth")

const router = express.Router();

// 🆕 NEW: Simple admin validation endpoint
router.get("/validate-access", async (req, res) => {
  try {
    // If this route is reached, the user has already passed:
    // 1. authenticateUser middleware (verified Firebase token)
    // 2. requireAdmin middleware (verified isAdmin = true in Firestore)

    console.log(
      "✅ [ADMIN] Admin access validation successful for:",
      req.user.email
    );

    res.json({
      hasAccess: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        isAdmin: true, // Already verified by middleware
      },
      message: "Admin access granted",
    });
  } catch (error) {
    console.error("❌ [ADMIN] Admin validation error:", error);
    res.status(500).json({
      hasAccess: false,
      message: "Validation error",
    });
  }
});

// Get security logs (Admin only - Requirement 2.4.4)
// ✅ No middleware here - handled in server.js
router.get("/security-logs", async (req, res) => {
  try {
    const { category, startDate, endDate, limit } = req.query;

    // 🆕 Log admin access to security logs
    await SecurityLogger.logSecurityEvent("ADMIN_LOG_ACCESS", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      description: "Administrator accessed security logs",
      metadata: {
        filters: { category, startDate, endDate, limit },
        adminEmail: req.userData?.email || req.user.email,
      },
    });

    const logs = await SecurityLogger.getSecurityLogs(req.user.uid, {
      category,
      startDate,
      endDate,
      limit: parseInt(limit) || 100,
    });

    res.json({
      success: true,
      logs,
      count: logs.length,
      filters: { category, startDate, endDate, limit },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // 🆕 Enhanced error logging
    await SecurityLogger.logSecurityEvent("ADMIN_LOG_ACCESS_ERROR", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      severity: "high",
      description: "Error accessing security logs",
      metadata: { error: error.message },
    });

    res.status(error.message.includes("Access denied") ? 403 : 500).json({
      error: true,
      message: error.message.includes("Access denied")
        ? "Administrative privileges required"
        : "Failed to retrieve logs",
      timestamp: new Date().toISOString(),
    });
  }
});

// Log statistics (Admin only)
// ✅ No middleware here - handled in server.js
router.get("/log-stats", async (req, res) => {
  try {
    // ❌ Remove manual admin checking - already done in server.js
    // No need for this anymore:
    // const adminDoc = await admin.firestore().collection("users").doc(req.user.uid).get();
    // if (!adminDoc.data()?.isAdmin) { throw new Error("Access denied"); }

    const db = admin.firestore();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get stats for different time periods
    const [authLogs24h, accessLogs24h, validationLogs24h, authLogs7d] =
      await Promise.all([
        db
          .collection("securityLogs")
          .where("category", "==", "AUTHENTICATION")
          .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(last24h))
          .get(),

        db
          .collection("securityLogs")
          .where("category", "==", "AUTHORIZATION")
          .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(last24h))
          .get(),

        db
          .collection("securityLogs")
          .where("category", "==", "DATA_VALIDATION")
          .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(last24h))
          .get(),

        db
          .collection("securityLogs")
          .where("category", "==", "AUTHENTICATION")
          .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(last7d))
          .get(),
      ]);

    // 🆕 Log admin access to stats
    await SecurityLogger.logSecurityEvent("ADMIN_STATS_ACCESS", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      description: "Administrator accessed log statistics",
      metadata: { adminEmail: req.userData?.email || req.user.email },
    });

    res.json({
      success: true,
      stats: {
        last24h: {
          authEvents: authLogs24h.size,
          accessControlFailures: accessLogs24h.size,
          validationFailures: validationLogs24h.size,
        },
        last7d: {
          authEvents: authLogs7d.size,
        },
        period: "last24h_and_7d",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // 🆕 Enhanced error logging
    await SecurityLogger.logSecurityEvent("ADMIN_STATS_ACCESS_ERROR", {
      userId: req.user?.uid || null,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      severity: "high",
      description: "Error accessing log statistics",
      metadata: { error: error.message },
    });

    res.status(500).json({
      error: true,
      message: "Failed to retrieve statistics",
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
