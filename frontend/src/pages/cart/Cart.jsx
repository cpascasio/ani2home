import { useState, useEffect, useContext } from 'react';
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
    const handleCheckout = ( ) => {
        if (cartNew?.length === 0) {
          alert('Your cart is empty');
          return;
        }
        navigate('/checkout', { state: { cartItems: cartNew}});
        // console.log('handleCheckout', cartNew);
        

      };


    return (
        <div  style={{ backgroundColor: '#e5e7eb', minHeight: '100vh' }} className="w-full pt-24">
            <Header />
            <div className="px-4 md:px-20 lg:px-40 bg-gray-200 min-h-screen"> {/* main container for body */}
                <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
                    YOUR CART
                </div>
                <div className="space-y-4">
                    {cartNew?.map((product, index) => (
                        <CartItem key={index} product={product} />
                    ))}
                </div>
                <div className="flex justify-center mt-10"> {/* container for checkout button */}
                    <button 
                        onClick={handleCheckout}
                        className="w-full max-w-[212px] h-[40px] bg-green-900 rounded-md text-[16px] font-inter font-bold text-white border border-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition duration-300 ease-in-out"
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
