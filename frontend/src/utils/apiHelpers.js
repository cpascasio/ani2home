import { auth } from "../config/firebase-config";
import tokenManager from "./tokenManager";

// Token refresh function (quick fix)
export const refreshUserToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Force refresh the token
      const newToken = await user.getIdToken(true);

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.token = newToken;
        localStorage.setItem("user", JSON.stringify(userData));
      }

      console.log("✅ Token refreshed successfully");
      return newToken;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Redirect to login if refresh fails
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

// Enhanced API call handler
export const handleApiCall = async (apiFunction) => {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.response?.data?.code === "TOKEN_EXPIRED") {
      console.log("🔄 Token expired, refreshing and retrying...");

      // Refresh token
      await tokenManager.getFreshToken(true);

      // Retry the API call
      return await apiFunction();
    }

    throw error; // Re-throw if not a token error
  }
};
