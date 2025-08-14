import useFetch from "../../../hooks/useFetch.js";
import { useUser } from "../../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useMap, Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Autocomplete } from "@react-google-maps/api";
import LocationIcon from "../../assets/location.png"; // Path to the location icon
import useDynamicFetch from "../../../hooks/useDynamicFetch.js";
import apiClient from "../../utils/apiClient.js";
import SecurityQuestionsSetup from "../../components/SecurityQuestionsSetup";
import PasswordChangeModal from "../../components/PasswordChangeModal.jsx";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../config/firebase-config"; // Adjust path as needed
import { useReauth } from "../../hooks/useReauth.jsx";

const MyProfile = () => {
  const userLog = localStorage.getItem("user");
  const { user, dispatch } = useUser();
  const [editing, setEditing] = useState(false);
  const placesLib = useMapsLibrary("places");

  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);

  const map = useMap();

  const [userProfilePic, setUserProfilePic] = useState(null);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [markerPosition, setMarkerPosition] = useState(null);
  const [addressDetails, setAddressDetails] = useState({});

  const autocompleteContainerRef = useRef(null);

  const [loginHistory, setLoginHistory] = useState(null);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const { ReauthModal, showReauthModal, setShowReauthModal } = useReauth();
  const [pendingAction, setPendingAction] = useState(null);

  // for verification
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [showSecurityQuestionsModal, setShowSecurityQuestionsModal] =
    useState(false);
  const [hasSecurityQuestions, setHasSecurityQuestions] = useState(false);

  const handleCreateStore = () => {
    setPendingAction("createStore");
    setShowReauthModal(true);
  };

  const handleDeleteStore = () => {
    setPendingAction("deleteStore");
    setShowReauthModal(true);
  };

  const handleReauthSuccess = async (currentPassword = null) => {
    try {
      if (pendingAction === "createStore") {
        console.log("🏪 Creating store with re-authentication...");

        // Prepare request body based on auth provider
        const requestBody = {};
        const authProvider = ReauthModal.getUserAuthProvider?.() || "unknown";

        // Only include password for email/password users
        if (authProvider === "password" && currentPassword) {
          requestBody.currentPassword = currentPassword;
        }

        const response = await apiClient.put(
          `/users/${user?.userId}/set-store-secure`,
          requestBody
        );

        if (response.data.state === "success") {
          dispatch({
            type: "UPDATE_USER",
            payload: { isStore: true },
          });
          navigate("/seller");
          alert("Store created successfully!");
        } else {
          console.error("Failed to create store:", response.data.message);
          alert(
            response.data.message || "Failed to create store. Please try again."
          );
        }
      } else if (pendingAction === "deleteStore") {
        console.log("🗑️ Deleting store with re-authentication...");

        // Prepare request body based on auth provider
        const requestBody = {};
        const authProvider = ReauthModal.getUserAuthProvider?.() || "unknown";

        // Only include password for email/password users
        if (authProvider === "password" && currentPassword) {
          requestBody.currentPassword = currentPassword;
        }

        const response = await apiClient.delete(
          `/users/${user?.userId}/delete-store`,
          {
            data: requestBody,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.state === "success") {
          dispatch({
            type: "UPDATE_USER",
            payload: { isStore: false },
          });
          alert("Store deleted successfully!");
          navigate("/myProfile");
        } else {
          console.error("Failed to delete store:", response.data.message);
          alert(
            response.data.message || "Failed to delete store. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error performing store operation:", error);

      // Handle different error scenarios
      if (error.response?.data?.code === "RECENT_AUTH_REQUIRED") {
        alert(
          "Please log out and log back in, then try again within 5 minutes."
        );
      } else if (error.response?.data?.code === "FRESH_AUTH_REQUIRED") {
        alert("Please re-authenticate with Google and try again immediately.");
      } else if (error.response?.data?.code === "CURRENT_PASSWORD_REQUIRED") {
        alert("Current password is required for this operation.");
      } else if (error.response?.data?.code === "UNSUPPORTED_AUTH_PROVIDER") {
        alert(
          "Your authentication method is not supported for this operation. Please contact support."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "An error occurred. Please try again."
        );
      }
    } finally {
      setPendingAction(null);
      setShowReauthModal(false);
    }
  };

  // 5. Add this component for displaying login history
  const LoginHistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Login History & Security Status
          </h2>
          <button
            onClick={() => setShowLoginHistory(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Security Status Summary */}
          {securityStatus && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Security Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${securityStatus.mfaEnabled ? "bg-green-500" : "bg-yellow-500"}`}
                  ></span>
                  <span className="text-sm">
                    MFA: {securityStatus.mfaEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${securityStatus.hasSecurityQuestions ? "bg-green-500" : "bg-red-500"}`}
                  ></span>
                  <span className="text-sm">
                    Security Questions:{" "}
                    {securityStatus.hasSecurityQuestions ? "Set" : "Not Set"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${securityStatus.accountLocked ? "bg-red-500" : "bg-green-500"}`}
                  ></span>
                  <span className="text-sm">
                    Account:{" "}
                    {securityStatus.accountLocked ? "Locked" : "Active"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2 bg-blue-500"></span>
                  <span className="text-sm">
                    Failed Attempts: {securityStatus.failedLoginAttempts}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Last Login Info */}
          {loginHistory && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                Last Login Information
              </h3>
              {loginHistory.lastSuccessfulLogin && (
                <p className="text-sm text-gray-700">
                  <strong>Last Successful Login:</strong>{" "}
                  {new Date(loginHistory.lastSuccessfulLogin).toLocaleString()}
                </p>
              )}
              {loginHistory.failedAttemptsSinceLastSuccess > 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  <strong>⚠️ Warning:</strong>{" "}
                  {loginHistory.failedAttemptsSinceLastSuccess} failed login
                  attempt(s) since your last successful login
                </p>
              )}
              {loginHistory.lastFailedLogin && (
                <p className="text-sm text-red-600 mt-1">
                  <strong>Last Failed Attempt:</strong>{" "}
                  {new Date(loginHistory.lastFailedLogin).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Recent Login History */}
          {loginHistory?.recentLogins && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Recent Login Activity
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date & Time</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Method</th>
                      <th className="text-left p-2">IP Address</th>
                      <th className="text-left p-2">Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.recentLogins.map((login, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {new Date(login.timestamp).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              login.success
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {login.success ? "Success" : "Failed"}
                          </span>
                        </td>
                        <td className="p-2">{login.loginMethod}</td>
                        <td className="p-2">{login.ipAddress}</td>
                        <td
                          className="p-2 truncate max-w-xs"
                          title={login.userAgent}
                        >
                          {login.userAgent?.includes("Chrome")
                            ? "Chrome"
                            : login.userAgent?.includes("Firefox")
                              ? "Firefox"
                              : login.userAgent?.includes("Safari")
                                ? "Safari"
                                : "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const fetchLoginHistory = async () => {
    try {
      const response = await apiClient.get("/auth/login-history");
      if (response.data.state === "success") {
        setLoginHistory(response.data.data);
        setSecurityStatus(response.data.data.securityStatus);
        setPasswordChangeStatus(response.data.data.passwordChangeStatus);
      }
    } catch (error) {
      console.error("Error fetching login history:", error);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchLoginHistory();
    }
  }, [user?.userId]);

  // 4. Add this function to handle password change
  // Update the handlePasswordChange function to return a result:
  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      // Step 1: Re-authenticate the user with their current password
      console.log("🔍 Re-authenticating user with current password...");

      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          message: "User not authenticated",
        };
      }

      // Create credential with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      try {
        // Re-authenticate
        await reauthenticateWithCredential(user, credential);
        console.log("✅ Current password verified successfully");
      } catch (reauthError) {
        console.error("❌ Current password verification failed:", reauthError);
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }

      // Step 2: Call your backend to change password (backend will update Firebase Auth)
      console.log("🔍 Calling backend to change password...");

      const response = await apiClient.post("/auth/change-password", {
        currentPassword, // Still send it even though backend won't verify it
        newPassword,
      });

      if (response.data.state === "success") {
        // Refresh password change status
        fetchLoginHistory();
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to change password",
        };
      }
    } catch (error) {
      console.error("Password change error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "An error occurred while changing password",
      };
    }
  };

  // 🆕 FETCH USER DATA FUNCTION USING apiClient
  const fetchUserData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Fetching user data with apiClient for:", user.userId);

      const response = await apiClient.get(`/users/${user.userId}`);

      console.log("✅ User data fetched:", response.data);
      setUserData(response.data.data); // Extract data from response
    } catch (err) {
      console.error("❌ Error fetching user data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 REPLACE the useDynamicFetch hook with useEffect
  useEffect(() => {
    if (user?.userId) {
      fetchUserData();
    }
  }, [user?.userId]); // Re-fetch when user changes

  // 🆕 REFETCH FUNCTION (to replace refetch from useDynamicFetch)
  const refetchUserData = () => {
    fetchUserData();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (userData?.securityQuestions && userData.securityQuestions.length >= 3) {
      setHasSecurityQuestions(true);
    } else {
      setHasSecurityQuestions(false);
    }
  }, [userData]);

  // Add this function to handle security questions setup
  const handleSecurityQuestionsSuccess = () => {
    setHasSecurityQuestions(true);
    fetchUserData(); // Refresh user data
  };

  // for get verified
  const handleOpenVerificationModal = () => setIsVerificationModalOpen(true);
  const handleCloseVerificationModal = () => setIsVerificationModalOpen(false);
  const handleVerify = () => {
    // Add verification logic here
    console.log("Verification Code:", verificationCode);
    handleCloseVerificationModal();
  };

  useEffect(() => {
    // assign address details
    setAddressDetails({
      fullAddress: userData?.address?.fullAddress,
      streetAddress: userData?.address?.streetAddress,
      barangay: userData?.address?.barangay,
      city: userData?.address?.city,
      province: userData?.address?.province,
      region: userData?.address?.region,
      country: userData?.address?.country,
      postalCode: userData?.address?.postalCode,
      lng: userData?.address?.lng,
      lat: userData?.address?.lat,
    });
  }, [userData]);

  const handleMapClick = async (event) => {
    const latitude = event.detail.latLng.lat;
    const longitude = event.detail.latLng.lng;
    setMarkerPosition({ lat: latitude, lng: longitude });
    console.log("marker clicked:", event.detail.latLng);
    event.map.panTo(event.detail.latLng);
    console.log("marker clicked lat:", event.detail.latLng.lat);
    console.log("marker clicked lng:", event.detail.latLng.lng);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`
      );

      console.log(response.data.results[0]);

      const fullAddress = response.data.results[0].formatted_address;
      const premise = response.data.results[0]?.address_components.find(
        (address) => address.types.includes("premise")
      )?.short_name;
      const plusCode =
        response.data.results[0]?.address_components.find((address) =>
          address.types.includes("plus_code")
        )?.short_name ?? "";
      console.log("PLUS:" + plusCode);
      const street =
        response.data.results[0]?.address_components.find((address) =>
          address.types.includes("route")
        )?.short_name ?? "";
      console.log("STREET:" + street);
      const barangay =
        response.data.results[0]?.address_components.find((address) =>
          address.types.includes("sublocality")
        )?.short_name ?? "";
      console.log("BARANGAY:" + barangay);
      const city =
        response.data.results[0]?.address_components.find((address) =>
          address.types.includes("locality")
        )?.short_name ?? "";
      console.log("CITY:" + city);
      const province =
        response.data.results[0]?.address_components.find((address) =>
          address.types.includes("administrative_area_level_2")
        )?.short_name ?? "";
      console.log("PROVINCE:" + province);
      const region =
        response.data.results[0]?.address_components.find((address) =>
          address.types.includes("administrative_area_level_1")
        )?.short_name ?? "";
      console.log("REGION:" + region);
      const country =
        response.data.results[0]?.address_components.find((address) =>
          address.types.includes("country")
        )?.long_name ?? "";
      console.log("COUNTRY:" + country);
      const postalCode =
        response.data.results[0]?.address_components.find((address) =>
          address.types.includes("postal_code")
        )?.short_name ?? "";
      console.log("POSTAL CODE:" + postalCode);

      const streetAddress = [premise, plusCode, street]
        .filter(Boolean)
        .join(", ");
      console.log("🚀 ~ handleMapClick ~ streetAddress:", streetAddress);

      setAddressDetails({
        fullAddress,
        streetAddress,
        barangay,
        city,
        province,
        region,
        country,
        postalCode,
        lng: longitude,
        lat: latitude,
      });

      document.getElementById("newStreetAddress").value = streetAddress;
      document.getElementById("newProvice").value = province;
      document.getElementById("newRegion").value = region;
      document.getElementById("newCity").value = city;
      document.getElementById("newBarangay").value = barangay;
      document.getElementById("newCountry").value = country;
      document.getElementById("newPostalCode").value = postalCode;
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  };

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (!storedUser) {
  //     navigate("/login");
  //   }
  //   //setIsLoading(false);
  // }, [navigate]);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleStreetAddressChange = (event) => {
    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      streetAddress: event.target.value,
    }));
  };

  const handleProvinceChange = (event) => {
    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      province: event.target.value,
    }));
  };

  const handleRegionChange = (event) => {
    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      region: event.target.value,
    }));
  };

  const handleCityChange = (event) => {
    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      city: event.target.value,
    }));
  };

  const handleBarangayChange = (event) => {
    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      barangay: event.target.value,
    }));
  };

  const handleCountryChange = (event) => {
    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      country: event.target.value,
    }));
  };

  const handlePostalCodeChange = (event) => {
    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      postalCode: event.target.value,
    }));
  };

  useEffect(() => {
    if (!placesLib || !map) return;

    const svc = new placesLib.PlacesService(map);
    // ...
  }, [placesLib, map]);

  useEffect(() => {
    if (!map) return;

    // here you can interact with the imperative maps API
  }, [map]);

  useEffect(() => {
    if (userData != null) {
      console.log("USERDATA: ");
      console.log(userData);
    }
  }, [userData]);

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // You can now use reader.result to get the file data
        console.log("READER");
        console.log(reader.result);
        // Update the user profile picture or perform any other action

        setUserProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAddress = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const address = {
      fullAddress: addressDetails?.fullAddress || "",
      streetAddress: formData.get("newStreetAddress") || "",
      province: formData.get("newProvice") || "",
      region: formData.get("newRegion") || "",
      city: formData.get("newCity") || "",
      barangay: formData.get("newBarangay") || "",
      country: formData.get("newCountry") || "",
      postalCode: formData.get("newPostalCode") || "",
      lng: markerPosition?.lng || 0,
      lat: markerPosition?.lat || 0,
    };

    const data = { address };

    try {
      const response = await apiClient.put(
        `/users/edit-user/${user?.userId}`,
        data
      );
      console.log("Success:", response.data);
      fetchUserData(); // 🆕 Use fetchUserData instead of setRefetch
      handleCancelEdit();
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  };

  //TODO:
  //1. conditionally render page if user is logged in from backend if not, redirect to login page
  //2. display userdata by userData.blahblah and display it in the
  //3. make the edit user profile functionality work with backend endpoint.

  // create the handleSubmit function that gets the value of formData then does an axios.put to the route http://localhost:3000/api/users/edit-user with headers type application json and token given the formdata.
  const handleDelAcc = () => {
    dispatch({ type: "LOGOUT" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const data = {};

    if (userProfilePic !== null) {
      data.userProfilePic = userProfilePic;
    }

    // Check if fields have been changed
    if (formData.get("newName") !== userData?.name) {
      data.name = formData.get("newName") || "";
    }
    if (formData.get("newUsername") !== userData?.userName) {
      data.userName = formData.get("newUsername");
    }
    if (formData.get("newEmail") !== userData?.email) {
      data.email = formData.get("newEmail");
    }
    if (formData.get("newPhoneNumber") !== userData?.phoneNumber) {
      data.phoneNumber = formData.get("newPhoneNumber") || "";
    }
    if (formData.get("newBio") !== userData?.bio) {
      data.bio = formData.get("newBio") || "";
    }

    try {
      const response = await apiClient.put(
        `/users/edit-user/${user?.userId}`,
        data
      );
      console.log("Success:", response.data);
      fetchUserData(); // 🆕 Use fetchUserData instead of setRefetch
      setUserProfilePic(null);
      document.getElementById("modal_editProfile").close();
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="w-full">
      {/* <!-- START OF BANNER --> */}
      <div className="flex flex-col md:flex-row w-full h-auto bg-gradient-to-r from-[#072c1c] to-[#83c763] pt-[6%]">
        {/* <!-- Mobile View: First Row --> */}
        <div className="flex flex-row md:hidden w-full p-6 pt-[8vh]">
          <div className="flex justify-center items-center w-1/3 sm:mb-0">
            <div className="bg-white rounded-full">
              <img
                src={
                  userData.userProfilePic || "../src/assets/MyProfile pic.png"
                }
                alt="Profile Pic"
                className="w-[30vw] h-[30vw] max-w-[162px] max-h-[162px] rounded-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center text-white w-2/3 pl-4">
            <h1 className="text-2xl font-bold font-inter mb-2">
              {userData.name || "Fernando Lopez"}
            </h1>
            <div className="italic mb-2 font-inter text-sm">
              {userData?.address?.fullAddress || "Dasmarinas, Cavite"}
            </div>
            <button
              className="rounded border border-[#D9D9D9] bg-[#D9D9D9] text-[#0C482E] p-2 px-5 mx-[20%] font-inter font-bold transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500"
              onClick={handleOpenVerificationModal}
            >
              Get Verified
            </button>
          </div>
        </div>

        {/* <!-- Mobile View: Second Row --> */}
        <div className="md:hidden flex flex-col p-6 pt-0 text-white">
          <div className="text-justify font-inter text-sm">
            {userData.bio ||
              "Fernando is the proud owner of Pogi Farms where he passionately practices sustainable agriculture. He cultivates organic produce on his expansive land and welcomes visitors for educational farm tours, promoting community engagement and environmental awareness."}
          </div>
        </div>

        {/* <!-- Desktop View --> */}
        <div className="hidden md:flex flex-col md:flex-row md:pl-[3%] p-4 w-full md:w-1/2">
          <div className="flex flex-col items-center text-white mb-4 md:mb-0">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-white rounded-full">
                <img
                  src={
                    userData.userProfilePic || "../src/assets/MyProfile pic.png"
                  }
                  alt="Profile Pic"
                  className="w-[30vw] h-[30vw] max-w-[162px] max-h-[162px] rounded-full object-cover"
                />
              </div>
            </div>
            <div className="mt-4 w-full flex justify-center">
              <button
                className="rounded border border-[#D9D9D9] bg-[#D9D9D9] text-[#0C482E] p-2 px-5 font-inter font-bold transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500"
                onClick={handleOpenVerificationModal}
              >
                Get Verified
              </button>
            </div>
          </div>
          <div className="flex flex-col flex-1 pl-0 md:pl-[4%] pr-0 md:pr-[4%] text-white items-start relative">
            <h1 className="text-2xl md:text-4xl font-bold font-inter mb-2 md:mb-0">
              {userData.name || "Fernando Lopez"}
            </h1>
            <div className="italic mb-2 md:mb-4 font-inter text-sm md:text-base">
              {userData.address?.fullAddress || "Dasmarinas, Cavite"}
            </div>
            <div className="md:mb-6 text-justify font-inter text-sm md:text-base">
              {userData.bio ||
                "Fernando is the proud owner of Pogi Farms where he passionately practices sustainable agriculture. He cultivates organic produce on his expansive land and welcomes visitors for educational farm tours, promoting community engagement and environmental awareness."}
            </div>
          </div>
        </div>

        {/* <!-- Desktop View: Cover Photo --> */}
        <div className="hidden md:flex flex-1 w-full md:w-1/2">
          <img
            src="../src/assets/FarmCover1.jpg"
            alt="Cover Photo"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Security Status Banner */}
      {loginHistory && loginHistory.failedAttemptsSinceLastSuccess > 0 && (
        <div className="w-full bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <strong>Security Alert:</strong> There{" "}
                {loginHistory.failedAttemptsSinceLastSuccess === 1
                  ? "was"
                  : "were"}{" "}
                {loginHistory.failedAttemptsSinceLastSuccess} failed login
                attempt
                {loginHistory.failedAttemptsSinceLastSuccess !== 1
                  ? "s"
                  : ""}{" "}
                on your account since your last successful login.
                <button
                  onClick={() => setShowLoginHistory(true)}
                  className="ml-2 underline hover:text-orange-900 font-medium"
                >
                  View Details
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Login Info Banner */}
      {loginHistory && loginHistory.lastSuccessfulLogin && (
        <div className="w-full bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Last Login:</strong>{" "}
                {new Date(loginHistory.lastSuccessfulLogin).toLocaleString()}
                <button
                  onClick={() => setShowLoginHistory(true)}
                  className="ml-2 underline hover:text-blue-900 font-medium"
                >
                  View All Activity
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseVerificationModal}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <h2 className="text-lg font-bold mb-4 text-left text-gray-600">
              Verify Your Account
            </h2>
            <p className="mb-4 text-gray-600">
              Please check your inbox for verification code sent to{" "}
              <span className="font-bold">{userData.email}</span>
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-auto mb-4 bg-white text-gray-600 font-bold text-center text-2xl"
              placeholder="Enter the 6-digit code"
              maxLength={6}
              pattern="\d{6}"
              inputMode="numeric"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-400 text-white py-2 px-4 rounded transition duration-300 ease-in-out hover:bg-gray-600"
                onClick={handleCloseVerificationModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-900 text-white p-2 px-5 rounded transition duration-300 ease-in-out hover:bg-blue-500"
                onClick={handleVerify}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Questions Warning Banner */}
      {!hasSecurityQuestions && userData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Security Recommendation:</strong> Set up security
                questions to enable password recovery.
                <button
                  onClick={() => setShowSecurityQuestionsModal(true)}
                  className="ml-2 underline hover:text-yellow-900 font-medium"
                >
                  Set up now
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ----- start of body ----- */}
      <div className="w-full min-h-screen bg-gray-200">
        <div className="flex flex-col min-h-screen sm:flex-row w-full max-w-screen-xl mx-auto p-4 bg-gray-200">
          {" "}
          {/* Main container */}
          <div className="w-full sm:w-[15%] p-4">
            {/* Mobile Collapse */}
            <div className="block lg:hidden w-full">
              <button
                onClick={() => setIsCollapseOpen(!isCollapseOpen)}
                className="flex items-center cursor-pointer bg-[#0B472D] text-white p-2 rounded-md w-full text-left mb-3"
              >
                <span className="flex-1">USER PROFILE</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isCollapseOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isCollapseOpen && (
                <div className="bg-[#67B045] text-white p-4 w-auto max-w-md mx-auto">
                  <ul className="space-y-4 text-left lg:pr-11">
                    <li>
                      <a
                        href="#"
                        className="block text-[16px] text-gray-200 underline hover:text-blue-300"
                      >
                        My Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="/myOrders"
                        className="block text-[16px] text-gray-200 hover:text-blue-300"
                      >
                        My Orders
                      </a>
                    </li>
                    {user?.isStore && (
                      <li>
                        <a
                          href="/seller"
                          className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out lg:ml-4"
                        >
                          My Shop
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block w-full">
              <div className="text-lg font-bold text-gray-600 pb-5 text-left flex items-center lg:mb-2 lg:mt-4 lg:ml-4">
                USER PROFILE
              </div>
              <ul className="space-y-4 text-left">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 underline hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out lg:ml-4"
                  >
                    My Profile
                  </a>
                </li>
                <li>
                  <a
                    href="/myOrders"
                    className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out lg:ml-4"
                  >
                    My Orders
                  </a>
                </li>
                {user?.isStore && (
                  <li>
                    <a
                      href="/seller"
                      className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out lg:ml-4"
                    >
                      My Shop
                    </a>
                  </li>
                )}
                <li>
                  <button
                    className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                    onClick={() => navigate("/enable-mfa", { state: { user } })}
                  >
                    Enable Multi-Factor Authentication (MFA)
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full sm:w-[85%] px-4 lg:pb-12">
            {" "}
            {/* Right div */}
            <div className="text-lg font-bold mb-3 text-left text-gray-600 lg:my-5 lg:pb-3 lg:mt-8">
              My Profile
            </div>
            <div className="bg-white p-4 md:p-6 lg:p-8 rounded shadow-md w-full max-w-full mx-auto overflow-auto">
              {" "}
              {/* white background */}
              <div className="flex items-center mb-3">
                {" "}
                {/* container for location icon and text */}
                <img
                  src={LocationIcon}
                  alt="Location"
                  className="w-[20px] h-[20px] mr-2"
                />
                <div className="font-inter text-[15px] text-[#737373]">
                  Delivery Address
                </div>
              </div>
              {/* <Map
                mapId="profileMap"
                defaultZoom={13}
                defaultCenter={{ lat: 14.3879953, lng: 120.9879423 }}
                onClick={handleMapClick}
                onCameraChanged={(ev) => {
                  console.log(
                    "camera changed:",
                    ev.detail.center,
                    "zoom:",
                    ev.detail.zoom
                  );
                }}
                options={{
                  gestureHandling: "greedy",
                  zoomControl: true,
                  fullscreenControl: false,
                  mapTypeControl: false,
                  scaleControl: true,
                  streetViewControl: false,
                  rotateControl: true,
                }}
                style={{ width: "100%", height: "400px" }}
              >
                <Marker position={markerPosition} />
              </Map> */}
              {editing ? (
                <div className="bg-white p-5 mb-5">
                  <h2 className="text-lg text-left font-bold text-gray-600">
                    Edit Location
                  </h2>
                  <form onSubmit={handleSubmitAddress} className="space-y-4">
                    <div className="flex space-x-4 mb-2 mt-5">
                      <label
                        htmlFor="newLocation"
                        className="w-full text-sm font-medium text-gray-600 text-left"
                      >
                        Full Address
                      </label>
                    </div>
                    <div className="flex flex-col my-2">
                      <div className="bg-gray-200 text-gray-800 p-2 rounded">
                        {addressDetails.fullAddress ||
                          userData?.address?.fullAddress ||
                          "No address selected"}
                      </div>
                    </div>
                    <div className="flex space-x-4 mb-2 mt-5">
                      <label
                        htmlFor="newStreetAddress"
                        className="w-full text-sm font-medium text-gray-600 text-left"
                      >
                        Street Address
                      </label>
                    </div>
                    <div className="flex flex-col my-2">
                      <input
                        type="text"
                        id="newStreetAddress"
                        name="newStreetAddress"
                        defaultValue={userData?.address?.streetAddress}
                        required
                        onChange={handleStreetAddressChange}
                        className="input input-bordered bg-gray-200 text-gray-800"
                      />
                    </div>
                    <div className="flex space-x-4 mb-2 mt-5">
                      <label
                        htmlFor="newProvice"
                        className="w-full text-sm font-medium text-gray-600 text-left"
                      >
                        Province
                      </label>
                      <label
                        htmlFor="newRegion"
                        className="w-full text-sm font-medium text-gray-600 text-left"
                      >
                        Region
                      </label>
                      <label
                        htmlFor="newCity"
                        className="w-full text-sm font-medium text-gray-600 text-left"
                      >
                        City
                      </label>
                    </div>
                    <div className="flex space-x-4 mb-2">
                      <input
                        type="text"
                        id="newProvice"
                        name="newProvice"
                        required
                        defaultValue={userData?.address?.province}
                        onChange={handleProvinceChange}
                        className="w-full input input-bordered bg-gray-200 text-gray-800"
                      />
                      <input
                        type="text"
                        id="newRegion"
                        name="newRegion"
                        required
                        defaultValue={userData?.address?.region}
                        onChange={handleRegionChange}
                        className="w-full input input-bordered bg-gray-200 text-gray-800"
                      />
                      <input
                        type="text"
                        id="newCity"
                        name="newCity"
                        required
                        defaultValue={userData?.address?.city}
                        onChange={handleCityChange}
                        className="w-full input input-bordered bg-gray-200 text-gray-800"
                      />
                    </div>
                    <div className="flex space-x-4 mb-2 mt-5">
                      <label
                        htmlFor="newBarangay"
                        className="w-full text-sm font-medium text-gray-600 text-left"
                      >
                        Barangay
                      </label>
                    </div>
                    <div className="flex flex-col my-2">
                      <input
                        type="text"
                        id="newBarangay"
                        name="newBarangay"
                        defaultValue={userData?.address?.barangay}
                        required
                        onChange={handleBarangayChange}
                        className="input input-bordered bg-gray-200 text-gray-800"
                      />
                    </div>
                    <div className="flex space-x-4 mb-2 mt-5">
                      <label
                        htmlFor="newCountry"
                        className="w-full text-sm font-medium text-gray-600 text-left"
                      >
                        Country
                      </label>
                      <label
                        htmlFor="newPostalCode"
                        className="w-full text-sm font-medium text-gray-600 text-left"
                      >
                        Postal Code
                      </label>
                    </div>
                    <div className="flex space-x-4 mb-2">
                      <input
                        type="text"
                        id="newCountry"
                        name="newCountry"
                        required
                        defaultValue={userData?.address?.country}
                        onChange={handleCountryChange}
                        className="w-full input input-bordered bg-gray-200 text-gray-800"
                      />
                      <input
                        type="text"
                        id="newPostalCode"
                        name="newPostalCode"
                        required
                        defaultValue={userData?.address?.postalCode}
                        onChange={handlePostalCodeChange}
                        className="w-full input input-bordered bg-gray-200 text-gray-800"
                      />
                    </div>
                    <div className="flex justify-end space-x-4 mb-2 w-full">
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-sm bg-gray-200 text-[#737373] rounded border border-gray-300 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="Submit"
                        className="btn btn-sm bg-green-900 rounded text-white hover:bg-blue-500 border-none px-5"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div
                  className="mt-2 p-2 cursor-pointer hover:bg-gray-100"
                  onClick={handleEditToggle}
                >
                  <div className="font-inter p-2 text-[15px] text-[#737373]">
                    Edit Location
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white p-10 pt-0 rounded shadow-md">
              {" "}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-600">
                  Personal Information
                </h2>
                <button
                  className="relative overflow-hidden flex"
                  onClick={() =>
                    document.getElementById("modal_editProfile").showModal()
                  }
                >
                  {" "}
                  {/* edit button */}
                  <span className="absolute inset-0 opacity-0 hover:opacity-100"></span>
                  <img
                    src="../../src/assets/edit button.png"
                    alt="Edit"
                    className="w-6 h-6 mr-2"
                  />
                  <img
                    src="../../src/assets/edit button hover.png"
                    alt="Edit"
                    className="w-6 h-6 mr-2 opacity-0 hover:opacity-100  absolute inset-0"
                  />
                </button>

                <dialog
                  id="modal_editProfile"
                  className="modal fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
                >
                  <div className="modal-box w-full max-w-lg bg-white shadow-lg rounded-md p-6 overflow-auto relative">
                    <button
                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      onClick={() =>
                        document.getElementById("modal_editProfile").close()
                      }
                    >
                      ✕
                    </button>
                    <h3 className="text-lg font-bold text-gray-600 text-left pb-5">
                      Edit Profile
                    </h3>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-4 px-4 sm:px-6 lg:px-8"
                    >
                      {/* Profile Picture */}
                      <div className="flex flex-col items-center mb-6">
                        <label
                          htmlFor="profilePicture"
                          className="text-sm font-medium text-gray-600 cursor-pointer text-left w-full"
                        >
                          Change Profile Picture
                        </label>
                        <img
                          src={userData.userProfilePic}
                          alt="Profile Picture"
                          className="w-28 h-28 rounded-full object-cover mb-4"
                        />
                        <input
                          type="file"
                          id="profilePicture"
                          name="profilePicture"
                          accept="image/*"
                          className="mt-2"
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* Name */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="newName"
                          className="text-sm font-medium text-gray-600 text-left"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="newName"
                          name="newName"
                          defaultValue={userData?.name}
                          className="input input-bordered bg-gray-200 text-gray-800 w-full"
                        />
                      </div>

                      {/* Username */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="newUsername"
                          className="text-sm font-medium text-gray-600 text-left"
                        >
                          Username
                        </label>
                        <input
                          type="text"
                          id="newUsername"
                          name="newUsername"
                          defaultValue={userData?.userName}
                          className="input input-bordered bg-gray-200 text-gray-800 w-full"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="newEmail"
                          className="text-sm font-medium text-gray-600 text-left"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="newEmail"
                          name="newEmail"
                          defaultValue={userData?.email}
                          className="input input-bordered bg-gray-200 text-gray-800 w-full"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="newPhoneNumber"
                          className="text-sm font-medium text-gray-600 text-left"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="newPhoneNumber"
                          pattern="(\+63|0)[1-9][0-9]{9}"
                          name="newPhoneNumber"
                          defaultValue={userData?.phoneNumber}
                          className="input input-bordered bg-gray-200 text-gray-800 w-full"
                        />
                      </div>

                      {/* Bio */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="newBio"
                          className="text-sm font-medium text-gray-600 text-left"
                        >
                          Bio
                        </label>
                        <textarea
                          id="newBio"
                          name="newBio"
                          defaultValue={userData?.bio}
                          className="input input-bordered bg-gray-200 text-gray-800 resize-none w-full h-auto py-2"
                          rows="8"
                        ></textarea>
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          type="button"
                          className="btn btn-sm bg-gray-500 rounded text-white hover:bg-red-500 border-none w-auto h-auto"
                          onClick={() =>
                            document.getElementById("modal_editProfile").close()
                          }
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-sm bg-green-900 rounded text-white hover:bg-blue-500 border-none w-auto h-auto"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </dialog>
              </div>
              <div className="flex flex-col lg:flex-row lg:space-x-8 p-4 px-0">
                {/* Right side with profile pic */}
                <div className="w-full lg:w-1/4 flex flex-col items-center justify-center mb-4 lg:mb-0">
                  <img
                    src={userData.userProfilePic}
                    alt="Profile Picture"
                    className="w-28 h-28 lg:w-44 lg:h-44 rounded-full object-cover"
                  />
                </div>

                {/* Table for forms */}
                <div className="w-full lg:w-3/4 overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                      <table className="table-auto min-w-full divide-y divide-gray-200">
                        <tbody>
                          <tr>
                            <td className="text-left text-gray-500 pl-2 md:pl-4 pb-2 font-medium whitespace-nowrap">
                              Name:
                            </td>
                            <td className="text-left px-2 md:px-4 pb-2 break-words">
                              {userData?.name}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left text-gray-500 pl-2 md:pl-4 pb-2 font-medium whitespace-nowrap">
                              Username:
                            </td>
                            <td className="text-left px-2 md:px-4 pb-2 break-words">
                              {userData?.userName}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left text-gray-500 pl-2 md:pl-4 pb-2 font-medium whitespace-nowrap">
                              Email:
                            </td>
                            <td className="text-left px-2 md:px-4 pb-2 break-words">
                              {userData?.email}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left text-gray-500 pl-2 md:pl-4 pb-2 font-medium whitespace-nowrap">
                              Phone Number:
                            </td>
                            <td className="text-left px-2 md:px-4 pb-2 break-words">
                              {userData?.phoneNumber}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left text-gray-500 pl-2 md:pl-4 pb-2 font-medium whitespace-nowrap">
                              Location:
                            </td>
                            <td className="text-left px-2 md:px-4 pb-2 break-words">
                              {userData?.address?.fullAddress}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left text-gray-500 pl-2 md:pl-4 pb-2 font-medium align-top whitespace-nowrap">
                              Bio:
                            </td>
                            <td className="text-left px-2 md:px-4 pb-2">
                              <div className="bio-content overflow-auto md:overflow-visible max-h-[200px] md:max-h-none">
                                {userData?.bio}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              {/* ------ Account Settings Section ------  */}
              <div className="w-1/4 mt-8">
                <h2 className="text-lg font-bold text-gray-600 text-left pb-5 whitespace-nowrap">
                  Account Settings
                </h2>
                <ul className="space-y-4 text-left pl-8 pb-2">
                  {/* ------------- View Login History ------------ */}
                  <li>
                    <button
                      className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded flex items-center"
                      onClick={() => setShowLoginHistory(true)}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      View Login History
                    </button>
                  </li>

                  {/* ------------- Change Password (Enhanced) ------------ */}
                  <li>
                    <button
                      className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      Change Password
                    </button>
                  </li>

                  {/* ------------- Security Questions Setup ------------ */}
                  <li>
                    <button
                      className={`text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded ${
                        hasSecurityQuestions ? "flex items-center" : ""
                      }`}
                      onClick={() => setShowSecurityQuestionsModal(true)}
                    >
                      {hasSecurityQuestions ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-2 text-green-600"
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
                          Update Security Questions
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          Set Up Security Questions
                        </>
                      )}
                    </button>
                  </li>

                  {/* ------------- Delete Account ------------ */}
                  <li>
                    <button
                      className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                      onClick={() =>
                        document.getElementById("modal_DeleteAcc").showModal()
                      }
                    >
                      Delete Account
                    </button>
                    <dialog id="modal_DeleteAcc" className="modal">
                      <div className="modal-box w-8/12 max-w-md p-6 bg-white shadow-lg rounded-md">
                        <button
                          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                          onClick={() =>
                            document.getElementById("modal_DeleteAcc").close()
                          }
                        >
                          ✕
                        </button>
                        <h3 className="text-lg font-bold text-gray-600 text-left pb-5">
                          Delete Account
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Are you sure you want to delete your account? This
                          action cannot be undone.
                        </p>
                        <form
                          method="dialog"
                          className="space-y-4"
                          onSubmit={handleDelAcc}
                        >
                          <div className="flex flex-col">
                            <input
                              type="text"
                              id="confirmation"
                              name="confirmation"
                              className="input input-bordered bg-gray-200 text-gray-800 border-gray-300 focus:border-red-500 mb-2"
                              required
                              onFocus={() => {
                                document
                                  .getElementById("confirmation")
                                  .classList.add("border-red-500");
                              }}
                              onBlur={() => {
                                document
                                  .getElementById("confirmation")
                                  .classList.remove("border-red-500");
                              }}
                              onInput={() => {
                                const input =
                                  document.getElementById("confirmation");
                                const deleteBtn =
                                  document.getElementById("deleteBtn");
                                deleteBtn.disabled = input.value !== "CONFIRM";
                              }}
                            />
                            <label
                              htmlFor="confirmation"
                              className="text-sm text-gray-600 text-center pb-auto"
                            >
                              Please type{" "}
                              <span className="font-bold">"CONFIRM"</span> to
                              continue deleting your account
                            </label>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none w-auto h-auto"
                              onClick={() =>
                                document
                                  .getElementById("modal_DeleteAcc")
                                  .close()
                              }
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              id="deleteBtn"
                              className="btn btn-sm bg-red-500 rounded text-white hover:bg-red-600 border-none w-auto h-auto"
                              disabled
                            >
                              Delete
                            </button>
                          </div>
                        </form>
                      </div>
                    </dialog>

                    {/* ------------- Delete Shop ------------ */}
                  </li>
                  <li>
                    {user?.isStore ? (
                      <button
                        className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                        onClick={handleDeleteStore}
                      >
                        Delete Shop
                      </button>
                    ) : (
                      <button
                        className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                        onClick={handleCreateStore}
                      >
                        Create Store
                      </button>
                    )}
                    <dialog id="modal_DeleteShop" className="modal">
                      <div className="modal-box w-8/12 max-w-md p-6 bg-white shadow-lg rounded-md">
                        <button
                          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                          onClick={() =>
                            document.getElementById("modal_DeleteShop").close()
                          }
                        >
                          ✕
                        </button>
                        <h3 className="text-lg font-bold text-gray-600 text-left pb-5">
                          Delete Shop
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Are you sure you want to delete{" "}
                          <span className="font-bold">Pogi Farms</span>? This
                          action cannot be undone.
                        </p>
                        <form method="dialog" className="space-y-4">
                          <div className="flex flex-col">
                            <input
                              type="text"
                              id="confirmationShop"
                              name="confirmation"
                              className="input input-bordered bg-gray-200 text-gray-800 border-gray-300 focus:border-red-500 mb-2"
                              required
                              onFocus={() => {
                                document
                                  .getElementById("confirmationShop")
                                  .classList.add("border-red-500");
                              }}
                              onBlur={() => {
                                document
                                  .getElementById("confirmationShop")
                                  .classList.remove("border-red-500");
                              }}
                              onInput={() => {
                                const input =
                                  document.getElementById("confirmationShop");
                                const deleteBtnShop =
                                  document.getElementById("deleteBtnShop");
                                deleteBtnShop.disabled =
                                  input.value !== "CONFIRM";
                              }}
                            />
                            <label
                              htmlFor="confirmation"
                              className="text-sm text-gray-600 text-center pb-5"
                            >
                              Please type{" "}
                              <span className="font-bold">"CONFIRM"</span> to
                              continue deleting your account
                            </label>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none px-4 w-auto h-auto"
                              onClick={() =>
                                document
                                  .getElementById("modal_DeleteShop")
                                  .close()
                              }
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              id="deleteBtnShop"
                              className="btn btn-sm bg-red-500 rounded text-white hover:bg-red-600 border-none px-5 w-auto h-auto"
                              disabled
                              onClick={() => console.log("Delete logic here")}
                            >
                              Delete
                            </button>
                          </div>
                        </form>
                      </div>
                    </dialog>
                  </li>

                  {/* ------------- Log Out ------------ */}
                  <li>
                    <button
                      className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                      onClick={() =>
                        document.getElementById("modal_Logout").showModal()
                      }
                    >
                      Log Out
                    </button>
                    <dialog id="modal_Logout" className="modal">
                      <div className="modal-box w-10/12 max-w-lg p-6 bg-white shadow-lg rounded-md">
                        <button
                          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                          onClick={() =>
                            document.getElementById("modal_Logout").close()
                          }
                        >
                          ✕
                        </button>
                        <h3 className="text-lg font-bold text-gray-600 text-left pb-5">
                          Log Out
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Are you sure you want to log out?
                        </p>

                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none w-auto h-auto"
                            onClick={() =>
                              document.getElementById("modal_Logout").close()
                            }
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm bg-blue-500 rounded text-white hover:bg-red-600 border-none w-auto h-auto"
                            onClick={() => {
                              dispatch({ type: "LOGOUT" });
                              navigate("/");
                            }}
                          >
                            Log Out
                          </button>
                        </div>
                      </div>
                    </dialog>
                  </li>
                </ul>
              </div>{" "}
              {/* END of Account Settings Section  */}
            </div>
          </div>
        </div>
        {/* Security Questions Modal */}
        {showSecurityQuestionsModal && (
          <SecurityQuestionsSetup
            onClose={() => setShowSecurityQuestionsModal(false)}
            onSuccess={handleSecurityQuestionsSuccess}
          />
        )}
      </div>
      {/* Login History Modal */}
      {showLoginHistory && <LoginHistoryModal />}
      <ReauthModal
        isOpen={showReauthModal}
        onClose={() => {
          setShowReauthModal(false);
          setPendingAction(null);
        }}
        onSuccess={handleReauthSuccess}
        title={
          pendingAction === "createStore"
            ? "Confirm Store Creation"
            : pendingAction === "deleteStore"
              ? "Confirm Store Deletion"
              : "Confirm Your Identity"
        }
      />

      <PasswordChangeModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        passwordChangeStatus={passwordChangeStatus}
        onPasswordChange={handlePasswordChange}
      />
    </div>
  );
};

export default MyProfile;
