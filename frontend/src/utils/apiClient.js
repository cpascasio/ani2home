// src/utils/apiClient.js
import axios from "axios";
import { auth } from "../config/firebase-config";

// Create axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get current user from Firebase
      const user = auth.currentUser;

      if (user) {
        // Get fresh token
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token added to request:", config.url);
      } else {
        // Try to get user data from localStorage as fallback
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
            console.log("Stored token added to request:", config.url);
          }
        }
      }
    } catch (error) {
      console.error("Error adding auth token:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If we get 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

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

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Clear user data and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("mfaVerified");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
