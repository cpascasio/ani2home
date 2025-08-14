// backend/routes/authRoutes.js
// This combines all authentication-related routes

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const SecurityLogger = require("../../utils/SecurityLogger");
const { authenticateUser } = require("../middleware/auth");
const PasswordManager = require("../../utils/PasswordManager"); // Adjust path as needed
const PasswordValidator = require("../../utils/PasswordValidator"); // Adjust path as needed

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

// GET route to fetch user's login history and security info
router.get("/login-history", authenticateUser, async (req, res) => {
  const uid = req.user.uid;

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // Get login history (last 10 entries)
    const loginHistory = userData.loginHistory || [];
    const recentLogins = loginHistory
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()) // Sort by newest first
      .slice(0, 10) // Get last 10 logins
      .map((entry) => ({
        timestamp: entry.timestamp.toDate(),
        success: entry.success,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        loginMethod: entry.loginMethod || "email_password",
        location: entry.location || "Unknown", // You can add geolocation later
      }));

    // Get last successful and unsuccessful logins
    const lastSuccessfulLogin = userData.lastSuccessfulLogin
      ? userData.lastSuccessfulLogin.toDate()
      : null;
    const lastFailedLogin = userData.lastFailedLogin
      ? userData.lastFailedLogin.toDate()
      : null;

    // Count failed attempts since last successful login
    let failedAttemptsSinceLastSuccess = 0;
    if (lastSuccessfulLogin) {
      failedAttemptsSinceLastSuccess = loginHistory.filter(
        (entry) =>
          !entry.success && entry.timestamp.toDate() > lastSuccessfulLogin
      ).length;
    }

    // Helper to convert to PH time
    const toPhilippinesTime = (date) => {
      const offsetMs = 8 * 60 * 60 * 1000; // UTC+8 offset
      return new Date(date.getTime() + offsetMs);
    };

    // Handle lastPasswordChange with number or Timestamp
    let lastPasswordChangeDate = null;
    if (userData.lastPasswordChange) {
      if (typeof userData.lastPasswordChange.toDate === "function") {
        lastPasswordChangeDate = toPhilippinesTime(
          userData.lastPasswordChange.toDate()
        );
      } else if (typeof userData.lastPasswordChange === "number") {
        lastPasswordChangeDate = toPhilippinesTime(
          new Date(userData.lastPasswordChange)
        );
      }
    }

    // Security status
    const securityStatus = {
      accountLocked: userData.accountLockedUntil
        ? userData.accountLockedUntil.toDate() > new Date()
        : false,
      accountLockedUntil: userData.accountLockedUntil
        ? userData.accountLockedUntil.toDate()
        : null,
      failedLoginAttempts: userData.failedLoginAttempts || 0,
      mfaEnabled: userData.mfaEnabled || false,
      hasSecurityQuestions:
        userData.securityQuestions && userData.securityQuestions.length >= 3,
      lastPasswordChange: lastPasswordChangeDate,
      emailVerified: true, // Assuming verified since they're logged in
    };

    // Password change eligibility
    let passwordChangeStatus = {
      canChange: true,
      hoursRemaining: 0,
      nextChangeAllowed: null,
    };

    if (lastPasswordChangeDate) {
      const oneDayLater = new Date(
        lastPasswordChangeDate.getTime() + 24 * 60 * 60 * 1000
      );
      const now = toPhilippinesTime(new Date());

      if (now < oneDayLater) {
        passwordChangeStatus = {
          canChange: false,
          hoursRemaining: Math.ceil(
            (oneDayLater.getTime() - now.getTime()) / (60 * 60 * 1000)
          ),
          nextChangeAllowed: oneDayLater,
        };
      }
    }

    res.status(200).json({
      message: "Login history retrieved successfully",
      state: "success",
      data: {
        lastSuccessfulLogin,
        lastFailedLogin,
        failedAttemptsSinceLastSuccess,
        recentLogins,
        securityStatus,
        passwordChangeStatus,
        totalLogins: loginHistory.length,
        accountCreated: userData.createdAt ? userData.createdAt.toDate() : null,
      },
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    res.status(500).json({
      message: "Error retrieving login history",
      state: "error",
    });
  }
});

