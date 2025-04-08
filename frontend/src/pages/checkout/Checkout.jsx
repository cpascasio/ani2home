import LocationIcon from "../../assets/location.png"; // Path to the location icon
import LogisticsIcon from "../../assets/logistics.png"; // Path to the logistics image
import Billing from "../../assets/billing.png";
import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../context/CartContext.jsx";
// import useFetch
import useFetch from "../../../hooks/useFetch";
// import user contxt
import { useUser } from "../../context/UserContext.jsx";
// import axios
import axios from "axios";
import { useParams } from "react-router-dom";
import useDynamicFetch from "../../../hooks/useDynamicFetch.js";
import { useMap, Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { encode } from "base-64";

const Checkout = () => {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [seller, setSeller] = useState({});

  const { sellerId } = useParams();

  const { data: itemsFetch } = useFetch(
    `/api/cart/checkout/${user?.userId}/${sellerId}`
  );

  useEffect(() => {
    if (itemsFetch) {
      setItems(itemsFetch.items);
      // add itemsFetch.sellerId to setSeller
      setSeller(itemsFetch.seller, itemsFetch.sellerId);
    }
    console.log("Checkout Items: ", itemsFetch);
  }, [itemsFetch]);

  useEffect(() => {
    setSellerAddress({
      lat: seller?.address?.lat || 14.3879953,
      lng: seller?.address?.lng || 120.9879423,
      address: seller?.address?.fullAddress,
    });
  }, [seller]);

  useEffect(() => {
    console.log("Checkout Items Items: ", items); // doesn't fetch the items correctly
  }, [items]);

  const navigate = useNavigate();
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const { cartItems = [] } = location.state || {};

  const userLog = localStorage.getItem("user");
  const [userData, setUserData] = useState({});
  const [refetch, setRefetch] = useState(false);
  const { data: userFetch } = useDynamicFetch(
    `/api/users/${user?.userId}`,
    refetch
  );

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("asd");
  const [countryCode, setCountryCode] = useState("+63");
  const [phoneNumber, setPhoneNumber] = useState("987654321");
  const [address, setAddress] = useState("123 Main St, City, Country");
  const [province, setProvince] = useState("Cavite");
  const [barangay, setBarangay] = useState("Molino III");
  const [city, setCity] = useState("Bacoor");
  const [note, setNote] = useState(""); // State for the note
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productTotal, setProductTotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(50);
  const [totalPayment, setTotalPayment] = useState(0);
  const [handlingFee, setHandlingFee] = useState(0);
  const [grossTotal, setGrossTotal] = useState(50);
  const [originalFullName, setOriginalFullName] = useState(fullName);
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState(phoneNumber);
  const [originalAddress, setOriginalAddress] = useState(address);

  const map = useMap();

  const [markerPosition, setMarkerPosition] = useState(null);
  const [addressDetails, setAddressDetails] = useState({});
  const [buyerAddress, setBuyerAddress] = useState({
    lat: 14.3879953,
    lng: 120.9879423,
  });

  const [sellerAddress, setSellerAddress] = useState({
    lat: 14.3879953,
    lng: 120.9879423,
  });

  const autocompleteContainerRef = useRef(null);

  const placesLib = useMapsLibrary("places");

  useEffect(() => {
    if (userFetch != null) {
      setUserData(userFetch.data);
      console.log("Fetched Data:", userFetch.data);
    }
  }, [userFetch]);

  useEffect(() => {
    if (userData != null) {
      setFullName(userData.name || "");
      setCountryCode(
        userData.phoneNumber ? userData.phoneNumber.slice(0, 3) : ""
      );
      setPhoneNumber(userData.phoneNumber ? userData.phoneNumber.slice(3) : "");
      setAddressDetails(userData?.address || "");
      setBuyerAddress({
        lat: userData?.address?.lat,
        lng: userData?.address?.lng,
      });
    }
  }, [userData]);

  // useEffect when buyerAddress and

  useEffect(() => {
    const payload = {
      co1: {
        lat: sellerAddress.lat ? sellerAddress.lat.toString() : "",
        lng: sellerAddress.lng ? sellerAddress.lng.toString() : "",
      },
      address1: sellerAddress.address || "",
      co2: {
        lat: buyerAddress.lat ? buyerAddress.lat.toString() : "",
        lng: buyerAddress.lng ? buyerAddress.lng.toString() : "",
      },
      address2: addressDetails.fullAddress || "",
    };

    axios
      .post("http://localhost:3000/api/lalamove/getQuotation", payload)
      .then((response) => {
        console.log("Quotation:", response.data);
        setShippingFee(Number(response.data.shippingFee));
      });
  }, [buyerAddress, sellerAddress, addressDetails]);

  // useEffect(() => {
  //   let total = 0;

  //   if (items.length > 0) {
  //     for (let i = 0; i < items.length; i++) {
  //       console.log("Price: ", items[i].product.price); // debug
  //       console.log("Quantity : ", items[i].quantity); // debug
  //       total += items[i].product.price * items[i].quantity;
  //     }
  //   }

  //   setProductTotal(total);
  //   setGrossTotal(total + shippingFee);
  //   setHandlingFee(0.06 * total);
  //   setTotalPayment(total + shippingFee + 0.06 * total);
  // }, [shippingFee]);

  useEffect(() => {
    let total = 0;

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const price = Number(items[i].product?.price || 0);
        const qty = Number(items[i].quantity || 0);
        total += price * qty;
      }
    }

    setProductTotal(total);
    setGrossTotal(total + shippingFee);
    setHandlingFee(0.06 * total);
    setTotalPayment(total + shippingFee + 0.06 * total);
  }, [items, shippingFee]);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
  };

  const handleBarangayChange = (e) => {
    setBarangay(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handlePostalCodeChange = (e) => {
    setPostalCode(e.target.value);
  };

  const handleCancelEdit = () => {
    console.log("Cancel button clicked");
    setEditing(false);
    setFullName(userData?.name);
    setPhoneNumber(userData?.phoneNumber);
    setAddress(userData?.address?.fullAddress);
    setProvince(userData?.address?.province);
    setBarangay(userData?.address?.barangay);
    setCity(userData?.address?.city);
    //setCountry(userData?.address?.country);
    setPostalCode(userData?.address?.postalCode);
    setCountryCode(
      userData.phoneNumber ? userData.phoneNumber.slice(0, 3) : ""
    );
    setPhoneNumber(userData.phoneNumber ? userData.phoneNumber.slice(3) : "");
    setAddressDetails(userData?.address || "");
    setBuyerAddress({
      lat: userData?.address?.lat,
      lng: userData?.address?.lng,
    });
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");
  const paymentOptions = ["GCash"];
  // Ensure totalPrice and shippingFee are numbers
  //let totalPrice = 0;

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlePaymentOptionSelect = (option) => {
    setSelectedPaymentOption(option);
    setIsDropdownOpen(false);
  };

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
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.results.length > 0) {
        const result = response.data.results[0];

        console.log("result: ", result);

        const fullAddress = response.data.results[0].formatted_address;

        const streetNumber = response.data.results[0]?.address_components.find(
          (address) => address.types.includes("street_number")
        )?.short_name;
        const premise = response.data.results[0]?.address_components.find(
          (address) => address.types.includes("premise")
        )?.short_name;
        const plusCode =
          response.data.results[0]?.address_components.find((address) =>
            address.types.includes("plus_code")
          )?.short_name ?? "";
        console.log("PLUS:" + plusCode);
        const route =
          response.data.results[0]?.address_components.find((address) =>
            address.types.includes("route")
          )?.short_name ?? "";
        console.log("ROUTE:" + route);
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

        const streetAddress = [premise, plusCode, streetNumber, route]
          .filter(Boolean)
          .join(", ");

        console.log("fullAddress: ", fullAddress);
        console.log("streetAddress: ", streetAddress);
        console.log("premise: ", premise);
        console.log("plusCode: ", plusCode);
        console.log("route: ", route);
        console.log("barangay: ", barangay);
        console.log("city: ", city);
        console.log("province: ", province);
        console.log("region: ", region);
        console.log("country: ", country);
        console.log("POSTAL CODE:" + postalCode);

        document.getElementById("newStreetAddress").value = streetAddress;
        document.getElementById("newProvice").value = province;
        document.getElementById("newRegion").value = region;
        document.getElementById("newCity").value = city;
        document.getElementById("newBarangay").value = barangay;
        document.getElementById("newCountry").value = country;
        document.getElementById("newPostalCode").value = postalCode;

        setAddressDetails({
          fullAddress,
          streetAddress,
          city,
          province,
          barangay,
          region,
          country,
          postalCode,
          lng: longitude,
          lat: latitude,
        });
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  };

  const handleClick = useCallback((ev) => {
    if (!ev) return;
    console.log("marker clicked:", ev.detail.latLng);
    const lat = ev.detail.latLng.lat;
    const lng = ev.detail.latLng.lng;
    setMarkerPosition({ lat, lng });
    ev.map.panTo(ev.detail.latLng);
  }, []);

  useEffect(() => {
    if (!placesLib || !map) return;

    const svc = new placesLib.PlacesService(map);
    // ...
  }, [placesLib, map]);

  useEffect(() => {
    if (!map) return;

    // here you can interact with the imperative maps API
  }, [map]);

  const handleSubmitAddress = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Collect form data
    const formData = new FormData(event.target);

    // Create an object to hold the updated address details
    const updatedAddressDetails = {
      fullAddress: formData.get("newStreetAddress"),
      streetAddress: formData.get("newStreetAddress"),
      city: formData.get("newCity"),
      province: formData.get("newProvice"),
      barangay: formData.get("newBarangay"),
      region: formData.get("newRegion"),
      country: formData.get("newCountry"),
      postalCode: formData.get("newPostalCode"),
      lat: addressDetails.lat, // Keep the existing latitude
      lng: addressDetails.lng, // Keep the existing longitude
    };

    // Update the addressDetails state
    setAddressDetails(updatedAddressDetails);

    // Update the buyerAddress state (if needed)
    setBuyerAddress({
      lat: addressDetails.lat,
      lng: addressDetails.lng,
    });

    // Update the fullName and phoneNumber states
    setFullName(formData.get("fullName"));
    setPhoneNumber(formData.get("phoneNumber"));

    // Close the editing mode
    setEditing(false);

    // Optionally, show a success message
    alert("Address updated successfully!");
  };

  // const totalPrice = cartItems.reduce((acc, items) => acc + (items.product.price * items.quantity), 0);

  //console.log("Total Price : ", totalPrice );

  // Function to format numbers with commas
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3}){1,7}(?!\d))/g, ",");
  };

  const handleCancel = () => {
    navigate("/cart");
  };

  const handlePlaceOrder = () => {
    // Validate required fields
    if (!fullName || typeof fullName !== "string") {
      console.error("Full name is missing or invalid:", fullName);
      alert("Please provide a valid full name.");
      return;
    }

    if (
      !addressDetails.fullAddress ||
      typeof addressDetails.fullAddress !== "string"
    ) {
      console.error(
        "Address is missing or invalid:",
        addressDetails.fullAddress
      );
      alert("Please provide a valid address.");
      return;
    }

    if (!phoneNumber || typeof phoneNumber !== "string") {
      console.error("Phone number is missing or invalid:", phoneNumber);
      alert("Please provide a valid phone number.");
      return;
    }

    if (!selectedPaymentOption || typeof selectedPaymentOption !== "string") {
      console.error(
        "Payment option is missing or invalid:",
        selectedPaymentOption
      );
      alert("Please select a valid payment option.");
      return;
    }

    // Ensure all required fields in deliveryAddress are present
    const deliveryAddress = {
      fullName: fullName,
      province: addressDetails.province || "",
      barangay: addressDetails.barangay || "",
      city: addressDetails.city || "",
      address: addressDetails.fullAddress,
      phoneNumber: phoneNumber,
      lng: addressDetails.lng,
      lat: addressDetails.lat,
    };

    // Log the deliveryAddress for debugging
    console.log("Delivery Address:", JSON.stringify(deliveryAddress, null, 2));

    // Prepare the order payload
    const order = {
      userId: user?.userId,
      sellerId: sellerId,
      shippingFee: shippingFee,
      totalPrice: totalPayment,
      status: "Pending",
      deliveryAddress: deliveryAddress,
      paymentOption: selectedPaymentOption,
      paymentRefNo: "123",
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    // Log the order payload for debugging
    console.log("Order Payload:", JSON.stringify(order, null, 2));

    // Conditionally add the note property if it's not an empty string
    if (note.trim() !== "") {
      order.note = note;
    }

    // Send the order to the server
    axios
      .post("https://ani2home.onrender.com/api/orders/place-order", order)
      .then((response) => {
        console.log("Order placed:", response.data);

        // Extract the orderId from the response if needed
        const orderId = String(response.data.orderId);
        console.log("OrderID: ", orderId);
        const base64Auth = encode(`${import.meta.env.VITE_PAYMENT_SECRET}:`);

        const payload = {
          reference_id: orderId,
          currency: "PHP",
          amount: response.data.order.totalPrice,
          checkout_method: "ONE_TIME_PAYMENT",
          channel_code: "PH_GCASH",
          channel_properties: {
            success_redirect_url: `http://localhost:5173/confirmation/${orderId}`,
            failure_redirect_url: "http://localhost:5173/cart",
          },
        };

        // Make the POST request to Xendit API
        axios
          .post("https://api.xendit.co/ewallets/charges", payload, {
            headers: {
              Authorization: `Basic ${base64Auth}`, // Basic Auth
              "Content-Type": "application/json", // Content-Type as JSON
            },
          })
          .then((response) => {
            console.log("Xendit Response:", response.data);

            // Check if the response contains the actions object and desktop_web_checkout_url
            if (
              response.data.actions &&
              response.data.actions.desktop_web_checkout_url
            ) {
              const checkoutUrl =
                response.data.actions.desktop_web_checkout_url;

              // Redirect the user to the checkout URL to complete the payment
              window.location.href = checkoutUrl;
            } else {
              console.error("Checkout URL not found in Xendit response.");
            }
          })
          .catch((error) => {
            console.error(
              "Error making request to Xendit:",
              error.response?.data || error.message
            );
          });

        // Navigate to the confirmation page
        //navigate("/confirmation", {
        //state: { order: order, orderId: orderId },
        //});

        // if response is successful, clear the cart
        // Client-side request using Axios
        axios
          .put(
            "http://localhost:3000/api/cart/remove-seller-items",
            {
              userId: user?.userId,
              sellerId: sellerId,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.error("Error removing seller items:", error);
            // Add your error handling logic here
          });
      })
      .catch((error) => {
        console.error("Error placing order:", error);

        // Display a user-friendly error message
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Server responded with:", error.response.data);
          alert(
            `Error: ${error.response.data.error || "Failed to place order."}`
          );
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
          alert("No response from the server. Please try again.");
        } else {
          // Something happened in setting up the request
          console.error("Request setup error:", error.message);
          alert("An error occurred while setting up the request.");
        }
      });
  };

  return (
    <div style={{ backgroundColor: "#e5e7eb" }} className="w-full pt-24">
      <div className="px-5 sm:px-10 md:px-20 lg:px-40 bg-gray-200 min-h-screen">
        {" "}
        {/* main container for body */}
        <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
          YOUR CART
        </div>
        <div className="flex justify-center mt-6">
          {" "}
          {/* container for white box */}
          <div className="bg-white w-full max-w-4xl p-4">
            {" "}
            {/* white box with padding */}
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
                      htmlFor="fullName"
                      className="w-full text-sm font-medium text-gray-600 text-left"
                    >
                      Full Name
                    </label>
                  </div>
                  <div className="flex flex-col my-2">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={fullName}
                      onChange={handleFullNameChange}
                      required
                      className="input input-bordered bg-gray-200 text-gray-800"
                    />
                  </div>
                  <div className="flex space-x-4 mb-2 mt-5">
                    <label
                      htmlFor="phoneNumber"
                      className="w-full text-sm font-medium text-gray-600 text-left"
                    >
                      Phone Number
                    </label>
                  </div>
                  <div className="flex flex-col my-2">
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      required
                      className="input input-bordered bg-gray-200 text-gray-800"
                    />
                  </div>
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
                      className="w-full input input-bordered bg-gray-200 text-gray-800"
                    />
                    <input
                      type="text"
                      id="newRegion"
                      name="newRegion"
                      required
                      defaultValue={userData?.address?.region}
                      className="w-full input input-bordered bg-gray-200 text-gray-800"
                    />
                    <input
                      type="text"
                      id="newCity"
                      name="newCity"
                      required
                      defaultValue={userData?.address?.city}
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
                      className="w-full input input-bordered bg-gray-200 text-gray-800"
                    />
                    <input
                      type="text"
                      id="newPostalCode"
                      name="newPostalCode"
                      required
                      defaultValue={userData?.address?.postalCode}
                      className="w-full input input-bordered bg-gray-200 text-gray-800"
                    />
                  </div>
                  <div className="flex justify-end space-x-4 mb-2 w-full">
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-sm bg-gray-400 text-white border-none rounded transition duration-300 ease-in-out hover:bg-red-500 font-inter font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit" // Keep this as "submit"
                      className="btn btn-sm bg-green-900 rounded text-white transition duration-300 ease-in-out hover:bg-blue-500 border-none px-5"
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
                <div className="font-inter text-[15px] text-[#737373]">
                  {fullName} | {phoneNumber}
                </div>
                <div className="font-inter text-[15px] text-[#737373]">
                  {addressDetails?.fullAddress}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-1 flex flex-col items-center space-y-1 max-w-4xl mx-auto">
          {items.map((item, index) => {
            const { product, quantity } = item;
            const totalProductPrice = product.price * quantity;
            return (
              <div
                key={index}
                className="bg-white w-full max-w-4xl h-24 flex items-center p-4"
              >
                <img
                  src={product.pictures[0]}
                  alt={product.productName}
                  className="w-16 h-16"
                />
                <div className="ml-4 flex flex-col justify-between flex-1">
                  <div className="font-inter font-bold text-lg text-[#737373] text-left">
                    {product.productName}
                  </div>
                  <div
                    className="font-inter text-base text-[#737373] text-left line-clamp-2"
                    style={{ maxWidth: "60%" }}
                  >
                    {product.description}
                  </div>
                </div>
                <div className="lg:mr-24 mr-7 font-inter text-lg text-[#737373]">
                  x {quantity}
                </div>
                <div className="ml-auto flex flex-col items-center justify-center mx-10">
                  <div className="font-inter text-[17px] text-[#737373] mx-2">
                    Price
                  </div>
                  <div className="font-inter text-[15px] text-[#E11919]">
                    ₱{formatNumber(totalProductPrice.toFixed(2))}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="bg-[#D5FAFF] w-full max-w-full h-[119px] mt-1 flex flex-wrap items-start p-4">
            <img
              src={LogisticsIcon}
              alt="Logistics"
              className="w-[36px] h-[23px]"
            />
            <div className="ml-4 flex flex-col justify-between">
              <div className="font-inter text-[15px] text-black ml-[-70px] mb-0.5 mt-[-3px]">
                Shipping Details
              </div>
              <div className="font-inter text-[15px] text-black ml-[-80px]">
                Standard Local
              </div>
              <div className="font-inter text-[15px] text-black ml-[-100px]">
                Lalamove
              </div>
              <div className="font-inter text-[13px] text-black mt-1">
                Guaranteed to get by 5 - 8 Aug
              </div>
            </div>
            <div className="ml-auto flex flex-col items-center justify-center mt-5 mx-12">
              <div className="font-inter text-[17px] text-black">Price</div>
              <div className="font-inter text-[15px] text-black">
                ₱{shippingFee.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-white w-full h-[auto] mt-1 p-4">
            <div className="font-inter text-[15px] text-[#737373]">Note</div>
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="Please leave a message..."
              className="w-full border-b border-[#AFAFAF] text-[#737373] font-inter text-[15px] p-2 resize-none bg-white"
              style={{ minHeight: "40px" }}
            />
          </div>

          <div className="bg-white w-full h-[46px] mt-1 flex items-center justify-between p-4">
            <div className="font-inter text-[15px] text-[#737373]">
              Order Total ({items.length} Items):
            </div>
            <div className="font-inter text-[15px] text-[#E11919] mr-12">
              ₱{formatNumber(productTotal.toFixed(2))}
            </div>
          </div>

          <div className="bg-white w-full h-[46px] mt-1 flex items-center justify-between p-4 border border-gray-300 relative">
            <div className="font-inter text-[15px] text-[#737373]">
              Payment Option
            </div>
            <div className="flex items-center">
              <div className="font-inter text-[15px] text-[#E11919]">
                {selectedPaymentOption || "Select payment method"}
              </div>
              <svg
                onClick={handleDropdownToggle}
                className={`w-[20px] h-[20px] ml-2 cursor-pointer transition-transform duration-300 ${isDropdownOpen ? "rotate-270" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            {isDropdownOpen && (
              <div className="absolute left-0 top-full bg-white border border-gray-300 w-full z-10">
                {paymentOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => handlePaymentOptionSelect(option)}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                  >
                    <div
                      className={`w-4 h-4 border rounded-full flex items-center justify-center mr-2 ${selectedPaymentOption === option ? "bg-blue-500" : "bg-white"}`}
                    >
                      {selectedPaymentOption === option && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="font-inter text-[15px] text-[#737373]">
                      {option}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Details Section */}
          <div className="bg-white w-full p-4 flex flex-col mt-1">
            <div className="flex items-center mb-4">
              <img
                src={Billing}
                alt="Billing"
                className="w-[20px] h-[32px] mr-2"
              />
              <div className="font-inter text-[15px] text-[#737373]">
                Payment Details
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-inter text-[13px] text-[#737373]">
                Product Total
              </div>
              <div className="font-inter text-[13px] text-[#737373]">
                ₱{productTotal.toFixed(2)}
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-inter text-[13px] text-[#737373]">
                Shipping Fee
              </div>
              <div className="font-inter text-[13px] text-[#737373]">
                ₱{shippingFee.toFixed(2)}
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-inter text-[13px] text-[#737373]">
                Gross Total
              </div>
              <div className="font-inter text-[13px] text-[#737373]">
                ₱{grossTotal.toFixed(2)}
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-inter text-[13px] text-[#737373]">
                Handling Fee
              </div>
              <div className="font-inter text-[13px] text-[#737373]">
                ₱{handlingFee.toFixed(2)}
              </div>
            </div>
            <hr className="border-t border-gray-300 my-2" />
            <div className="flex justify-between mt-2">
              <div className="font-inter text-[15px] text-[#737373]">
                Total Payment
              </div>
              <div className="font-inter text-[15px] text-[#E11919]">
                ₱{totalPayment.toFixed(2)}
              </div>
            </div>
          </div>

          <div
            className="flex justify-between border p-2 pb-10"
            style={{ marginBottom: "auto" }}
          >
            {" "}
            {/* Inline style for margin-bottom */}
            <button
              onClick={handleCancel}
              className="w-[122px] h-[40px] bg-gray-400 text-white border border-gray-300 rounded transition duration-300 ease-in-out hover:bg-red-500 font-inter font-bold text-[16px] mr-4 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              className="w-[122px] h-[40px] bg-green-900 font-inter font-bold text-white border border-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition duration-300 ease-in-out rounded-md "
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
