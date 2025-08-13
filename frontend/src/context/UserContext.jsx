// frontend/src/context/UserContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { auth } from "../config/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import tokenManager from "../utils/tokenManager";

export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        const registrationInProgress =
          localStorage.getItem("registrationInProgress") === "true";
        const backendCreationInProgress =
          localStorage.getItem("backendCreationInProgress") === "true";

        if (registrationInProgress || backendCreationInProgress) {
          console.log("Registration in progress - ignoring auth state change");
          return;
        }

        if (firebaseUser) {
          console.log("🔐 Firebase user detected:", firebaseUser.uid);

          // Setup auto-refresh for this user
          tokenManager.setupAutoRefresh();

          // Check localStorage for existing user data
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);

              // 🆕 FIXED: Check if the stored userId matches the Firebase UID
              // Since Firebase UID = Firestore Document ID, we check userData.userId
              if (userData.userId === firebaseUser.uid) {
                console.log(
                  "✅ Stored user matches Firebase user:",
                  userData.userId
                );

                // 🆕 CHECK IF TOKEN IS EXPIRING SOON BEFORE REFRESHING
                const isTokenExpiringSoon = (token) => {
                  try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    const expirationTime = payload.exp * 1000;
                    const currentTime = Date.now();
                    const fiveMinutes = 5 * 60 * 1000;
                    return expirationTime - currentTime < fiveMinutes;
                  } catch (error) {
                    return true; // If can't parse, assume needs refresh
                  }
                };

                // 🆕 ONLY REFRESH IF TOKEN IS ACTUALLY EXPIRING
                if (userData.token && isTokenExpiringSoon(userData.token)) {
                  console.log("🔄 Token expiring soon, refreshing...");
                  try {
                    const freshToken = await tokenManager.getFreshToken(true);
                    userData.token = freshToken;
                    userData.tokenRefreshed = new Date().toISOString();
                    localStorage.setItem("user", JSON.stringify(userData));
                    console.log("✅ Token refreshed on auth state change");
                  } catch (error) {
                    console.error(
                      "Failed to refresh token on auth state change:",
                      error
                    );
                  }
                } else {
                  console.log("⏰ Token still valid, no refresh needed");
                }

                dispatch({ type: "LOGIN", payload: userData });
              } else {
                console.warn(
                  `❌ UID mismatch - Firebase: ${firebaseUser.uid}, Stored: ${userData.userId}`
                );
                console.log("Clearing mismatched user data...");
                localStorage.removeItem("user");
                localStorage.removeItem("mfaVerified");
                dispatch({ type: "LOGOUT_NO_CLEAR" });
              }
            } catch (error) {
              console.error("Error parsing stored user:", error);
              localStorage.removeItem("user");
              dispatch({ type: "LOGOUT_NO_CLEAR" });
            }
          } else {
            // Firebase user exists but no localStorage - reconstruct user data
            console.log(
              "🔧 Firebase user exists but no stored user data - reconstructing..."
            );

            try {
              // Get fresh token
              const token = await firebaseUser.getIdToken(true);

              // 🆕 FETCH USER DATA USING FIREBASE UID AS DOCUMENT ID
              console.log(
                `📡 Fetching user data for document ID: ${firebaseUser.uid}`
              );
              const response = await fetch(
                `http://localhost:3000/api/users/${firebaseUser.uid}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (response.ok) {
                const backendResponse = await response.json();
                const userData = backendResponse.data; // Extract data from response

                console.log("✅ User data fetched from backend:", userData);

                // 🆕 RECONSTRUCT USER OBJECT WITH PROPER STRUCTURE
                const reconstructedUser = {
                  // Essential fields for auth
                  userId: firebaseUser.uid, // Firebase UID = Document ID
                  email: firebaseUser.email,
                  token: token,

                  // User profile data from Firestore
                  username:
                    userData?.userName ||
                    userData?.name ||
                    firebaseUser.email?.split("@")[0],
                  name: userData?.name || "",
                  userName: userData?.userName || "",
                  phoneNumber: userData?.phoneNumber || "",
                  bio: userData?.bio || "",
                  isStore: userData?.isStore || false,
                  isAdmin: userData?.isAdmin || false, // 🆕 ADD THIS LINE
                  isVerified: userData?.isVerified || false,
                  userProfilePic: userData?.userProfilePic || "",
                  address: userData?.address || {
                    fullAddress: "",
                    streetAddress: "",
                    city: "",
                    province: "",
                    barangay: "",
                    region: "",
                    country: "",
                    postalCode: "",
                    lng: 0,
                    lat: 0,
                  },

                  // Metadata
                  tokenRefreshed: new Date().toISOString(),
                  reconstructed: true, // Flag to indicate this was reconstructed
                };

                // Save to localStorage and update context
                localStorage.setItem("user", JSON.stringify(reconstructedUser));
                dispatch({ type: "LOGIN", payload: reconstructedUser });
                console.log(
                  "✅ User data reconstructed and saved successfully"
                );
              } else if (response.status === 404) {
                console.error("❌ User document not found in Firestore");
                console.log(
                  "This might be a new user that needs to complete registration"
                );
                dispatch({ type: "SET_LOADING", payload: false });
              } else {
                console.error(
                  `❌ Failed to fetch user data: ${response.status}`
                );
                dispatch({ type: "SET_LOADING", payload: false });
              }
            } catch (error) {
              console.error("❌ Error reconstructing user data:", error);
              dispatch({ type: "SET_LOADING", payload: false });
            }
          }
        } else {
          console.log("🚫 No Firebase user, cleaning up");

          // Cleanup token manager
          tokenManager.cleanup();

          // Clear everything
          dispatch({ type: "LOGOUT" });
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        dispatch({ type: "LOGOUT" });
      }

      if (mounted) {
        dispatch({ type: "SET_INITIALIZED", payload: true });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      tokenManager.cleanup();
    };
  }, []);

  // 🆕 ADD PERIODIC TOKEN CHECK TO PREVENT EXPIRATION
  useEffect(() => {
    const checkTokenPeriodically = setInterval(async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && auth.currentUser) {
          const userData = JSON.parse(storedUser);
          if (userData.token) {
            try {
              // Decode JWT to check expiration
              const payload = JSON.parse(atob(userData.token.split(".")[1]));
              const expirationTime = payload.exp * 1000; // Convert to milliseconds
              const currentTime = Date.now();
              const fiveMinutes = 5 * 60 * 1000; // 5 minutes buffer

              // Refresh if expiring in 5 minutes
              if (currentTime >= expirationTime - fiveMinutes) {
                console.log("🔄 Token expiring soon, auto-refreshing...");

                const newToken = await auth.currentUser.getIdToken(true);
                userData.token = newToken;
                userData.tokenRefreshed = new Date().toISOString();
                localStorage.setItem("user", JSON.stringify(userData));

                // Update context user data
                dispatch({ type: "UPDATE_USER", payload: { token: newToken } });

                console.log("✅ Token auto-refreshed successfully");
              }
            } catch (parseError) {
              console.error(
                "Failed to parse token for expiration check:",
                parseError
              );

              // If we can't parse the token, try to refresh it
              if (auth.currentUser) {
                console.log("🔄 Token parsing failed, attempting refresh...");
                try {
                  const newToken = await auth.currentUser.getIdToken(true);
                  userData.token = newToken;
                  userData.tokenRefreshed = new Date().toISOString();
                  localStorage.setItem("user", JSON.stringify(userData));

                  dispatch({
                    type: "UPDATE_USER",
                    payload: { token: newToken },
                  });
                  console.log("✅ Token refreshed after parse failure");
                } catch (refreshError) {
                  console.error(
                    "Failed to refresh token after parse failure:",
                    refreshError
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Periodic token check failed:", error);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(checkTokenPeriodically);
      console.log("🧹 Periodic token check cleanup");
    };
  }, []);

  // 🆕 ADD TOKEN REFRESH METHOD TO CONTEXT
  const refreshUserToken = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("No authenticated user");
      }

      console.log("🔄 Manual token refresh requested...");
      const newToken = await auth.currentUser.getIdToken(true);

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.token = newToken;
        userData.tokenRefreshed = new Date().toISOString();
        localStorage.setItem("user", JSON.stringify(userData));

        // Update context
        dispatch({ type: "UPDATE_USER", payload: { token: newToken } });
      }

      console.log("✅ Manual token refresh successful");
      return newToken;
    } catch (error) {
      console.error("❌ Manual token refresh failed:", error);

      // If refresh fails, user needs to login again
      localStorage.removeItem("user");
      localStorage.removeItem("mfaVerified");
      dispatch({ type: "LOGOUT" });

      throw error;
    }
  };

  // 🆕 ADD TOKEN STATUS CHECK METHOD
  const getTokenStatus = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        return { valid: false, reason: "No stored user" };
      }

      const userData = JSON.parse(storedUser);
      if (!userData.token) {
        return { valid: false, reason: "No token" };
      }

      // Decode JWT to check expiration
      const payload = JSON.parse(atob(userData.token.split(".")[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      return {
        valid: timeUntilExpiry > 0,
        expiresAt: new Date(expirationTime),
        timeUntilExpiry: Math.max(0, timeUntilExpiry),
        isExpiringSoon: timeUntilExpiry < 5 * 60 * 1000, // Less than 5 minutes
        lastRefreshed: userData.tokenRefreshed || "Never",
      };
    } catch (error) {
      console.error("Failed to get token status:", error);
      return { valid: false, reason: "Invalid token format" };
    }
  };

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      refreshUserToken, // 🆕 Add refresh method
      getTokenStatus, // 🆕 Add status check method
    }),
    [state]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      // Don't store to localStorage here since Register component handles it
      console.log("User logged in:", action.payload);

      return {
        ...state,
        user: action.payload,
        loading: false,
      };

    case "LOGOUT":
      // Sign out from Firebase if not already signed out
      if (auth.currentUser) {
        auth.signOut().catch(console.error);
      }

      // 🆕 CLEANUP TOKEN MANAGER ON LOGOUT
      if (tokenManager && tokenManager.cleanup) {
        tokenManager.cleanup();
      }

      // Clear all localStorage
      localStorage.clear();
      console.log("User logged out");

      return {
        ...state,
        user: null,
        loading: false,
      };

    case "LOGOUT_NO_CLEAR":
      // Logout without clearing localStorage (for registration flow)
      console.log("User logged out (no localStorage clear)");

      return {
        ...state,
        user: null,
        loading: false,
      };

    case "UPDATE_USER":
      const updatedUser = {
        ...state.user,
        ...action.payload,
      };

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("User updated:", updatedUser);

      return {
        ...state,
        user: updatedUser,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_INITIALIZED":
      return {
        ...state,
        initialized: action.payload,
        loading: action.payload ? false : state.loading,
      };

    default:
      return state;
  }
};

// 🆕 ENHANCED PERMISSIONS HOOK WITH TOKEN STATUS
export const usePermissions = () => {
  const { user, loading, getTokenStatus } = useUser();

  return {
    loading,
    isAuthenticated: !!user,
    isStore: user?.isStore || false,
    isAdmin: user?.isAdmin || false,
    canAccessStore: user?.isStore || false,
    user,
    getTokenStatus, // 🆕 Add token status method
  };
};

// 🆕 NEW HOOK FOR TOKEN MANAGEMENT
export const useTokenManager = () => {
  const { refreshUserToken, getTokenStatus } = useUser();

  return {
    refreshToken: refreshUserToken,
    getTokenStatus,
    // Utility method to ensure valid token before API calls
    ensureValidToken: async () => {
      const status = getTokenStatus();
      if (!status.valid || status.isExpiringSoon) {
        console.log("🔄 Token invalid or expiring, refreshing...");
        return await refreshUserToken();
      }
      return JSON.parse(localStorage.getItem("user"))?.token;
    },
  };
};

// 🆕 TOKEN DEBUG COMPONENT (for development)
export const TokenDebugInfo = () => {
  const { getTokenStatus } = usePermissions();
  const [status, setStatus] = React.useState(null);

  const updateStatus = () => {
    const tokenStatus = getTokenStatus();
    setStatus(tokenStatus);
  };

  React.useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <div>🔐 Token Status</div>
      {status && (
        <div>
          <div>Status: {status.valid ? "✅ Valid" : "❌ Invalid"}</div>
          {status.valid && (
            <>
              <div>Expires: {status.expiresAt.toLocaleTimeString()}</div>
              <div>
                Time left: {Math.floor(status.timeUntilExpiry / 1000 / 60)}min
              </div>
              <div
                style={{
                  color: status.isExpiringSoon ? "orange" : "lightgreen",
                }}
              >
                {status.isExpiringSoon ? "⚠️ Expiring soon" : "🟢 Good"}
              </div>
            </>
          )}
          {!status.valid && (
            <div style={{ color: "red" }}>Reason: {status.reason}</div>
          )}
        </div>
      )}
    </div>
  );
};
