import React from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import Carrot from '../../assets/carrot.png';
import Star from '../../assets/Star.png';
import StarFilled from '../../assets/StarFilled.png';
import { useNavigate } from 'react-router-dom';

// Function to generate star elements based on the rating
const generateStars = (rating) => {
    const starElements = [];
    for (let k = 0; k < Math.floor(rating); k++) {
        starElements.push(
            <img
                key={`filled-${k}`}
                alt="Star"
                src={StarFilled}
                className="w-4 h-4"
            />
        );
    }
    for (let k = 0; k < 5 - Math.floor(rating); k++) {
        starElements.push(
            <img
                key={`empty-${k}`}
                alt="Star"
                src={Star}
                className="w-4 h-4"
            />
        );
    }
    return starElements;
};

const ItemPage = () => {
    const navigate = useNavigate();
    const rating = 4.9; // Example rating
    const price = 100; // Example price
    const productName = "Carrot"; // Example product name

    const handleAddToCart = () => {
        navigate('/cart');
    };

    return (
        <div style={{ backgroundColor: '#e5e7eb', minHeight: '100vh' }} className="w-full pt-24">
            <Header />
            <div className="flex flex-col min-h-screen bg-gray-200">
                {/* Breadcrumb Navigation Container */}
                <div className="relative w-full max-w-screen-md mx-left">
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
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden shadow-md w-full bg-white">
                        {/* Image Section */}
                        <div className="w-1/3 flex justify-center items-center">
                            <img
                                src={Carrot}
                                alt="Carrot"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {/* Product Details Section */}
                        <div className="w-2/3 flex flex-col p-7">
                            <h2 className="text-left text-xl font-bold text-gray-900 truncate">{productName}</h2>
                            <p className="text-left text-xs text-gray-600 mt-1 line-clamp-2">
                                This is a description of the carrot product. It provides details about the carrot, its benefits, and any other relevant information.
                            </p>
                            <div className="text-left text-[15px] text-[#E11919] mt-2">
                                ₱{price}
                            </div>
                            <div className="flex items-center mt-2">
                                <div className="flex flex-grow items-center">
                                    {generateStars(rating)}
                                    <span className="ml-2 text-xs text-gray-700">{rating.toFixed(1)}</span>
                                </div>
                                <a
                                    href="#"
                                    className="text-xs text-blue-500 underline hover:text-blue-700 ml-4"
                                >
                                    See all
                                </a>
                            </div>
                            <button
                                className="bg-green-900 text-white py-1 px-2 text-xs rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-300 mt-4 sm:py-2 sm:px-4 sm:text-sm"
                                onClick={handleAddToCart}
                            >
                                Add To Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ItemPage;
