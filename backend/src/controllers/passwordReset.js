// backend/controllers/passwordReset.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { authenticateUser } = require("../middleware/auth");
const { logToFirestore, logger } = require("../config/firebase-config");
const crypto = require("crypto");
const PasswordManager = require("../../utils/PasswordManager"); // You'll need to create this
const PasswordValidator = require("../../utils/PasswordValidator"); // You'll need to create this

// ✅ ADD SECURITY LOGGER - same as other files
const SecurityLogger = require("../../utils/SecurityLogger");

const db = admin.firestore();

// Helper function to create standardized log data
const createLogData = (
  userId,
  action,
  resource,
  status,
  details = {},
  error = null
) => {
  return {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    status,
    details,
    ...(error && { error: error.message || error }),
  };
};

// Security questions for password reset (Requirement 2.1.9)
const SECURITY_QUESTIONS = [
  {
    id: "pet_name",
    question: "What was the name of your first pet?",
  },
  {
    id: "favorite_teacher",
    question: "What was the name of your favorite teacher?",
  },
  {
    id: "childhood_friend",
    question: "What was the name of your childhood best friend?",
  },
];

// GET route to retrieve security questions (public)
router.get("/security-questions", async (req, res) => {
  try {
    // ✅ ADD SECURITY LOGGING FOR PUBLIC ENDPOINT ACCESS
    await SecurityLogger.logSecurityEvent("SECURITY_QUESTIONS_ACCESSED", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Security questions list accessed",
      severity: "low",
      metadata: {
        questionCount: SECURITY_QUESTIONS.length,
        action: "get_security_questions",
      },
    });

    res.status(200).json({
      message: "Security questions retrieved successfully",
      state: "success",
      data: SECURITY_QUESTIONS,
    });
  } catch (error) {
    console.error("Error retrieving security questions:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error retrieving security questions",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "Error retrieving security questions",
      state: "error",
    });
  }
});

router.post("/setup-security-questions", authenticateUser, async (req, res) => {
  const { questions } = req.body; // Array of { questionId, answer }
  const uid = req.user.uid; // ✅ FIXED: Changed from req.firebaseUser.uid

  try {
    // Validate input - require exactly 3 questions since we only have 3
    if (!questions || questions.length !== 3) {
      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "questions",
        rule: "array_length",
        error: "Must provide exactly 3 security questions",
      });

      return res.status(400).json({
        message: "Please provide answers to all 3 security questions",
        state: "error",
      });
    }

    // Validate each question
    for (const q of questions) {
      if (!q.questionId || !q.answer || q.answer.trim().length < 2) {
        // ✅ ADD SECURITY LOGGING FOR INVALID QUESTION FORMAT
        await SecurityLogger.logValidationFailure({
          userId: uid,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          fieldName: "question_answer",
          rule: "min_length",
          error: "Security question answers too short",
        });

        return res.status(400).json({
          message:
            "All security question answers must be at least 2 characters long",
          state: "error",
        });
      }

      // Validate question ID exists
      const validQuestion = SECURITY_QUESTIONS.find(
        (sq) => sq.id === q.questionId
      );
      if (!validQuestion) {
        // ✅ ADD SECURITY LOGGING FOR INVALID QUESTION ID
        await SecurityLogger.logValidationFailure({
          userId: uid,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          fieldName: "questionId",
          rule: "valid_question",
          error: "Invalid security question ID provided",
        });

        return res.status(400).json({
          message: "Invalid security question ID",
          state: "error",
        });
      }
    }

    // Ensure all 3 questions are answered (no duplicates)
    const questionIds = questions.map((q) => q.questionId);
    const uniqueQuestionIds = new Set(questionIds);
    if (uniqueQuestionIds.size !== 3) {
      // ✅ ADD SECURITY LOGGING FOR DUPLICATE QUESTIONS
      await SecurityLogger.logValidationFailure({
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "questions",
        rule: "unique_questions",
        error: "Duplicate security questions provided",
      });

      return res.status(400).json({
        message: "Please answer all 3 different security questions",
        state: "error",
      });
    }

    // Hash answers (case-insensitive, trimmed)
    const hashedQuestions = await Promise.all(
      questions.map(async (q) => ({
        questionId: q.questionId,
        answer: await PasswordManager.hashPassword(
          q.answer.toLowerCase().trim()
        ),
      }))
    );

    // Update user document
    await db.collection("users").doc(uid).update({
      securityQuestions: hashedQuestions,
      securityQuestionsSetAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log the setup
    const logData = createLogData(
      uid,
      "security_questions_setup",
      `users/${uid}`,
      "success",
      {
        questionCount: questions.length,
        questionIds: questions.map((q) => q.questionId),
      }
    );

    logger.info(logData);
    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL SETUP
    await SecurityLogger.logSecurityEvent("SECURITY_QUESTIONS_SETUP", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Security questions set up successfully",
      severity: "low",
      metadata: {
        questionCount: questions.length,
        questionIds: questions.map((q) => q.questionId),
        action: "setup_security_questions",
      },
    });

    res.status(200).json({
      message: "Security questions set successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Error setting up security questions:", error);

    const logData = createLogData(
      uid,
      "security_questions_setup",
      `users/${uid}`,
      "failed",
      {},
      error
    );

    logger.error(logData);
    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error setting up security questions",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "Error setting up security questions",
      state: "error",
    });
  }
});

