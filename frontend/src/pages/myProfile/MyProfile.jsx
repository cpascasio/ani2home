import useFetch from "../../../hooks/useFetch.js";
import { useUser } from "../../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useMap, Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Autocomplete } from "@react-google-maps/api";
import LocationIcon from "../../assets/location.png"; // Path to the location icon
import useDynamicFetch from "../../../hooks/useDynamicFetch.js";

const MyProfile = () => {
  const userLog = localStorage.getItem("user");
  const { user, dispatch } = useUser();
  const [editing, setEditing] = useState(false);
  const placesLib = useMapsLibrary("places");

  const [refetch, setRefetch] = useState(false);

  const { data: userFetch } = useDynamicFetch(
    `/api/users/${user?.userId}`,
    refetch
  );
  const [userData, setUserData] = useState({});
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

  // for verification
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    }
    //setIsLoading(false);
  }, [navigate]);

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
    if (userFetch != null) {
      setUserData(userFetch.data);
      //setUserProfilePic(userFetch?.data?.userProfilePic);
      console.log(userFetch.data);
    }
  }, [userFetch]);

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
    event.preventDefault(); // Prevent the default form submission behavior

    // Collect form data
    const formData = new FormData(event.target);

    // Create an object to hold form values
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

    // Get the token from localStorage or any other source
    const token = user?.token; // Replace with your actual token retrieval method

    try {
      const response = await axios.put(
        `http://localhost:3000/api/users/edit-user/${user?.userId}`, // Include userId in the URL
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
      console.log("Success:", response.data);
      setRefetch((prev) => !prev);
      handleCancelEdit();
      // Handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      // Handle error (e.g., show an error message)
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

    // Collect form data
    const formData = new FormData(event.target);

    // Create an object to hold form values
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

    // Get the token from localStorage or any other source
    const token = user?.token;

    try {
      const response = await axios.put(
        `http://localhost:3000/api/users/edit-user/${user?.userId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Success:", response.data);
      setRefetch((prev) => !prev);
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
                  {/* ------------- Change Password ------------ */}
                  <li>
                    <button
                      className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                      onClick={() =>
                        document.getElementById("modal_ChangePass").showModal()
                      }
                    >
                      Change Password
                    </button>
                    <dialog id="modal_ChangePass" className="modal">
                      <div className="modal-box w-11/12 max-w-lg p-6 bg-white shadow-lg rounded-md">
                        <button
                          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                          onClick={() =>
                            document.getElementById("modal_ChangePass").close()
                          }
                        >
                          ✕
                        </button>
                        <h3 className="text-lg font-bold text-gray-600 text-left pb-5">
                          Change Password
                        </h3>
                        <form method="dialog" className="space-y-4">
                          <div className="flex flex-col">
                            <label
                              htmlFor="oldPassword"
                              className="text-sm font-medium text-gray-600"
                            >
                              Old Password
                            </label>
                            <input
                              type="password"
                              id="oldPassword"
                              name="oldPassword"
                              className="input input-bordered bg-gray-200 text-gray-800"
                              required
                            />
                          </div>
                          <div className="flex flex-col">
                            <label
                              htmlFor="newPassword"
                              className="text-sm font-medium text-gray-600"
                            >
                              New Password
                            </label>
                            <input
                              type="password"
                              id="newPassword"
                              name="newPassword"
                              className="input input-bordered bg-gray-200 text-gray-800"
                              required
                            />
                          </div>
                          <div className="flex flex-col">
                            <label
                              htmlFor="confirmPassword"
                              className="text-sm font-medium text-gray-600"
                            >
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              className="input input-bordered bg-gray-200 text-gray-800"
                              required
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              className="btn btn-sm bg-gray-500 rounded text-white hover:bg-red-500 border-none flex items-center justify-center w-auto h-auto"
                              onClick={() =>
                                document
                                  .getElementById("modal_ChangePass")
                                  .close()
                              }
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn btn-sm bg-green-900 rounded text-white hover:bg-blue-500 border-none flex items-center justify-center w-auto h-auto"
                              onClick={() => console.log("Save logic here")}
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </div>
                    </dialog>
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
                        onClick={() =>
                          document
                            .getElementById("modal_DeleteShop")
                            .showModal()
                        }
                      >
                        Delete Shop
                      </button>
                    ) : (
                      <button
                        className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                        onClick={async () => {
                          try {
                            // Call the set-store endpoint
                            const response = await axios.put(
                              `http://localhost:3000/api/users/${user?.userId}/set-store`,
                              {}, // Empty body since we're just updating a field
                              {
                                headers: {
                                  Authorization: `Bearer ${user?.token}`, // Include auth token
                                },
                              }
                            );

                            if (response.data.state === "success") {
                              // Update local user context if needed
                              dispatch({
                                type: "UPDATE_USER",
                                payload: { isStore: true },
                              });

                              // Navigate to seller page
                              navigate("/seller");
                            } else {
                              console.error(
                                "Failed to update store status:",
                                response.data.message
                              );
                              alert(
                                "Failed to create store. Please try again."
                              );
                            }
                          } catch (error) {
                            console.error("Error creating store:", error);
                            alert(
                              "An error occurred while creating your store."
                            );
                          }
                        }}
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
      </div>
    </div>
  );
};

export default MyProfile;
