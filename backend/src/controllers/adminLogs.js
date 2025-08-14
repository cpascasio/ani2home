// backend/src/controllers/adminLogs.js
const express = require("express");
const SecurityLogger = require("../../utils/SecurityLogger");
const { admin } = require("../config/firebase-config");

const router = express.Router();

// Admin validation endpoint
router.get("/validate-access", async (req, res) => {
  try {
    console.log(
      "✅ [ADMIN] Admin access validation successful for:",
      req.user.email
    );

    res.json({
      hasAccess: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        isAdmin: true,
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

// Updated security logs endpoint with pagination support
router.get("/security-logs", async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 100, page = 1 } = req.query;

    // Log admin access
    await SecurityLogger.logSecurityEvent("ADMIN_LOG_ACCESS", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      description: "Administrator accessed security logs",
      metadata: {
        filters: { category, startDate, endDate, limit, page },
        adminEmail: req.user.email,
      },
    });

    const db = admin.firestore();
    let query = db.collection("securityLogs").orderBy("timestamp", "desc");
    let countQuery = db.collection("securityLogs");

    // Apply filters for both data query and count query
    if (category) {
      query = query.where("category", "==", category);
      countQuery = countQuery.where("category", "==", category);
    }

    if (startDate) {
      const startTimestamp = admin.firestore.Timestamp.fromDate(
        new Date(startDate)
      );
      query = query.where("timestamp", ">=", startTimestamp);
      countQuery = countQuery.where("timestamp", ">=", startTimestamp);
    }

    if (endDate) {
      const endTimestamp = admin.firestore.Timestamp.fromDate(
        new Date(endDate)
      );
      query = query.where("timestamp", "<=", endTimestamp);
      countQuery = countQuery.where("timestamp", "<=", endTimestamp);
    }

    // Get total count (for pagination)
    const totalCountSnapshot = await countQuery.get();
    const totalCount = totalCountSnapshot.size;

    // Apply pagination to data query
    const pageSize = parseInt(limit);
    const pageNumber = parseInt(page);
    const offset = (pageNumber - 1) * pageSize;

    // Get the paginated results
    const logsSnapshot = await query.limit(pageSize).offset(offset).get();

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    }));

    res.json({
      success: true,
      logs,
      totalCount, // 🆕 This is what the frontend needs!
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      pageSize,
      filters: { category, startDate, endDate, limit, page },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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

// Log statistics endpoint (unchanged)
router.get("/log-stats", async (req, res) => {
  try {
    const db = admin.firestore();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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

    await SecurityLogger.logSecurityEvent("ADMIN_STATS_ACCESS", {
      userId: req.user.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      description: "Administrator accessed log statistics",
      metadata: { adminEmail: req.user.email },
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
