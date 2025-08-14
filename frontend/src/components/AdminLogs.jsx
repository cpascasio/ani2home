import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiRefreshCw,
  FiFilter,
  FiDownload,
  FiClock,
  FiUser,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
} from "lucide-react";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    limit: 100,
  });
  const [stats, setStats] = useState(null);

  // Mock user data - replace with actual user context
  const user = { token: "mock-token", email: "admin@example.com" };

  // Mock API client - replace with actual apiClient
  const apiClient = {
    get: async (url) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (url.includes("/admin/security-logs")) {
        return {
          data: {
            success: true,
            logs: [
              {
                id: "1",
                eventType: "LOGIN_SUCCESS",
                category: "AUTHENTICATION",
                userId: "user123",
                email: "john@example.com",
                ipAddress: "192.168.1.100",
                timestamp: new Date().toISOString(),
                description: "User successfully logged in",
                success: true,
              },
              {
                id: "2",
                eventType: "LOGIN_FAILURE",
                category: "AUTHENTICATION",
                userId: null,
                email: "hacker@bad.com",
                ipAddress: "10.0.0.1",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                description: "Failed login attempt - invalid credentials",
                success: false,
                failureReason: "Invalid password",
              },
              {
                id: "3",
                eventType: "ACCESS_CONTROL_FAILURE",
                category: "AUTHORIZATION",
                userId: "user456",
                email: "user@example.com",
                ipAddress: "192.168.1.105",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                description: "Unauthorized access attempt to admin panel",
                success: false,
              },
              {
                id: "4",
                eventType: "INPUT_VALIDATION_FAILURE",
                category: "DATA_VALIDATION",
                userId: "user789",
                email: "test@example.com",
                ipAddress: "192.168.1.110",
                timestamp: new Date(Date.now() - 10800000).toISOString(),
                description: "Invalid input detected in form submission",
                success: false,
              },
              {
                id: "5",
                eventType: "ADMIN_LOG_ACCESS",
                category: "SECURITY_EVENT",
                userId: "admin123",
                email: "admin@example.com",
                ipAddress: "192.168.1.200",
                timestamp: new Date(Date.now() - 14400000).toISOString(),
                description: "Administrator accessed security logs",
                success: true,
              },
            ],
          },
        };
      }

      if (url.includes("/admin/log-stats")) {
        return {
          data: {
            success: true,
            stats: {
              last24h: {
                authEvents: 45,
                accessControlFailures: 8,
                validationFailures: 12,
              },
            },
          },
        };
      }

      throw new Error("API endpoint not found");
    },
  };

  // Load logs on component mount and filter changes
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.limit) queryParams.append("limit", filters.limit.toString());

      const response = await apiClient.get(
        `/admin/security-logs?${queryParams.toString()}`
      );

      if (response.data.success) {
        setLogs(response.data.logs);
      } else {
        throw new Error(response.data.message || "Failed to fetch logs");
      }
    } catch (error) {
      console.error("❌ [ADMIN LOGS] Failed to fetch logs:", error);
      setError(error.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
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
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
      limit: 100,
    });
  };

  const exportLogs = () => {
    if (logs.length === 0) return;

    const csvContent = [
      // Header
      [
        "Timestamp",
        "Event Type",
        "Category",
        "User ID",
        "IP Address",
        "Description",
        "Success",
      ].join(","),
      // Data rows
      ...logs.map((log) =>
        [
          log.timestamp,
          log.eventType,
          log.category,
          log.userId || "N/A",
          log.ipAddress,
          `"${log.description || "N/A"}"`,
          log.success ? "Yes" : "No",
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading security logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiShield className="text-green-600" />
                Security Logs
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and analyze system security events
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportLogs}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={logs.length === 0}
              >
                <FiDownload className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
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
                <FiUser className="w-8 h-8 text-blue-600" />
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
                <FiXCircle className="w-8 h-8 text-red-600" />
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
                <FiAlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Total Events
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {logs.length}
                  </p>
                  <p className="text-sm text-gray-600">Current view</p>
                </div>
                <FiShield className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="AUTHENTICATION">Authentication</option>
                <option value="AUTHORIZATION">Authorization</option>
                <option value="DATA_VALIDATION">Data Validation</option>
                <option value="SECURITY_EVENT">Security Events</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) =>
                  handleFilterChange("limit", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={50}>50 entries</option>
                <option value={100}>100 entries</option>
                <option value={250}>250 entries</option>
                <option value={500}>500 entries</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-red-800">
              <FiXCircle className="w-5 h-5" />
              <span className="font-medium">Error Loading Logs</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Security Events ({logs.length} entries)
            </h2>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <FiClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Logs Found
              </h3>
              <p className="text-gray-600">
                {error
                  ? "Unable to load logs due to an error."
                  : "No security events match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getEventIcon(log.eventType, log.success)}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.eventType}
                            </div>
                            {log.success !== undefined && (
                              <div
                                className={`text-xs ${log.success ? "text-green-600" : "text-red-600"}`}
                              >
                                {log.success ? "Success" : "Failed"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-l-4 ${getSeverityColor(log.eventType, log.success)}`}
                        >
                          {log.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {log.email || "N/A"}
                          </div>
                          {log.userId && (
                            <div className="text-xs text-gray-500 font-mono">
                              {log.userId.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="truncate" title={log.description}>
                          {log.description || "No description"}
                        </div>
                        {log.failureReason && (
                          <div className="text-xs text-red-600 mt-1">
                            Reason: {log.failureReason}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh indicator */}
        {loading && logs.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4 animate-spin text-green-600" />
              <span className="text-sm text-gray-600">Refreshing logs...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
