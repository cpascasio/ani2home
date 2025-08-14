// backend/controllers/passwordReset.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { authenticateUser } = require("../middleware/auth");
const { logToFirestore, logger } = require("../config/firebase-config");
const crypto = require("crypto");
const PasswordManager = require("../../utils/PasswordManager"); // You'll need to create this
const PasswordValidator = require("../../utils/PasswordValidator"); // You'll need to create this

const db = admin.firestore();

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
    res.status(200).json({
      message: "Security questions retrieved successfully",
      state: "success",
      data: SECURITY_QUESTIONS,
    });
  } catch (error) {
    console.error("Error retrieving security questions:", error);
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
      return res.status(400).json({
        message: "Please provide answers to all 3 security questions",
        state: "error",
      });
    }

    // Validate each question
    for (const q of questions) {
      if (!q.questionId || !q.answer || q.answer.trim().length < 2) {
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
    const logData = {
      timestamp: new Date(),
      userId: uid,
      action: "security_questions_setup",
      resource: `users/${uid}`,
      status: "success",
      details: {
        questionCount: questions.length,
        questionIds: questions.map((q) => q.questionId),
      },
    };

    logger.info(logData);
    await logToFirestore(logData);

    res.status(200).json({
      message: "Security questions set successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Error setting up security questions:", error);

    const logData = {
      timestamp: new Date(),
      userId: uid,
      action: "security_questions_setup",
      resource: `users/${uid}`,
      status: "failed",
      error: error.message,
    };

    logger.error(logData);
    await logToFirestore(logData);

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
    console.log("📧 Sending email verification for:", email);

    // Check if user exists in Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    if (userRecord.emailVerified) {
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

    res.status(200).json({
      message: "Email verification sent successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Email verification error:", error);
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
    return res.status(403).json({
      message: "This endpoint is only available in development",
      state: "error",
    });
  }

  try {
    console.log("🔧 Force verifying email for development:", email);

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Update user to mark email as verified
    await admin.auth().updateUser(userRecord.uid, {
      emailVerified: true,
    });

    console.log("✅ Email force-verified for development");

    res.status(200).json({
      message: "Email verified successfully (development only)",
      state: "success",
    });
  } catch (error) {
    console.error("Force verification error:", error);
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
        await logToFirestore({
          timestamp: new Date(),
          action: "password_reset_attempted_no_questions",
          email: email,
          userId: userId,
          status: "blocked",
          debug: {
            hasSecurityQuestions: !!userData.securityQuestions,
            isArray: Array.isArray(userData.securityQuestions),
            length: userData.securityQuestions
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
            console.log("⚠️  WARNING: User account is disabled");
            return res.status(400).json({
              message: "User account is disabled",
              state: "error",
            });
          }

          if (!userRecord.emailVerified) {
            console.log("⚠️  WARNING: Email is not verified");
            // Continue anyway for development
          }
        } catch (getUserError) {
          console.log("❌ User NOT found in Firebase Auth:", getUserError.code);
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
        await logToFirestore({
          timestamp: new Date(),
          action: "password_reset_link_generated",
          email: email,
          userId: userId,
          status: "success",
          method: "direct_link",
          linkParameters: {
            mode,
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
        await logToFirestore({
          timestamp: new Date(),
          action: "password_reset_link_generation_failed",
          email: email,
          userId: userId,
          status: "error",
          error: firebaseError.message,
          errorCode: firebaseError.code,
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
      await logToFirestore({
        timestamp: new Date(),
        action: "password_reset_attempted",
        email: email,
        status: "email_not_found",
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

    await logToFirestore({
      timestamp: new Date(),
      action: "password_reset_error",
      email: email,
      error: error.message,
      status: "error",
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
    return res.status(403).json({
      message: "This endpoint is only available in development",
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

    res.status(200).json({
      message: "Reset link generated for testing",
      state: "success",
      resetLink: resetLink,
      instructions:
        "Copy this link and paste it in your browser to test the reset flow",
    });
  } catch (error) {
    console.error("Error generating test reset link:", error);
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
      return res.status(400).json({
        message: "Current password and new password are required",
        state: "error",
      });
    }

    // Get user document
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userData = userDoc.data();

    // 🔐 REQUIREMENT 2.1.13: Re-authenticate before password change
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
      await logToFirestore({
        timestamp: new Date(),
        userId: uid,
        action: "password_change_reauth_failed",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        error: reAuthError.code,
      });

      return res.status(401).json({
        message: "Current password is incorrect",
        state: "error",
      });
    }

    // 🔐 REQUIREMENT 2.1.11: Check if password is at least 1 day old
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

        await logToFirestore({
          timestamp: new Date(),
          userId: uid,
          action: "password_change_blocked_too_young",
          ipAddress: req.ip,
          lastPasswordChange: lastChangeDate,
          hoursRemaining: hoursRemaining,
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
      return res.status(400).json({
        message: "Password does not meet security requirements",
        errors: validation.errors,
        state: "error",
      });
    }

    console.log("✅ New password meets strength requirements");

    // 🔐 REQUIREMENT 2.1.10: Check password history to prevent reuse
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
    console.log(
      "🔍 DEBUG: Full password history:",
      JSON.stringify(passwordHistory, null, 2)
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

          await logToFirestore({
            timestamp: new Date(),
            userId: uid,
            action: "password_change_blocked_reuse",
            ipAddress: req.ip,
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
    await logToFirestore({
      timestamp: new Date(),
      userId: uid,
      action: "password_changed_successfully",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      passwordHistorySize: updatedHistory.length,
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
    await logToFirestore({
      timestamp: new Date(),
      userId: uid,
      action: "password_change_error",
      ipAddress: req.ip,
      error: error.message,
      stack: error.stack,
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
    res.status(500).json({
      message: "Error retrieving password change status",
      state: "error",
    });
  }
});

// Add these new endpoints for the Firebase Default System:

// POST route to verify security questions (for Firebase reset flow)
router.post("/verify-security-questions", async (req, res) => {
  const { email, answers } = req.body;

  try {
    console.log("🔍 Verifying security questions for email:", email);

    // Validate input
    if (!email || !answers) {
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

      await logToFirestore({
        timestamp: new Date(),
        action: "security_questions_verification_failed",
        email: email,
        userId: userId,
        status: "failed",
        correctAnswers: correctAnswers,
        totalQuestions: userQuestions.length,
        method: "firebase_reset",
      });

      return res.status(400).json({
        message: "Security question answers are incorrect",
        state: "error",
      });
    }

    console.log("✅ All security questions verified successfully");

    // Log successful verification
    await logToFirestore({
      timestamp: new Date(),
      action: "security_questions_verification_success",
      email: email,
      userId: userId,
      status: "success",
      correctAnswers: correctAnswers,
      totalQuestions: userQuestions.length,
      method: "firebase_reset",
    });

    res.status(200).json({
      message: "Security questions verified successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Security questions verification error:", error);

    await logToFirestore({
      timestamp: new Date(),
      action: "security_questions_verification_error",
      email: email,
      error: error.message,
      status: "error",
      method: "firebase_reset",
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
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

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
    res.status(500).json({
      message: "An error occurred while fetching user data",
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

      await logToFirestore({
        timestamp: new Date(),
        action: "security_questions_verification_failed",
        email: email,
        userId: userId,
        status: "failed",
        correctAnswers: correctAnswers,
        totalQuestions: userQuestions.length,
        method: "firebase_reset",
      });

      return res.status(400).json({
        message: "Security question answers are incorrect",
        state: "error",
      });
    }

    console.log("✅ All security questions verified successfully");

    // Log successful verification
    await logToFirestore({
      timestamp: new Date(),
      action: "security_questions_verification_success",
      email: email,
      userId: userId,
      status: "success",
      correctAnswers: correctAnswers,
      totalQuestions: userQuestions.length,
      method: "firebase_reset",
    });

    res.status(200).json({
      message: "Security questions verified successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Security questions verification error:", error);

    await logToFirestore({
      timestamp: new Date(),
      action: "security_questions_verification_error",
      email: email,
      error: error.message,
      status: "error",
      method: "firebase_reset",
    });

    res.status(500).json({
      message: "An error occurred while verifying security questions",
      state: "error",
    });
  }
});

// Also add a helper endpoint to get user by email (for security questions)
router.post("/get-user-by-email", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
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
      return res.status(404).json({
        message: "User not found",
        state: "error",
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

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
    res.status(500).json({
      message: "An error occurred while fetching user data",
      state: "error",
    });
  }
});

// Debug endpoint to test Firebase configuration
router.get("/debug-firebase", async (req, res) => {
  try {
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
    // Hash the provided token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Get user document
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
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

      return res.status(400).json({
        message: "Reset link has expired. Please request a new one.",
        state: "error",
      });
    }

    // Get user's security questions
    const userQuestions = userData.securityQuestions || [];
    if (userQuestions.length < 3) {
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
      return res.status(400).json({
        message: "Missing required fields",
        state: "error",
      });
    }

    // Validate password
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
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
      return res.status(400).json({
        message: "Invalid or expired reset link",
        state: "error",
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiry = userData.passwordResetTokenExpiry?.toDate();

    if (!expiry || now > expiry) {
      return res.status(400).json({
        message: "Reset link has expired",
        state: "error",
      });
    }

    // Verify security question answers
    const userQuestions = userData.securityQuestions || [];
    if (userQuestions.length < 3) {
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
      await logToFirestore({
        timestamp: new Date(),
        action: "password_reset_failed_security_questions",
        userId: uid,
        status: "failed",
        correctAnswers: correctAnswers,
        totalQuestions: userQuestions.length,
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
    await logToFirestore({
      timestamp: new Date(),
      userId: uid,
      action: "password_reset_completed",
      status: "success",
      method: "security_questions",
    });

    res.status(200).json({
      message: "Password reset successfully",
      state: "success",
    });
  } catch (error) {
    console.error("Password reset completion error:", error);

    await logToFirestore({
      timestamp: new Date(),
      action: "password_reset_error",
      userId: uid,
      error: error.message,
      status: "error",
    });

    res.status(500).json({
      message: "An error occurred resetting the password",
      state: "error",
    });
  }
});

module.exports = router;
