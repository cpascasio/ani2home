// frontend/src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../config/firebase-config";
import apiClient from "../../utils/apiClient";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get Firebase parameters from URL
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const apiKey = searchParams.get("apiKey"); // 🆕 Get API key from URL

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [email, setEmail] = useState("");
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  useEffect(() => {
    console.log("🔍 Reset Password - URL Parameters:");
    console.log("  - mode:", mode);
    console.log("  - oobCode:", oobCode?.substring(0, 10) + "...");
    console.log("  - apiKey:", apiKey?.substring(0, 10) + "...");

    if (mode !== "resetPassword" || !oobCode || !apiKey) {
      setError("Invalid reset link - missing required parameters");
      setLoading(false);
      return;
    }

    verifyResetCode();
  }, [mode, oobCode, apiKey]);

  const verifyResetCode = async () => {
    try {
      console.log("🔍 Verifying Firebase reset code...");

      // Use the API key from the URL parameters instead of environment variable
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oobCode: oobCode,
          }),
        }
      );

      console.log("🔍 Firebase API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Firebase API error:", errorData);
        throw new Error(
          errorData.error?.message || "Invalid or expired reset code"
        );
      }

      const data = await response.json();
      const userEmail = data.email;

      console.log("✅ Reset code verified for email:", userEmail);
      setEmail(userEmail);

      // Get user's security questions from your backend
      console.log("🔍 Fetching security questions...");

      try {
        const userResponse = await apiClient.post("/auth/get-user-by-email", {
          email: userEmail,
        });

        if (userResponse.data.state === "success") {
          const userData = userResponse.data.data;

          if (!userData.hasSecurityQuestions) {
            setError("Security questions not set up for this account");
            return;
          }

          // Get security questions list
          const questionsResponse = await apiClient.get(
            "/auth/security-questions"
          );
          const allQuestions = questionsResponse.data.data;

          // Map user's questions to display text
          const userQuestions = userData.securityQuestions.map((uq) => {
            const questionData = allQuestions.find(
              (q) => q.id === uq.questionId
            );
            return {
              questionId: uq.questionId,
              question: questionData
                ? questionData.question
                : "Question not found",
            };
          });

          console.log("✅ Security questions loaded:", userQuestions.length);
          setSecurityQuestions(userQuestions);

          // Initialize answers
          const initialAnswers = {};
          userQuestions.forEach((q) => {
            initialAnswers[q.questionId] = "";
          });
          setAnswers(initialAnswers);
        } else {
          throw new Error(
            userResponse.data.message || "Failed to get user data"
          );
        }
      } catch (userError) {
        console.error("❌ Error fetching user data:", userError);
        setError("Error loading security questions. Please try again.");
        return;
      }
    } catch (err) {
      console.error("❌ Reset code verification error:", err);
      setError(err.message || "Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 12) score += 25;
    else feedback.push("At least 12 characters");

    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(password)) score += 25;
    else feedback.push("One lowercase letter");

    if (/\d/.test(password)) score += 12.5;
    else feedback.push("One number");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 12.5;
    else feedback.push("One special character");

    setPasswordStrength({ score, feedback });
    return score === 100;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    if (pwd) {
      checkPasswordStrength(pwd);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    // Check all security questions are answered
    for (const question of securityQuestions) {
      if (
        !answers[question.questionId] ||
        answers[question.questionId].trim().length === 0
      ) {
        setError("Please answer all security questions");
        return false;
      }
    }

    if (passwordStrength.score < 100) {
      setError("Password does not meet all security requirements");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Call your secure backend endpoint - this handles EVERYTHING including Firebase update
      console.log("🔍 Calling secure password reset endpoint...");

      const resetResponse = await apiClient.post(
        "/auth/reset-password-secure",
        {
          email: email,
          answers: answers,
          newPassword: newPassword,
          oobCode: oobCode,
        }
      );

      if (resetResponse.data.state !== "success") {
        setError(resetResponse.data.message || "Password reset failed");
        return;
      }

      console.log("✅ Password reset successful via secure endpoint");

      // ❌ REMOVE THIS SECTION - DON'T CALL FIREBASE AGAIN
      // The backend already updated Firebase Auth, so calling confirmPasswordReset again
      // will try to set the same password that's now in the password history

      // console.log("🔍 Completing Firebase password reset...");
      // try {
      //   await confirmPasswordReset(auth, oobCode, newPassword);
      //   console.log("✅ Firebase password reset completed");
      // } catch (firebaseError) {
      //   console.error("Firebase reset completion error:", firebaseError);
      // }

      // ✅ Just show success and redirect
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);

      // Handle specific error cases
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "An error occurred while resetting your password. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    const score = passwordStrength.score;
    if (score < 40) return "#ef4444";
    if (score < 60) return "#f97316";
    if (score < 80) return "#eab308";
    return "#209D48";
  };

  const getStrengthText = () => {
    const score = passwordStrength.score;
    if (score < 40) return "Weak";
    if (score < 60) return "Fair";
    if (score < 80) return "Good";
    return "Strong";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#072C1C] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <div className="text-white text-lg">Validating reset link...</div>
        </div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-2 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] transition duration-200"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Password Reset Successful
          </h2>
          <p className="text-gray-600 mb-4">{success}</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] transition duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#209D48] mb-2">
            Reset Your Password
          </h2>
          <p className="text-gray-600">
            Please answer your security questions and choose a new password
          </p>
          <p className="text-sm text-gray-500 mt-1">Account: {email}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Security Questions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Security Questions
            </h3>

            {securityQuestions.map((question, index) => (
              <div key={question.questionId} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {index + 1}. {question.question}
                </label>
                <input
                  type="text"
                  value={answers[question.questionId] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.questionId, e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#209D48] focus:border-transparent"
                  placeholder="Enter your answer"
                  required
                />
              </div>
            ))}
          </div>

          {/* New Password Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              New Password
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#209D48] focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${passwordStrength.score}%`,
                          backgroundColor: getStrengthColor(),
                        }}
                      />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: getStrengthColor() }}
                    >
                      {getStrengthText()}
                    </span>
                  </div>

                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Password requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#209D48] focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={submitting || passwordStrength.score < 100}
              className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-[#209D48] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
