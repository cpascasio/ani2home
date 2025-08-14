// backend/routes/authRoutes.js
// This combines all authentication-related routes

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const SecurityLogger = require("../../utils/SecurityLogger");

// ============================================
// HELPER FUNCTIONS
// ============================================

// Check account lockout
const checkAccountLockout = async (email) => {
  try {
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return { isLocked: false };
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Check if account is currently locked
    if (
      userData.accountLockedUntil &&
      new Date(userData.accountLockedUntil) > new Date()
    ) {
      const remainingTime = new Date(userData.accountLockedUntil) - new Date();
      return {
        isLocked: true,
        message: `Account is locked. Please try again in ${Math.ceil(
          remainingTime / 1000 / 60
        )} minutes.`,
        remainingMinutes: Math.ceil(remainingTime / 1000 / 60),
      };
    }

    // Reset failed attempts if lockout period has expired
    if (
      userData.accountLockedUntil &&
      new Date(userData.accountLockedUntil) <= new Date()
    ) {
      await userDoc.ref.update({
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      });
    }

    return { isLocked: false, userId: userDoc.id };
  } catch (error) {
    console.error("Error checking account lockout:", error);
    return { isLocked: false };
  }
};

// Validate password
function validatePassword(password) {
  const errors = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// ROUTES
// ============================================

// Check lockout status (keep existing)
router.post("/check-lockout", async (req, res) => {
  const { email } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get("User-Agent");

  if (!email) {
    // 🆕 Log validation failure
    await SecurityLogger.logValidationFailure({
      ipAddress,
      userAgent,
      endpoint: req.originalUrl,
      method: req.method,
      fieldName: "email",
      rule: "required",
      error: "Email is required",
      sanitizedValue: "[MISSING]",
    });

    return res.status(400).json({
      error: true,
      message: "Invalid input data provided",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const lockoutStatus = await checkAccountLockout(email);

    // 🆕 Log lockout check
    await SecurityLogger.logSecurityEvent("LOCKOUT_CHECK", {
      ipAddress,
      userAgent,
      description: `Account lockout check for email`,
      metadata: {
        email: email.substring(0, 3) + "***", // Partially masked email
        isLocked: lockoutStatus.isLocked,
      },
    });

    res.status(200).json(lockoutStatus);
  } catch (error) {
    // 🆕 Log system error
    await SecurityLogger.logSecurityEvent("LOCKOUT_CHECK_ERROR", {
      ipAddress,
      userAgent,
      severity: "high",
      description: "Error checking account lockout status",
      metadata: { error: error.message },
    });

    console.error("Lockout check error:", error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error - An unexpected error occurred",
      timestamp: new Date().toISOString(),
    });
  }
});

// 🆕 NEW: Firebase Login Logging Endpoint
router.post("/log-firebase-login", async (req, res) => {
  const { success, email, userId, loginMethod, errorMessage, errorCode } =
    req.body;
  const ipAddress = req.ip;
  const userAgent = req.get("User-Agent");

  try {
    if (success) {
      // Log successful Firebase login
      await SecurityLogger.logAuthAttempt("FIREBASE_LOGIN_SUCCESS", {
        userId,
        email,
        ipAddress,
        userAgent,
        success: true,
        metadata: {
          loginMethod: loginMethod || "email_password",
          source: "firebase_auth",
        },
      });

      // Update user document with successful login
      if (userId) {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const loginHistoryEntry = {
            timestamp: admin.firestore.Timestamp.now(),
            success: true,
            ipAddress: ipAddress || "unknown",
            userAgent: userAgent || "unknown",
            loginMethod: loginMethod || "email_password",
          };

          await userRef.update({
            failedLoginAttempts: 0,
            accountLockedUntil: null,
            lastSuccessfulLogin: admin.firestore.Timestamp.now(),
            lastLoginAttempt: admin.firestore.Timestamp.now(),
            loginHistory:
              admin.firestore.FieldValue.arrayUnion(loginHistoryEntry),
          });
        }
      }

      res.status(200).json({
        success: true,
        message: "Login logged successfully",
        timestamp: new Date().toISOString(),
      });
    } else {
      // Log failed Firebase login
      await SecurityLogger.logAuthAttempt("FIREBASE_LOGIN_FAILED", {
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: errorMessage || "Authentication failed",
        metadata: {
          errorCode: errorCode || "unknown",
          loginMethod: loginMethod || "email_password",
          source: "firebase_auth",
        },
      });

      // Handle failed login attempts and lockout
      if (email) {
        const usersSnapshot = await db
          .collection("users")
          .where("email", "==", email)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const userData = userDoc.data();
          const failedAttempts = (userData.failedLoginAttempts || 0) + 1;

          const updateData = {
            failedLoginAttempts: failedAttempts,
            lastFailedLogin: admin.firestore.Timestamp.now(),
            lastLoginAttempt: admin.firestore.Timestamp.now(),
          };

          // Lock account if max attempts reached
          const MAX_ATTEMPTS = 5;
          const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

          if (failedAttempts >= MAX_ATTEMPTS) {
            updateData.accountLockedUntil = new Date(
              Date.now() + LOCKOUT_DURATION
            );

            // Log account lockout
            await SecurityLogger.logSecurityEvent("ACCOUNT_LOCKED", {
              userId: userDoc.id,
              ipAddress,
              userAgent,
              severity: "high",
              description:
                "Account locked due to multiple failed login attempts",
              metadata: {
                failedAttempts,
                lockoutDuration: LOCKOUT_DURATION,
              },
            });
          }

          // Add to login history
          const loginHistoryEntry = {
            timestamp: admin.firestore.Timestamp.now(),
            success: false,
            ipAddress: ipAddress || "unknown",
            userAgent: userAgent || "unknown",
            loginMethod: loginMethod || "email_password",
            errorCode: errorCode || "unknown",
          };

          await userDoc.ref.update({
            ...updateData,
            loginHistory:
              admin.firestore.FieldValue.arrayUnion(loginHistoryEntry),
          });
        }
      }

      res.status(200).json({
        success: true,
        message: "Failed login logged",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    await SecurityLogger.logSecurityEvent("LOGIN_LOGGING_ERROR", {
      ipAddress,
      userAgent,
      severity: "high",
      description: "Error logging Firebase login attempt",
      metadata: { error: error.message },
    });

    console.error("Error logging Firebase login:", error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error - An unexpected error occurred",
      timestamp: new Date().toISOString(),
    });
  }
});

// 🆕 NEW: MFA Verification Logging
router.post("/log-mfa-attempt", async (req, res) => {
  const { success, userId, errorMessage } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get("User-Agent");

  try {
    if (success) {
      await SecurityLogger.logAuthAttempt("MFA_VERIFICATION_SUCCESS", {
        userId,
        ipAddress,
        userAgent,
        success: true,
        metadata: {
          authStep: "mfa_verification",
          source: "frontend",
        },
      });
    } else {
      await SecurityLogger.logAuthAttempt("MFA_VERIFICATION_FAILED", {
        userId,
        ipAddress,
        userAgent,
        success: false,
        failureReason: errorMessage || "Invalid MFA token",
        metadata: {
          authStep: "mfa_verification",
          source: "frontend",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "MFA attempt logged",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await SecurityLogger.logSecurityEvent("MFA_LOGGING_ERROR", {
      userId,
      ipAddress,
      userAgent,
      severity: "medium",
      description: "Error logging MFA verification attempt",
      metadata: { error: error.message },
    });

    res.status(500).json({
      error: true,
      message: "Internal Server Error - An unexpected error occurred",
      timestamp: new Date().toISOString(),
    });
  }
});

// Log failed login attempt
router.post("/log-failed-login", async (req, res) => {
  const { email, ipAddress, userAgent } = req.body;

  try {
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({
        message: "Attempt logged",
        state: "success",
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const failedAttempts = (userData.failedLoginAttempts || 0) + 1;

    const updateData = {
      failedLoginAttempts: failedAttempts,
      lastFailedLogin: admin.firestore.Timestamp.now(),
      lastLoginAttempt: admin.firestore.Timestamp.now(),
    };

    // Lock account if max attempts reached (5 attempts)
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

    if (failedAttempts >= MAX_ATTEMPTS) {
      updateData.accountLockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
    }

    // Add to login history
    const loginHistoryEntry = {
      timestamp: admin.firestore.Timestamp.now(),
      success: false,
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
    };

    await userDoc.ref.update({
      ...updateData,
      loginHistory: admin.firestore.FieldValue.arrayUnion(loginHistoryEntry),
    });

    // Log to audit collection
    await db.collection("auditLogs").add({
      timestamp: admin.firestore.Timestamp.now(),
      userId: userDoc.id,
      action: "login_failed",
      email: email,
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
      attemptsCount: failedAttempts,
    });

    res.status(200).json({
      message: "Attempt logged",
      attemptsRemaining: Math.max(0, MAX_ATTEMPTS - failedAttempts),
      accountLocked: failedAttempts >= MAX_ATTEMPTS,
      state: "success",
    });
  } catch (error) {
    console.error("Error logging failed login:", error);
    res.status(500).json({
      message: "Error logging attempt",
      state: "error",
    });
  }
});

// Log successful login
router.post("/log-successful-login", async (req, res) => {
  const { userId, ipAddress, userAgent } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      state: "error",
    });
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // Calculate failed attempts since last success for return
    const failedAttemptsSinceLastSuccess = userData.failedLoginAttempts || 0;

    const loginHistoryEntry = {
      timestamp: admin.firestore.Timestamp.now(),
      success: true,
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
    };

    // Update user document
    await userRef.update({
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastSuccessfulLogin: admin.firestore.Timestamp.now(),
      lastLoginAttempt: admin.firestore.Timestamp.now(),
      loginHistory: admin.firestore.FieldValue.arrayUnion(loginHistoryEntry),
    });

    // Log to audit collection
    await db.collection("auditLogs").add({
      timestamp: admin.firestore.Timestamp.now(),
      userId: userId,
      action: "login_success",
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
    });

    res.status(200).json({
      message: "Login logged successfully",
      state: "success",
      lastLoginInfo: {
        lastSuccessfulLogin: userData.lastSuccessfulLogin,
        lastFailedLogin: userData.lastFailedLogin,
        failedAttemptsSinceLastSuccess: failedAttemptsSinceLastSuccess,
      },
    });
  } catch (error) {
    console.error("Error logging successful login:", error);
    res.status(500).json({
      message: "Error logging login",
      state: "error",
    });
  }
});

// Change password (with re-authentication)
router.post("/change-password", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
      state: "error",
    });
  }

  try {
    // Verify the token
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (decodedToken.uid !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
        state: "error",
      });
    }

    // Get user document
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // Check if password is at least 24 hours old
    const lastPasswordChange = userData.lastPasswordChange;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (lastPasswordChange && lastPasswordChange.toDate() > oneDayAgo) {
      return res.status(400).json({
        message:
          "Password must be at least 24 hours old before it can be changed",
        state: "error",
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: "Password does not meet requirements",
        errors: passwordValidation.errors,
        state: "error",
      });
    }

    // Check password history to prevent reuse
    const passwordHistory = userData.passwordHistory || [];
    const HISTORY_SIZE = 12;

    // Note: In production, you should hash passwords and compare hashes
    const isReused = passwordHistory.some((entry) => {
      return entry.password === newPassword;
    });

    if (isReused) {
      return res.status(400).json({
        message:
          "This password has been used recently. Please choose a different password.",
        state: "error",
      });
    }

    // Update password in Firebase Auth
    await admin.auth().updateUser(userId, {
      password: newPassword,
    });

    // Update password history
    const updatedHistory = [
      {
        password: newPassword, // In production, hash this
        changedAt: admin.firestore.Timestamp.now(),
      },
      ...passwordHistory.slice(0, HISTORY_SIZE - 1),
    ];

    // Update user document
    await userDoc.ref.update({
      passwordHistory: updatedHistory,
      lastPasswordChange: admin.firestore.Timestamp.now(),
    });

    // Log password change
    await db.collection("auditLogs").add({
      timestamp: admin.firestore.Timestamp.now(),
      userId: userId,
      action: "password_changed",
      ipAddress: req.ip || "unknown",
    });

    res.status(200).json({
      message: "Password changed successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      message: "An error occurred while changing password",
      state: "error",
    });
  }
});

