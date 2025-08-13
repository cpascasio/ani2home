import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth, provider, db } from "../../config/firebase-config";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useUser } from "../../../src/context/UserContext.jsx";
import GoogleIcon from "../../assets/google-icon.png";
import { useNavigate } from "react-router-dom";

// 🆕 HELPER FUNCTIONS FOR COMPREHENSIVE LOGGING
// Helper function to log authentication attempts
const logAuthAttempt = async (
  success,
  email,
  userId = null,
  loginMethod = "email_password",
  errorMessage = null,
  errorCode = null
) => {
  try {
    await axios.post("http://localhost:3000/api/auth/log-firebase-login", {
      success,
      email,
      userId,
      loginMethod,
      errorMessage,
      errorCode,
    });
  } catch (logError) {
    console.error("Failed to log authentication attempt:", logError);
    // Don't block login flow if logging fails
  }
};

// Helper function to log MFA attempts
const logMfaAttempt = async (success, userId, errorMessage = null) => {
  try {
    await axios.post("http://localhost:3000/api/auth/log-mfa-attempt", {
      success,
      userId,
      errorMessage,
    });
  } catch (logError) {
    console.error("Failed to log MFA attempt:", logError);
  }
};

const Login = () => {
  const { user, dispatch } = useUser();
  const [authenticated, setAuthenticated] = useState(false || user === "true");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [showMfaModal, setShowMfaModal] = useState(false);
  const navigate = useNavigate();

  // Security feature states
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [lastLoginInfo, setLastLoginInfo] = useState(null);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/myProfile");
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists()) {
            // For Google users, create the user document if it doesn't exist
            if (user.providerData[0]?.providerId === "google.com") {
              await createUserDocumentForGoogleUser(user);
            } else {
              throw new Error("User document not found");
            }
          }

          const userData = userDoc.exists() ? userDoc.data() : null;
          const mfaEnabled = userData?.mfaEnabled || false;

          // Display last login info
          if (userData?.lastSuccessfulLogin) {
            const lastLogin = new Date(
              userData.lastSuccessfulLogin
            ).toLocaleString();
            const failedAttempts =
              userData.failedLoginAttemptsSinceLastSuccess || 0;
            setLastLoginInfo({ lastLogin, failedAttempts });
          }

          if (mfaEnabled && localStorage.getItem("mfaVerified") !== "true") {
            setShowMfaModal(true);
            return;
          }

          await completeLogin(user);
        } catch (error) {
          console.error("Authentication error:", error);
          setLoginError("Invalid username and/or password");
        }
      } else {
        setAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("mfaVerified");
        dispatch({ type: "LOGOUT" });
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  // Helper function to create user document for Google users
  const createUserDocumentForGoogleUser = async (user) => {
    try {
      const token = await user.getIdToken();
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        userName:
          user.displayName?.replace(/\s+/g, "") || user.email.split("@")[0],
        userProfilePic: user.photoURL || "",
        phoneNumber: user.phoneNumber || "",
        // Security fields
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastPasswordChange: new Date().toISOString(),
        mfaEnabled: false,
        passwordHistory: [],
        loginHistory: [],
        isVerified: true, // Google accounts are pre-verified
        bio: "",
        isStore: false,
        followers: [],
      };

      const response = await axios.post(
        "http://localhost:3000/api/users/create-user",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Google user document created:", response.data);
    } catch (error) {
      console.error("Error creating Google user document:", error);
      throw error;
    }
  };

  // 🆕 UPDATED completeLogin WITH ENHANCED LOGGING
  const completeLogin = async (user) => {
    try {
      const tokenResult = await user.getIdTokenResult();
      const userId = user.uid;

      // 🆕 LOG SUCCESSFUL LOGIN COMPLETION (for existing users)
      try {
        await axios.post(
          `http://localhost:3000/api/auth/log-successful-login`,
          {
            userId,
            ipAddress: window.location.hostname,
            userAgent: navigator.userAgent,
          },
          {
            headers: {
              Authorization: `Bearer ${tokenResult.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ Login completion logged successfully");
      } catch (logError) {
        console.error("Failed to log successful login completion:", logError);
        // Don't block login flow if logging fails
      }

      // Show last login notification if available
      if (lastLoginInfo) {
        console.log(`Last login: ${lastLoginInfo.lastLogin}`);
        if (lastLoginInfo.failedAttempts > 0) {
          console.log(
            `Warning: ${lastLoginInfo.failedAttempts} failed login attempt(s) since your last successful login`
          );
        }
      }

      // 🔥 ONLY NAVIGATION - UserContext handles all localStorage management
      navigate("/myProfile");
    } catch (error) {
      console.error("Login continuation error:", error);
      setLoginError("An error occurred during login. Please try again.");
    }
  };

  // 🆕 UPDATED handleLogin WITH COMPREHENSIVE LOGGING
  const handleLogin = async () => {
    try {
      setLoginError("");
      setAccountLocked(false);

      // Check for account lockout (keep existing)
      try {
        const lockoutCheck = await axios.post(
          "http://localhost:3000/api/auth/check-lockout",
          { email }
        );

        if (lockoutCheck.data.isLocked) {
          setAccountLocked(true);
          setLockoutMessage(lockoutCheck.data.message);
          return;
        }
      } catch (lockoutError) {
        console.error("Lockout check failed:", lockoutError);
      }

      // 🆕 ATTEMPT FIREBASE LOGIN
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 🆕 LOG SUCCESSFUL LOGIN
      await logAuthAttempt(
        true, // success
        email, // email
        user.uid, // userId
        "email_password", // loginMethod
        null, // errorMessage
        null // errorCode
      );

      // The rest of your login flow continues as normal...
      // onAuthStateChanged will handle the completion
    } catch (error) {
      console.error("Login failed:", error.message);

      // 🆕 LOG FAILED LOGIN WITH DETAILED ERROR INFO
      await logAuthAttempt(
        false, // success
        email, // email
        null, // userId
        "email_password", // loginMethod
        error.message, // errorMessage
        error.code // errorCode
      );

      // 🆕 CHECK IF ACCOUNT WAS LOCKED DUE TO THIS FAILURE
      try {
        const lockoutCheck = await axios.post(
          "http://localhost:3000/api/auth/check-lockout",
          { email }
        );

        if (lockoutCheck.data.isLocked) {
          setAccountLocked(true);
          setLockoutMessage(lockoutCheck.data.message);
          return;
        }
      } catch (lockoutError) {
        console.error("Post-failure lockout check failed:", lockoutError);
      }

      setLoginError("Invalid username and/or password");
    }
  };

  // 🆕 UPDATED handleMfaSubmit WITH LOGGING
  const handleMfaSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not signed in");

      const verifyResponse = await axios.post(
        `http://localhost:3000/api/users/verify-mfa-login/${user.uid}`,
        { token: mfaToken },
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (verifyResponse.data.state !== "success") {
        throw new Error("Invalid MFA token");
      }

      // 🆕 LOG SUCCESSFUL MFA VERIFICATION
      await logMfaAttempt(true, user.uid);

      localStorage.setItem("mfaVerified", "true");
      setShowMfaModal(false);
      await completeLogin(auth.currentUser);
    } catch (error) {
      console.error("MFA verification failed:", error.message);

      // 🆕 LOG FAILED MFA VERIFICATION
      const user = auth.currentUser;
      if (user) {
        await logMfaAttempt(false, user.uid, error.message);
      }

      setLoginError("Invalid MFA token. Please try again.");
    }
  };

  // 🆕 UPDATED handleGoogleLogin WITH COMPREHENSIVE LOGGING
  const handleGoogleLogin = async () => {
    try {
      setLoginError("");
      console.log("Starting Google login...");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google login successful, user:", user.uid);

      // 🆕 LOG SUCCESSFUL GOOGLE LOGIN
      await logAuthAttempt(
        true, // success
        user.email, // email
        user.uid, // userId
        "google", // loginMethod
        null, // errorMessage
        null // errorCode
      );

      // The onAuthStateChanged listener will handle the rest
    } catch (error) {
      console.error("Google login failed:", error);

      // 🆕 LOG FAILED GOOGLE LOGIN (unless user cancelled)
      if (error.code !== "auth/popup-cancelled-by-user") {
        await logAuthAttempt(
          false, // success
          error.email || "unknown", // email
          null, // userId
          "google", // loginMethod
          error.message, // errorMessage
          error.code // errorCode
        );
      }

      setLoginError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-[#209D48] mb-6">
          Login to Your Account
        </h2>

        {/* Display errors */}
        {(loginError || accountLocked) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {accountLocked ? lockoutMessage : loginError}
          </div>
        )}

        {/* Display last login info */}
        {lastLoginInfo && !showMfaModal && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm">
            <p>Last login: {lastLoginInfo.lastLogin}</p>
            {lastLoginInfo.failedAttempts > 0 && (
              <p className="text-orange-600 mt-1">
                ⚠️ {lastLoginInfo.failedAttempts} failed attempt(s) since last
                login
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button
          onClick={handleLogin}
          className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045]"
          disabled={accountLocked}
        >
          {accountLocked ? "Account Locked" : "Login"}
        </button>
        <div className="my-4 text-center">
          <p className="text-sm text-gray-600">Or</p>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] flex items-center justify-center"
          disabled={accountLocked}
        >
          <img src={GoogleIcon} alt="Google" className="w-5 h-5 mr-2" />
          Log in with Google
        </button>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-[#209D48] hover:underline">
              Register Here
            </a>
          </p>
        </div>

        {/* MFA Modal */}
        {showMfaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Enter MFA Token</h3>
              <input
                type="text"
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value)}
                placeholder="Enter MFA token"
                maxLength="6"
                pattern="[0-9]{6}"
                className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent mb-4"
                autoComplete="one-time-code"
              />
              <button
                onClick={handleMfaSubmit}
                className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045]"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
