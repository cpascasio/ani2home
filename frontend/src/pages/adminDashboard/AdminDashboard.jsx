// frontend/src/pages/adminDashboard/AdminDashboard.jsx - Enhanced with more details
import React, { useState, useEffect } from "react";
import { usePermissions } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import {
  FiShield,
  FiRefreshCw,
  FiLock,
  FiCheckCircle,
  FiFilter,
  FiDownload,
  FiClock,
  FiUser,
  FiAlertTriangle,
  FiXCircle,
  FiInfo,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

const AdminDashboard = () => {
  const { isAuthenticated, user } = usePermissions();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminVerified, setAdminVerified] = useState(false);
  const [error, setError] = useState(null);

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
  });

  // 🆕 New state for expanded log details
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 3;

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

  // Load logs when admin is verified or pagination changes
  useEffect(() => {
    if (adminVerified) {
      fetchLogs();
      fetchStats();
    }
  }, [adminVerified, filters, currentPage]);

  const verifyAdminAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/admin/validate-access");

      if (response.data.hasAccess) {
        setAdminVerified(true);
      } else {
        throw new Error("Admin access denied");
      }
    } catch (error) {
      console.error("❌ [ADMIN] Verification failed:", error);

      let errorMessage = "Failed to verify admin access";
      if (error.response?.status === 403) {
        errorMessage = "Admin privileges required";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);

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

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      setLogsError(null);

      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      queryParams.append("limit", itemsPerPage.toString());
      queryParams.append("page", currentPage.toString());

      const response = await apiClient.get(
        `/admin/security-logs?${queryParams.toString()}`
      );

      if (response.data.success) {
        setLogs(response.data.logs);
        setTotalCount(response.data.totalCount || response.data.logs.length);
        setTotalPages(
          Math.ceil(
            (response.data.totalCount || response.data.logs.length) /
              itemsPerPage
          )
        );
      } else {
        throw new Error(response.data.message || "Failed to fetch logs");
      }
    } catch (error) {
      console.error("❌ [ADMIN LOGS] Failed to fetch logs:", error);
      setLogsError(
        error.response?.data?.message || error.message || "Failed to fetch logs"
      );
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/admin/log-stats");
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("❌ [ADMIN STATS] Failed to fetch stats:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 🆕 Toggle expanded log details
  const toggleLogExpansion = (logId) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const exportLogs = () => {
    if (logs.length === 0) return;

    const csvContent = [
      [
        "Timestamp",
        "Event Type",
        "Category",
        "User ID",
        "Email", // 🆕 Added email
        "IP Address",
        "Description",
        "Success",
        "Browser", // 🆕 Added browser info
        "Device Type", // 🆕 Added device type
        "Operating System", // 🆕 Added OS
        "Device Fingerprint", // 🆕 Added fingerprint
      ].join(","),
      ...logs.map((log) =>
        [
          log.timestamp,
          log.eventType,
          log.category,
          log.userId || "N/A",
          log.email || "N/A",
          log.ipAddress,
          `"${log.description || "N/A"}"`,
          log.success ? "Yes" : "No",
          log.metadata?.browserInfo
            ? `${log.metadata.browserInfo.name} ${log.metadata.browserInfo.version}`
            : "N/A",
          log.metadata?.deviceType || "N/A",
          log.metadata?.operatingSystem || "N/A",
          showSensitiveData
            ? log.metadata?.deviceFingerprint || "N/A"
            : "[Hidden]",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEventIcon = (eventType, success) => {
    if (eventType?.includes("AUTH")) {
      return success ? (
        <FiCheckCircle className="text-green-600" />
      ) : (
        <FiXCircle className="text-red-600" />
      );
    }
    if (eventType?.includes("ACCESS_CONTROL_FAILURE")) {
      return <FiAlertTriangle className="text-yellow-600" />;
    }
    if (eventType?.includes("VALIDATION")) {
      return <FiAlertTriangle className="text-orange-600" />;
    }
    return <FiInfo className="text-blue-600" />;
  };

  // 🆕 Get device icon based on device type
  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case "mobile":
        return <FiSmartphone className="text-gray-600" />;
      case "tablet":
        return <FiTablet className="text-gray-600" />;
      case "desktop":
      default:
        return <FiMonitor className="text-gray-600" />;
    }
  };

  const getSeverityColor = (eventType, success) => {
    if (
      eventType?.includes("FAILURE") ||
      eventType?.includes("ERROR") ||
      success === false
    ) {
      return "bg-red-50 border-l-red-500 text-red-800";
    }
    if (
      eventType?.includes("ACCESS_CONTROL") ||
      eventType?.includes("VALIDATION")
    ) {
      return "bg-yellow-50 border-l-yellow-500 text-yellow-800";
    }
    return "bg-green-50 border-l-green-500 text-green-800";
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🆕 Mask sensitive data based on setting
  const maskSensitiveData = (data) => {
    if (showSensitiveData) return data;
    if (!data) return "N/A";

    if (typeof data === "string" && data.length > 8) {
      return data.substring(0, 4) + "****" + data.substring(data.length - 4);
    }
    return "[Hidden]";
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
            <div className="flex items-center gap-3">
              {/* 🆕 Toggle for sensitive data */}
              <button
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                  showSensitiveData
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                {showSensitiveData ? <FiEye /> : <FiEyeOff />}
                {showSensitiveData ? "Hide Sensitive" : "Show Sensitive"}
              </button>
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
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Auth Events
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.last24h.authEvents}
                  </p>
                  <p className="text-sm text-gray-600">Last 24 hours</p>
                </div>
                <FiUser className="text-3xl text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Access Failures
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.last24h.accessControlFailures}
                  </p>
                  <p className="text-sm text-gray-600">Last 24 hours</p>
                </div>
                <FiXCircle className="text-3xl text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Validation Errors
                  </h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.last24h.validationFailures}
                  </p>
                  <p className="text-sm text-gray-600">Last 24 hours</p>
                </div>
                <FiAlertTriangle className="text-3xl text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Total Events
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {totalCount}
                  </p>
                  <p className="text-sm text-gray-600">All time</p>
                </div>
                <FiShield className="text-3xl text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Security Logs Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiShield className="text-[#209D48]" />
                Security Events ({totalCount} total, page {currentPage} of{" "}
                {totalPages})
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportLogs}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  disabled={logs.length === 0}
                >
                  <FiDownload />
                  Export
                </button>
                <button
                  onClick={fetchLogs}
                  className="px-3 py-2 bg-[#209D48] text-white rounded-lg hover:bg-[#67b045] transition-colors flex items-center gap-2 text-sm"
                  disabled={logsLoading}
                >
                  <FiRefreshCw className={logsLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Filters:
                </span>
              </div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#209D48] focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="AUTHENTICATION">Authentication</option>
                <option value="AUTHORIZATION">Authorization</option>
                <option value="DATA_VALIDATION">Data Validation</option>
                <option value="SECURITY_EVENT">Security Events</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {logsError && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-800">
                <FiXCircle />
                <span className="text-sm font-medium">Error: {logsError}</span>
              </div>
            </div>
          )}

          {/* Logs Table */}
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <FiClock className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Security Events
              </h3>
              <p className="text-gray-600">
                {logsError
                  ? "Unable to load logs."
                  : "No security events found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User & Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Network Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-gray-50">
                        {/* Event Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {getEventIcon(log.eventType, log.success)}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {log.eventType.replace(/_/g, " ")}
                              </div>
                              <div
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border-l-4 ${getSeverityColor(log.eventType, log.success)}`}
                              >
                                {log.category}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-sm">
                                {log.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* User & Device */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {log.email || "N/A"}
                            </div>
                            {log.userId && (
                              <div className="text-xs text-gray-500 font-mono">
                                {showSensitiveData
                                  ? log.userId
                                  : maskSensitiveData(log.userId)}
                              </div>
                            )}
                            {/* 🆕 Device Information */}
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {getDeviceIcon(log.metadata?.deviceType)}
                              <span>
                                {log.metadata?.operatingSystem || "Unknown"}
                              </span>
                            </div>
                            {/* 🆕 Browser Information */}
                            {log.metadata?.browserInfo && (
                              <div className="text-xs text-gray-500">
                                {log.metadata.browserInfo.name}{" "}
                                {log.metadata.browserInfo.version}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Network Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 font-mono">
                              {log.ipAddress}
                            </div>
                            {/* 🆕 Device Fingerprint */}
                            {log.metadata?.deviceFingerprint && (
                              <div className="text-xs text-gray-500 font-mono">
                                FP:{" "}
                                {maskSensitiveData(
                                  log.metadata.deviceFingerprint
                                )}
                              </div>
                            )}
                            {/* 🆕 Security Flags */}
                            {(log.metadata?.isNewDevice ||
                              log.metadata?.isNewLocation) && (
                              <div className="flex gap-1">
                                {log.metadata?.isNewDevice && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    New Device
                                  </span>
                                )}
                                {log.metadata?.isNewLocation && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    New Location
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Time & Status */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {formatTimestamp(log.timestamp)}
                            </div>
                            {log.success !== undefined && (
                              <div
                                className={`text-xs font-medium ${log.success ? "text-green-600" : "text-red-600"}`}
                              >
                                {log.success ? "Success" : "Failed"}
                              </div>
                            )}
                            {log.failureReason && (
                              <div className="text-xs text-red-600">
                                {log.failureReason}
                              </div>
                            )}
                            {/* 🆕 Severity/Threat Level */}
                            {(log.severity || log.threatLevel) && (
                              <div className="text-xs">
                                <span
                                  className={`font-medium ${
                                    log.severity === "high"
                                      ? "text-red-600"
                                      : log.severity === "medium"
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                  }`}
                                >
                                  {log.severity || log.threatLevel}
                                </span>
                                {log.severity &&
                                  log.threatLevel &&
                                  ` / ${log.threatLevel}`}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {expandedLogs.has(log.id) ? (
                              <>
                                <FiChevronDown className="text-xs" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <FiChevronRight className="text-xs" />
                                View Details
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* 🆕 Expandable Detail Row */}
                      {expandedLogs.has(log.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              {/* Authentication Details */}
                              {log.category === "AUTHENTICATION" && (
                                <div className="bg-white p-3 rounded border">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Authentication Details
                                  </h4>
                                  <div className="space-y-1 text-xs">
                                    <div>
                                      <span className="font-medium">
                                        Method:
                                      </span>{" "}
                                      {log.metadata?.authMethod || "password"}
                                    </div>
                                    {log.metadata?.consecutiveFailures > 0 && (
                                      <div>
                                        <span className="font-medium">
                                          Consecutive Failures:
                                        </span>{" "}
                                        {log.metadata.consecutiveFailures}
                                      </div>
                                    )}
                                    {log.metadata?.lastLoginTime && (
                                      <div>
                                        <span className="font-medium">
                                          Last Login:
                                        </span>{" "}
                                        {new Date(
                                          log.metadata.lastLoginTime
                                        ).toLocaleString()}
                                      </div>
                                    )}
                                    {log.metadata?.accountAge && (
                                      <div>
                                        <span className="font-medium">
                                          Account Age:
                                        </span>{" "}
                                        {log.metadata.accountAge} days
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Technical Details */}
                              <div className="bg-white p-3 rounded border">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Technical Details
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="font-medium">
                                      Endpoint:
                                    </span>{" "}
                                    {log.endpoint}
                                  </div>
                                  <div>
                                    <span className="font-medium">Method:</span>{" "}
                                    {log.method || "N/A"}
                                  </div>
                                  {log.sessionId && (
                                    <div>
                                      <span className="font-medium">
                                        Session:
                                      </span>{" "}
                                      {showSensitiveData
                                        ? log.sessionId
                                        : maskSensitiveData(log.sessionId)}
                                    </div>
                                  )}
                                  {log.metadata?.eventSource && (
                                    <div>
                                      <span className="font-medium">
                                        Source:
                                      </span>{" "}
                                      {log.metadata.eventSource}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Validation Details */}
                              {log.category === "DATA_VALIDATION" && (
                                <div className="bg-white p-3 rounded border">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Validation Details
                                  </h4>
                                  <div className="space-y-1 text-xs">
                                    <div>
                                      <span className="font-medium">
                                        Field:
                                      </span>{" "}
                                      {log.fieldName}
                                    </div>
                                    <div>
                                      <span className="font-medium">Rule:</span>{" "}
                                      {log.validationRule}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Value:
                                      </span>{" "}
                                      {log.providedValue}
                                    </div>
                                    {log.metadata?.expectedFormat && (
                                      <div>
                                        <span className="font-medium">
                                          Expected:
                                        </span>{" "}
                                        {log.metadata.expectedFormat}
                                      </div>
                                    )}
                                    {log.metadata?.securityThreat && (
                                      <div>
                                        <span className="font-medium text-red-600">
                                          Threat:
                                        </span>{" "}
                                        {log.metadata.securityThreat}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Access Control Details */}
                              {log.category === "AUTHORIZATION" && (
                                <div className="bg-white p-3 rounded border">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Access Control Details
                                  </h4>
                                  <div className="space-y-1 text-xs">
                                    <div>
                                      <span className="font-medium">
                                        Resource:
                                      </span>{" "}
                                      {log.requestedResource}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Required Permission:
                                      </span>{" "}
                                      {log.requiredPermission}
                                    </div>
                                    {log.accessType && (
                                      <div>
                                        <span className="font-medium">
                                          Access Type:
                                        </span>{" "}
                                        {log.accessType}
                                      </div>
                                    )}
                                    {log.reason && (
                                      <div>
                                        <span className="font-medium">
                                          Reason:
                                        </span>{" "}
                                        {log.reason}
                                      </div>
                                    )}
                                    {log.metadata?.userRole && (
                                      <div>
                                        <span className="font-medium">
                                          User Role:
                                        </span>{" "}
                                        {log.metadata.userRole}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Timing Information */}
                              <div className="bg-white p-3 rounded border">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Timing Information
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="font-medium">
                                      Full Timestamp:
                                    </span>{" "}
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                  {log.metadata?.timeOfDay !== undefined && (
                                    <div>
                                      <span className="font-medium">
                                        Hour of Day:
                                      </span>{" "}
                                      {log.metadata.timeOfDay}:00
                                    </div>
                                  )}
                                  {log.metadata?.dayOfWeek !== undefined && (
                                    <div>
                                      <span className="font-medium">
                                        Day of Week:
                                      </span>{" "}
                                      {
                                        [
                                          "Sunday",
                                          "Monday",
                                          "Tuesday",
                                          "Wednesday",
                                          "Thursday",
                                          "Friday",
                                          "Saturday",
                                        ][log.metadata.dayOfWeek]
                                      }
                                    </div>
                                  )}
                                  {log.metadata?.loginDuration && (
                                    <div>
                                      <span className="font-medium">
                                        Duration:
                                      </span>{" "}
                                      {log.metadata.loginDuration}ms
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Additional Metadata */}
                              {Object.keys(log.metadata || {}).length > 0 && (
                                <div className="bg-white p-3 rounded border">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Additional Information
                                  </h4>
                                  <div className="space-y-1 text-xs">
                                    {Object.entries(log.metadata || {}).map(
                                      ([key, value]) => {
                                        // Skip already displayed fields
                                        if (
                                          [
                                            "browserInfo",
                                            "deviceType",
                                            "operatingSystem",
                                            "deviceFingerprint",
                                            "timeOfDay",
                                            "dayOfWeek",
                                            "authMethod",
                                            "consecutiveFailures",
                                            "lastLoginTime",
                                            "accountAge",
                                            "eventSource",
                                            "expectedFormat",
                                            "securityThreat",
                                            "userRole",
                                            "loginDuration",
                                          ].includes(key)
                                        ) {
                                          return null;
                                        }

                                        if (typeof value === "object") {
                                          return (
                                            <div key={key}>
                                              <span className="font-medium">
                                                {key}:
                                              </span>{" "}
                                              {JSON.stringify(value)}
                                            </div>
                                          );
                                        }

                                        return (
                                          <div key={key}>
                                            <span className="font-medium">
                                              {key}:
                                            </span>{" "}
                                            {String(value)}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                  {totalCount} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {getPaginationNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof page === "number" ? handlePageChange(page) : null
                      }
                      disabled={page === "..."}
                      className={`px-3 py-1 border rounded text-sm ${
                        page === currentPage
                          ? "bg-[#209D48] text-white border-[#209D48]"
                          : page === "..."
                            ? "border-transparent cursor-default"
                            : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {logsLoading && (
          <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <FiRefreshCw className="animate-spin text-[#209D48]" />
              <span className="text-sm text-gray-600">Refreshing logs...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
