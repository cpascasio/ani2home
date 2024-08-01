import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ConfirmationIcon from '../../assets/confirmationIcon.png'; // Path to the confirmation icon
import useFetch from '../../../hooks/useFetch.js';
// import user contxt
import { useUser } from '../../context/UserContext.jsx';
import { useState, useContext, useEffect } from 'react';

const Confirmation = () => {

  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const { data: orderFetch } = useFetch(`/api/orders/${user?.userId}`);

  useEffect(() => {
    console.log(`Fetching orders for userId: ${user?.userId}`); // Log the userId
    if (orderFetch) {
      setOrders(orderFetch);
    }
    console.log(orderFetch);
  },[orderFetch]);

  useEffect(() => {
    console.log("Confirmation Page: ", orderFetch);
  }, [orders]);

  return (
    <div className='w-full'>
      <Header />
      <div className="px-40 bg-gray-200 min-h-screen"> {/* main container for body */}
        <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
          YOUR CART
        </div>
        <div className="flex justify-center mt-10"> {/* container for white box */}
          <div className="bg-white w-[848px] h-[405px] p-6 relative"> {/* Set relative positioning */}
            <div className="flex flex-col items-center">
              <img 
                src={ConfirmationIcon} 
                alt="Confirmation" 
                className="w-[60px] h-[68px] mt-6" 
              />
              <div className="mt-4 font-inter text-[15px] text-black">
                THANK YOU FOR YOUR PURCHASE!
              </div>
            </div>
            <div className="mt-4 ml-5 font-inter text-[15px] text-black text-left">
              Your order number is: <span className="font-bold text-[#0000FF]">{orders[0]?.orderId}</span>
            </div>
            <div className="mt-4 ml-5 font-inter text-[15px] text-black text-left">
              Billing & Shipping Information: <span>Fernando Lopez</span>
            </div>
            <div className="ml-5 font-inter text-[15px] text-black text-left">
              Condo Residences, You know where street, Dasmarinas Barangay 123, Dasmarinas, Cavite, 1004
            </div>
            <div className="ml-5 font-inter text-[15px] text-black text-left">
              (+63) 998 765 4321
            </div>
            <div className="mt-4 ml-5 font-inter text-[15px] text-black text-left">
              We’ll message you an order confirmation with details and tracking info.
            </div>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2"> {/* Center button horizontally */}
              <button className="bg-[#67B045] text-white font-inter font-bold text-[15px] w-[166px] h-[33px] hover:bg-[#4a9d2e]">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Confirmation;
