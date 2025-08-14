const logger = require("../src/config/logger");
const { admin } = require("../src/config/firebase-config");
const db = admin.firestore();

class SecurityLogger {
  // Log authentication attempts (Requirement 2.4.6)
  static async logAuthAttempt(eventType, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      category: "AUTHENTICATION",
      ipAddress: data.ipAddress || "unknown",
      userAgent: data.userAgent || "unknown",
      email: data.email || null,
      userId: data.userId || null,
      success: data.success || false,
      failureReason: data.failureReason || null,
      sessionId: data.sessionId || null,
      metadata: data.metadata || {},
    };

    // Log to winston
    logger.info("Auth attempt", logEntry);

    // Log to Firestore for admin access (Requirement 2.4.4)
    try {
      await db.collection("securityLogs").add({
        ...logEntry,
        timestamp: admin.firestore.Timestamp.now(),
      });
    } catch (error) {
      logger.error("Failed to log to Firestore", { error: error.message });
    }

    console.log(
      `🔐 AUTH ${data.success ? "SUCCESS" : "FAILURE"}: ${eventType} - ${data.email || "unknown"}`
    );
  }

  // Log access control failures (Requirement 2.4.7)
  static async logAccessControlFailure(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: "ACCESS_CONTROL_FAILURE",
      category: "AUTHORIZATION",
      ipAddress: data.ipAddress || "unknown",
      userAgent: data.userAgent || "unknown",
      userId: data.userId || null,
      requestedResource: data.resource || "unknown",
      requiredPermission: data.permission || "unknown",
      currentPermissions: data.userPermissions || null,
      endpoint: data.endpoint || "unknown",
      method: data.method || "unknown",
      sessionId: data.sessionId || null,
    };

    logger.warn("Access control failure", logEntry);

    try {
      await db.collection("securityLogs").add({
        ...logEntry,
        timestamp: admin.firestore.Timestamp.now(),
      });
    } catch (error) {
      logger.error("Failed to log access control failure", {
        error: error.message,
      });
    }

    console.log(
      `🚫 ACCESS DENIED: ${data.userId || "anonymous"} → ${data.resource || "unknown"}`
    );
  }

  // Log input validation failures (Requirement 2.4.5)
  static async logValidationFailure(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: "INPUT_VALIDATION_FAILURE",
      category: "DATA_VALIDATION",
      ipAddress: data.ipAddress || "unknown",
      userAgent: data.userAgent || "unknown",
      userId: data.userId || null,
      endpoint: data.endpoint || "unknown",
      method: data.method || "unknown",
      fieldName: data.fieldName || "unknown",
      providedValue: data.sanitizedValue || "[REDACTED]", // Never log actual invalid input
      validationRule: data.rule || "unknown",
      errorMessage: data.error || "Validation failed",
    };

    logger.warn("Input validation failure", logEntry);

    try {
      await db.collection("securityLogs").add({
        ...logEntry,
        timestamp: admin.firestore.Timestamp.now(),
      });
    } catch (error) {
      logger.error("Failed to log validation failure", {
        error: error.message,
      });
    }

    console.log(`⚠️ VALIDATION FAILED: ${data.fieldName} at ${data.endpoint}`);
  }

  // Log security events (Requirement 2.4.3)
  static async logSecurityEvent(eventType, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      category: "SECURITY_EVENT",
      ipAddress: data.ipAddress || "unknown",
      userAgent: data.userAgent || "unknown",
      userId: data.userId || null,
      severity: data.severity || "medium",
      description: data.description || "Security event occurred",
      endpoint: data.endpoint || "unknown",
      sessionId: data.sessionId || null,
      metadata: data.metadata || {},
    };

    const logLevel = data.severity === "high" ? "error" : "warn";
    logger[logLevel]("Security event", logEntry);

    try {
      await db.collection("securityLogs").add({
        ...logEntry,
        timestamp: admin.firestore.Timestamp.now(),
      });
    } catch (error) {
      logger.error("Failed to log security event", { error: error.message });
    }

    console.log(`🛡️ SECURITY EVENT: ${eventType} - ${data.description}`);
  }

  // Get logs for administrators (Requirement 2.4.4)
  static async getSecurityLogs(adminUserId, filters = {}) {
    try {
      // Verify admin access
      const adminDoc = await db.collection("users").doc(adminUserId).get();
      const adminData = adminDoc.data();

      if (!adminData || !adminData.isAdmin) {
        await this.logAccessControlFailure({
          userId: adminUserId,
          resource: "security_logs",
          permission: "admin_access",
          userPermissions: adminData?.permissions || [],
        });
        throw new Error("Access denied: Admin privileges required");
      }

      let query = db
        .collection("securityLogs")
        .orderBy("timestamp", "desc")
        .limit(filters.limit || 100);

      if (filters.category) {
        query = query.where("category", "==", filters.category);
      }

      if (filters.startDate) {
        query = query.where(
          "timestamp",
          ">=",
          admin.firestore.Timestamp.fromDate(new Date(filters.startDate))
        );
      }

      const logs = await query.get();

      // Log admin access to logs
      await this.logSecurityEvent("ADMIN_LOG_ACCESS", {
        userId: adminUserId,
        description: "Administrator accessed security logs",
        metadata: { filters },
      });

      return logs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toISOString(),
      }));
    } catch (error) {
      logger.error("Failed to retrieve security logs", {
        error: error.message,
        adminUserId,
      });
      throw error;
    }
  }
}

module.exports = SecurityLogger;
