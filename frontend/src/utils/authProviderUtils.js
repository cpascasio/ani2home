// frontend/src/utils/authProviderUtils.js

import { auth } from "../config/firebase-config";

/**
 * Get the authentication provider for the current user
 * @returns {string|null} - Provider ID ('google.com', 'password', etc.) or null
 */
export const getCurrentUserAuthProvider = () => {
  const user = auth.currentUser;
  if (!user) return null;

  // Check provider data to determine sign-in method
  const providerData = user.providerData;
  if (providerData.length > 0) {
    return providerData[0].providerId; // "google.com", "password", etc.
  }

  return null;
};

/**
 * Check if the current user is a Google OAuth user
 * @returns {boolean}
 */
export const isGoogleUser = () => {
  return getCurrentUserAuthProvider() === "google.com";
};

/**
 * Check if the current user is an email/password user
 * @returns {boolean}
 */
export const isPasswordUser = () => {
  return getCurrentUserAuthProvider() === "password";
};

/**
 * Get user-friendly provider name
 * @returns {string}
 */
export const getProviderDisplayName = () => {
  const provider = getCurrentUserAuthProvider();

  switch (provider) {
    case "google.com":
      return "Google";
    case "password":
      return "Email/Password";
    case "facebook.com":
      return "Facebook";
    case "twitter.com":
      return "Twitter";
    case "github.com":
      return "GitHub";
    default:
      return "Unknown Provider";
  }
};

/**
 * Check if re-authentication requires a password
 * @returns {boolean}
 */
export const requiresPasswordForReauth = () => {
  return isPasswordUser();
};

/**
 * Get appropriate re-authentication instructions for the user
 * @returns {string}
 */
export const getReauthInstructions = () => {
  const provider = getCurrentUserAuthProvider();

  switch (provider) {
    case "google.com":
      return "You will be prompted to sign in with Google to verify your identity.";
    case "password":
      return "Please enter your current password to verify your identity.";
    default:
      return "Please verify your identity to continue.";
  }
};
