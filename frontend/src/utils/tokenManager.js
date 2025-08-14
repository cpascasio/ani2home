// ================================
// 1. SMALL FIX FOR YOUR EXISTING tokenManager.js
// frontend/src/utils/tokenManager.js (MINOR UPDATES)
// ================================

import { auth } from "../config/firebase-config";

class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.refreshTimer = null;
    this.setupAutoRefresh();
  }

  // Get fresh token with automatic refresh
  async getFreshToken(forceRefresh = false) {
    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("No authenticated user");
      }

      // Get token with force refresh if needed
      const token = await user.getIdToken(forceRefresh);

      // Update localStorage
      await this.updateStoredToken(token);

      console.log(`🔄 Token ${forceRefresh ? "force refreshed" : "retrieved"}`);
      return token;
    } catch (error) {
      console.error("Failed to get fresh token:", error);

      // If token refresh fails, redirect to login
      this.handleTokenFailure();
      throw error;
    }
  }

  // Setup automatic token refresh (before expiration)
  setupAutoRefresh() {
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Refresh token every 50 minutes (before 60-minute expiration)
    this.refreshTimer = setInterval(
      async () => {
        try {
          if (auth.currentUser) {
            console.log("🔄 Auto-refreshing token...");
            await this.getFreshToken(true);
          }
        } catch (error) {
          console.error("Auto-refresh failed:", error);
        }
      },
      50 * 60 * 1000
    ); // 50 minutes

    console.log("🔄 Auto-refresh timer set (50 minutes)");
  }

  // Update token in localStorage
  async updateStoredToken(newToken) {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.token = newToken;
        userData.tokenRefreshed = new Date().toISOString();
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("📱 Token updated in localStorage");
      }
    } catch (error) {
      console.error("Failed to update stored token:", error);
    }
  }

  // Handle token failure (logout and redirect)
  handleTokenFailure() {
    console.log("🚫 Token failure - logging out");

    // Clear all storage
    localStorage.removeItem("user");
    localStorage.removeItem("mfaVerified");

    // Sign out from Firebase
    if (auth.currentUser) {
      auth.signOut().catch(console.error);
    }

    // 🆕 PREVENT REDIRECT LOOP - only redirect if not already on login/register
    if (
      !window.location.pathname.includes("/login") &&
      !window.location.pathname.includes("/register")
    ) {
      window.location.href = "/login";
    }
  }

  // Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon(token) {
    try {
      if (!token) return true;

      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      return expirationTime - currentTime < fiveMinutes;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return true; // Assume expired if we can't parse
    }
  }

  // Get token for API requests
  async getTokenForRequest() {
    try {
      // Get current token from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("No stored user");
      }

      const userData = JSON.parse(storedUser);
      const currentToken = userData.token;

      // Check if token is expiring soon
      if (this.isTokenExpiringSoon(currentToken)) {
        console.log("🔄 Token expiring soon, refreshing...");
        return await this.getFreshToken(true);
      }

      return currentToken;
    } catch (error) {
      console.error("Failed to get token for request:", error);
      // Try to get fresh token as fallback
      return await this.getFreshToken(true);
    }
  }

  // 🆕 ADD MANUAL REFRESH METHOD (for testing/debugging)
  async manualRefresh() {
    try {
      console.log("🔄 Manual token refresh requested...");
      const token = await this.getFreshToken(true);
      console.log("✅ Manual refresh successful");
      return token;
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
      throw error;
    }
  }

  // Cleanup timers
  cleanup() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
