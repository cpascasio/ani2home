import { useState, useEffect } from "react";
import React, { useContext } from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import CartItem from "../../components/CartItem";
import { CartContext } from "../../context/CartContext";
import useFetch from "../../../hooks/useFetch";
import { useUser } from "../../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { user } = useUser();
  const { data: cartFetch } = useFetch(`/api/cart/${user?.userId}`);
  const [cartNew, setCartNew] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartFetch) {
      setCartNew(cartFetch);
    }
    console.log(cartFetch);
  }, [cartFetch]);

  useEffect(() => {
    console.log("Cart Page: ", cartNew);
  }, [cartNew]);

  const handleCheckout = (sellerId) => {
    if (cartNew?.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate(`/checkout/${sellerId}`);
    console.log('handleCheckout', sellerId);
  };

  return (
    <div style={{ backgroundColor: '#e5e7eb', minHeight: '100vh' }} className="w-full pt-24">
      <div className="px-4 md:px-20 lg:px-40 bg-gray-200 min-h-screen"> {/* main container for body */}
        <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
          YOUR CART
        </div>
        <div className="space-y-4">
          {cartNew?.length === 0 ? (
            <div className="flex justify-center items-center h-[400px]">
              <p className="text-gray-600 font-inter font-bold text-[18px]">
                Your cart is empty
              </p>
            </div>
          ) : (
            cartNew?.map((item) => (
              <div key={item.sellerId}>
                {item?.sellerId}
                {item.items?.map((product) => (
                  <CartItem key={product.productId} product={product} />
                ))}
                <button 
                  onClick={() => handleCheckout(item.sellerId)}
                  className="w-full max-w-[212px] h-[40px] bg-green-900 rounded-md text-[16px] font-inter font-bold text-white border border-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition duration-300 ease-in-out"
                >
                  Proceed to Checkout
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;