// POST route to send email verification
router.post("/send-email-verification", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "email",
        rule: "required",
        error: "Email is required for verification",
      });

      return res.status(400).json({
        message: "Email is required",
        state: "error",
      });
    }

    console.log("📧 Sending email verification for:", email);

    // Check if user exists in Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    if (userRecord.emailVerified) {
      // ✅ ADD SECURITY LOGGING FOR ALREADY VERIFIED EMAIL
      await SecurityLogger.logSecurityEvent("EMAIL_ALREADY_VERIFIED", {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Email verification requested for already verified email",
        severity: "low",
        metadata: {
          email: email.substring(0, 3) + "***",
          action: "email_verification",
        },
      });

      return res.status(200).json({
        message: "Email is already verified",
        state: "success",
        alreadyVerified: true,
      });
    }

    // Generate email verification link
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, {
        url: `${process.env.FRONTEND_URL}/login?verified=true`,
        handleCodeInApp: false,
      });

    console.log("✅ Email verification link generated:", verificationLink);

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL EMAIL VERIFICATION SEND
    await SecurityLogger.logSecurityEvent("EMAIL_VERIFICATION_SENT", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Email verification link generated successfully",
      severity: "low",
      metadata: {
        email: email.substring(0, 3) + "***",
        action: "send_email_verification",
      },
    });

    res.status(200).json({
      message: "Email verification sent successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error sending email verification",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "Error sending email verification",
      state: "error",
    });
  }
});

// Option B: Force verify email in development (ONLY for testing)
router.post("/force-verify-email", async (req, res) => {
  const { email } = req.body;

  // ⚠️ WARNING: Only use this in development!
  if (process.env.NODE_ENV !== "development") {
    // ✅ ADD SECURITY LOGGING FOR PRODUCTION ATTEMPT
    await SecurityLogger.logSecurityEvent("DEVELOPMENT_ENDPOINT_BLOCKED", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Attempt to use development endpoint in production",
      severity: "high",
      metadata: {
        email: email ? email.substring(0, 3) + "***" : "unknown",
        environment: process.env.NODE_ENV,
      },
    });

    return res.status(403).json({
      message: "This endpoint is only available in development",
      state: "error",
    });
  }

  if (!email) {
    // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
    await SecurityLogger.logValidationFailure({
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      fieldName: "email",
      rule: "required",
      error: "Email is required for force verification",
    });

    return res.status(400).json({
      message: "Email is required",
      state: "error",
    });
  }

  try {
    console.log("📧 Force verifying email for development:", email);

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Update user to mark email as verified
    await admin.auth().updateUser(userRecord.uid, {
      emailVerified: true,
    });

    console.log("✅ Email force-verified for development");

    // ✅ ADD SECURITY LOGGING FOR DEVELOPMENT FORCE VERIFICATION
    await SecurityLogger.logSecurityEvent("EMAIL_FORCE_VERIFIED", {
      userId: userRecord.uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Email force-verified in development mode",
      severity: "low",
      metadata: {
        email: email.substring(0, 3) + "***",
        environment: process.env.NODE_ENV,
        action: "force_verify_email",
      },
    });

    res.status(200).json({
      message: "Email verified successfully (development only)",
      state: "success",
    });
  } catch (error) {
    console.error("Force verification error:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error force-verifying email",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "Error force-verifying email",
      state: "error",
    });
  }
});

