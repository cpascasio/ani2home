const express = require("express");
const SecurityLogger = require("../utils/SecurityLogger");
const { authenticateWithLogging } = require("../middleware/authWithLogging");

const router = express.Router();

// Get security logs (Admin only - Requirement 2.4.4)
router.get("/security-logs", authenticateWithLogging, async (req, res) => {
  try {
    const { category, startDate, endDate, limit } = req.query;

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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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
router.get("/log-stats", authenticateWithLogging, async (req, res) => {
  try {
    // Verify admin access first
    const adminDoc = await admin
      .firestore()
      .collection("users")
      .doc(req.user.uid)
      .get();
    if (!adminDoc.data()?.isAdmin) {
      throw new Error("Access denied");
    }

    const db = admin.firestore();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get stats for last 24 hours
    const authLogs = await db
      .collection("securityLogs")
      .where("category", "==", "AUTHENTICATION")
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(last24h))
      .get();

    const accessLogs = await db
      .collection("securityLogs")
      .where("category", "==", "AUTHORIZATION")
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(last24h))
      .get();

    const validationLogs = await db
      .collection("securityLogs")
      .where("category", "==", "DATA_VALIDATION")
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(last24h))
      .get();

    res.json({
      success: true,
      stats: {
        authEvents: authLogs.size,
        accessControlFailures: accessLogs.size,
        validationFailures: validationLogs.size,
        period: "last24h",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(403).json({
      error: true,
      message: "Administrative privileges required",
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
