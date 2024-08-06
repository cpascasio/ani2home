import { useState, useContext } from 'react';
import { Link, useNavigate} from 'react-router-dom';
// import useEffect
import { useEffect } from 'react';
// import useFetch
import useFetch from '../../hooks/useFetch';

import StarFilled from '../assets/StarFilled.png'; // path to the star images
import StarHalfEmpty from '../assets/StarHalfEmpty.png'; // path to the star images
import Star from '../assets/Star.png'; // path to the star images
// import axios
import axios from 'axios';
import { useUser } from '../context/UserContext';
// import cartcontext
import { CartContext } from '../context/CartContext';

const CartItem = ({ product }) => {
    const { user } = useUser();
    const [products, setProducts] = useState('');
    const { data: productsFetch } = useFetch(`/api/products/${product.productId}`);
  

  useEffect(() => {
    if (productsFetch) {
      setProducts(productsFetch);
    }
  }
  , [productsFetch]);


  useEffect(() => {
    console.log("Products: ", products)
  }
  , [products]);

    console.log('Product Data: ', product);

    const [quantity, setQuantity] = useState(product.quantity || 1);
    const [showModal, setShowModal] = useState(false);
    const { updateQuantity } = useContext(CartContext);

    const handleIncrease = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        updateQuantity(product.id, newQuantity);
    };

    const handleDecrease = () => {
        const newQuantity = Math.max(quantity - 1, 1);
        setQuantity(newQuantity);
        updateQuantity(product.id, newQuantity);
    };

    const handleRemoveClick = () => setShowModal(true);
    const handleCancel = () => setShowModal(false);
    const handleRemove = () => {
        setShowModal(false);
        handleRemoveFromCart();
        // Implement the actual remove logic here
    };

    // Calculate total price
    const totalPrice = products?.price * product.quantity;

    // const handleRemoveFromCart = async () => {
    //     try {
    //       // Create Axios DELETE request
    //       await axios.delete(`http://localhost:3000/api/cart/remove-from-cart`, {
    //         data: {
    //           userId: user?.userId,
    //           productId: product?.id
    //         }
    //       });
    //       console.log('user id: ', userId);
    //       console.log('Product removed from cart');
    //     } catch (error) {
    //       console.error('Error removing from cart:', error);
    //     }
    //   };

    const handleRemoveFromCart = async () => {
        try {
            const payload = {
                userId: user?.userId,
                productId: product?.productId
            };
            console.log('Payload:', payload);
    
            // Create Axios DELETE request
            await axios.delete(`http://localhost:3000/api/cart/remove-from-cart`, {
                data: payload
            });
            console.log('Product removed from cart');
            window.location.reload();
         
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    return (
        <div className="bg-white p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between w-full max-w-5xl mx-auto my-4 border border-gray-300 relative">
            <div className="flex flex-row items-start lg:flex-row lg:items-start">
                <img src={products.picture} alt="Product" className="w-[100px] h-[100px]" />
                <div className="flex flex-col lg:ml-4 items-start mt-2 lg:mt-1">
                    <div className="w-full line-clamp-2 text-[15px] font-inter text-[#737373] text-left lg:text-left mb-3 mt-3">
                        {products.description}
                    </div>
                    <div className="flex items-center justify-center mt-2">
                        <img src={StarFilled} alt="Star Filled" className="w-4 h-4" />
                        <img src={StarFilled} alt="Star Filled" className="w-4 h-4" />
                        <img src={StarFilled} alt="Star Filled" className="w-4 h-4" />
                        <img src={StarHalfEmpty} alt="Star Half Empty" className="w-4 h-4" />
                        <img src={Star} alt="Star" className="w-4 h-4" />
                        <div className="text-[13px] font-inter text-[#737373] ml-2">4.5k sold</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row items-center justify-center lg:flex-row lg:items-center lg:justify-between mt-4 lg:mt-0 lg:w-auto w-full">
                <div className="flex flex-col items-center lg:items-center lg:mr-10 mb-4 lg:mb-0 mr-10">
                    <div className="text-[17px] font-inter text-[#737373]">Unit Price</div>
                    <div className="text-[15px] font-inter text-[#E11919] mt-1">₱{products.price}</div>
                </div>
                <div className="flex flex-col items-center lg:items-center lg:mr-8 mb-4 lg:mb-0 mr-10">
                    <div className="text-[17px] font-inter text-[#737373] text-center lg:text-left">Quantity</div>
                    <div className="flex items-center justify-center mt-2">
                        <button 
                            onClick={handleDecrease} 
                            className="w-[20px] h-[20px] flex items-center justify-center text-[16px] font-inter text-[#737373] bg-gray-200 border border-gray-300 hover:bg-gray-300 transition-colors duration-300"
                        >
                            -
                        </button>
                        <input
                            type="text"
                            value={quantity}
                            readOnly
                            className="w-[40px] h-[20px] text-center text-black border border-gray-300 bg-white mx-1"
                        />
                        <button 
                            onClick={handleIncrease} 
                            className="w-[20px] h-[20px] flex items-center justify-center text-[16px] font-inter text-[#737373] bg-gray-200 border border-gray-300 hover:bg-gray-300 transition-colors duration-300"
                        >
                            +
                        </button>
                    </div>
                </div>
                <div className="flex flex-col items-center lg:items-center lg:mr-5 mb-4 lg:mb-0 lg:ml-2">
                    <div className="text-[17px] font-inter text-[#737373] text-center lg:text-left">Total Price</div>
                    <div className="text-[15px] font-inter text-[#E11919] mt-1 text-center lg:text-left">
                        ₱{totalPrice.toFixed(2)}
                    </div>
                </div>
            </div>
            <div className="flex justify-center lg:justify-end mt-4 lg:mt-0 lg:mr-10">
                <button 
                    onClick={handleRemoveClick} 
                    className="text-[15px] font-inter text-[#737373] underline hover:text-blue-500"
                >
                    Remove
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white w-[400px] p-6 rounded-lg shadow-lg">
                        <div className="text-[16px] font-inter text-black mb-4">
                            Are you sure you want to remove this product?
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={handleCancel} 
                                className="w-[80px] h-[40px] bg-gray-200 text-[16px] font-inter font-bold text-[#737373] border border-gray-300 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRemove} 
                                className="w-[80px] h-[40px] bg-[#E11919] text-[16px] font-inter font-bold text-white border border-gray-300 hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartItem;
