import { useState, useEffect } from 'react';
import React, { useContext } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import CartItem from '../../components/CartItem';
import { CartContext } from '../../context/CartContext';
import useFetch from '../../../hooks/useFetch'
import { useUser } from '../../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';



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
    },[cartFetch]);
  
    useEffect(() => {
      console.log(cartNew);
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
    const handleCheckout = () => {
        if (cartNew?.length === 0) {
          alert('Your cart is empty');
          return;
        }
        navigate('/checkout', { state: { cartItems: cartNew}});
        console.log('handleCheckout', cartNew);
        

      };


    return (
        <div className='w-full'>
            <Header />
            <div className="px-40 bg-gray-200"> {/* main container for body */}
                <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
                    YOUR CART
                </div>
                {cartNew?.map((product, index) => (
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