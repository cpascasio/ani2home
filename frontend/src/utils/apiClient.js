import axios from "axios";
import { auth } from "../config/firebase-config";

// Create axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

// 🆕 ADD TOKEN EXPIRATION CHECK FUNCTION
const isTokenExpired = (token) => {
  try {
    if (!token) return true;

    // Decode JWT payload
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Check if expired (with 1 minute buffer)
    const buffer = 60 * 1000; // 1 minute
    const isExpired = currentTime >= expirationTime - buffer;

    if (isExpired) {
      console.log("⏰ Token is expired or expiring soon");
      console.log("Current time:", new Date(currentTime).toISOString());
      console.log("Token expires:", new Date(expirationTime).toISOString());
    }

    return isExpired;
  } catch (error) {
    console.error("Failed to parse token:", error);
    return true; // Assume expired if can't parse
  }
};

// 🔧 FIXED: Simple token getter - NO localStorage management
const getValidToken = async (forceRefresh = false) => {
  try {
    const user = auth.currentUser;

    if (user) {
      // Get fresh token from Firebase directly
      const token = await user.getIdToken(forceRefresh);
      console.log(
        `🔄 Token ${forceRefresh ? "force refreshed" : "retrieved"} in apiClient`
      );
      return token;
    } else {
      // 🔍 READ-ONLY: Check localStorage as fallback but don't modify it
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.token && !isTokenExpired(userData.token)) {
          console.log(
            "📱 Using valid stored token from localStorage (read-only)"
          );
          return userData.token;
        } else {
          console.log("❌ Stored token is expired and no Firebase user");
          throw new Error("Token expired and no authenticated user");
        }
      }
    }

    throw new Error("No valid token available");
  } catch (error) {
    console.error("Failed to get valid token:", error);
    throw error;
  }
};

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // 🆕 ALWAYS CHECK TOKEN EXPIRATION BEFORE REQUEST
      const token = await getValidToken(false);
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to request:", config.url);
    } catch (error) {
      console.error("❌ Error adding auth token:", error);
      // Continue with request anyway - might be a public endpoint
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - NO RETRY LOGIC, NO localStorage MANAGEMENT
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 🚫 NO RETRY - SIMPLE ERROR HANDLING
    console.error(
      "❌ API Request failed:",
      error.response?.status || error.message
    );

    // 🚨 HANDLE AUTH FAILURES (only cleanup, no retry)
    if (error.response?.status === 401) {
      console.log("🚫 Authentication failed, cleaning up...");

      // ❌ REMOVED: Don't manage localStorage here
      // Let UserContext handle this through proper auth state management

      // 🔥 TRIGGER FIREBASE SIGNOUT TO LET UserContext HANDLE CLEANUP
      if (auth.currentUser) {
        try {
          await auth.signOut();
          console.log(
            "🔥 Firebase signout triggered - UserContext will handle cleanup"
          );
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);

          // Only as last resort, manually clean up
          localStorage.removeItem("user");
          localStorage.removeItem("mfaVerified");

          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      } else {
        // No Firebase user, clean up manually
        localStorage.removeItem("user");
        localStorage.removeItem("mfaVerified");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
