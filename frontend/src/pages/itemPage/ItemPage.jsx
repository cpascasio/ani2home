import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import Carrot from '../../assets/carrot.png';
import Star from '../../assets/Star.png';
import StarFilled from '../../assets/StarFilled.png';
import MyProfilePic from '../../assets/MyProfile pic.png'; // Update with your profile pic
import StorefrontIcon from '../../assets/storefront.png'; // Add your storefront icon import
import { useNavigate } from 'react-router-dom';

// Function to generate star elements based on the rating
const generateStars = (rating, isProductCard = false) => {
    const starElements = [];
    const starClass = isProductCard ? "w-6 h-6" : "w-5 h-5"; // Adjust size for product card
    for (let k = 0; k < Math.floor(rating); k++) {
        starElements.push(
            <img
                key={`filled-${k}`}
                alt="Star"
                src={StarFilled}
                className={starClass} // Adjusted size to match "/ 5"
            />
        );
    }
    for (let k = 0; k < 5 - Math.floor(rating); k++) {
        starElements.push(
            <img
                key={`empty-${k}`}
                alt="Star"
                src={Star}
                className={starClass} // Adjusted size to match "/ 5"
            />
        );
    }
    return starElements;
};

const ItemPage = () => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1); // State for quantity
    const rating = 4.9; // Example rating
    const price = 100; // Example price
    const productName = "Carrot"; // Example product name
    const numberOfRatings = 100; // Example number of received ratings

    const handleAddToCart = () => {
        navigate('/cart');
    };

    const handleIncrease = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrease = () => {
        setQuantity(prev => Math.max(prev - 1, 1)); // Ensure minimum is 1
    };

    const handleViewShop = () => {
        window.location.href = 'http://localhost:5173/shopProfile';
    };

    return (
        <div style={{ backgroundColor: '#e5e7eb', minHeight: '100vh' }} className="w-full pt-24">
            <Header />
            <div className="flex flex-col min-h-screen bg-gray-200">
                {/* Breadcrumb Navigation Container */}
                <div className="relative w-full max-w-screen-md">
                    {/* Flex container for positioning */}
                    <div className="absolute top-0 left-0 w-full px-4 mt-2">
                        <nav className="text-gray-600 text-sm font-semibold">
                            <a
                                href="http://localhost:5173/"
                                className="hover:text-blue-500"
                            >
                                Homepage
                            </a> 
                            {' > '}
                            <a
                                href="http://localhost:5173/products"
                                className="hover:text-blue-500"
                            >
                                Products
                            </a>
                            {' > '}
                            <span>{productName}</span>
                        </nav>
                    </div>
                </div>
                <div className="flex flex-col w-full max-w-screen-lg mx-auto p-4 mt-10">
                    {/* Product Card Container */}
                    <div className="flex flex-col md:flex-row border border-gray-300 rounded-lg overflow-hidden shadow-md w-full bg-white">
                        {/* Image Section */}
                        <div className="w-full md:w-1/3 flex justify-center items-center">
                            <img
                                src={Carrot}
                                alt="Carrot"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {/* Product Details Section */}
                        <div className="w-full md:w-2/3 flex flex-col p-4 md:p-7">
                            <h2 className="text-left text-xl font-bold text-gray-900 truncate">{productName}</h2>
                            <p className="text-left text-xs text-gray-600 mt-1 line-clamp-2">
                                This is a description of the carrot product. It provides details about the carrot, its benefits, and any other relevant information.
                            </p>
                            <div className="flex flex-col mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-left text-[15px] text-[#E11919]">
                                        <span className="text-black">Price: </span>
                                        ₱{price.toFixed(2)}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-left text-[15px] text-[#737373] mr-2">Quantity</div>
                                        <button
                                            onClick={handleDecrease}
                                            className="w-[30px] h-[30px] flex items-center justify-center text-[20px] font-inter text-[#737373] bg-gray-200 border border-gray-300 hover:bg-gray-300 transition-colors duration-300"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="text"
                                            value={quantity}
                                            readOnly
                                            className="w-[40px] h-[30px] text-center border border-gray-300 mx-1"
                                        />
                                        <button
                                            onClick={handleIncrease}
                                            className="w-[30px] h-[30px] flex items-center justify-center text-[20px] font-inter text-[#737373] bg-gray-200 border border-gray-300 hover:bg-gray-300 transition-colors duration-300"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center">
                                        {generateStars(rating, true)}
                                        <span className="ml-2 text-xs text-gray-700">{rating.toFixed(1)}</span>
                                    </div>
                                    <button
                                        className="bg-green-900 text-white py-2 px-4 md:px-20 text-sm rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-300"
                                        onClick={handleAddToCart}
                                    >
                                        Add To Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* White Rectangle with Profile Pic and Shop Info */}
                    <div className="my-6 bg-white border border-gray-300 rounded-lg shadow-md p-4 flex items-center">
                        <div className="flex items-center">
                            <img
                                src={MyProfilePic}
                                alt="Profile"
                                className="w-12 h-12 bg-gray-300 rounded-full object-cover"
                            />
                            <div className="ml-4">
                                <div className="text-gray-900 text-md font-semibold">Shop Name</div>
                                <button
                                    onClick={handleViewShop}
                                    className="mt-1 flex items-center bg-blue-500 text-white text-xs py-1 px-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
                                >
                                    <img
                                        src={StorefrontIcon}
                                        alt="Storefront"
                                        className="w-4 h-4 mr-1"
                                    />
                                    View Shop
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Additional Details Box */}
                    <div className="mt-4 bg-white border border-gray-300 rounded-lg shadow-md">
                        <div className="bg-gray-200 p-3 rounded-t-lg text-left">
                            <h3 className="text-base font-semibold text-gray-900 ml-2">Ratings and Reviews of {productName}</h3>
                        </div>
                        <div className="p-5">
                            {/* Rating Number Container */}
                            <div className="flex items-baseline mb-2">
                                <span className="text-3xl font-bold text-black">{rating.toFixed(1)}</span>
                                <span className="text-xl text-gray-600 ml-2">/ 5</span>
                            </div>
                            {/* Stars Container */}
                            <div className="flex mb-2">
                                {generateStars(rating)}
                            </div>
                            {/* Number of Ratings Container */}
                            <div className="flex items-left text-xs text-gray-600">
                                {numberOfRatings} Ratings
                            </div>
                            <hr className="my-4 border-gray-300" />
                            <div className="flex items-left mt-4 text-sm font-semibold text-black">
                                Product Reviews
                            </div>
                            <hr className="my-4 border-gray-300" />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ItemPage;