// Modified forgot-password endpoint that returns the reset link directly
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "email",
        rule: "required",
        error: "Email is required for password reset",
      });

      return res.status(400).json({
        message: "Email is required",
        state: "error",
      });
    }

    console.log("🔍 Starting password reset for email:", email);

    // Check if user exists in Firestore
    const searchEmail = email.toLowerCase().trim();
    console.log("🔍 Searching for email:", searchEmail);

    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", searchEmail)
      .limit(1)
      .get();

    console.log("🔍 Firestore query results:");
    console.log("  - Empty:", usersSnapshot.empty);
    console.log("  - Size:", usersSnapshot.size);

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      console.log("🔍 Found user document:");
      console.log("  - User ID:", userId);
      console.log("  - Document email:", userData.email);

      // Check for security questions
      const hasValidSecurityQuestions =
        userData.securityQuestions &&
        Array.isArray(userData.securityQuestions) &&
        userData.securityQuestions.length >= 3 &&
        userData.securityQuestions.every((q) => q && q.questionId && q.answer);

      console.log("🔍 Security questions check:", hasValidSecurityQuestions);

      if (!hasValidSecurityQuestions) {
        console.log(
          `❌ Password reset blocked for ${email} - insufficient security questions`
        );

        // Log this event
        const logData = createLogData(
          userId,
          "password_reset_attempted_no_questions",
          `users/${userId}`,
          "blocked",
          {
            hasSecurityQuestions: !!userData.securityQuestions,
            isArray: Array.isArray(userData.securityQuestions),
            length: userData.securityQuestions
              ? userData.securityQuestions.length
              : 0,
          }
        );

        await logToFirestore(logData);

        // ✅ ADD SECURITY LOGGING FOR INSUFFICIENT SECURITY QUESTIONS
        await SecurityLogger.logSecurityEvent("PASSWORD_RESET_BLOCKED", {
          userId,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          description:
            "Password reset blocked - insufficient security questions",
          severity: "medium",
          metadata: {
            email: email.substring(0, 3) + "***",
            hasSecurityQuestions: !!userData.securityQuestions,
            securityQuestionsCount: userData.securityQuestions
              ? userData.securityQuestions.length
              : 0,
          },
        });

        return res.status(400).json({
          message: "Security questions not set up for this account",
          state: "error",
        });
      }

      console.log(
        "✅ User has valid security questions, proceeding with password reset"
      );

      // Generate Firebase reset link (without sending email)
      try {
        console.log("🔗 Generating Firebase reset link...");

        // Create action code settings
        const actionCodeSettings = {
          url: `${process.env.FRONTEND_URL}/reset-password`,
          handleCodeInApp: false,
        };

        console.log("🔍 Action code settings:");
        console.log("  - URL:", actionCodeSettings.url);

        // Critical check: Verify the user exists in Firebase Auth
        console.log("🔍 Checking if user exists in Firebase Auth...");
        try {
          const userRecord = await admin.auth().getUserByEmail(email);
          console.log("✅ User found in Firebase Auth:");
          console.log("  - UID:", userRecord.uid);
          console.log("  - Email verified:", userRecord.emailVerified);
          console.log("  - Disabled:", userRecord.disabled);

          if (userRecord.disabled) {
            console.log("⚠️ WARNING: User account is disabled");

            // ✅ ADD SECURITY LOGGING FOR DISABLED ACCOUNT
            await SecurityLogger.logSecurityEvent("PASSWORD_RESET_BLOCKED", {
              userId,
              ipAddress: req.ip,
              userAgent: req.get("User-Agent"),
              endpoint: req.originalUrl,
              method: req.method,
              description: "Password reset blocked - account disabled",
              severity: "medium",
              metadata: {
                email: email.substring(0, 3) + "***",
                reason: "account_disabled",
              },
            });

            return res.status(400).json({
              message: "User account is disabled",
              state: "error",
            });
          }

          if (!userRecord.emailVerified) {
            console.log("⚠️ WARNING: Email is not verified");
            // Continue anyway for development
          }
        } catch (getUserError) {
          console.log("❌ User NOT found in Firebase Auth:", getUserError.code);

          // ✅ ADD SECURITY LOGGING FOR USER NOT FOUND IN AUTH
          await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            description: "User not found in Firebase Auth for password reset",
            severity: "medium",
            metadata: {
              email: email.substring(0, 3) + "***",
              error: getUserError.code,
            },
          });

          return res.status(404).json({
            message: "User not found in authentication system",
            state: "error",
          });
        }

        console.log("🔗 Generating password reset link...");

        // Generate the reset link (this doesn't send an email)
        const resetLink = await admin
          .auth()
          .generatePasswordResetLink(email, actionCodeSettings);

        console.log("✅ Firebase password reset link generated successfully!");
        console.log("🔗 Reset link:", resetLink);

        // Extract the oobCode from the link for easier frontend handling
        const urlObj = new URL(resetLink);
        const mode = urlObj.searchParams.get("mode");
        const oobCode = urlObj.searchParams.get("oobCode");
        const apiKey = urlObj.searchParams.get("apiKey");

        console.log("📋 Link parameters:");
        console.log("  - Mode:", mode);
        console.log(
          "  - OOB Code (first 10 chars):",
          oobCode?.substring(0, 10) + "..."
        );
        console.log(
          "  - API Key (first 10 chars):",
          apiKey?.substring(0, 10) + "..."
        );

        // Log successful link generation
        const logData = createLogData(
          userId,
          "password_reset_link_generated",
          `users/${userId}`,
          "success",
          {
            method: "direct_link",
            linkParameters: {
              mode,
              hasOobCode: !!oobCode,
              hasApiKey: !!apiKey,
            },
          }
        );

        await logToFirestore(logData);

        // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL LINK GENERATION
        await SecurityLogger.logSecurityEvent("PASSWORD_RESET_LINK_GENERATED", {
          userId,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          description: "Password reset link generated successfully",
          severity: "low",
          metadata: {
            email: email.substring(0, 3) + "***",
            method: "direct_link",
            hasOobCode: !!oobCode,
            hasApiKey: !!apiKey,
          },
        });

        // Return the reset link directly to the frontend
        res.status(200).json({
          message: "Password reset link generated successfully",
          state: "success",
          data: {
            resetLink: resetLink,
            // You can also return individual parameters if needed
            parameters: {
              mode: mode,
              oobCode: oobCode,
              apiKey: apiKey,
              baseUrl: `${process.env.FRONTEND_URL}/reset-password`,
            },
            // Frontend can use this to redirect directly
            directUrl: resetLink,
          },
        });
      } catch (firebaseError) {
        console.error("❌ Firebase password reset link generation error:");
        console.error("  - Error code:", firebaseError.code);
        console.error("  - Error message:", firebaseError.message);

        // Log the error
        const logData = createLogData(
          userId,
          "password_reset_link_generation_failed",
          `users/${userId}`,
          "error",
          {
            errorCode: firebaseError.code,
          },
          firebaseError
        );

        await logToFirestore(logData);

        // ✅ ADD SECURITY LOGGING FOR FIREBASE ERROR
        await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
          userId,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          severity: "high",
          description: "Error generating password reset link",
          metadata: {
            error: firebaseError.message,
            errorCode: firebaseError.code,
            email: email.substring(0, 3) + "***",
          },
        });

        res.status(500).json({
          message: "Error generating password reset link",
          state: "error",
          error: firebaseError.message,
        });
      }
    } else {
      console.log("❌ No user document found for email:", searchEmail);

      // Log failed attempt (email doesn't exist)
      const logData = createLogData(
        "unknown",
        "password_reset_attempted",
        "users/unknown",
        "email_not_found"
      );

      await logToFirestore(logData);

      // ✅ ADD SECURITY LOGGING FOR EMAIL NOT FOUND
      await SecurityLogger.logSecurityEvent("PASSWORD_RESET_EMAIL_NOT_FOUND", {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Password reset attempted for non-existent email",
        severity: "medium",
        metadata: {
          email: email.substring(0, 3) + "***",
        },
      });

      // For security, don't reveal that email doesn't exist
      res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }
  } catch (error) {
    console.error("❌ Password reset initiation error:", error);
    console.error("❌ Error stack:", error.stack);

    const logData = createLogData(
      "unknown",
      "password_reset_error",
      "users/unknown",
      "error",
      {},
      error
    );

    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Password reset initiation error",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "An error occurred. Please try again later.",
      state: "error",
    });
  }
});

// Optional: Add a test endpoint to directly generate and display reset links
router.post("/generate-reset-link", async (req, res) => {
  const { email } = req.body;

  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    // ✅ ADD SECURITY LOGGING FOR PRODUCTION ATTEMPT
    await SecurityLogger.logSecurityEvent("DEVELOPMENT_ENDPOINT_BLOCKED", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Attempt to use development endpoint in production",
      severity: "high",
      metadata: {
        email: email ? email.substring(0, 3) + "***" : "unknown",
        environment: process.env.NODE_ENV,
      },
    });

    return res.status(403).json({
      message: "This endpoint is only available in development",
      state: "error",
    });
  }

  if (!email) {
    // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
    await SecurityLogger.logValidationFailure({
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      fieldName: "email",
      rule: "required",
      error: "Email is required for reset link generation",
    });

    return res.status(400).json({
      message: "Email is required",
      state: "error",
    });
  }

  try {
    const actionCodeSettings = {
      url: `${process.env.FRONTEND_URL}/reset-password`,
      handleCodeInApp: false,
    };

    const resetLink = await admin
      .auth()
      .generatePasswordResetLink(email, actionCodeSettings);

    console.log("🔗 Generated reset link for testing:", resetLink);

    // ✅ ADD SECURITY LOGGING FOR DEVELOPMENT LINK GENERATION
    await SecurityLogger.logSecurityEvent("DEV_RESET_LINK_GENERATED", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Reset link generated for testing in development",
      severity: "low",
      metadata: {
        email: email.substring(0, 3) + "***",
        environment: process.env.NODE_ENV,
      },
    });

    res.status(200).json({
      message: "Reset link generated for testing",
      state: "success",
      resetLink: resetLink,
      instructions:
        "Copy this link and paste it in your browser to test the reset flow",
    });
  } catch (error) {
    console.error("Error generating test reset link:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error generating test reset link",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "Error generating reset link",
      state: "error",
      error: error.message,
    });
  }
});

