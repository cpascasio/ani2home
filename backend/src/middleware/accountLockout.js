class AccountLockoutManager {
  static MAX_ATTEMPTS = 5;
  static LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  static async checkAccountLockout(uid) {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return { isLocked: false };

    const userData = userDoc.data();

    // Check if account is currently locked
    if (
      userData.accountLockedUntil &&
      new Date(userData.accountLockedUntil) > new Date()
    ) {
      const remainingTime = new Date(userData.accountLockedUntil) - new Date();
      return {
        isLocked: true,
        remainingTime: Math.ceil(remainingTime / 1000 / 60), // in minutes
        message: `Account is locked. Please try again in ${Math.ceil(remainingTime / 1000 / 60)} minutes.`,
      };
    }

    // Reset failed attempts if lockout period has expired
    if (
      userData.accountLockedUntil &&
      new Date(userData.accountLockedUntil) <= new Date()
    ) {
      await db.collection("users").doc(uid).update({
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      });
    }

    return { isLocked: false };
  }

  static async recordFailedAttempt(uid, ipAddress, userAgent) {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const failedAttempts = (userData.failedLoginAttempts || 0) + 1;

    const updateData = {
      failedLoginAttempts: failedAttempts,
      lastFailedLogin: new Date(),
      lastLoginAttempt: new Date(),
    };

    // Lock account if max attempts reached
    if (failedAttempts >= this.MAX_ATTEMPTS) {
      updateData.accountLockedUntil = new Date(
        Date.now() + this.LOCKOUT_DURATION
      );
    }

    // Add to login history
    const loginHistoryEntry = {
      timestamp: new Date(),
      success: false,
      ipAddress,
      userAgent,
    };

    await db
      .collection("users")
      .doc(uid)
      .update({
        ...updateData,
        loginHistory: admin.firestore.FieldValue.arrayUnion(loginHistoryEntry),
      });

    return {
      attemptsRemaining: Math.max(0, this.MAX_ATTEMPTS - failedAttempts),
      isLocked: failedAttempts >= this.MAX_ATTEMPTS,
    };
  }

  static async recordSuccessfulLogin(uid, ipAddress, userAgent) {
    const loginHistoryEntry = {
      timestamp: new Date(),
      success: true,
      ipAddress,
      userAgent,
    };

    await db
      .collection("users")
      .doc(uid)
      .update({
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastSuccessfulLogin: new Date(),
        lastLoginAttempt: new Date(),
        loginHistory: admin.firestore.FieldValue.arrayUnion(loginHistoryEntry),
      });
  }
}

module.exports = AccountLockoutManager;
