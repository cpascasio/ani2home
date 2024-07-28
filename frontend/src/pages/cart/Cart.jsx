import { useState } from 'react';
import React, { useContext } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import CartItem from '../../components/CartItem';
import { CartContext } from '../../context/CartContext';

import { useNavigate } from 'react-router-dom';



const Cart = () => {
    const { cart } = useContext(CartContext);
    const { checkout } = useContext(CartContext);
    const navigate = useNavigate();


    // const handleCheckout = () => {
    //     checkout(product);
    //     navigate('/checkout');
    //   };
    const handleCheckout = () => {
        if (cart.length === 0) {
          alert('Your cart is empty');
          return;
        }
        navigate('/checkout');
       // add console log
        console.log('checkout', cart
        );
        

      };

    return (
        <div className='w-full'>
            <Header />
            <div className="px-40 bg-gray-200"> {/* main container for body */}
                <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
                    YOUR CART
                </div>
                {cart.map((product, index) => (
                    <CartItem key={index} product={product} />
                ))}
                <div className="flex justify-center mt-10"> {/* container for checkout button */}
                    <button 
                        onClick={handleCheckout}
                        className="w-[212px] h-[40px] bg-white text-[16px] font-inter font-bold text-[#737373] border border-gray-300 hover:bg-gray-200"
                    >
                        Proceed to Checkout
                    </button>
                </div>
                <br/>
            </div>
            <Footer />
        </div>
    );
};

export default Cart;