// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const PasswordManager = require("../utils/passwordUtils");
const PasswordValidator = require("../validators/passwordValidator");
const AccountLockoutManager = require("../middleware/accountLockout");

// ✅ ADD BOTH LOGGING SYSTEMS
const { logger, logToFirestore } = require("../config/firebase-config");
const SecurityLogger = require("../../utils/SecurityLogger");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("user-agent");

  // ✅ ADD INPUT VALIDATION LOGGING
  if (!email || !password) {
    await SecurityLogger.logValidationFailure({
      ipAddress,
      userAgent,
      endpoint: req.originalUrl,
      method: req.method,
      fieldName: !email ? "email" : "password",
      rule: "required",
      error: "Email and password are required",
    });

    return res.status(400).json({
      error: true,
      message: "Invalid input data provided",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Generic error message (Requirement 2.1.4)
    const genericError = "Invalid username and/or password";

    // Check if user exists by email
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      // ✅ ADD SECURITY LOGGING FOR NON-EXISTENT USER LOGIN ATTEMPT
      await SecurityLogger.logAuthAttempt("LOGIN_FAILED_UNKNOWN_USER", {
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "User not found",
        metadata: {
          source: "email_password_login",
          emailProvided: true,
        },
      });

      // Don't reveal that the user doesn't exist
      return res.status(401).json({
        message: genericError,
        state: "error",
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const uid = userDoc.id;
    const userData = userDoc.data();

    // Check account lockout (Requirement 2.1.8)
    const lockoutStatus = await AccountLockoutManager.checkAccountLockout(uid);
    if (lockoutStatus.isLocked) {
      // ✅ ADD SECURITY LOGGING FOR LOCKED ACCOUNT LOGIN ATTEMPT
      await SecurityLogger.logSecurityEvent("LOGIN_BLOCKED_ACCOUNT_LOCKED", {
        userId: uid,
        email,
        ipAddress,
        userAgent,
        endpoint: req.originalUrl,
        method: req.method,
        description: "Login attempt on locked account",
        severity: "high",
        metadata: {
          lockoutReason: "multiple_failed_attempts",
          remainingMinutes: lockoutStatus.remainingMinutes || 0,
        },
      });

      return res.status(423).json({
        message: lockoutStatus.message,
        state: "error",
        locked: true,
      });
    }

    // Verify password
    const isPasswordValid = await PasswordManager.verifyPassword(
      password,
      userData.password
    );

    if (!isPasswordValid) {
      // Record failed attempt
      const attemptResult = await AccountLockoutManager.recordFailedAttempt(
        uid,
        ipAddress,
        userAgent
      );

      // ✅ KEEP ORIGINAL AUDIT LOGGING
      const logData = {
        timestamp: new Date(),
        userId: uid,
        action: "login_failed",
        ipAddress,
        userAgent,
        attemptsRemaining: attemptResult.attemptsRemaining,
      };
      await logToFirestore(logData);

      // ✅ ADD SECURITY LOGGING FOR FAILED LOGIN
      await SecurityLogger.logAuthAttempt("LOGIN_FAILED_INVALID_PASSWORD", {
        userId: uid,
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Invalid password",
        metadata: {
          attemptsRemaining: attemptResult.attemptsRemaining,
          totalFailedAttempts: (userData.failedLoginAttempts || 0) + 1,
          source: "email_password_login",
          willLockAccount: attemptResult.attemptsRemaining === 0,
        },
      });

      // ✅ ADD SECURITY LOGGING IF ACCOUNT GETS LOCKED
      if (attemptResult.attemptsRemaining === 0) {
        await SecurityLogger.logSecurityEvent("ACCOUNT_LOCKED", {
          userId: uid,
          email,
          ipAddress,
          userAgent,
          endpoint: req.originalUrl,
          method: req.method,
          description: "Account locked due to multiple failed login attempts",
          severity: "high",
          metadata: {
            totalFailedAttempts: (userData.failedLoginAttempts || 0) + 1,
            lockoutDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
          },
        });
      }

      return res.status(401).json({
        message: genericError,
        state: "error",
        // Optionally include attempts remaining (be careful with this)
        // attemptsRemaining: attemptResult.attemptsRemaining
      });
    }

    // Get last login info for display (Requirement 2.1.12)
    const lastLoginInfo = {
      lastSuccessfulLogin: userData.lastSuccessfulLogin,
      lastFailedLogin: userData.lastFailedLogin,
      failedAttemptsSinceLastSuccess: userData.failedLoginAttempts || 0,
    };

    // Record successful login
    await AccountLockoutManager.recordSuccessfulLogin(
      uid,
      ipAddress,
      userAgent
    );

    // Check if MFA is enabled
    if (userData.mfaEnabled) {
      // ✅ ADD SECURITY LOGGING FOR MFA REQUIRED
      await SecurityLogger.logAuthAttempt("LOGIN_SUCCESS_MFA_REQUIRED", {
        userId: uid,
        email,
        ipAddress,
        userAgent,
        success: true,
        metadata: {
          authStep: "password_verified",
          nextStep: "mfa_verification",
          source: "email_password_login",
          lastLoginInfo,
        },
      });

      // ✅ ADD AUDIT LOGGING FOR MFA STEP
      const logData = {
        timestamp: new Date(),
        userId: uid,
        action: "login_password_success_mfa_required",
        email,
        ipAddress,
        userAgent,
        lastLoginInfo,
      };
      await logToFirestore(logData);

      // Return that MFA is required
      return res.status(200).json({
        message: "MFA verification required",
        state: "mfa_required",
        uid,
        lastLoginInfo, // Send last login info
      });
    }

    // Generate session token or JWT
    const token = generateAuthToken(uid); // Implement your token generation

    // Create session
    await createSession(uid, token, ipAddress, userAgent);

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL LOGIN
    await SecurityLogger.logAuthAttempt("LOGIN_SUCCESS", {
      userId: uid,
      email,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        loginMethod: "email_password",
        source: "email_password_login",
        isStore: userData.isStore || false,
        mfaEnabled: userData.mfaEnabled || false,
        lastLoginInfo,
      },
    });

    // ✅ ADD AUDIT LOGGING FOR SUCCESSFUL LOGIN
    const logData = {
      timestamp: new Date(),
      userId: uid,
      action: "login_success",
      email,
      ipAddress,
      userAgent,
      loginMethod: "email_password",
      isStore: userData.isStore || false,
      lastLoginInfo,
    };
    await logToFirestore(logData);

    res.status(200).json({
      message: "Login successful",
      state: "success",
      token,
      user: {
        uid,
        email: userData.email,
        isStore: userData.isStore,
        lastLoginInfo, // Include last login info
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress,
      userAgent,
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Login system error",
      metadata: {
        error: error.message,
        email: email ? email.substring(0, 3) + "***" : "unknown",
      },
    });

    // ✅ ADD AUDIT LOGGING FOR SYSTEM ERRORS
    const logData = {
      timestamp: new Date(),
      action: "login_system_error",
      email: email || "unknown",
      ipAddress,
      userAgent,
      error: error.message,
    };
    await logToFirestore(logData);

    // Fail securely (Requirement 2.1.2)
    res.status(500).json({
      message: "An error occurred during login",
      state: "error",
    });
  }
});

module.exports = router;
