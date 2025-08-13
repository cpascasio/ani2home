import { useState, useEffect, useCallback, useRef } from "react";
import { auth } from "../src/config/firebase-config";

// 🔍 TOKEN EXPIRATION CHECK FUNCTION (matching apiClient.js)
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
        `🔄 Token ${forceRefresh ? "force refreshed" : "retrieved"} in useFetch`
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

// 🛡️ ENHANCED USEFETCH HOOK
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔧 USE REF TO STORE STABLE REFERENCES
  const optionsRef = useRef(options);
  const urlRef = useRef(url);

  // Update refs when props change
  useEffect(() => {
    optionsRef.current = options;
    urlRef.current = url;
  }, [options, url]);

  // 🚀 SIMPLE FETCH FUNCTION (Stable dependencies)
  const fetchData = useCallback(
    async (customUrl, customOptions) => {
      const targetUrl = customUrl || urlRef.current;
      if (!targetUrl) return;

      setLoading(true);
      setError(null);

      try {
        // 🆕 ALWAYS CHECK TOKEN EXPIRATION BEFORE REQUEST
        const token = await getValidToken(false);

        const fetchOptions = {
          method: "GET",
          ...optionsRef.current,
          ...customOptions,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...optionsRef.current?.headers,
            ...customOptions?.headers,
          },
        };

        console.log(`🚀 Fetching: ${targetUrl}`);

        const response = await fetch(
          `http://localhost:3000${targetUrl}`,
          fetchOptions
        );

        // 🚫 NO RETRY - SIMPLE ERROR HANDLING
        if (!response.ok) {
          // 🛡️ SECURITY: Generic error messages in production
          const errorMessage =
            process.env.NODE_ENV === "production"
              ? "Request failed"
              : `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const result = await response.json();
        setData(result);
        console.log("✅ Request succeeded");
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);

        // 🚨 HANDLE AUTH FAILURES - Let UserContext handle cleanup
        if (
          err.message.includes("401") ||
          err.message.includes("auth") ||
          err.message.includes("Token expired")
        ) {
          console.log(
            "🚫 Authentication failed, triggering Firebase signout..."
          );

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
      } finally {
        setLoading(false);
      }
    },
    [] // 🔧 EMPTY DEPENDENCIES - prevents infinite loops
  );

  // 🔄 AUTO-FETCH ON URL CHANGE ONLY
  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url, fetchData]); // Only depend on URL changes

  // 🧹 CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      setData(null);
      setLoading(false);
      setError(null);
    };
  }, []);

  // 📤 RETURN API MATCHING APICLIENT PATTERN
  return {
    data,
    loading,
    error,
    refetch: fetchData,
    // 🆕 Additional utility methods
    isLoading: loading,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
  };
};

export default useFetch;
