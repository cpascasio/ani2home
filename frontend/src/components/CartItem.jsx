// import useState
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

    // const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);

    // const handleIncrease = () => setQuantity(prevQuantity => prevQuantity + 1);
    // const handleDecrease = () => setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));

    const [quantity, setQuantity] = useState(product.quantity || 1);
  //const { updateQuantity } = useContext(CartContext);

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
         
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    return (
        <div className="bg-white w-[1225px] h-[133px] mt-4 flex items-center p-4 relative"> {/* white box */}
            <img src={products.pictures} alt="Product" className="w-[100px] h-[100px]" /> {/* product image */}
            <div className="flex flex-col justify-between ml-4"> {/* container for description and ratings */}
                <div className="p-2 w-[224px] h-[53px] line-clamp-2 text-[15px] font-inter text-[#737373] text-left"> {/* description text box */}
                    {products.description}
                </div>
                <div className="flex items-center mt-1 ml-1.5"> {/* container for star ratings */}
                    <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                    <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                    <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                    <img src={StarHalfEmpty} alt="Star Half Empty" className="w-4 h-4 mx-0.1" />
                    <img src={Star} alt="Star" className="w-4 h-4 mx-0.5" />
                    <div className="text-[13px] font-inter text-[#737373] ml-1">4.5k sold</div>
                </div>
            </div>
            <div className="ml-20 flex items-center"> {/* container for unit price, quantity, and total price */}
                <div className="flex flex-col mr-20"> {/* container for unit price */}
                    <div className="text-[17px] font-inter text-[#737373] mt-[-24px]">Unit Price</div>
                    <div className="text-[15px] font-inter text-[#E11919] mt-5">₱{products.price}</div>
                </div>
                <div className="flex flex-col items-center mr-20"> {/* container for quantity */}
                    <div className="text-[17px] font-inter text-[#737373] mt-[-24px]">Quantity</div>
                    <div className="flex items-center mt-5"> {/* quantity selector */}
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
                            className="w-[40px] h-[20px] text-center border border-gray-300 mx-1"
                        />
                        <Link
                            to={{
                            pathname: '/checkout',
                            state: { quantity },
                            }}
                        ></Link>
                        <button 
                            onClick={handleIncrease} 
                            className="w-[20px] h-[20px] flex items-center justify-center text-[16px] font-inter text-[#737373] bg-gray-200 border border-gray-300 hover:bg-gray-300 transition-colors duration-300"
                        >
                            +
                        </button>
                    </div>
                </div>
                <div className="flex flex-col mr-20"> {/* container for total price */}
                    <div className="text-[17px] font-inter text-[#737373] mt-[-24px]">Total Price</div>
                    <div className="text-[15px] font-inter text-[#E11919] mt-5">₱{totalPrice.toFixed(2)}</div>
                </div>
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 mx-10"> {/* Remove text */}
                <button 
                    onClick={handleRemoveFromCart} 
                    className="text-[15px] font-inter text-[#737373] underline hover:text-blue-500"
                >
                    Remove
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"> {/* Added z-50 */}
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