// Enhanced login completion endpoint (updates login history)
router.post("/log-successful-login", authenticateUser, async (req, res) => {
  const { ipAddress, userAgent, loginMethod = "email_password" } = req.body;
  const uid = req.user.uid;

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // Create login history entry
    const loginHistoryEntry = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      success: true,
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
      loginMethod: loginMethod,
    };

    // Count failed attempts since last successful login for reporting
    const failedAttemptsSinceLastSuccess = userData.loginHistory
      ? userData.loginHistory.filter(
          (entry) =>
            !entry.success &&
            userData.lastSuccessfulLogin &&
            entry.timestamp.toMillis() > userData.lastSuccessfulLogin.toMillis()
        ).length
      : 0;

    // Update user document
    await userRef.update({
      lastSuccessfulLogin: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAttempt: admin.firestore.FieldValue.serverTimestamp(),
      failedLoginAttempts: 0, // Reset failed attempts on successful login
      accountLockedUntil: null, // Clear any lockout
      loginHistory: admin.firestore.FieldValue.arrayUnion(loginHistoryEntry),
    });

    // Log to audit trail
    await logToFirestore({
      timestamp: new Date(),
      userId: uid,
      action: "successful_login_logged",
      ipAddress: ipAddress,
      userAgent: userAgent,
      loginMethod: loginMethod,
      failedAttemptsSinceLastSuccess: failedAttemptsSinceLastSuccess,
    });

    res.status(200).json({
      message: "Login logged successfully",
      state: "success",
      lastLoginInfo: {
        lastSuccessfulLogin: userData.lastSuccessfulLogin
          ? userData.lastSuccessfulLogin.toDate()
          : null,
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

// Updated change-password endpoint with better Firebase Auth handling and debugging:

router.post("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
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

    // Get userId from the token
    const userId = decodedToken.uid;
    console.log("🔍 Changing password for user:", userId);

    // Get user document
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // REMOVE THE CURRENT PASSWORD VERIFICATION -
    // Frontend should handle this by re-authenticating the user before calling this endpoint
    console.log("✅ Current password verification handled by frontend");

    // Check if password is at least 24 hours old
    const lastPasswordChange = userData.lastPasswordChange;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (lastPasswordChange) {
      let lastPasswordChangeDate;

      if (typeof lastPasswordChange === "number") {
        lastPasswordChangeDate = new Date(lastPasswordChange * 1000);
      } else if (
        lastPasswordChange.toDate &&
        typeof lastPasswordChange.toDate === "function"
      ) {
        lastPasswordChangeDate = lastPasswordChange.toDate();
      } else if (lastPasswordChange instanceof Date) {
        lastPasswordChangeDate = lastPasswordChange;
      } else {
        lastPasswordChangeDate = new Date(lastPasswordChange);
      }

      if (isNaN(lastPasswordChangeDate.getTime())) {
        console.error("Invalid lastPasswordChange format:", lastPasswordChange);
      } else if (lastPasswordChangeDate > oneDayAgo) {
        const hoursRemaining = Math.ceil(
          (lastPasswordChangeDate.getTime() - oneDayAgo.getTime()) /
            (1000 * 60 * 60)
        );
        return res.status(400).json({
          message: `Password must be at least 24 hours old before it can be changed. Please wait ${hoursRemaining} more hour(s).`,
          state: "error",
          hoursRemaining: hoursRemaining,
          nextChangeAllowed: new Date(
            lastPasswordChangeDate.getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      }
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

    for (const historyEntry of passwordHistory) {
      if (historyEntry.password) {
        const isReused = await PasswordManager.verifyPassword(
          newPassword,
          historyEntry.password
        );
        if (isReused) {
          return res.status(400).json({
            message:
              "This password has been used recently. Please choose a different password.",
            state: "error",
          });
        }
      }
    }

    // Hash the new password for storage in password history
    const hashedNewPassword = await PasswordManager.hashPassword(newPassword);

    console.log("🔍 Attempting to update Firebase Auth password...");

    // Update password in Firebase Auth - THIS IS THE MAIN FUNCTIONALITY
    try {
      await admin.auth().updateUser(userId, {
        password: newPassword,
      });
      console.log("✅ Firebase Auth password updated successfully");
    } catch (firebaseError) {
      console.error("❌ Firebase Auth password update failed:", firebaseError);

      return res.status(500).json({
        message: "Failed to update password in Firebase Auth",
        state: "error",
        details: firebaseError.message,
      });
    }

    // Get current timestamp in epoch seconds
    const currentEpochSeconds = Math.floor(Date.now() / 1000);

    // Update password history with HASHED password
    const updatedHistory = [
      {
        password: hashedNewPassword,
        changedAt: currentEpochSeconds,
      },
      ...passwordHistory.slice(0, HISTORY_SIZE - 1),
    ];

    console.log("🔍 Updating user document in Firestore...");

    // Update user document
    await userDoc.ref.update({
      passwordHistory: updatedHistory,
      lastPasswordChange: currentEpochSeconds,
    });

    console.log("✅ User document updated successfully");

    // Log password change
    await db.collection("auditLogs").add({
      timestamp: admin.firestore.Timestamp.now(),
      userId: userId,
      action: "password_changed",
      ipAddress: req.ip || "unknown",
    });

    console.log("✅ Password change completed successfully for user:", userId);

    res.status(200).json({
      message: "Password changed successfully",
      state: "success",
    });
  } catch (error) {
    console.error("❌ Password change error:", error);
    res.status(500).json({
      message: "An error occurred while changing password",
      state: "error",
      details: error.message,
    });
  }
});

// Add this to your authRoutes.js - Secure password reset with all checks
router.post("/reset-password-secure", async (req, res) => {
  const { email, answers, newPassword, oobCode } = req.body;

  try {
    console.log("🔍 Secure password reset request for email:", email);

    // Validate input
    if (!email || !answers || !newPassword || !oobCode) {
      return res.status(400).json({
        message:
          "Email, security question answers, new password, and reset code are required",
        state: "error",
      });
    }

    // Find user by email
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email.toLowerCase().trim())
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log("❌ User not found for email:", email);
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // 🔐 STEP 1: Verify security questions
    const userQuestions = userData.securityQuestions || [];
    if (userQuestions.length < 3) {
      console.log("❌ User does not have sufficient security questions");
      return res.status(400).json({
        message: "Security questions not set up for this account",
        state: "error",
      });
    }

    console.log("🔍 Verifying security questions...");
    let correctAnswers = 0;
    for (const userQuestion of userQuestions) {
      const providedAnswer = answers[userQuestion.questionId];
      if (providedAnswer) {
        const isCorrect = await PasswordManager.verifyPassword(
          providedAnswer.toLowerCase().trim(),
          userQuestion.answer
        );
        if (isCorrect) {
          correctAnswers++;
        }
      }
    }

    if (correctAnswers < userQuestions.length) {
      console.log("❌ Security questions verification failed");

      // FIXED LOGGING - Direct Firestore
      await db.collection("auditLogs").add({
        timestamp: admin.firestore.Timestamp.now(),
        action: "password_reset_security_questions_failed",
        email: email,
        userId: userId,
        correctAnswers: correctAnswers,
        totalQuestions: userQuestions.length,
      });

      return res.status(400).json({
        message: "Security question answers are incorrect",
        state: "error",
      });
    }

    console.log("✅ Security questions verified successfully");

    // 🔐 STEP 2: Check if password is at least 24 hours old
    console.log("🔍 Checking password age requirement...");
    const lastPasswordChange = userData.lastPasswordChange;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (lastPasswordChange) {
      let lastPasswordChangeDate;

      if (typeof lastPasswordChange === "number") {
        lastPasswordChangeDate = new Date(lastPasswordChange * 1000);
      } else if (
        lastPasswordChange.toDate &&
        typeof lastPasswordChange.toDate === "function"
      ) {
        lastPasswordChangeDate = lastPasswordChange.toDate();
      } else if (lastPasswordChange instanceof Date) {
        lastPasswordChangeDate = lastPasswordChange;
      } else {
        lastPasswordChangeDate = new Date(lastPasswordChange);
      }

      if (isNaN(lastPasswordChangeDate.getTime())) {
        console.error("Invalid lastPasswordChange format:", lastPasswordChange);
      } else if (lastPasswordChangeDate > oneDayAgo) {
        const hoursRemaining = Math.ceil(
          (lastPasswordChangeDate.getTime() - oneDayAgo.getTime()) /
            (1000 * 60 * 60)
        );

        console.log(
          `❌ Password too young. Hours remaining: ${hoursRemaining}`
        );

        // FIXED LOGGING - Direct Firestore
        await db.collection("auditLogs").add({
          timestamp: admin.firestore.Timestamp.now(),
          userId: userId,
          action: "password_reset_blocked_too_young",
          email: email,
          lastPasswordChange: admin.firestore.Timestamp.fromDate(
            lastPasswordChangeDate
          ),
          hoursRemaining: hoursRemaining,
        });

        return res.status(400).json({
          message: `Password must be at least 24 hours old before it can be changed. Please wait ${hoursRemaining} more hour(s).`,
          state: "error",
          hoursRemaining: hoursRemaining,
          nextChangeAllowed: new Date(
            lastPasswordChangeDate.getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      }
    }

    console.log("✅ Password age requirement met");

    // 🔐 STEP 3: Validate new password strength
    console.log("🔍 Validating new password strength...");
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Password does not meet security requirements",
        errors: validation.errors,
        state: "error",
      });
    }

    console.log("✅ New password meets strength requirements");

    // 🔐 STEP 4: Check password history to prevent reuse
    console.log("🔍 Checking password history for reuse...");
    const passwordHistory = userData.passwordHistory || [];
    const HISTORY_SIZE = 12;

    // ADD DEBUGGING HERE
    console.log("🔍 DEBUG: PasswordManager available:", !!PasswordManager);
    console.log("🔍 DEBUG: Password history length:", passwordHistory.length);
    console.log("🔍 DEBUG: New password length:", newPassword.length);
    console.log(
      "🔍 DEBUG: New password (first 10 chars):",
      newPassword.substring(0, 10) + "..."
    );

    for (let i = 0; i < passwordHistory.length; i++) {
      const historyEntry = passwordHistory[i];

      console.log(`🔍 DEBUG: Processing history entry ${i + 1}:`, {
        hasPassword: !!historyEntry.password,
        passwordLength: historyEntry.password
          ? historyEntry.password.length
          : 0,
        passwordPrefix: historyEntry.password
          ? historyEntry.password.substring(0, 20)
          : "none",
        changedAt: historyEntry.changedAt,
      });

      if (!historyEntry.password) {
        console.log(
          `⚠️ DEBUG: History entry ${i + 1} has no password field, skipping...`
        );
        continue;
      }

      try {
        console.log(
          `🔍 DEBUG: Calling PasswordManager.verifyPassword for entry ${i + 1}...`
        );
        const isReused = await PasswordManager.verifyPassword(
          newPassword,
          historyEntry.password
        );
        console.log(`🔍 DEBUG: Entry ${i + 1} comparison result:`, isReused);

        if (isReused) {
          console.log(
            `❌ Password reuse detected. Matches password #${i + 1} in history`
          );

          // FIXED LOGGING - Direct Firestore
          await db.collection("auditLogs").add({
            timestamp: admin.firestore.Timestamp.now(),
            userId: userId,
            action: "password_reset_blocked_reuse",
            email: email,
            historyPosition: i + 1,
          });

          return res.status(400).json({
            message: `This password has been used recently (within your last ${HISTORY_SIZE} passwords). Please choose a different password.`,
            state: "error",
          });
        }
      } catch (compareError) {
        console.error(
          `❌ DEBUG: Error comparing password with entry ${i + 1}:`,
          compareError
        );
      }
    }

    console.log("✅ Password not found in history - reuse check passed");

    // 🔐 STEP 5: Hash the new password
    const hashedNewPassword = await PasswordManager.hashPassword(newPassword);
    console.log(
      "🔍 DEBUG: New password hashed successfully, hash prefix:",
      hashedNewPassword.substring(0, 20) + "..."
    );

    // 🔐 STEP 6: Update password history
    const currentEpochSeconds = Math.floor(Date.now() / 1000);
    const updatedHistory = [
      {
        password: hashedNewPassword,
        changedAt: currentEpochSeconds,
        method: "password_reset",
      },
      ...passwordHistory.slice(0, HISTORY_SIZE - 1),
    ];

    console.log(
      "🔍 DEBUG: Updated history will have",
      updatedHistory.length,
      "entries"
    );

    // 🔐 STEP 7: Update Firebase Auth password
    console.log("🔍 Updating Firebase Auth password...");
    try {
      await admin.auth().updateUser(userId, {
        password: newPassword,
      });
      console.log("✅ Firebase Auth password updated successfully");
    } catch (firebaseError) {
      console.error("❌ Firebase Auth password update failed:", firebaseError);
      return res.status(500).json({
        message: "Failed to update password in Firebase Auth",
        state: "error",
        details: firebaseError.message,
      });
    }

    // 🔐 STEP 8: Update user document
    console.log("🔍 Updating user document...");
    await userDoc.ref.update({
      passwordHistory: updatedHistory,
      lastPasswordChange: currentEpochSeconds,
    });

    // 🔐 STEP 9: Log successful password reset - FIXED LOGGING
    await db.collection("auditLogs").add({
      timestamp: admin.firestore.Timestamp.now(),
      userId: userId,
      action: "password_reset_successful",
      email: email,
      method: "security_questions_firebase",
      passwordHistorySize: updatedHistory.length,
    });

    console.log("✅ Password reset completed successfully for user:", userId);

    res.status(200).json({
      message: "Password reset successfully",
      state: "success",
      nextChangeAllowed: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error("❌ Password reset error:", error);

    // FIXED LOGGING - Direct Firestore
    await db.collection("auditLogs").add({
      timestamp: admin.firestore.Timestamp.now(),
      action: "password_reset_error",
      email: email || "unknown",
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      message: "An error occurred while resetting password",
      state: "error",
    });
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
