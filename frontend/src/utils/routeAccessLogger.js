import axios from "axios";

class RouteAccessLogger {
  static async logUnauthorizedAccess(
    attemptedRoute,
    accessType,
    userInfo,
    reason = null
  ) {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/log-unauthorized-access",
        {
          attemptedRoute,
          accessType,
          userInfo: {
            uid: userInfo?.uid || null,
            email: userInfo?.email || null,
            isAdmin: userInfo?.isAdmin || false,
            isStore: userInfo?.isStore || false,
          },
          reason,
          timestamp: new Date().toISOString(),
        }
      );

      console.log(`🛡️ Logged unauthorized access attempt to ${attemptedRoute}`);
    } catch (error) {
      console.error("Failed to log unauthorized route access:", error);
      // Don't block the UI if logging fails
    }
  }

  static async logRouteAccess(route, accessType, userInfo, granted = true) {
    try {
      if (!granted) {
        await this.logUnauthorizedAccess(
          route,
          accessType,
          userInfo,
          "Permission denied"
        );
      }
      // You could also log successful access if needed
    } catch (error) {
      console.error("Route access logging error:", error);
    }
  }
}

export default RouteAccessLogger;
