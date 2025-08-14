// Update your SecurityQuestionsSetup.jsx component

import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import apiClient from "../utils/apiClient";

const SecurityQuestionsSetup = ({ onClose, onSuccess }) => {
  const { user } = useUser();
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState({
    pet_name: "",
    favorite_teacher: "",
    childhood_friend: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch available security questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await apiClient.get("/auth/security-questions");
        if (response.data.state === "success") {
          setSecurityQuestions(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching security questions:", err);
        setError("Failed to load security questions");
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    setError("");
  };

  const validateForm = () => {
    // Check if all answers are provided and meet minimum length
    for (const [questionId, answer] of Object.entries(answers)) {
      if (!answer || answer.trim().length < 2) {
        setError("All answers must be at least 2 characters long");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert answers object to the expected format
      const questionsToSubmit = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer: answer.trim(),
        })
      );

      const response = await apiClient.post("/auth/setup-security-questions", {
        questions: questionsToSubmit,
      });

      if (response.data.state === "success") {
        setSuccess("Security questions set up successfully!");
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose && onClose();
        }, 2000);
      } else {
        setError(
          response.data.message || "Failed to set up security questions"
        );
      }
    } catch (err) {
      console.error("Error setting up security questions:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while setting up security questions"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Set Up Security Questions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Security Questions:</strong> These questions will be used
              to verify your identity if you forget your password. Choose
              answers that are memorable to you but difficult for others to
              guess.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {securityQuestions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {index + 1}. {question.question} *
                </label>

                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder="Enter your answer"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Setting up...
                    </span>
                  ) : (
                    "Set Up Security Questions"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecurityQuestionsSetup;
