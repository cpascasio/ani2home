// backend/routes/authRoutes.js
// This combines all authentication-related routes

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

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

// Check lockout status
router.post("/check-lockout", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
      state: "error",
    });
  }

  try {
    const lockoutStatus = await checkAccountLockout(email);
    res.status(200).json(lockoutStatus);
  } catch (error) {
    console.error("Lockout check error:", error);
    res.status(500).json({
      message: "Error checking account status",
      state: "error",
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

module.exports = router;
