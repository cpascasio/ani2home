import { useState } from 'react';
import React, { useContext } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import CartItem from '../../components/CartItem';
import { CartContext } from '../../context/CartContext';


const Cart = () => {
    const { cart } = useContext(CartContext);

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
                        onClick={() => window.location.href = "http://localhost:5173/checkout"}
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