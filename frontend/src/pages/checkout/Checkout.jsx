import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LocationIcon from '../../assets/location.png' // Path to the location icon
import LogisticsIcon from '../../assets/logistics.png'; // Path to the logistics image
import Billing from '../../assets/billing.png';
import { useState, useContext, useEffect, useCallback, useRef  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext.jsx';
// import useFetch
import useFetch from '../../../hooks/useFetch';
// import user contxt
import { useUser } from '../../context/UserContext.jsx';
// import axios
import axios from 'axios';
import useDynamicFetch from '../../../hooks/useDynamicFetch.js';
import { useMap, Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";

const Checkout = () => {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const { data: itemsFetch } = useFetch(`/api/cart/cart-items/${user?.userId}`);
  

  useEffect(() => {
    if (itemsFetch) {
      setItems(itemsFetch);
    }
    console.log("Checkout Items: ", itemsFetch);
  }
  , [itemsFetch]);

  useEffect(() => {
    console.log("Checkout Items Items: ", items); // doesn't fetch the items correctly
  }
  , [items]);

  const navigate = useNavigate();
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const { cartItems = [] } = location.state || {};

  const userLog = localStorage.getItem('user');
  const [userData, setUserData] = useState({});
  const [refetch, setRefetch] = useState(false);
  const { data: userFetch } = useDynamicFetch(`/api/users/${user?.userId}`, refetch);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('asd');
  const [countryCode, setCountryCode] = useState('+63');
  const [phoneNumber, setPhoneNumber] = useState('987654321');
  const [address, setAddress] = useState('123 Main St, City, Country');
  const [province, setProvince] = useState('Cavite');
  const [barangay, setBarangay] = useState('Molino III');
  const [city, setCity] = useState('Bacoor');
  const [note, setNote] = useState(''); // State for the note
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [originalFullName, setOriginalFullName] = useState(fullName);
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState(phoneNumber);
  const [originalAddress, setOriginalAddress] = useState(address);

  const map = useMap();

  const [markerPosition, setMarkerPosition] = useState(null);
  const [addressDetails, setAddressDetails] = useState({});

  const autocompleteContainerRef = useRef(null);

  const placesLib = useMapsLibrary('places');

//   useEffect(() => {
//     console.log('Quantity:', quantity);

// }, [quantity]);

useEffect(() => {
  if (userFetch != null) {
      setUserData(userFetch.data);
      console.log("Fetched Data:", userFetch.data);
  }
}, [userFetch]);

useEffect(() => {
  if (userData != null) {
    setFullName(userData.name || '');
    setCountryCode(userData.phoneNumber ? userData.phoneNumber.slice(0, 3) : '');
    setPhoneNumber(userData.phoneNumber ? userData.phoneNumber.slice(3) : '');
    setAddress(userData?.address?.fulladdress || '');
  }
}, [userData]);

  

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

  const handleCancelEdit = () => {
    setFullName(originalFullName);
    setPhoneNumber(originalPhoneNumber);
    setAddress(originalAddress);
    setProvince(originalProvince);
    setBarangay(originalBarangay);
    setCity(originalCity);
    setEditing(false);
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const [selectedPaymentOption, setSelectedPaymentOption] = useState('');
  const paymentOptions = ['Cash on Delivery', 'GCash'];

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
  
        const fulladdress = result.formatted_address;
        const addressComponents = result.address_components;
  
        let city = '';
        let province = '';
        let region = '';
        let country = '';
  
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            province = component.long_name;
          } else if (component.types.includes('administrative_area_level_2')) {
            region = component.long_name;
          } else if (component.types.includes('country')) {
            country = component.long_name;
          }
        }
  
        document.getElementById('newLocation').value = fulladdress;
        document.getElementById('newProvice').value = province;
        document.getElementById('newRegion').value = region;
        document.getElementById('newCity').value = city;
  
        setAddressDetails({
          fulladdress,
          city,
          province,
          region,
          country,
          lng: longitude,
          lat: latitude,
        });
      }

    } catch (error) {
      console.error('Error fetching address details:', error);
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

    // Create an object to hold form values
    const data = {};
    data.address = {};

    // Check if fields have been changed
    if (formData.get("newLocation") !== userData?.address?.fulladdress) {
      data.address.fulladdress = formData.get("newLocation") || "";
    }
    if (formData.get("newProvice") !== userData?.address?.province) {
      data.address.province = formData.get("newProvice") || "";
    }
    if (formData.get("newRegion") !== userData?.address?.region) {
      data.address.region = formData.get("newRegion") || "";
    }
    if (formData.get("newCity") !== userData?.address?.city) {
      data.address.city = formData.get("newCity") || "";
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

  let totalPrice = 0;


  if (items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      console.log("Price: ", items[i].product.price); // debug
      console.log("Quantity : ", items[i].quantity); // debug
      totalPrice += items[i].product.price * items[i].quantity;
    }
  }
  // const totalPrice = cartItems.reduce((acc, items) => acc + (items.product.price * items.quantity), 0);

  console.log("Total Price : ", totalPrice );

  // Function to format numbers with commas
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  const handlePlaceOrder = () => {

        const order = {
          userId: user?.userId,
          sellerId: "store345", // update card model to have a sellerId ty
          shippingFee: 50,
          totalPrice,
          status: "In Process",
          deliveryAddress: {
            fullName,
            province,
            barangay,
            city,
            address,
            phoneNumber
          },
          paymentOption: selectedPaymentOption,
          paymentRefNo: '1234567890',
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        };



        // Extract order details from items
      const orderDetails = items.map(item => ({
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity
      }));

        // navigate('/confirmation', { state: { order: order}});
        // console.log('handlePlaceOrder', items);

        // add to firebase to order db

       


        // Conditionally add the note property if it's not an empty string
  // Conditionally add the note property if it's not an empty string
if (note.trim() !== '') {
  order.note = note;
}

console.log('Order:', order);




// First, create the order
axios.post('http://localhost:3000/api/orders/place-order', order)
  .then((response) => {
    console.log('Order placed:', response.data);
    
     // Extract the orderId from the response if needed
     const orderId = String(response.data.orderId);
     console.log("OrderID: ", orderId);

  })
  .catch((error) => {
    console.error('Error placing order or order details:', error);
  });
  };




 

  return (
    <div  style={{ backgroundColor: '#e5e7eb', minHeight: '100vh' }} className='w-full pt-24'>
      <div className="px-5 sm:px-10 md:px-20 lg:px-40 bg-gray-200 min-h-screen"> {/* main container for body */}
        <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
          YOUR CART
        </div>
        <div className="flex justify-center mt-6"> {/* container for white box */}
          <div className="bg-white w-full max-w-4xl p-4"> {/* white box with padding */}
            <div className="flex items-center"> {/* container for location icon and text */}
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
                    <input
                      type="text"
                      id="newLocation"
                      name="newLocation"
                      defaultValue={userData?.address?.fulladdress}
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
                  <div className="flex justify-end space-x-4 mb-2 w-full">
                    <button 
                      onClick={handleCancelEdit}
                      className="btn btn-sm bg-gray-400 text-white border-none rounded transition duration-300 ease-in-out hover:bg-red-500 font-inter font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="Submit"
                      className="btn btn-sm bg-green-900 rounded text-white hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out border-none px-5"
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
                <div className="font-inter text-[15px] text-[#737373]">{fullName} | {phoneNumber}</div>
                <div className="font-inter text-[15px] text-[#737373]">{address}</div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-1 flex flex-col items-center space-y-1 max-w-4xl mx-auto">
          {items.map((item, index) => {
              const { product, quantity } = item;
              const totalProductPrice = product.price * quantity;
            return (
              <div key={index} className="bg-white w-full max-w-4xl h-24 flex items-center p-4">
                <img src={product.pictures[0]} alt={product.productName} className="w-16 h-16" />
                <div className="ml-4 flex flex-col justify-between flex-1">
                  <div className="font-inter font-bold text-lg text-[#737373] text-left">{product.productName}</div>
                  <div className="font-inter text-base text-[#737373] text-left line-clamp-2" style={{ maxWidth: '60%' }}>{product.description}</div>
                </div>
                <div className="lg:mr-24 mr-7 font-inter text-lg text-[#737373]">x {quantity}</div>
                <div className="ml-auto flex flex-col items-center justify-center mx-10">
                  <div className="font-inter text-[17px] text-[#737373] mx-2">Price</div>
                  <div className="font-inter text-[15px] text-[#E11919]">₱{formatNumber(totalProductPrice.toFixed(2))}</div>
                </div>
              </div>
            );
          })}
          <div className="bg-[#D5FAFF] w-full max-w-full h-[119px] mt-1 flex flex-wrap items-start p-4">
            <img src={LogisticsIcon} alt="Logistics" className="w-[36px] h-[23px]" />
            <div className="ml-4 flex flex-col justify-between">
              <div className="font-inter text-[15px] text-black ml-[-70px] mb-0.5 mt-[-3px]">Shipping Details</div>
              <div className="font-inter text-[15px] text-black ml-[-80px]">Standard Local</div>
              <div className="font-inter text-[15px] text-black ml-[-100px]">SPX Express</div>
              <div className="font-inter text-[13px] text-black mt-1">Guaranteed to get by 5 - 8 Aug</div>
            </div>
            <div className="ml-auto flex flex-col items-center justify-center mt-5 mx-12">
              <div className="font-inter text-[17px] text-black">Price</div>
              <div className="font-inter text-[15px] text-black">₱{formatNumber(50.00.toFixed(2))}</div>
            </div>
          </div>


          <div className="bg-white w-full h-[auto] mt-1 p-4">
            <div className="font-inter text-[15px] text-[#737373]">Note</div>
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="Please leave a message..."
              className="w-full border-b border-[#AFAFAF] text-[#737373] font-inter text-[15px] p-2 resize-none bg-white"
              style={{ minHeight: '40px' }}
            />
          </div>

          <div className="bg-white w-full h-[46px] mt-1 flex items-center justify-between p-4">
            <div className="font-inter text-[15px] text-[#737373]">
              Order Total ({cartItems.length} Items):
            </div>
            <div className="font-inter text-[15px] text-[#E11919] mr-12">
              ₱{formatNumber(totalPrice.toFixed(2))}
            </div>
          </div>

          <div className="bg-white w-full h-[46px] mt-1 flex items-center justify-between p-4 border border-gray-300 relative">
  <div className="font-inter text-[15px] text-[#737373]">
    Payment Option
  </div>
  <div className="flex items-center">
    <div className="font-inter text-[15px] text-[#E11919]">
      {selectedPaymentOption || 'Select payment method'}
    </div>
    <svg
      onClick={handleDropdownToggle}
      className={`w-[20px] h-[20px] ml-2 cursor-pointer transition-transform duration-300 ${isDropdownOpen ? 'rotate-270' : ''}`}
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
          <div className={`w-4 h-4 border rounded-full flex items-center justify-center mr-2 ${selectedPaymentOption === option ? 'bg-blue-500' : 'bg-white'}`}>
            {selectedPaymentOption === option && (
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            )}
          </div>
          <div className="font-inter text-[15px] text-[#737373]">{option}</div>
        </div>
      ))}
    </div>
  )}
</div>


          {/* Payment Details Section */} 
          <div className="bg-white w-full p-4 flex flex-col mt-1">
            <div className="flex items-center mb-4">
              <img src={Billing} alt="Billing" className="w-[20px] h-[32px] mr-2" />
              <div className="font-inter text-[15px] text-[#737373]">Payment Details</div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-inter text-[13px] text-[#737373]">Product Total</div>
              <div className="font-inter text-[13px] text-[#737373]">₱{formatNumber(totalPrice.toFixed(2))}</div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-inter text-[13px] text-[#737373]">Shipping Total</div>
              <div className="font-inter text-[13px] text-[#737373]">₱{formatNumber(50.00.toFixed(2))}</div>
            </div>
            <hr className="border-t border-gray-300 my-2" />
            <div className="flex justify-between mt-2">
              <div className="font-inter text-[15px] text-[#737373]">Total Payment</div>
              <div className="font-inter text-[15px] text-[#E11919]">₱{formatNumber((totalPrice + 50).toFixed(2))}</div>
            </div>
          </div>
          
          <div className="flex justify-between border p-2" style={{ marginBottom: 'auto'}}> {/* Inline style for margin-bottom */}
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
