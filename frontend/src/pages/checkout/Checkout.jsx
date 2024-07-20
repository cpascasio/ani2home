import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LocationIcon from '../../assets/location.png' // Path to the location icon
import { useState } from 'react';

const Checkout = () => {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('Juan Dela Cruz');
  const [countryCode, setCountryCode] = useState('+63');
  const [phoneNumber, setPhoneNumber] = useState('987654321');
  const [address, setAddress] = useState('123 Main St, City, Country');

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
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
                  <select 
                    value={countryCode} 
                    onChange={handleCountryCodeChange} 
                    className="font-inter text-[15px] text-[#737373] border border-gray-300 p-2 mr-2"
                  >
                    <option value="+63">+63</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    {/* Add more country codes as needed */}
                  </select>
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
                <button 
                  onClick={handleEditToggle}
                  className="mt-2 px-4 py-2 bg-gray-200 text-[#737373] font-inter text-[15px] border border-gray-300 hover:bg-gray-300"
                >
                  Save
                </button>
              </div>
            ) : (
              <div 
                className="mt-2 p-2 cursor-pointer"
                onClick={handleEditToggle}
              >
                <div className="font-inter text-[15px] text-[#737373]">{fullName} | {countryCode} {phoneNumber}</div>
                <div className="font-inter text-[15px] text-[#737373]">{address}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