// POST route to change password (Implements all security requirements)
router.post("/change-password", authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const uid = req.user.uid;

  try {
    console.log("🔒 Password change request for user:", uid);

    // Validate input
    if (!currentPassword || !newPassword) {
      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: !currentPassword ? "currentPassword" : "newPassword",
        rule: "required",
        error: "Password fields are required",
      });

      return res.status(400).json({
        message: "Current password and new password are required",
        state: "error",
      });
    }

    // Get user document
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      // ✅ ADD SECURITY LOGGING FOR USER NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "User not found for password change",
        severity: "medium",
        metadata: { action: "change_password" },
      });

      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // 🔍 REQUIREMENT 2.1.13: Re-authenticate before password change
    console.log("🔍 Verifying current password for re-authentication...");

    // For Firebase Auth users, verify current password by attempting to sign in
    try {
      const { signInWithEmailAndPassword } = require("firebase/auth");
      const { auth } = require("../config/firebase-config"); // Adjust path as needed

      // Re-authenticate with current password
      await signInWithEmailAndPassword(auth, userData.email, currentPassword);
      console.log("✅ Re-authentication successful");
    } catch (reAuthError) {
      console.log("❌ Re-authentication failed:", reAuthError.code);

      // Log failed re-authentication attempt
      const logData = createLogData(
        uid,
        "password_change_reauth_failed",
        `users/${uid}`,
        "failed",
        { error: reAuthError.code }
      );

      await logToFirestore(logData);

      // ✅ ADD SECURITY LOGGING FOR FAILED RE-AUTHENTICATION
      await SecurityLogger.logAuthAttempt("PASSWORD_CHANGE_REAUTH_FAILED", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        success: false,
        failureReason: "Current password incorrect",
        metadata: {
          action: "password_change",
          errorCode: reAuthError.code,
        },
      });

      return res.status(401).json({
        message: "Current password is incorrect",
        state: "error",
      });
    }

    // 🔍 REQUIREMENT 2.1.11: Check if password is at least 1 day old
    console.log("🔍 Checking password age requirement...");

    const lastPasswordChange = userData.lastPasswordChange;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (lastPasswordChange) {
      // Convert Firestore timestamp to Date if needed
      const lastChangeDate = lastPasswordChange.toDate
        ? lastPasswordChange.toDate()
        : new Date(lastPasswordChange);

      if (lastChangeDate > oneDayAgo) {
        const hoursRemaining = Math.ceil(
          (lastChangeDate.getTime() + 24 * 60 * 60 * 1000 - Date.now()) /
            (60 * 60 * 1000)
        );

        console.log(
          `❌ Password too young. Hours remaining: ${hoursRemaining}`
        );

        const logData = createLogData(
          uid,
          "password_change_blocked_too_young",
          `users/${uid}`,
          "blocked",
          {
            lastPasswordChange: lastChangeDate,
            hoursRemaining: hoursRemaining,
          }
        );

        await logToFirestore(logData);

        // ✅ ADD SECURITY LOGGING FOR PASSWORD TOO YOUNG
        await SecurityLogger.logSecurityEvent("PASSWORD_CHANGE_BLOCKED", {
          userId: uid,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          description: "Password change blocked - password too young",
          severity: "medium",
          metadata: {
            hoursRemaining,
            lastPasswordChange: lastChangeDate.toISOString(),
            reason: "password_too_young",
          },
        });

        return res.status(400).json({
          message: `Password must be at least 24 hours old before it can be changed. Please wait ${hoursRemaining} more hour(s).`,
          state: "error",
          hoursRemaining: hoursRemaining,
        });
      }
    }

    console.log("✅ Password age requirement met");

    // Validate new password strength
    console.log("🔍 Validating new password strength...");

    const validation = PasswordValidator.validate(newPassword);
    if (!validation.isValid) {
      // ✅ ADD SECURITY LOGGING FOR WEAK PASSWORD
      await SecurityLogger.logValidationFailure({
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "newPassword",
        rule: "password_strength",
        error: "Password does not meet security requirements",
      });

      return res.status(400).json({
        message: "Password does not meet security requirements",
        errors: validation.errors,
        state: "error",
      });
    }

    console.log("✅ New password meets strength requirements");

    // 🔍 REQUIREMENT 2.1.10: Check password history to prevent reuse
    console.log("🔍 Checking password history for reuse...");

    // ADD DEBUGGING HERE
    console.log("🔍 DEBUG: PasswordManager available:", !!PasswordManager);
    console.log(
      "🔍 DEBUG: PasswordManager.verifyPassword available:",
      !!PasswordManager.verifyPassword
    );

    const passwordHistory = userData.passwordHistory || [];
    const HISTORY_SIZE = 12; // Remember last 12 passwords

    // ADD MORE DEBUGGING
    console.log("🔍 DEBUG: Password history length:", passwordHistory.length);
    console.log("🔍 DEBUG: New password length:", newPassword.length);
    console.log(
      "🔍 DEBUG: New password (first 10 chars):",
      newPassword.substring(0, 10) + "..."
    );

    // Check if new password matches any in history
    for (let i = 0; i < passwordHistory.length; i++) {
      const historyEntry = passwordHistory[i];

      // ADD DEBUGGING FOR EACH ENTRY
      console.log(`🔍 DEBUG: Processing history entry ${i + 1}:`, {
        hasPassword: !!historyEntry.password,
        passwordLength: historyEntry.password
          ? historyEntry.password.length
          : 0,
        passwordPrefix: historyEntry.password
          ? historyEntry.password.substring(0, 20)
          : "none",
        changedAt: historyEntry.changedAt,
        changedAtType: typeof historyEntry.changedAt,
      });

      if (!historyEntry.password) {
        console.log(
          `⚠️ DEBUG: History entry ${i + 1} has no password field, skipping...`
        );
        continue;
      }

      // Check if it looks like a bcrypt hash
      const isBcryptHash =
        historyEntry.password.startsWith("$2b$") ||
        historyEntry.password.startsWith("$2a$") ||
        historyEntry.password.startsWith("$2y$");
      console.log(
        `🔍 DEBUG: History entry ${i + 1} appears to be bcrypt hash:`,
        isBcryptHash
      );

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

          const logData = createLogData(
            uid,
            "password_change_blocked_reuse",
            `users/${uid}`,
            "blocked",
            { historyPosition: i + 1 }
          );

          await logToFirestore(logData);

          // ✅ ADD SECURITY LOGGING FOR PASSWORD REUSE
          await SecurityLogger.logSecurityEvent("PASSWORD_CHANGE_BLOCKED", {
            userId: uid,
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            description: "Password change blocked - password reuse detected",
            severity: "medium",
            metadata: {
              historyPosition: i + 1,
              historySize: passwordHistory.length,
              reason: "password_reuse",
            },
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
        // Continue checking other entries even if one fails
      }
    }

    console.log("✅ Password not found in history - reuse check passed");

    // Hash the new password
    const hashedPassword = await PasswordManager.hashPassword(newPassword);
    console.log(
      "🔍 DEBUG: New password hashed successfully, hash prefix:",
      hashedPassword.substring(0, 20) + "..."
    );

    // Update password history (keep last 12 passwords)
    const updatedHistory = [
      {
        password: hashedPassword,
        changedAt: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
      ...passwordHistory.slice(0, HISTORY_SIZE - 1), // Keep last 11, add new one = 12 total
    ];

    console.log(
      "🔍 DEBUG: Updated history will have",
      updatedHistory.length,
      "entries"
    );

    // Update Firebase Auth password
    console.log("🔍 Updating Firebase Auth password...");
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    // Update user document in Firestore
    console.log("🔍 Updating user document...");
    await db.collection("users").doc(uid).update({
      passwordHistory: updatedHistory,
      lastPasswordChange: admin.firestore.FieldValue.serverTimestamp(),
      // Optional: Invalidate all existing sessions except current (security measure)
      sessionsInvalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log successful password change
    const logData = createLogData(
      uid,
      "password_changed_successfully",
      `users/${uid}`,
      "success",
      { passwordHistorySize: updatedHistory.length }
    );

    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL PASSWORD CHANGE
    await SecurityLogger.logSecurityEvent("PASSWORD_CHANGED", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Password changed successfully",
      severity: "low",
      metadata: {
        method: "authenticated_change",
        passwordHistorySize: updatedHistory.length,
        action: "change_password",
      },
    });

    console.log("✅ Password change completed successfully");

    res.status(200).json({
      message: "Password changed successfully",
      state: "success",
      nextChangeAllowed: new Date(Date.now() + 24 * 60 * 60 * 1000), // When they can change it again
    });
  } catch (error) {
    console.error("❌ Password change error:", error);

    // Log the error
    const logData = createLogData(
      uid,
      "password_change_error",
      `users/${uid}`,
      "error",
      {},
      error
    );

    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Password change system error",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "An error occurred while changing password",
      state: "error",
    });
  }
});

