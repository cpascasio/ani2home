// backend/utils/SecurityLogger.js - Enhanced with more details
const logger = require("../src/config/logger");
const { admin } = require("../src/config/firebase-config");
const db = admin.firestore();

class SecurityLogger {
  // Enhanced authentication attempt logging
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
      endpoint: data.endpoint || "unknown",
      method: data.method || "unknown",

      // 🆕 Enhanced metadata with more details
      metadata: {
        ...data.metadata,
        // Browser/Device Information
        browserInfo: this.extractBrowserInfo(data.userAgent),
        deviceType: this.extractDeviceType(data.userAgent),
        operatingSystem: this.extractOperatingSystem(data.userAgent),

        // Authentication Details
        authMethod: data.authMethod || "password",
        loginDuration: data.loginDuration || null,
        consecutiveFailures: data.consecutiveFailures || 0,
        accountAge: data.accountAge || null,
        lastLoginTime: data.lastLoginTime || null,

        // Security Context
        isNewDevice: data.isNewDevice || false,
        isNewLocation: data.isNewLocation || false,
        deviceFingerprint: this.generateDeviceFingerprint(
          data.userAgent,
          data.ipAddress
        ),

        // Timing Information
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        timestamp: new Date().toISOString(),
      },
    };

    logger.info("Auth attempt", logEntry);

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

  // Enhanced access control failure logging
  static async logAccessControlFailure(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: "ACCESS_CONTROL_FAILURE",
      category: "AUTHORIZATION",
      ipAddress: data.ipAddress || "unknown",
      userAgent: data.userAgent || "unknown",
      userId: data.userId || null,
      email: data.email || null, // 🆕 Add email for better tracking
      requestedResource: data.resource || "unknown",
      requiredPermission: data.permission || "unknown",
      currentPermissions: data.userPermissions || null,
      endpoint: data.endpoint || "unknown",
      method: data.method || "unknown",
      sessionId: data.sessionId || null,

      // 🆕 Enhanced fields
      accessType: data.accessType || "unknown",
      attemptedRoute: data.attemptedRoute || data.endpoint,
      reason: data.reason || "Insufficient privileges",

      metadata: {
        ...data.metadata,
        browserInfo: this.extractBrowserInfo(data.userAgent),
        deviceType: this.extractDeviceType(data.userAgent),
        operatingSystem: this.extractOperatingSystem(data.userAgent),
        deviceFingerprint: this.generateDeviceFingerprint(
          data.userAgent,
          data.ipAddress
        ),
        userRole: data.userRole || "unknown",
        accountStatus: data.accountStatus || "unknown",
        attemptCount: data.attemptCount || 1,
        securityLevel: data.securityLevel || "medium",
        timestamp: new Date().toISOString(),
      },
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

  // Enhanced validation failure logging
  static async logValidationFailure(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: "INPUT_VALIDATION_FAILURE",
      category: "DATA_VALIDATION",
      ipAddress: data.ipAddress || "unknown",
      userAgent: data.userAgent || "unknown",
      userId: data.userId || null,
      email: data.email || null, // 🆕 Add email
      endpoint: data.endpoint || "unknown",
      method: data.method || "unknown",
      fieldName: data.fieldName || "unknown",
      providedValue: data.sanitizedValue || "[REDACTED]",
      validationRule: data.rule || "unknown",
      errorMessage: data.error || "Validation failed",

      // 🆕 Enhanced fields
      inputLength: data.inputLength || null,
      inputType: data.inputType || "unknown",

      metadata: {
        ...data.metadata,
        browserInfo: this.extractBrowserInfo(data.userAgent),
        deviceType: this.extractDeviceType(data.userAgent),
        operatingSystem: this.extractOperatingSystem(data.userAgent),
        deviceFingerprint: this.generateDeviceFingerprint(
          data.userAgent,
          data.ipAddress
        ),
        formName: data.formName || "unknown",
        expectedFormat: data.expectedFormat || null,
        validationAttempts: data.validationAttempts || 1,
        securityThreat: data.securityThreat || null,
        timestamp: new Date().toISOString(),
      },
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

  // Enhanced security event logging
  static async logSecurityEvent(eventType, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      category: data.category || "SECURITY_EVENT",
      ipAddress: data.ipAddress || "unknown",
      userAgent: data.userAgent || "unknown",
      userId: data.userId || null,
      email: data.email || null, // 🆕 Add email
      severity: data.severity || "medium",
      description: data.description || "Security event occurred",
      endpoint: data.endpoint || "unknown",
      method: data.method || "unknown",
      sessionId: data.sessionId || null,

      // 🆕 Enhanced fields
      threatLevel: data.threatLevel || "low",
      actionTaken: data.actionTaken || "logged",

      metadata: {
        ...data.metadata,
        browserInfo: this.extractBrowserInfo(data.userAgent),
        deviceType: this.extractDeviceType(data.userAgent),
        operatingSystem: this.extractOperatingSystem(data.userAgent),
        deviceFingerprint: this.generateDeviceFingerprint(
          data.userAgent,
          data.ipAddress
        ),
        eventSource: data.eventSource || "application",
        responseTime: data.responseTime || null,
        affectedUsers: data.affectedUsers || 1,
        timestamp: new Date().toISOString(),
      },
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

  // 🆕 Utility functions for extracting information
  static generateDeviceFingerprint(userAgent, ipAddress) {
    if (!userAgent || !ipAddress) return "unknown";
    const crypto = require("crypto");
    const fingerprint = userAgent + ipAddress;
    return crypto
      .createHash("sha256")
      .update(fingerprint)
      .digest("hex")
      .substring(0, 16);
  }

  static extractBrowserInfo(userAgent) {
    if (!userAgent) return { name: "unknown", version: "unknown" };

    let browserName = "unknown";
    let browserVersion = "unknown";

    if (userAgent.includes("Chrome")) {
      browserName = "Chrome";
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browserName = "Safari";
      const match = userAgent.match(/Version\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes("Edge")) {
      browserName = "Edge";
      const match = userAgent.match(/Edge\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    }

    return { name: browserName, version: browserVersion };
  }

  static extractOperatingSystem(userAgent) {
    if (!userAgent) return "unknown";

    if (userAgent.includes("Windows NT 10.0")) return "Windows 10/11";
    if (userAgent.includes("Windows NT 6.3")) return "Windows 8.1";
    if (userAgent.includes("Windows NT 6.2")) return "Windows 8";
    if (userAgent.includes("Windows NT 6.1")) return "Windows 7";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac OS X")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
      return "iOS";

    return "unknown";
  }

  static extractDeviceType(userAgent) {
    if (!userAgent) return "unknown";

    if (userAgent.includes("Mobile") || userAgent.includes("Android"))
      return "mobile";
    if (userAgent.includes("Tablet") || userAgent.includes("iPad"))
      return "tablet";

    return "desktop";
  }

  // Keep existing getSecurityLogs method unchanged
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
