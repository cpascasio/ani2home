import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LocationIcon from '../../assets/location.png' // Path to the location icon
import LogisticsIcon from '../../assets/logistics.png'; // Path to the logistics image
import Billing from '../../assets/billing.png';
import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext.jsx';
// import useFetch
import useFetch from '../../../hooks/useFetch';
// import user contxt
import { useUser } from '../../context/UserContext.jsx';
// import axios
import axios from 'axios';



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

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('Juan Dela Cruz');
  const [phoneNumber, setPhoneNumber] = useState('0987654321');
  const [address, setAddress] = useState('123 Main St, City, Country');
  const [province, setProvince] = useState('Cavite');
  const [barangay, setBarangay] = useState('Molino III');
  const [city, setCity] = useState('Bacoor');
  const [note, setNote] = useState(''); // State for the note
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [originalFullName, setOriginalFullName] = useState(fullName);
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState(phoneNumber);
  const [originalAddress, setOriginalAddress] = useState(address);
  const [originalProvince, setOriginalProvince] = useState(province);
  const [originalBarangay, setOriginalBarangay] = useState(barangay);
  const [originalCity, setOriginalCity] = useState(city);

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

  console.log("Items to Checkout: ", items);
  
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
          paymentRefNo: '1234567890'
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
axios.post('http://localhost:3000/api/orders/create-order', order)
  .then((response) => {
    console.log('Order placed:', response.data);
    
     // Extract the orderId from the response if needed
     const orderId = String(response.data.orderId);
     console.log("OrderID: ", orderId);

     // Map orderId to each item in orderDetails
     const orderDetails = items.map(item => ({
       orderId: response.data.orderId,
       productId: item.productId,
       quantity: item.quantity
     }));

     // console log the orderDetails
      console.log("Order Details: ", orderDetails);
    
    // Then, create the order detail
    return axios.post('http://localhost:3000/api/order-details/create-order-details', { orderDetails });
  })
  .then((response) => {
    console.log('Order Details placed:', response.data);
    console.log('ygugOrder:', order);
    console.log('iugugjOrder Details:', orderDetails);
    navigate('/confirmation');
    
  })
  .catch((error) => {
    console.error('Error placing order or order details:', error);
  });
  };




 

  return (
    <div className='w-full'>
      <Header />
      <div className="px-40 bg-gray-200 min-h-screen"> {/* main container for body */}
        <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
          YOUR CART
        </div>
        <div className="flex justify-center mt-6"> {/* container for white box */}
          <div className="bg-white w-[848px] h-[auto] p-4"> {/* white box with padding */}
            <div className="flex items-center"> {/* container for location icon and text */}
              <img src={LocationIcon} alt="Location" className="w-[20px] h-[20px] mr-2" />
              <div className="font-inter text-[15px] text-[#737373]">Delivery Address</div>
            </div>
            {editing ? (
              <div className="mt-2">
                <div className="flex items-center mb-2">
                <input 
                    type="text" 
                    value={fullName} 
                    onChange={handleFullNameChange} 
                    className="w-full font-inter text-[15px] text-[#737373] border border-gray-300 p-2 mr-2" 
                    placeholder="Full Name"
                  />
                  <input 
                    type="text" 
                    value={phoneNumber} 
                    onChange={handlePhoneNumberChange} 
                    className="w-full font-inter text-[15px] text-[#737373] border border-gray-300 p-2" 
                    placeholder="Phone Number"
                  />
                </div>
                <textarea 
                  value={address} 
                  onChange={handleAddressChange} 
                  className="w-full font-inter text-[15px] text-[#737373] border border-gray-300 p-2 resize-none"
                  rows="3"
                  placeholder="Address"
                />
                <div className="flex space-x-4 mb-2">
                  <input 
                    type="text" 
                    value={province} 
                    onChange={handleProvinceChange} 
                    className="w-full font-inter text-[15px] text-[#737373] border border-gray-300 p-2" 
                    placeholder="Province"
                  />
                  <input 
                    type="text" 
                    value={barangay} 
                    onChange={handleBarangayChange} 
                    className="w-full font-inter text-[15px] text-[#737373] border border-gray-300 p-2" 
                    placeholder="Barangay"
                  />
                  <input 
                    type="text" 
                    value={city} 
                    onChange={handleCityChange} 
                    className="w-full font-inter text-[15px] text-[#737373] border border-gray-300 p-2" 
                    placeholder="City"
                  />
                </div>
                <textarea 
                  value={address} 
                  onChange={handleAddressChange} 
                  className="w-full font-inter text-[15px] text-[#737373] border border-gray-300 p-2 resize-none"
                  rows="3"
                  placeholder="Address"
                />
                <button 
                  onClick={handleEditToggle}
                  className="mt-2 px-4 py-2 bg-[#67B045] text-white font-inter text-[15px] border border-gray-300 hover:bg-[#55a03d]"
                >
                  Save
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="ml-4 px-4 py-2 bg-gray-200 text-[#737373] font-inter text-[15px] border border-gray-300 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                className="mt-2 p-2 cursor-pointer transition-all duration-300 hover:bg-gray-100"
                onClick={handleEditToggle}
              >
                <div className="font-inter text-[15px] text-[#737373]">{fullName} | {phoneNumber}</div>
                <div className="font-inter text-[15px] text-[#737373]">{address}</div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-1 flex flex-col items-center">
        {items.map((item, index) => {
            const { product, quantity } = item;
            const totalProductPrice = product.price * quantity;
            return (
              
              <div key={index} className="bg-white w-[848px] h-[91px] flex items-center p-4 mb-1">
                <img src={product.pictures[0]} alt={product.productName} className="w-[69px] h-[63px]" />
                <div className="ml-4 flex flex-col justify-between">
                  <div className="font-inter font-bold text-[18px] text-[#737373] text-left">{product.productName}</div>
                  <div className="font-inter text-[15px] text-[#737373] text-left line-clamp-1" style={{ width: '356px', height: '25px' }}>{product.description}</div>
                </div>
                <div className="ml-20 font-inter text-[17px] text-[#737373]">x {quantity}</div>
                <div className="ml-auto flex flex-col items-center justify-center mx-10">
                  <div className="font-inter text-[17px] text-[#737373] mx-2">Price</div>
                  <div className="font-inter text-[15px] text-[#E11919]">₱{formatNumber(totalProductPrice.toFixed(2))}</div>
                </div>
              </div>
            );
          })}
          <div className="bg-[#D5FAFF] w-[848px] h-[119px] mt-1 flex items-start p-4">
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
          <div className="bg-white w-[848px] h-[auto] mt-1 p-4">
            <div className="font-inter text-[15px] text-[#737373]">Note</div>
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="Please leave a message..."
              className="w-full border-b border-[#AFAFAF] text-[#737373] font-inter text-[15px] p-2 resize-none"
              style={{ minHeight: '40px' }}
            />
          </div>
          <div className="bg-white w-[848px] h-[46px] mt-1 flex items-center justify-between p-4">
            <div className="font-inter text-[15px] text-[#737373]">
              Order Total ({cartItems.length} Items):
            </div>
            <div className="font-inter text-[15px] text-[#E11919] mr-10">
              ₱{formatNumber(totalPrice.toFixed(2))}
            </div>
          </div>

          <div className="bg-white w-[848px] h-[46px] mt-1 flex items-center justify-between p-4 border border-gray-300 relative">
          <div className="font-inter text-[15px] text-[#737373]">
            Payment Option
          </div>
          <div className="flex items-center">
            <div className="font-inter text-[15px] text-[#E11919]">
              {selectedPaymentOption || 'Select payment method'}
            </div>
            <svg
              onClick={handleDropdownToggle}
              className={`w-[20px] h-[20px] ml-2 cursor-pointer transition-transform duration-300 ${isDropdownOpen ? 'rotate-90' : ''}`}
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
            <div className="absolute bg-white border border-gray-300 w-full mt-1 z-10">
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
          <div className="bg-white w-[848px] p-4 flex flex-col mt-1">
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
          
          <div className="flex justify-between mt-4 mb-20">
            <button 
              onClick={handleCancel} 
              className="w-[122px] h-[40px] bg-white border border-gray-300 text-[#737373] font-inter font-bold text-[16px] hover:bg-gray-100 mr-4" // Added mr-4 for spacing
            >
              Cancel
            </button>
            <button 
              onClick={handlePlaceOrder} 
              className="w-[122px] h-[40px] bg-white border border-gray-300 text-[#737373] font-inter font-bold text-[16px] hover:bg-gray-100"
            >
              Place Order
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
