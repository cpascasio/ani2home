import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../config/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";

const Register = () => {
  const [authenticated, setAuthenticated] = useState(
    false || window.localStorage.getItem("authenticated") === "true"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // Security feature states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  useEffect(() => {
    console.log(
      "AUTHENTICATED? " + window.localStorage.getItem("authenticated")
    );
  }, []);

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

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created in Firebase Auth:", userCredential.user);

      await updateProfile(userCredential.user, {
        displayName: username,
      });

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

      // Get Firebase ID token for authenticated API call
      const tokenResult = await userCredential.user.getIdTokenResult();

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

      setAuthenticated(true);
      window.localStorage.setItem("authenticated", "true");
      console.log("Firebase ID token:", tokenResult.token);

      // Clear input fields after successful registration
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUsername("");
      setError("");

      // Success message or redirect
      alert("Registration successful! Please login to continue.");
    } catch (error) {
      console.error("Error during sign-up:", error.message);

      // Generic error message for security (Requirement 2.1.4)
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (error.code === "auth/weak-password") {
        setError("Password does not meet security requirements");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEmailSignUp(email, password);
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

  return (
    <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-[#209D48] mb-6">
          Create a New Account
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
                onChange={handlePasswordChange}
                className="w-full p-3 pr-12 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && (
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
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* Password match indicator */}
            {confirmPassword && (
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
            className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045]"
            disabled={
              passwordStrength.score < 100 || password !== confirmPassword
            }
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-[#209D48] hover:underline">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
