// frontend/src/hooks/useReauth.jsx - Enhanced version for multiple auth providers

import { useState } from "react";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../config/firebase-config";

export const useReauth = () => {
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [reauthError, setReauthError] = useState("");
  const [showReauthModal, setShowReauthModal] = useState(false);

  // Get user's authentication provider
  const getUserAuthProvider = () => {
    const user = auth.currentUser;
    if (!user) return null;

    // Check provider data to determine sign-in method
    const providerData = user.providerData;
    if (providerData.length > 0) {
      const providerId = providerData[0].providerId;
      return providerId; // "google.com", "password", etc.
    }

    return null;
  };

  const reauthenticate = async (credentials = {}) => {
    setIsReauthenticating(true);
    setReauthError("");

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("No authenticated user found");
      }

      const provider = getUserAuthProvider();
      console.log("🔍 User authentication provider:", provider);

      let credential;

      switch (provider) {
        case "google.com":
          // Re-authenticate with Google
          console.log("🔄 Re-authenticating with Google...");
          const googleProvider = new GoogleAuthProvider();

          // Force account selection to ensure fresh authentication
          googleProvider.setCustomParameters({
            prompt: "select_account",
          });

          // Use popup for re-authentication
          const result = await signInWithPopup(auth, googleProvider);
          console.log("✅ Google re-authentication successful");

          // For Google OAuth, the popup itself serves as re-authentication
          return { success: true };

        case "password":
          // Traditional email/password re-authentication
          console.log("🔄 Re-authenticating with email/password...");

          if (!credentials.password) {
            throw new Error("Password is required for email/password accounts");
          }

          credential = EmailAuthProvider.credential(
            user.email,
            credentials.password
          );
          await reauthenticateWithCredential(user, credential);
          console.log("✅ Email/password re-authentication successful");
          return { success: true };

        default:
          throw new Error(`Unsupported authentication provider: ${provider}`);
      }
    } catch (error) {
      console.error("❌ Re-authentication failed:", error);

      let errorMessage = "Re-authentication failed";

      // Handle specific error codes
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later";
      } else if (error.code === "auth/user-mismatch") {
        errorMessage = "User credentials do not match";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Authentication was cancelled";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setReauthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsReauthenticating(false);
    }
  };

  const ReauthModal = ({
    isOpen,
    onClose,
    onSuccess,
    title = "Confirm Your Identity",
  }) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const provider = getUserAuthProvider();
    const isGoogleUser = provider === "google.com";
    const isPasswordUser = provider === "password";

    const handleSubmit = async (e) => {
      e.preventDefault();

      let credentials = {};
      if (isPasswordUser) {
        credentials.password = password;
      }

      const result = await reauthenticate(credentials);
      if (result.success) {
        setPassword("");
        onSuccess?.(password); // For password users, pass password for backend verification
        onClose?.();
      }
    };

    const handleGoogleReauth = async () => {
      const result = await reauthenticate();
      if (result.success) {
        onSuccess?.(); // No password to pass for Google users
        onClose?.();
      }
    };

    const handleClose = () => {
      setPassword("");
      setReauthError("");
      onClose?.();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>

          <p className="text-gray-600 mb-4">
            For security purposes, please confirm your identity to continue with
            this action.
          </p>

          {reauthError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {reauthError}
            </div>
          )}

          {isGoogleUser && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  You signed in with Google. Click below to verify your
                  identity.
                </p>
                <button
                  onClick={handleGoogleReauth}
                  disabled={isReauthenticating}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReauthenticating ? (
                    <span className="text-gray-600">Verifying...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {isPasswordUser && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                    required
                    disabled={isReauthenticating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                    disabled={isReauthenticating}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={isReauthenticating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReauthenticating || !password}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReauthenticating ? "Verifying..." : "Confirm"}
                </button>
              </div>
            </form>
          )}

          {!isGoogleUser && !isPasswordUser && (
            <div className="text-center">
              <p className="text-red-600">
                Unsupported authentication method. Please contact support.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return {
    reauthenticate,
    isReauthenticating,
    reauthError,
    showReauthModal,
    setShowReauthModal,
    ReauthModal,
    getUserAuthProvider, // Export this for components to check auth method
  };
};
