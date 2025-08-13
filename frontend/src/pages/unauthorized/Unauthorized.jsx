// frontend/src/pages/unauthorized/Unauthorized.jsx
import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const reason =
    location.state?.reason || "You don't have permission to access this page";
  const fromPath = location.state?.from?.pathname || "/";

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto h-20 w-20 text-red-500">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
            />
          </svg>
        </div>

        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">{reason}</p>
          {fromPath !== "/" && (
            <p className="mt-1 text-xs text-gray-400">
              Attempted to access: {fromPath}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoBack}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300"
          >
            Go Back
          </button>

          <Link
            to="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300"
          >
            Go to Homepage
          </Link>

          {!user && (
            <Link
              to="/login"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300"
            >
              Login
            </Link>
          )}

          {user && !user.isStore && (
            <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
              <p className="font-medium">Want to become a seller?</p>
              <p>
                Contact support to upgrade your account to access seller
                features.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
