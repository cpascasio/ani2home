// frontend/src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 🆕 Added useNavigate
import apiClient from "../../utils/apiClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resetLink, setResetLink] = useState(""); // 🆕 Added state for reset link

  const navigate = useNavigate(); // 🆕 Added navigate

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiClient.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      console.log("🔍 Full API response:", response.data); // 🆕 Debug log

      if (response.data.state === "success") {
        // Check if we got a direct link in the response
        if (response.data.data && response.data.data.resetLink) {
          console.log(
            "🔗 Received direct reset link:",
            response.data.data.resetLink
          );

          // Store the reset link to display it
          setResetLink(response.data.data.resetLink);
          setMessage("Password reset link generated successfully!");
          setEmailSent(true); // Show the success page

          // Optional: Automatically redirect after a delay
          setTimeout(() => {
            const url = new URL(response.data.data.resetLink);
            const searchParams = url.search; // Gets ?mode=resetPassword&oobCode=...
            navigate(`/reset-password${searchParams}`);
          }, 3000); // Redirect after 3 seconds
        } else {
          // Fallback to regular email message
          setMessage(response.data.message);
          setEmailSent(true);
        }
      } else {
        setError(response.data.message || "An error occurred");
      }
    } catch (err) {
      console.error("🚨 Forgot password error:", err);
      console.error("🚨 Error response:", err.response?.data); // 🆕 Debug log

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Invalid request. Please check your email address.");
      } else if (err.response?.status === 404) {
        setError("No account found with this email address.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Reset Link Generated
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {/* 🆕 Show the direct reset link if available */}
            {resetLink && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Direct Reset Link:
                </p>
                <div className="bg-white p-3 rounded border break-all text-sm text-blue-600">
                  {resetLink}
                </div>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetLink);
                      alert("Link copied to clipboard!");
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      const url = new URL(resetLink);
                      const searchParams = url.search;
                      navigate(`/reset-password${searchParams}`);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
                  >
                    Go to Reset Page Now
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  You will be automatically redirected in a few seconds...
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                  setMessage("");
                  setResetLink(""); // 🆕 Clear reset link
                }}
                className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Generate Another Link
              </button>
              <Link
                to="/login"
                className="block w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] text-center transition duration-200"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#072C1C] flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#209D48] mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-600">
            Enter your email address and we'll generate a password reset link
            for you.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 🆕 Development mode helper */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-700 mb-2">
              <strong>Development Mode:</strong> Reset links will be generated
              directly (no email sent)
            </p>
            <button
              onClick={() => setEmail("usogreenlens2@gmail.com")}
              className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
            >
              Use Test Email
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="w-full p-3 rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
              placeholder="Enter your email address"
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-[#209D48] text-white rounded-lg hover:bg-[#67B045] focus:outline-none focus:ring focus:ring-[#67B045] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? (
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
                Generating Link...
              </span>
            ) : (
              "Generate Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-[#209D48] hover:underline font-medium"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
