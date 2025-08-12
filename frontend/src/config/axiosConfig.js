// Create this file: src/utils/axiosConfig.js

import axios from "axios";

// Create an axios interceptor that automatically adds the auth token
axios.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const token = userData?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("user");
      localStorage.removeItem("mfaVerified");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axios;
