import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  deleteUser,
} from "firebase/auth";
import { auth } from "../../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../src/context/UserContext.jsx";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const { dispatch } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Security feature states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  useEffect(() => {
    // If user is already logged in, redirect to profile
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/myProfile");
    }
  }, [navigate]);

  // Toast helper functions
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Password strength checker (Requirements 2.1.5, 2.1.6)
  const checkPasswordStrength = (pwd) => {
    const feedback = [];
    let score = 0;

    // Length check (Requirement 2.1.6) - minimum 12 characters
    if (pwd.length >= 12) {
      score += 20;
    } else {
      feedback.push("At least 12 characters");
    }

    // Complexity checks (Requirement 2.1.5)
    if (/[A-Z]/.test(pwd)) {
      score += 20;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(pwd)) {
      score += 20;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/\d/.test(pwd)) {
      score += 20;
    } else {
      feedback.push("One number");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      score += 20;
    } else {
      feedback.push("One special character");
    }

    setPasswordStrength({ score, feedback });
    return score === 100;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (pwd) {
      checkPasswordStrength(pwd);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  };

  const handleEmailSignUp = async (email, password) => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check password strength (Requirements 2.1.5, 2.1.6)
    if (passwordStrength.score < 100) {
      setError("Password does not meet all security requirements");
      return;
    }

    setIsLoading(true);
    setError("");

    // Set flag to prevent auth listener from interfering
    localStorage.setItem("registrationInProgress", "true");

    let userCredential = null;

    try {
      // Step 1: Create user in Firebase Auth
      showToast("Creating Firebase account...", "info");
      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created in Firebase Auth:", userCredential.user);

      // Step 2: Update Firebase Auth profile
      showToast("Updating profile...", "info");
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      // Step 3: Prepare user data for backend
      showToast("Creating user profile...", "info");
      const userId = userCredential.user.uid;
      const userData = {
        userId,
        email: email,
        name: username,
        userName: username,
        userProfilePic: "",
        phoneNumber: "",
        bio: "",
        isStore: false,
        isVerified: false,
        followers: [],
        // Security fields with defaults (Requirements 2.1.8, 2.1.10, 2.1.11)
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastPasswordChange: new Date().toISOString(),
        mfaEnabled: false,
        passwordHistory: [], // Will store hashed passwords
        loginHistory: [],
        address: {
          streetAddress: "",
          barangay: "",
          city: "",
          province: "",
          region: "",
          country: "",
          postalCode: "",
          fullAddress: "",
          lat: 0,
          lng: 0,
        },
      };

      // Step 4: Get Firebase ID token for authenticated API call
      const tokenResult = await userCredential.user.getIdTokenResult();

      // Step 5: Create user document in backend
      showToast("Finalizing account setup...", "info");

      // Set a flag to prevent UserContext from interfering
      localStorage.setItem("backendCreationInProgress", "true");

      const response = await fetch(
        "http://localhost:3000/api/users/create-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenResult.token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create user in backend"
        );
      }

      console.log("User document created successfully in backend");
      showToast("✅ User account created successfully!", "success");

      // Clear the backend creation flag
      localStorage.removeItem("backendCreationInProgress");

      // Step 6: Auto-login the user (same logic as Login.jsx)
      showToast("Logging you in...", "info");

      // Log successful registration as a login event
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
      } catch (logError) {
        console.error("Failed to log successful registration:", logError);
      }

      // Get store status
      const storeResponse = await axios.get(
        `http://localhost:3000/api/users/${userId}/isStore`,
        { headers: { Authorization: `Bearer ${tokenResult.token}` } }
      );

      // Create user object for localStorage and context
      const enrichedUser = {
        username: username,
        userId,
        email: userCredential.user.email,
        token: tokenResult.token,
        isStore: storeResponse.data.data,
      };

      // Step 7: Save user to localStorage and context (complete login)
      localStorage.setItem("user", JSON.stringify(enrichedUser));
      dispatch({ type: "LOGIN", payload: enrichedUser });

      // Step 8: Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUsername("");
      setError("");

      // Clear the registration flag and backend creation flag
      localStorage.removeItem("registrationInProgress");
      localStorage.removeItem("backendCreationInProgress");

      // Step 9: Show success message and redirect to profile
      showToast("Welcome! Redirecting to your profile...", "success");
      setTimeout(() => {
        console.log("Registration and auto-login successful!");
        navigate("/myProfile");
      }, 2000);
    } catch (error) {
      console.error("Error during sign-up:", error.message);

      // Clear the registration flags
      localStorage.removeItem("registrationInProgress");
      localStorage.removeItem("backendCreationInProgress");

      // CLEANUP: If backend creation failed but Firebase user was created, delete Firebase user
      if (userCredential && userCredential.user) {
        try {
          showToast("Cleaning up failed registration...", "error");
          console.log("Backend creation failed, deleting Firebase user...");

          // Delete the Firebase user
          await deleteUser(userCredential.user);
          console.log("Firebase user deleted successfully");

          // Also sign out to clear any auth state
          await signOut(auth);
          console.log("User signed out after cleanup");

          showToast(
            "❌ Registration failed. Account cleaned up. Please try again.",
            "error"
          );
          setError(
            "Registration failed. Firebase account has been cleaned up. Please try again."
          );
        } catch (deleteError) {
          console.error("Failed to delete Firebase user:", deleteError);

          // If we can't delete the user, at least sign them out
          try {
            await signOut(auth);
            console.log("User signed out after failed cleanup");
          } catch (signOutError) {
            console.error("Failed to sign out user:", signOutError);
          }

          if (deleteError.code === "auth/requires-recent-login") {
            showToast(
              "❌ Registration failed. Please try logging in and delete account manually.",
              "error"
            );
            setError(
              "Registration failed. Please try logging in and then delete your account manually, or contact support."
            );
          } else {
            showToast(
              "❌ Registration failed. Account may still exist in Firebase.",
              "error"
            );
            setError(
              "Registration failed. Account may still exist in Firebase. Please try logging in or contact support."
            );
          }
        }
      } else {
        // Firebase user creation failed
        showToast("❌ Failed to create Firebase account.", "error");
        setError("Failed to create Firebase account. Please try again.");
      }

      // Generic error message for security (Requirement 2.1.4)
      if (error.code === "auth/email-already-in-use") {
        showToast("❌ Email already in use", "error");
        setError("An account with this email already exists");
      } else if (error.code === "auth/weak-password") {
        showToast("❌ Password too weak", "error");
        setError("Password does not meet security requirements");
      } else if (error.code === "auth/invalid-email") {
        showToast("❌ Invalid email address", "error");
        setError("Please enter a valid email address");
      } else if (error.message.includes("User already exists")) {
        showToast("❌ User already exists", "error");
        setError("An account with this email already exists");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      handleEmailSignUp(email, password);
    }
  };

  // Get color for password strength indicator
  const getStrengthColor = () => {
    const score = passwordStrength.score;
    if (score < 40) return "#ef4444"; // red
    if (score < 60) return "#f97316"; // orange
    if (score < 80) return "#eab308"; // yellow
    return "#209D48"; // green (your brand color)
  };

  const getStrengthText = () => {
    const score = passwordStrength.score;
    if (score < 40) return "Weak";
    if (score < 60) return "Fair";
    if (score < 80) return "Good";
    return "Strong";
  };

  const getToastColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-100 border-green-400 text-green-700";
      case "error":
        return "bg-red-100 border-red-400 text-red-700";
      case "info":
        return "bg-blue-100 border-blue-400 text-blue-700";
      default:
        return "bg-gray-100 border-gray-400 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg border shadow-lg ${getToastColor()}`}>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast({ show: false, message: "", type: "" })}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-[#209D48] mb-6">
          Create a New Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
              required
              autoComplete="username"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-3 pr-12 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                disabled={isLoading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && !isLoading && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">
                    Password strength:
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: getStrengthColor() }}
                  >
                    {getStrengthText()}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${passwordStrength.score}%`,
                      backgroundColor: getStrengthColor(),
                    }}
                  />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-medium mb-1">Requirements:</p>
                    <ul className="space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-red-500 mr-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 pr-12 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                disabled={isLoading}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* Password match indicator */}
            {confirmPassword && !isLoading && (
              <div className="mt-1">
                {password === confirmPassword ? (
                  <p className="text-xs text-green-600">✓ Passwords match</p>
                ) : (
                  <p className="text-xs text-red-600">
                    ✗ Passwords do not match
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045] disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={
              isLoading ||
              passwordStrength.score < 100 ||
              password !== confirmPassword
            }
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#209D48] hover:underline"
              onClick={(e) => {
                if (!isLoading) {
                  e.preventDefault();
                  navigate("/login");
                }
              }}
            >
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
