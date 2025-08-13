// frontend/src/pages/adminDashboard/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { usePermissions } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient"; // 🆕 Import apiClient
import {
  FiUsers,
  FiShield,
  FiActivity,
  FiSettings,
  FiRefreshCw,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi";

const AdminDashboard = () => {
  const { isAuthenticated, user } = usePermissions();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminVerified, setAdminVerified] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Verify admin access with backend
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      verifyAdminAccess();
    }
  }, [isAuthenticated, user]);

  const verifyAdminAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 [ADMIN] Verifying admin access...");

      // 🆕 Updated to use apiClient instead of fetch
      const response = await apiClient.get("/admin/validate-access", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ [ADMIN] Access verification result:", response.data);

      if (response.data.hasAccess) {
        setAdminVerified(true);
      } else {
        throw new Error("Admin access denied");
      }
    } catch (error) {
      console.error("❌ [ADMIN] Verification failed:", error);

      // Handle different error types
      let errorMessage = "Failed to verify admin access";

      if (error.response?.status === 403) {
        errorMessage = "Admin privileges required";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      // Redirect to unauthorized page after a delay
      setTimeout(() => {
        navigate("/unauthorized", {
          state: {
            reason: "Administrative privileges required to access this page.",
          },
        });
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state during verification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#209D48] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !adminVerified) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <FiLock className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show admin dashboard only if verified
  if (!adminVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiShield className="text-[#209D48]" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.name || user?.email}!
                <span className="inline-flex items-center gap-1 ml-2 text-green-600">
                  <FiCheckCircle className="text-sm" />
                  Admin Access Verified
                </span>
              </p>
            </div>
            <button
              onClick={verifyAdminAccess}
              className="px-4 py-2 bg-[#209D48] text-white rounded-lg hover:bg-[#67b045] transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh Access
            </button>
          </div>
        </div>

        {/* Admin Status Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Status
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Your administrative privileges have been verified
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <FiCheckCircle className="text-2xl" />
              <span className="font-medium">Verified</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">User ID:</span>
              <span className="ml-2 font-mono text-xs">{user?.userId}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Access Level:</span>
              <span className="ml-2 font-medium text-green-600">
                Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AdminActionCard
            title="Security Logs"
            description="View and analyze system security events"
            icon={<FiShield className="text-2xl text-blue-600" />}
            href="/admin/logs"
            color="blue"
          />
          <AdminActionCard
            title="User Management"
            description="Manage user accounts and permissions"
            icon={<FiUsers className="text-2xl text-green-600" />}
            href="/admin/users"
            color="green"
          />
          <AdminActionCard
            title="System Health"
            description="Monitor system performance and status"
            icon={<FiActivity className="text-2xl text-purple-600" />}
            href="/admin/health"
            color="purple"
          />
        </div>

        {/* Admin Tools */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiSettings />
            Administrative Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminTool
              title="Database Management"
              description="View and manage database collections"
              href="/admin/database"
            />
            <AdminTool
              title="System Configuration"
              description="Update system settings and preferences"
              href="/admin/config"
            />
            <AdminTool
              title="Backup & Recovery"
              description="Manage data backups and recovery options"
              href="/admin/backup"
            />
            <AdminTool
              title="Security Settings"
              description="Configure security policies and rules"
              href="/admin/security"
            />
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Environment:</span>
              <span className="ml-2 font-medium">
                {process.env.NODE_ENV === "production"
                  ? "Production"
                  : "Development"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Access:</span>
              <span className="ml-2 font-medium">
                {new Date().toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Admin Session:</span>
              <span className="ml-2 font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Action Card Component
const AdminActionCard = ({ title, description, icon, href, color }) => {
  const colorClasses = {
    blue: "border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100",
    green:
      "border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100",
    purple:
      "border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100",
  };

  return (
    <a
      href={href}
      className={`block p-6 rounded-lg border-2 transition-all duration-200 ${colorClasses[color]}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </a>
  );
};

// Admin Tool Component
const AdminTool = ({ title, description, href }) => (
  <a
    href={href}
    className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
  >
    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </a>
);

export default AdminDashboard;
