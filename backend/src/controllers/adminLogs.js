// backend/src/controllers/adminLogs.js - Updated to include email in logs
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

// Enhanced security logs endpoint with email enrichment
router.get("/security-logs", async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 100, page = 1 } = req.query;

    // Log admin access with enhanced metadata
    await SecurityLogger.logSecurityEvent("ADMIN_LOG_ACCESS", {
      userId: req.user.uid,
      email: req.user.email, // 🆕 Include email
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

    // 🆕 Enhanced log processing with email enrichment
    const logs = await Promise.all(
      logsSnapshot.docs.map(async (doc) => {
        const logData = doc.data();
        let enrichedLog = {
          id: doc.id,
          ...logData,
          timestamp: logData.timestamp.toDate().toISOString(),
        };

        // 🆕 If log has userId but no email, try to fetch email from users collection
        if (logData.userId && !logData.email) {
          try {
            const userDoc = await db
              .collection("users")
              .doc(logData.userId)
              .get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              enrichedLog.email = userData.email || null;
              // 🆕 Also add additional user context if available
              enrichedLog.userRole = userData.isAdmin
                ? "admin"
                : userData.isStore
                  ? "store"
                  : "user";
              enrichedLog.accountStatus = userData.isDisabled
                ? "disabled"
                : "active";
            }
          } catch (userFetchError) {
            console.warn(
              `Failed to fetch user data for ${logData.userId}:`,
              userFetchError.message
            );
            // Continue without email - don't fail the entire request
          }
        }

        return enrichedLog;
      })
    );

    res.json({
      success: true,
      logs,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      pageSize,
      filters: { category, startDate, endDate, limit, page },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await SecurityLogger.logSecurityEvent("ADMIN_LOG_ACCESS_ERROR", {
      userId: req.user?.uid || null,
      email: req.user?.email || null, // 🆕 Include email
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

// Enhanced log statistics endpoint
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
      email: req.user.email, // 🆕 Include email
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
      email: req.user?.email || null, // 🆕 Include email
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
