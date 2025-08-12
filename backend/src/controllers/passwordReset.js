// backend/routes/passwordReset.js
router.post("/change-password", authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const uid = req.user.uid;

  try {
    // Requirement 2.1.13: Re-authenticate before password change
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    // Verify current password
    const isCurrentPasswordValid = await PasswordManager.verifyPassword(
      currentPassword,
      userData.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
        state: "error",
      });
    }

    // Requirement 2.1.11: Check if password is at least 1 day old
    const lastPasswordChange = userData.lastPasswordChange;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (lastPasswordChange && new Date(lastPasswordChange) > oneDayAgo) {
      return res.status(400).json({
        message:
          "Password must be at least 24 hours old before it can be changed",
        state: "error",
      });
    }

    // Validate new password
    const validation = PasswordValidator.validate(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Password does not meet requirements",
        errors: validation.errors,
        state: "error",
      });
    }

    // Requirement 2.1.10: Check password history to prevent reuse
    const passwordHistory = userData.passwordHistory || [];
    const HISTORY_SIZE = 12; // Remember last 12 passwords

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

    // Hash new password
    const hashedPassword = await PasswordManager.hashPassword(newPassword);

    // Update password history
    const updatedHistory = [
      { password: hashedPassword, changedAt: new Date() },
      ...passwordHistory.slice(0, HISTORY_SIZE - 1),
    ];

    // Update user document
    await db.collection("users").doc(uid).update({
      password: hashedPassword,
      passwordHistory: updatedHistory,
      lastPasswordChange: new Date(),
      // Invalidate all existing sessions except current
      sessionsInvalidatedAt: new Date(),
    });

    // Log password change
    await logToFirestore({
      timestamp: new Date(),
      userId: uid,
      action: "password_changed",
      ipAddress: req.ip,
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

// Security questions for password reset (Requirement 2.1.9)
const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What is your mother's maiden name?",
  "What was the make and model of your first car?",
  "What elementary school did you attend?",
  "What is the name of the town where you were born?",
  "What was your childhood nickname?",
  "What is the middle name of your oldest child?",
  "What is your oldest sibling's middle name?",
  "What school did you attend for sixth grade?",
];

router.post("/setup-security-questions", authenticateUser, async (req, res) => {
  const { questions } = req.body; // Array of { questionId, answer }
  const uid = req.user.uid;

  // Require at least 3 security questions
  if (!questions || questions.length < 3) {
    return res.status(400).json({
      message: "Please provide at least 3 security questions",
      state: "error",
    });
  }

  // Hash answers
  const hashedQuestions = await Promise.all(
    questions.map(async (q) => ({
      questionId: q.questionId,
      answer: await PasswordManager.hashPassword(q.answer.toLowerCase().trim()),
    }))
  );

  await db.collection("users").doc(uid).update({
    securityQuestions: hashedQuestions,
  });

  res.status(200).json({
    message: "Security questions set successfully",
    state: "success",
  });
});