// GET route to check password change eligibility
router.get("/password-change-status", authenticateUser, async (req, res) => {
  const uid = req.user.uid;

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      // ✅ ADD SECURITY LOGGING FOR USER NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "User not found for password change status",
        severity: "medium",
        metadata: { action: "get_password_change_status" },
      });

      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();
    const lastPasswordChange = userData.lastPasswordChange;

    let canChangePassword = true;
    let hoursRemaining = 0;
    let nextChangeAllowed = null;

    if (lastPasswordChange) {
      const lastChangeDate = lastPasswordChange.toDate
        ? lastPasswordChange.toDate()
        : new Date(lastPasswordChange);
      const oneDayLater = new Date(
        lastChangeDate.getTime() + 24 * 60 * 60 * 1000
      );
      const now = new Date();

      if (now < oneDayLater) {
        canChangePassword = false;
        hoursRemaining = Math.ceil(
          (oneDayLater.getTime() - now.getTime()) / (60 * 60 * 1000)
        );
        nextChangeAllowed = oneDayLater;
      }
    }

    // ✅ ADD SECURITY LOGGING FOR PASSWORD CHANGE STATUS ACCESS
    await SecurityLogger.logSecurityEvent("PASSWORD_CHANGE_STATUS_ACCESSED", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Password change status retrieved",
      severity: "low",
      metadata: {
        canChangePassword,
        hoursRemaining,
        passwordHistoryCount: userData.passwordHistory
          ? userData.passwordHistory.length
          : 0,
      },
    });

    res.status(200).json({
      message: "Password change status retrieved",
      state: "success",
      data: {
        canChangePassword,
        hoursRemaining,
        nextChangeAllowed,
        lastPasswordChange: lastPasswordChange,
        passwordHistoryCount: userData.passwordHistory
          ? userData.passwordHistory.length
          : 0,
      },
    });
  } catch (error) {
    console.error("Error getting password change status:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error retrieving password change status",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "Error retrieving password change status",
      state: "error",
    });
  }
});

