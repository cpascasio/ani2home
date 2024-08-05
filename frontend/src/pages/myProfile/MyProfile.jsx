
import useFetch from "../../../hooks/useFetch.js";
import { useUser } from "../../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useMap, Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Autocomplete } from "@react-google-maps/api";
import LocationIcon from '../../assets/location.png'; // Path to the location icon

const MyProfile = () => {
  const userLog = localStorage.getItem("user");

  const [editing, setEditing] = useState(false);

  const placesLib = useMapsLibrary("places");

  const { user } = useUser();

  const { data: userFetch } = useFetch(`/api/users/${user?.userId}`);

  const [userData, setUserData] = useState({});

  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();

  const map = useMap();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");


  const [markerPosition, setMarkerPosition] = useState(null);
  const [addressDetails, setAddressDetails] = useState({});

  const autocompleteContainerRef = useRef(null);

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

      const streetAddress = [premise, plusCode, street].filter(Boolean).join(', ');
      console.log("🚀 ~ handleMapClick ~ streetAddress:", streetAddress)
      

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

      document.getElementById('newStreetAddress').value = streetAddress;
      document.getElementById('newProvice').value = province;
      document.getElementById('newRegion').value = region;
      document.getElementById('newCity').value = city;
      document.getElementById('newBarangay').value = barangay;
      document.getElementById('newCountry').value = country;
      document.getElementById('newPostalCode').value = postalCode;

    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  };

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

  const handleClick = useCallback((ev) => {
    if (!ev) return;
    console.log("marker clicked:", ev.detail.latLng);
    const lat = ev.detail.latLng.lat;
    const lng = ev.detail.latLng.lng;
    setMarkerPosition({ lat, lng });
    ev.map.panTo(ev.detail.latLng);
  }, []);

  useEffect(() => {
    if (!map) return;

    // here you can interact with the imperative maps API
  }, [map]);

  useEffect(() => {
    console.log(user);
  }, []);

  useEffect(() => {
    if (userLog != null) {
      console.log(user);
    } else {
      navigate("/login");
    }
  }, [userLog]);

  useEffect(() => {
    if (userFetch != null) {
      setUserData(userFetch.data);
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
      // Handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      // Handle error (e.g., show an error message)
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Collect form data
    const formData = new FormData(event.target);

    // Create an object to hold form values
    const data = {};

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
      // Handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div className="w-full">
      <div className="flex w-full h-auto bg-gradient-to-r from-green-900">
        {" "}
        {/*banner */}
        <div className="flex flex-1 pl-[3%] pt-[2%] pb-[2%]">
          {" "}
          {/*banner left side */}
          <div className="flex flex-col items-center text-white">
            {" "}
            {/*box for logo and stats*/}
            <div className="flex justify-center items-center mb-4">
              <div className="bg-white rounded-full">
                {" "}
                {/* White background */}
                <img
                  src={userData.userProfilePic}
                  alt="Profile Pic"
                  className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover"
                />
              </div>
            </div>
            <div className="mt-[5%]">
              {" "}
              {/*stats box */}
              <div className="flex items-center mb-2">
                {" "}
                {/*followers */}
                <div className="mr-2">
                  <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                </div>
                <div className="text-left font-inter">
                  <strong>Followers:</strong> {userData.followers}
                </div>
              </div>
              <div className="flex items-center mb-2">
                {" "}
                {/*ratings */}
                <div className="mr-2">
                  <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
                </div>
                <div className="text-left font-inter">
                  <strong>Rating:</strong> 4.4 (1,304)
                </div>
              </div>
              <div className="flex items-center mb-2">
                {" "}
                {/*products */}
                <div className="mr-2">
                  <img src="../src/assets/ProductsIcon.png" alt="Products" />
                </div>
                <div className="text-left font-inter">
                  <strong>Products:</strong> 67
                </div>
              </div>
            </div>
          </div>{" "}
          {/*end of box for logo and stats */}
          <div className="flex flex-col flex-1 pl-[4%] pr-[4%] text-white items-start relative">
            {" "}
            {/*Name, Location, Bio, Buttons */}
            <h1 className="text-4xl font-bold font-inter mb-0">
              {userData.name}
            </h1>
            <div className="italic mb-4 font-inter">
              {userData?.address?.fulladdress}
            </div>
            <div className="mb-6 text-justify font-inter">
              {" "}
              {/*CHARACTERS MAXIMUM: 439 */}
              {userData.bio}
            </div>
            <button
              className="absolute bottom-0 right-0 rounded border border-[#D9D9D9] bg-[#D9D9D9] text-[#0C482E] p-2 px-5 font-inter font-bold mr-7 
                        transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500"
            >
              Get Verified
            </button>
          </div>{" "}
          {/*end of name etc of user profile */}
        </div>{" "}
        {/*banner left side end*/}
        <div className="flex flex-1 w-full">
          {" "}
          {/*banner right side */}
          {/* should insert cover photo here --> use FarmCover1.jpg */}
        </div>{" "}
        {/*banner right side end*/}
      </div>{" "}
      {/*banner end*/}
      {/* ----- start of body ----- */}
      <div className="px-40 bg-gray-200">
        {" "}
        {/*main container for body*/}
        <div className="flex">
          {" "}
          {/* Main div with left and right child divs */}
          <div className="w-40% pr-40 pt-20">
            {" "}
            {/* Left div */}
            <div className="text-lg font-bold mb-2 text-gray-600 pb-5">
              USER PROFILE
            </div>
            <ul className="space-y-4 text-left">
              <li>
                <a
                  href="#"
                  className="text-gray-600 underline hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out"
                >
                  My Profile
                </a>
              </li>
              <li>
                <a
                  href="/myOrders"
                  className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out"
                >
                  My Orders
                </a>
              </li>
              <li>
                <a
                  href="/myShop"
                  className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out"
                >
                  My Shop
                </a>
              </li>
            </ul>
          </div>
          <div className="flex-1 pt-20">
            {" "}
            {/* Right div */}
            <div className="text-lg font-bold mb-2 text-left text-gray-600 pb-5">
              My Profile
            </div>
            <div className="bg-white w-full h-[auto] p-4"> {/* white box with padding */}
            <div className="flex items-center mb-3"> {/* container for location icon and text */}
              <img src={LocationIcon} alt="Location" className="w-[20px] h-[20px] mr-2" />
              <div className="font-inter text-[15px] text-[#737373]">Delivery Address</div>
            </div>
            <Map
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
            </Map>
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
                      {addressDetails.fullAddress || userData?.address?.fullAddress || 'No address selected'}
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
                <div className="font-inter p-2 text-[15px] text-[#737373]">Edit Location</div>
              </div>
            )}
          </div>
            <div className="bg-white p-10 rounded shadow-md">
              {" "}
              {/* white background */}
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex flex-col items-center mb-6">
                        <label
                          htmlFor="profilePicture"
                          className="text-sm font-medium text-gray-600 mt-2 cursor-pointer text-left pb-4 w-full"
                        >
                          Change Profile Picture
                        </label>
                        <img
                          src={userData.userProfilePic}
                          alt="Profile Picture"
                          className="w-28 h-auto rounded-full object-cover mb-4"
                        />
                        <input
                          type="file"
                          id="profilePicture"
                          name="profilePicture"
                          accept="image/*"
                          className="mt-2"
                          onChange={(e) => {
                            // Handle file upload here
                            console.log(e.target.files[0]);
                          }}
                        />
                      </div>
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
                          required
                          defaultValue={userData?.name}
                          className="input input-bordered bg-gray-200 text-gray-800"
                        />
                      </div>
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
                          required
                          defaultValue={userData?.userName}
                          className="input input-bordered bg-gray-200 text-gray-800"
                        />
                      </div>
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
                          required
                          defaultValue={userData?.email}
                          className="input input-bordered bg-gray-200 text-gray-800"
                        />
                      </div>
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
                          required
                          defaultValue={userData?.phoneNumber}
                          className="input input-bordered bg-gray-200 text-gray-800"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor="newBio"
                          className="text-sm font-medium text-gray-600 text-left"
                        >
                          Bio
                        </label>
                        <input
                          type="textarea"
                          id="newBio"
                          name="newBio"
                          required
                          defaultValue={userData?.bio}
                          className="input input-bordered bg-gray-200 text-gray-800"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          type="button"
                          className="btn btn-sm bg-gray-500 rounded text-white hover:bg-red-500 border-none px-4"
                          onClick={() =>
                            document.getElementById("modal_editProfile").close()
                          }
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-sm bg-green-900 rounded text-white hover:bg-blue-500 border-none px-5"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </dialog>
              </div>
              <div className="flex space-x-8">
                {" "}
                {/* container for flex */}
                <div className="w-3/4">
                  <table className="table-auto w-full">
                    {" "}
                    {/* table for forms */}
                    <tbody>
                      <tr>
                        <td className="text-left text-gray-500 pl-8 pb-2 font-medium min-w-40">
                          Name:
                        </td>
                        <td className="text-left px-8 pb-2">
                          {userData?.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left text-gray-500 pl-8 pb-2 font-medium">
                          Username:
                        </td>
                        <td className="text-left px-8 pb-2">
                          {userData?.userName}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left text-gray-500 pl-8 pb-2 font-medium">
                          Email:
                        </td>
                        <td className="text-left px-8 pb-2">
                          {userData?.email}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left text-gray-500 pl-8 pb-2 font-medium w-100">
                          Phone Number:
                        </td>
                        <td className="text-left px-8 pb-2">
                          {userData?.phoneNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left text-gray-500 pl-8 pb-2 font-medium">
                          Location:
                        </td>
                        <td className="text-left px-8 pb-2">
                          {userData?.address?.fullAddress}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left text-gray-500 pl-8 pb-2 font-medium align-top">
                          Bio:
                        </td>
                        <td className="text-justify px-8 pb-2">
                          {userData?.bio}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>{" "}
                {/* end of table for forms */}
                <div className="w-1/4 flex flex-col items-center justify-center">
                  {" "}
                  {/* right side with prof pic and buttons */}
                  <img
                    src={userData.userProfilePic}
                    alt="Profile Picture"
                    className="w-28 h-28 rounded-full object-cover mb-12"
                  />
                </div>{" "}
                {/* end of box for prof pic and buttons */}
              </div>{" "}
              {/* end of flex box */}
              {/* ------ Account Settings Section ------  */}
              <div className="w-1/4 mt-8">
                <h2 className="text-lg font-bold text-gray-600 text-left pb-5">
                  Account Settings
                </h2>
                <ul className="space-y-4 text-left pl-8 pb-2">
                  {/* ------------- Change Password ------------ */}
                  <li>
                    <button
                      className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out"
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
                              className="btn btn-sm bg-gray-500 rounded text-white hover:bg-red-500 border-none px-4"
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
                              className="btn btn-sm bg-green-900 rounded text-white hover:bg-blue-500 border-none px-5"
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
                      className="text-gray-600 hover:text-red-500 hover:font-bold transition duration-800 ease-in-out"
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
                        <form method="dialog" className="space-y-4">
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
                              className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none px-4"
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
                              className="btn btn-sm bg-red-500 rounded text-white hover:bg-red-600 border-none px-5"
                              disabled
                              onClick={() => console.log("Delete logic here")}
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
                    <button
                      className="text-gray-600 hover:text-red-500 hover:font-bold transition duration-800 ease-in-out"
                      onClick={() =>
                        document.getElementById("modal_DeleteShop").showModal()
                      }
                    >
                      Delete Shop
                    </button>
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
                          Delete Account
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
                                  document.getElementById("confirmation");
                                const deleteBtn =
                                  document.getElementById("deleteBtn");
                                deleteBtn.disabled = input.value !== "CONFIRM";
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
                              className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none px-4"
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
                              id="deleteBtn"
                              className="btn btn-sm bg-red-500 rounded text-white hover:bg-red-600 border-none px-5"
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
                      className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out"
                      onClick={() =>
                        document.getElementById("modal_Logout").showModal()
                      }
                    >
                      Log Out
                    </button>
                    <dialog id="modal_Logout" className="modal">
                      <div className="modal-box w-8/12 max-w-md p-6 bg-white shadow-lg rounded-md">
                        <button
                          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                          onClick={() =>
                            document.getElementById("modal_Logout").close()
                          }
                        >
                          ✕
                        </button>
                        <h3 className="text-lg font-bold text-gray-600 text-left pb-5">
                          Delete Account
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Are you sure you want to log out?{" "}
                        </p>

                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none px-4"
                            onClick={() =>
                              document.getElementById("modal_Logout").close()
                            }
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm bg-blue-500 rounded text-white hover:bg-red-600 border-none px-5"
                            onClick={() => console.log("Delete logic here")}
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
