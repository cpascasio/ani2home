// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const PasswordManager = require("../utils/passwordUtils");
const PasswordValidator = require("../validators/passwordValidator");
const AccountLockoutManager = require("../middleware/accountLockout");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("user-agent");

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

      // Log the failed attempt
      await logToFirestore({
        timestamp: new Date(),
        userId: uid,
        action: "login_failed",
        ipAddress,
        userAgent,
        attemptsRemaining: attemptResult.attemptsRemaining,
      });

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
    // Fail securely (Requirement 2.1.2)
    res.status(500).json({
      message: "An error occurred during login",
      state: "error",
    });
  }
});
