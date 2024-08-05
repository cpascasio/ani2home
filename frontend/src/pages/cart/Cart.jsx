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

  //const { cart } = useContext(CartContext);
  // const navigate = useNavigate();

  // add console log for user
  //console.log('Current user:', user);
  const navigate = useNavigate();

  // fetch cart items from firebase

  useEffect(() => {
    if (cartFetch) {
      setCartNew(cartFetch);
    }
    console.log(cartFetch);
  }, [cartFetch]);

  useEffect(() => {
    console.log("Cart Page: ", cartNew);
  }, [cartNew]);

  // useEffect(() => {
  //   if (cartFetch) {
  //     setCartNew(cartFetch);
  //   }
  // }
  // , [cartFetch]);

  // useEffect(() => {
  //   console.log(cartNew)
  // }
  // , [cartNew]);

  // const handleCheckout = () => {
  //     checkout(product);
  //     navigate('/checkout');
  //   };
  const handleCheckout = (sellerId) => {
    if (cartNew?.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate(`/checkout/${sellerId}`);
    console.log('handleCheckout', sellerId);
  };

  return (
    <div className="w-full">
      <Header />
      <div className="px-40 bg-gray-200">
        {" "}
        {/* main container for body */}
        <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
          YOUR CART
        </div>
        <div className="flex flex-col mt-10">
          {" "}
          {/* container for cart items */}
          {cartNew?.length === 0 ? (
            <div className="flex justify-center items-center h-[400px]">
              <p className="text-gray-600 font-inter font-bold text-[18px]">
                Your cart is empty
              </p>
            </div>
          ) : (
            cartNew?.map((item) => (
              <div>
                {item?.sellerId}
                {item.items?.map((product) => (
                  <CartItem key={product.productId} product={product} />
                ))}
                <div className="flex justify-center mt-10">
                  {" "}
                  {/* container for checkout button */}
                  <button
                    onClick={() => handleCheckout(item?.sellerId)}
                    className="w-[212px] h-[40px] bg-white text-[16px] font-inter font-bold text-[#737373] border border-gray-300 hover:bg-gray-200"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <br />
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