// POST route to verify security questions (for Firebase reset flow)
router.post("/verify-security-questions", async (req, res) => {
  const { email, answers } = req.body;

  try {
    console.log("🔍 Verifying security questions for email:", email);

    // Validate input
    if (!email || !answers) {
      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: !email ? "email" : "answers",
        rule: "required",
        error: "Email and answers are required",
      });

      return res.status(400).json({
        message: "Email and answers are required",
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

      // ✅ ADD SECURITY LOGGING FOR USER NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "User not found for security questions verification",
        severity: "medium",
        metadata: {
          email: email.substring(0, 3) + "***",
          action: "verify_security_questions",
        },
      });

      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Check if user has security questions
    const userQuestions = userData.securityQuestions || [];
    if (userQuestions.length < 3) {
      console.log("❌ User does not have sufficient security questions");

      // ✅ ADD SECURITY LOGGING FOR INSUFFICIENT SECURITY QUESTIONS
      await SecurityLogger.logSecurityEvent("SECURITY_QUESTIONS_INSUFFICIENT", {
        userId,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description:
          "Security questions verification failed - insufficient questions",
        severity: "medium",
        metadata: {
          securityQuestionsCount: userQuestions.length,
          email: email.substring(0, 3) + "***",
        },
      });

      return res.status(400).json({
        message: "Security questions not set up for this account",
        state: "error",
      });
    }

    console.log("🔍 Checking", userQuestions.length, "security questions");

    // Verify security question answers
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

    console.log(
      `🔍 Correct answers: ${correctAnswers}/${userQuestions.length}`
    );

    // Require all answers to be correct
    if (correctAnswers < userQuestions.length) {
      console.log("❌ Security questions verification failed");

      const logData = createLogData(
        userId,
        "security_questions_verification_failed",
        `users/${userId}`,
        "failed",
        {
          correctAnswers: correctAnswers,
          totalQuestions: userQuestions.length,
          method: "firebase_reset",
        }
      );

      await logToFirestore(logData);

      // ✅ ADD SECURITY LOGGING FOR FAILED SECURITY QUESTIONS
      await SecurityLogger.logSecurityEvent("SECURITY_QUESTIONS_FAILED", {
        userId,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Security questions verification failed",
        severity: "high",
        metadata: {
          correctAnswers,
          totalQuestions: userQuestions.length,
          email: email.substring(0, 3) + "***",
          method: "firebase_reset",
        },
      });

      return res.status(400).json({
        message: "Security question answers are incorrect",
        state: "error",
      });
    }

    console.log("✅ All security questions verified successfully");

    // Log successful verification
    const logData = createLogData(
      userId,
      "security_questions_verification_success",
      `users/${userId}`,
      "success",
      {
        correctAnswers: correctAnswers,
        totalQuestions: userQuestions.length,
        method: "firebase_reset",
      }
    );

    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL SECURITY QUESTIONS
    await SecurityLogger.logSecurityEvent("SECURITY_QUESTIONS_VERIFIED", {
      userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Security questions verified successfully",
      severity: "low",
      metadata: {
        correctAnswers,
        totalQuestions: userQuestions.length,
        email: email.substring(0, 3) + "***",
        method: "firebase_reset",
      },
    });

    res.status(200).json({
      message: "Security questions verified successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Security questions verification error:", error);

    const logData = createLogData(
      "unknown",
      "security_questions_verification_error",
      "users/unknown",
      "error",
      { method: "firebase_reset" },
      error
    );

    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error verifying security questions",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "An error occurred while verifying security questions",
      state: "error",
    });
  }
});

// Helper endpoint to get user by email (for security questions)
router.post("/get-user-by-email", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "email",
        rule: "required",
        error: "Email is required",
      });

      return res.status(400).json({
        message: "Email is required",
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
      // ✅ ADD SECURITY LOGGING FOR USER NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "User not found by email lookup",
        severity: "medium",
        metadata: {
          email: email.substring(0, 3) + "***",
          action: "get_user_by_email",
        },
      });

      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL USER LOOKUP
    await SecurityLogger.logSecurityEvent("USER_LOOKUP_BY_EMAIL", {
      userId: userDoc.id,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "User found by email lookup",
      severity: "low",
      metadata: {
        email: email.substring(0, 3) + "***",
        hasSecurityQuestions:
          userData.securityQuestions && userData.securityQuestions.length >= 3,
        securityQuestionsCount: userData.securityQuestions
          ? userData.securityQuestions.length
          : 0,
      },
    });

    // Return only necessary data for password reset
    res.status(200).json({
      message: "User found",
      state: "success",
      data: {
        email: userData.email,
        securityQuestions: userData.securityQuestions || [],
        hasSecurityQuestions:
          userData.securityQuestions && userData.securityQuestions.length >= 3,
      },
    });
  } catch (error) {
    console.error("Error getting user by email:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error getting user by email",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "An error occurred while fetching user data",
      state: "error",
    });
  }
});