// Validate user permissions (called by frontend before sensitive actions)
router.get("/validate-permissions", async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get FRESH user data from Firestore (source of truth)
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ valid: false, message: "User not found" });
    }

    const userData = userDoc.data();

    // Return current permissions from database
    res.json({
      valid: true,
      permissions: {
        isStore: userData.isStore || false,
        isAdmin: userData.isAdmin || false,
        isVerified: userData.isVerified || false,
        isDisabled: userData.isDisabled || false,
      },
      user: {
        uid: decodedToken.uid,
        email: userData.email,
        name: userData.name,
      },
    });
  } catch (error) {
    console.error("Permission validation error:", error);
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

// Specific endpoint for store access validation
router.get("/validate-store-access", async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ hasAccess: false });
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await admin.auth().verifyIdToken(token);

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ hasAccess: false });
    }

    const userData = userDoc.data();

    // Check all conditions for store access
    const hasAccess =
      userData.isStore === true &&
      !userData.isDisabled &&
      userData.isVerified === true;

    res.json({ hasAccess, isStore: userData.isStore });
  } catch (error) {
    console.error("Store access validation error:", error);
    res.status(401).json({ hasAccess: false });
  }
});

// add near the bottom of this file or in a small audit router
router.post("/ui-access-attempt", async (req, res) => {
  console.log("[ui-access-attempt] hit:", req.body);

  const ipAddress =
    (req.headers["x-forwarded-for"] || "").split(",")[0]?.trim() ||
    req.ip ||
    "unknown";
  const userAgent = req.get("User-Agent") || "unknown";
  const { target, result } = req.body || {};
  await SecurityLogger.logAccessControlFailure({
    ipAddress,
    userAgent,
    endpoint: req.originalUrl,
    method: req.method,
    userId: null, // or decode from a token cookie if available
    resource: `${target || "unknown"}_ui`,
    permission: "route_guard",
    userPermissions: [],
  });
  res.json({ ok: true });
});

module.exports = router;
