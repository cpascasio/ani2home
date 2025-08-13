import React, { useState, useEffect } from "react";
import { auth } from "../config/firebase-config";
import { useTokenManager } from "../context/UserContext";
import apiClient from "../utils/apiClient";

const TokenDebugger = () => {
  const [debugInfo, setDebugInfo] = useState("");
  const { getTokenStatus, refreshToken } = useTokenManager();

  const checkEverything = async () => {
    let debug = "🔍 TOKEN SYSTEM DEBUG:\n\n";

    try {
      // 1. Check Firebase user
      debug += `1. Firebase User: ${auth.currentUser ? "✅ Logged in" : "❌ Not logged in"}\n`;
      if (auth.currentUser) {
        debug += `   - UID: ${auth.currentUser.uid}\n`;
        debug += `   - Email: ${auth.currentUser.email}\n`;
      }

      // 2. Check localStorage
      const storedUser = localStorage.getItem("user");
      debug += `\n2. LocalStorage User: ${storedUser ? "✅ Found" : "❌ Missing"}\n`;

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        debug += `   - UserId: ${userData.userId || userData.uid}\n`;
        debug += `   - Email: ${userData.email}\n`;
        debug += `   - Token exists: ${userData.token ? "✅ Yes" : "❌ No"}\n`;

        if (userData.token) {
          try {
            const payload = JSON.parse(atob(userData.token.split(".")[1]));
            const exp = new Date(payload.exp * 1000);
            const now = new Date();
            debug += `   - Token expires: ${exp.toLocaleString()}\n`;
            debug += `   - Current time: ${now.toLocaleString()}\n`;
            debug += `   - Is expired: ${now > exp ? "❌ YES" : "✅ No"}\n`;
          } catch (e) {
            debug += `   - Token parse error: ${e.message}\n`;
          }
        }
      }

      // 3. Check token manager status
      debug += `\n3. Token Manager Status:\n`;
      try {
        const status = getTokenStatus();
        debug += `   - Valid: ${status.valid ? "✅ Yes" : "❌ No"}\n`;
        debug += `   - Expires soon: ${status.isExpiringSoon ? "⚠️ Yes" : "✅ No"}\n`;
        if (status.valid) {
          debug += `   - Time left: ${Math.floor(status.timeUntilExpiry / 1000 / 60)} minutes\n`;
        }
      } catch (e) {
        debug += `   - Error: ${e.message}\n`;
      }

      // 4. Try to get fresh token
      debug += `\n4. Token Refresh Test:\n`;
      try {
        const freshToken = await refreshToken();
        debug += `   - Refresh: ✅ Success\n`;
        debug += `   - New token: ${freshToken.substring(0, 50)}...\n`;
      } catch (e) {
        debug += `   - Refresh: ❌ Failed - ${e.message}\n`;
      }

      // 5. Test API call
      debug += `\n5. API Call Test:\n`;
      try {
        const response = await apiClient.get(`/cart/${auth.currentUser?.uid}`);
        debug += `   - API call: ✅ Success\n`;
        debug += `   - Response: ${JSON.stringify(response.data).substring(0, 100)}...\n`;
      } catch (e) {
        debug += `   - API call: ❌ Failed - ${e.message}\n`;
        if (e.response) {
          debug += `   - Status: ${e.response.status}\n`;
          debug += `   - Error: ${e.response.data?.message}\n`;
        }
      }
    } catch (error) {
      debug += `\n❌ Debug error: ${error.message}\n`;
    }

    setDebugInfo(debug);
  };

  const forceTokenRefresh = async () => {
    try {
      setDebugInfo("🔄 Forcing token refresh...");

      if (!auth.currentUser) {
        setDebugInfo("❌ No Firebase user found - please login again");
        return;
      }

      // Force refresh
      const newToken = await auth.currentUser.getIdToken(true);

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.token = newToken;
        userData.tokenRefreshed = new Date().toISOString();
        localStorage.setItem("user", JSON.stringify(userData));
      }

      setDebugInfo(
        `✅ Token refreshed successfully!\n\nNew token: ${newToken.substring(0, 50)}...\n\nTry your API call again.`
      );
    } catch (error) {
      setDebugInfo(`❌ Token refresh failed: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "white",
        border: "2px solid #ccc",
        borderRadius: "8px",
        padding: "15px",
        maxWidth: "400px",
        maxHeight: "500px",
        overflow: "auto",
        zIndex: 9999,
        fontSize: "12px",
        fontFamily: "monospace",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
        🔧 Token Debugger
      </div>

      <button
        onClick={checkEverything}
        style={{
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "8px 12px",
          margin: "5px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        🔍 Check All
      </button>

      <button
        onClick={forceTokenRefresh}
        style={{
          background: "#28a745",
          color: "white",
          border: "none",
          padding: "8px 12px",
          margin: "5px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        🔄 Force Refresh
      </button>

      <button
        onClick={() => setDebugInfo("")}
        style={{
          background: "#6c757d",
          color: "white",
          border: "none",
          padding: "8px 12px",
          margin: "5px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        🧹 Clear
      </button>

      {debugInfo && (
        <pre
          style={{
            background: "#f8f9fa",
            padding: "10px",
            marginTop: "10px",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {debugInfo}
        </pre>
      )}
    </div>
  );
};

export default TokenDebugger;