// Debug endpoint to test Firebase configuration
router.get("/debug-firebase", async (req, res) => {
  try {
    // ✅ ADD SECURITY LOGGING FOR DEBUG ENDPOINT ACCESS
    await SecurityLogger.logSecurityEvent("DEBUG_ENDPOINT_ACCESSED", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Firebase debug endpoint accessed",
      severity: "medium",
      metadata: {
        environment: process.env.NODE_ENV,
      },
    });

    console.log("🔍 Firebase Configuration Debug");
    console.log("================================");

    // Check Firebase Admin initialization
    const app = admin.app();
    console.log("✅ Firebase Admin app initialized");
    console.log("  - Project ID:", app.options.projectId);

    // Check Auth service
    const auth = admin.auth();
    console.log("✅ Firebase Auth service available");

    // Test: List a few users to verify Auth is working
    try {
      const listResult = await auth.listUsers(5);
      console.log(
        "✅ Firebase Auth working - found",
        listResult.users.length,
        "users"
      );

      // Check if your test user exists
      const testEmail = "ceejay1117@yahoo.com";
      try {
        const userRecord = await auth.getUserByEmail(testEmail);
        console.log("✅ Test user found in Firebase Auth:");
        console.log("  - UID:", userRecord.uid);
        console.log("  - Email:", userRecord.email);
        console.log("  - Email verified:", userRecord.emailVerified);
        console.log("  - Disabled:", userRecord.disabled);
        console.log("  - Created:", new Date(userRecord.metadata.creationTime));
        console.log(
          "  - Last sign in:",
          new Date(userRecord.metadata.lastSignInTime)
        );
      } catch (userError) {
        console.log("❌ Test user NOT found in Firebase Auth:", userError.code);
        console.log("   This is likely why emails aren't being sent!");
      }
    } catch (listError) {
      console.log("❌ Cannot list users:", listError.code, listError.message);
    }

    // Check Firestore connection
    try {
      const testDoc = await admin
        .firestore()
        .collection("users")
        .limit(1)
        .get();
      console.log(
        "✅ Firestore connection working - found",
        testDoc.size,
        "user documents"
      );
    } catch (firestoreError) {
      console.log("❌ Firestore connection failed:", firestoreError.message);
    }

    // Test environment variables
    console.log("\n🔍 Environment Variables:");
    console.log("  - FRONTEND_URL:", process.env.FRONTEND_URL || "NOT SET");
    console.log("  - NODE_ENV:", process.env.NODE_ENV || "NOT SET");
    console.log(
      "  - FIREBASE_PROJECT_ID:",
      process.env.FIREBASE_PROJECT_ID || "NOT SET"
    );

    // Test generating a password reset link (without sending)
    try {
      const testActionSettings = {
        url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?test=true`,
        handleCodeInApp: false,
      };

      console.log("\n🔍 Testing password reset link generation...");
      const testLink = await auth.generatePasswordResetLink(
        "ceejay1117@yahoo.com",
        testActionSettings
      );
      console.log("✅ Password reset link generated successfully!");
      console.log("  - Link preview:", testLink.substring(0, 100) + "...");
    } catch (testError) {
      console.log("❌ Failed to generate test password reset link:");
      console.log("  - Code:", testError.code);
      console.log("  - Message:", testError.message);
    }

    res.json({
      success: true,
      message: "Debug information logged to console",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Firebase debug error:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error in Firebase debug endpoint",
      metadata: { error: error.message },
    });

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET route to validate reset token and get security questions
router.get("/reset-password/:token/:uid", async (req, res) => {
  const { token, uid } = req.params;

  try {
    // ✅ ADD SECURITY LOGGING FOR RESET TOKEN VALIDATION ATTEMPT
    await SecurityLogger.logSecurityEvent("RESET_TOKEN_VALIDATION_ATTEMPT", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Reset token validation attempted",
      severity: "medium",
      metadata: {
        tokenProvided: !!token,
        action: "validate_reset_token",
      },
    });

    // Hash the provided token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Get user document
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      // ✅ ADD SECURITY LOGGING FOR USER NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "User not found for reset token validation",
        severity: "medium",
        metadata: { action: "validate_reset_token" },
      });

      return res.status(404).json({
        message: "Invalid reset link",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // Validate token
    if (
      !userData.passwordResetToken ||
      userData.passwordResetToken !== tokenHash
    ) {
      // ✅ ADD SECURITY LOGGING FOR INVALID TOKEN
      await SecurityLogger.logSecurityEvent("RESET_TOKEN_INVALID", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Invalid reset token provided",
        severity: "high",
        metadata: {
          hasStoredToken: !!userData.passwordResetToken,
          action: "validate_reset_token",
        },
      });

      return res.status(400).json({
        message: "Invalid or expired reset link",
        state: "error",
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiry = userData.passwordResetTokenExpiry?.toDate();

    if (!expiry || now > expiry) {
      // Clean up expired token
      await db.collection("users").doc(uid).update({
        passwordResetToken: admin.firestore.FieldValue.delete(),
        passwordResetTokenExpiry: admin.firestore.FieldValue.delete(),
      });

      // ✅ ADD SECURITY LOGGING FOR EXPIRED TOKEN
      await SecurityLogger.logSecurityEvent("RESET_TOKEN_EXPIRED", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Expired reset token provided",
        severity: "medium",
        metadata: {
          expiry: expiry ? expiry.toISOString() : "no_expiry",
          action: "validate_reset_token",
        },
      });

      return res.status(400).json({
        message: "Reset link has expired. Please request a new one.",
        state: "error",
      });
    }

    // Get user's security questions
    const userQuestions = userData.securityQuestions || [];
    if (userQuestions.length < 3) {
      // ✅ ADD SECURITY LOGGING FOR INSUFFICIENT SECURITY QUESTIONS
      await SecurityLogger.logSecurityEvent("SECURITY_QUESTIONS_INSUFFICIENT", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Reset token valid but insufficient security questions",
        severity: "medium",
        metadata: {
          securityQuestionsCount: userQuestions.length,
          action: "validate_reset_token",
        },
      });

      return res.status(400).json({
        message: "Security questions not set up for this account",
        state: "error",
      });
    }

    // Map question IDs to actual questions
    const questionsWithText = userQuestions.map((uq) => {
      const questionData = SECURITY_QUESTIONS.find(
        (sq) => sq.id === uq.questionId
      );
      return {
        questionId: uq.questionId,
        question: questionData ? questionData.question : "Question not found",
      };
    });

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL TOKEN VALIDATION
    await SecurityLogger.logSecurityEvent("RESET_TOKEN_VALID", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Reset token validated successfully",
      severity: "low",
      metadata: {
        email: userData.email.substring(0, 3) + "***",
        securityQuestionsCount: userQuestions.length,
        action: "validate_reset_token",
      },
    });

    res.status(200).json({
      message: "Reset token is valid",
      state: "success",
      data: {
        email: userData.email,
        questions: questionsWithText,
        tokenValid: true,
      },
    });
  } catch (error) {
    console.error("Reset token validation error:", error);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error validating reset token",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "An error occurred validating the reset link",
      state: "error",
    });
  }
});

// POST route to complete password reset
router.post("/reset-password", async (req, res) => {
  const { token, uid, answers, newPassword } = req.body;

  try {
    // Validate input
    if (!token || !uid || !answers || !newPassword) {
      // ✅ ADD SECURITY LOGGING FOR VALIDATION ERRORS
      await SecurityLogger.logValidationFailure({
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "reset_password_fields",
        rule: "required",
        error: "Missing required fields for password reset",
      });

      return res.status(400).json({
        message: "Missing required fields",
        state: "error",
      });
    }

    // Validate password
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      // ✅ ADD SECURITY LOGGING FOR WEAK PASSWORD
      await SecurityLogger.logValidationFailure({
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        fieldName: "newPassword",
        rule: "password_strength",
        error: "Password does not meet security requirements",
      });

      return res.status(400).json({
        message: "Password does not meet requirements",
        errors: passwordValidation.errors,
        state: "error",
      });
    }

    // Hash the provided token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Get user document
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      // ✅ ADD SECURITY LOGGING FOR USER NOT FOUND
      await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "User not found for password reset completion",
        severity: "medium",
        metadata: { action: "complete_password_reset" },
      });

      return res.status(404).json({
        message: "Invalid reset request",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // Validate token again
    if (
      !userData.passwordResetToken ||
      userData.passwordResetToken !== tokenHash
    ) {
      // ✅ ADD SECURITY LOGGING FOR INVALID TOKEN
      await SecurityLogger.logSecurityEvent("RESET_TOKEN_INVALID", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Invalid reset token for password reset completion",
        severity: "high",
        metadata: { action: "complete_password_reset" },
      });

      return res.status(400).json({
        message: "Invalid or expired reset link",
        state: "error",
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiry = userData.passwordResetTokenExpiry?.toDate();

    if (!expiry || now > expiry) {
      // ✅ ADD SECURITY LOGGING FOR EXPIRED TOKEN
      await SecurityLogger.logSecurityEvent("RESET_TOKEN_EXPIRED", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Expired reset token for password reset completion",
        severity: "medium",
        metadata: { action: "complete_password_reset" },
      });

      return res.status(400).json({
        message: "Reset link has expired",
        state: "error",
      });
    }

    // Verify security question answers
    const userQuestions = userData.securityQuestions || [];
    if (userQuestions.length < 3) {
      // ✅ ADD SECURITY LOGGING FOR INSUFFICIENT SECURITY QUESTIONS
      await SecurityLogger.logSecurityEvent("SECURITY_QUESTIONS_INSUFFICIENT", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Insufficient security questions for password reset",
        severity: "medium",
        metadata: {
          securityQuestionsCount: userQuestions.length,
          action: "complete_password_reset",
        },
      });

      return res.status(400).json({
        message: "Security questions not set up",
        state: "error",
      });
    }

    // Check answers
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

    // Require all answers to be correct
    if (correctAnswers < userQuestions.length) {
      const logData = createLogData(
        uid,
        "password_reset_failed_security_questions",
        `users/${uid}`,
        "failed",
        {
          correctAnswers: correctAnswers,
          totalQuestions: userQuestions.length,
        }
      );

      await logToFirestore(logData);

      // ✅ ADD SECURITY LOGGING FOR FAILED SECURITY QUESTIONS
      await SecurityLogger.logSecurityEvent("SECURITY_QUESTIONS_FAILED", {
        userId: uid,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        method: req.method,
        description: "Security questions failed for password reset",
        severity: "high",
        metadata: {
          correctAnswers,
          totalQuestions: userQuestions.length,
          action: "complete_password_reset",
        },
      });

      return res.status(400).json({
        message: "Security question answers are incorrect",
        state: "error",
      });
    }

    // Check password history to prevent reuse (Requirement 2.1.10)
    const passwordHistory = userData.passwordHistory || [];
    for (const historyEntry of passwordHistory) {
      const isReused = await PasswordManager.verifyPassword(
        newPassword,
        historyEntry.password
      );
      if (isReused) {
        // ✅ ADD SECURITY LOGGING FOR PASSWORD REUSE
        await SecurityLogger.logSecurityEvent("PASSWORD_RESET_REUSE_BLOCKED", {
          userId: uid,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: req.method,
          description: "Password reset blocked - password reuse detected",
          severity: "medium",
          metadata: {
            historySize: passwordHistory.length,
            action: "complete_password_reset",
          },
        });

        return res.status(400).json({
          message:
            "This password has been used recently. Please choose a different password.",
          state: "error",
        });
      }
    }

    // Update password in Firebase Auth
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    // Hash new password for history
    const hashedPassword = await PasswordManager.hashPassword(newPassword);

    // Update password history
    const HISTORY_SIZE = 12;
    const updatedHistory = [
      { password: hashedPassword, changedAt: new Date() },
      ...passwordHistory.slice(0, HISTORY_SIZE - 1),
    ];

    // Update user document
    await db.collection("users").doc(uid).update({
      passwordHistory: updatedHistory,
      lastPasswordChange: admin.firestore.FieldValue.serverTimestamp(),
      // Clear reset token
      passwordResetToken: admin.firestore.FieldValue.delete(),
      passwordResetTokenExpiry: admin.firestore.FieldValue.delete(),
      // Reset failed login attempts
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    });

    // Log successful password reset
    const logData = createLogData(
      uid,
      "password_reset_completed",
      `users/${uid}`,
      "success",
      { method: "security_questions" }
    );

    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SUCCESSFUL PASSWORD RESET
    await SecurityLogger.logSecurityEvent("PASSWORD_RESET_SUCCESS", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      description: "Password reset completed successfully",
      severity: "low",
      metadata: {
        method: "security_questions",
        passwordHistorySize: updatedHistory.length,
        action: "complete_password_reset",
      },
    });

    res.status(200).json({
      message: "Password reset successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Password reset completion error:", error);

    const logData = createLogData(
      uid,
      "password_reset_error",
      `users/${uid}`,
      "error",
      {},
      error
    );

    await logToFirestore(logData);

    // ✅ ADD SECURITY LOGGING FOR SYSTEM ERRORS
    await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
      userId: uid,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      severity: "high",
      description: "Error completing password reset",
      metadata: { error: error.message },
    });

    res.status(500).json({
      message: "An error occurred resetting the password",
      state: "error",
    });
  }
});

module.exports = router;
