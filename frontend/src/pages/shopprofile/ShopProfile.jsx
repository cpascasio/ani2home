import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import HorizontalLines from '../../assets/horizontallines.png';
import SortUp from '../../assets/SortUp.png'; // Assuming you have these images
import SortDown from '../../assets/SortDown.png'; // Assuming you have these images
import LeftArrow from '../../assets/LeftArrow.png';
import RightArrow from '../../assets/RightArr.png';
import useFetch from '../../../hooks/useFetch';
import ProductCard from '../../components/ProductCard';
import { useParams } from 'react-router-dom';

const ShopProfile = () => {
    const { sellerId } = useParams();
    const [products, setProducts] = useState([]);
    const [seller, setSeller] = useState({});
    const [profilePicture, setProfilePicture] = useState("");
    const [name, setName] = useState("");
    const [fullAddress, setfullAddress] = useState("");
    const [bio, setBio] = useState("");
    const [followers, setFollowers] = useState(0);
    const [rating, setRating] = useState(0);
    const [numberOfProducts, setNumberOfProducts] = useState(0);
    const [numberOfProductsSold, setNumberOfProductsSold] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedButton, setSelectedButton] = useState('default');
    const [isAscending, setIsAscending] = useState(true);
    const [isCollapseOpen, setIsCollapseOpen] = useState(false);
    const [isSortOptionsOpen, setIsSortOptionsOpen] = useState(false);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);

    const { data: productsFetch } = useFetch(`/api/products/seller/${sellerId}`); // Fetch product data

    useEffect(() => {
        if (productsFetch) {
            setProducts(productsFetch.products);
            setSeller(productsFetch.seller);
        }
    }, [productsFetch]);

    useEffect(() => {
        if (seller) {
            setProfilePicture(seller?.userProfilePic || "");
            setName(seller?.name || "");
            setfullAddress(seller?.address?.fullAddress || "");
            setBio(seller?.bio || "");
            setFollowers(seller?.followers?.length || 0);
            setRating(seller?.rating || 0);
            setNumberOfProducts(products?.length || 0);
            setNumberOfProductsSold(seller?.productsSold || 0);
        }
    }, [seller]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setIsCollapseOpen(false);
    };

    const getButtonClassName = (buttonType) => {
        return `text-base font-inter rounded px-4 py-2 w-auto h-auto flex items-center justify-center cursor-pointer transition-colors duration-300 ${
            selectedButton === buttonType ? 'bg-[#67B045] text-white' : 'bg-white text-[#1E1E1E]'
        }`;
    };

    const handlePrevProduct = () => {
        setCurrentProductIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 3));
    };

    const handleNextProduct = () => {
        setCurrentProductIndex((prevIndex) => (prevIndex < 3 ? prevIndex + 1 : 0));
    };


    return (
        <div className="w-full">
        {/* ----- START BANNER ------ */}
            <div className="flex flex-col md:flex-row w-full h-auto bg-gradient-to-r from-[#072c1c] to-[#83c763] pt-[6%]">
                {/* Mobile View: Profile and Follow Button */}
                <div className="flex flex-row md:hidden w-full p-6 pt-[8vh]">
                    <div className="flex justify-center items-center w-1/3">
                        <div className="bg-white rounded-full">
                            <img src={profilePicture} alt="Shop Logo" className="w-[30vw] h-[30vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center text-white w-2/3 pl-4">
                        <h1 className="text-2xl font-bold font-inter mb-2">{name}</h1>
                        <div className="italic mb-2 font-inter text-sm">{fullAddress}</div>
                        <button className="rounded border border-[#D9D9D9] text-white p-2 px-5 mx-[20%] mt-2 font-inter font-bold transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500">
                            Follow+
                        </button>
                    </div>
                </div>

                {/* Mobile View: Bio Section */}
                <div className="md:hidden flex flex-col p-6 py-0 text-white">
                    <div className="text-justify font-inter text-sm">
                        {bio}
                    </div>
                </div>

                {/* Mobile View: Stats Section */}
                <div className="md:hidden flex flex-row justify-around items-center p-4 space-x-2">
                    <div className="flex flex-col items-center text-white">
                        <div className="flex items-center">
                            <div className="mr-1">
                                <img src="../src/assets/FollowersIcon.png" alt="Followers" className="w-5 h-5" />
                            </div>
                            <div className="text-center font-inter text-xs">
                                <strong>Followers:</strong> {followers}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-white">
                        <div className="flex items-center">
                            <div className="mr-1">
                                <img src="../src/assets/RatingsIcon.png" alt="Ratings" className="w-5 h-5" />
                            </div>
                            <div className="text-center font-inter text-xs">
                                <strong>Rating:</strong> {rating} (1,304)
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-white">
                        <div className="flex items-center">
                            <div className="mr-1">
                                <img src="../src/assets/ProductsIcon.png" alt="Products" className="w-5 h-5" />
                            </div>
                            <div className="text-center font-inter text-xs">
                                <strong>Products:</strong> {numberOfProducts}
                            </div>
                        </div>
                    </div>
                </div>



                {/* Desktop View */}
                <div className="hidden md:flex flex-row w-full px-4 py-2">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center w-1/4 pr-4">
                        <div className="flex justify-center items-center mb-4">
                            <img src={profilePicture} alt="Shop Logo" className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
                        </div>
                    </div>
                    
                    {/* Bio and Follow Button Section */}
                    <div className="flex flex-col w-1/2 pr-8">
                        <div className="flex items-center mb-4">
                            <h1 className="text-2xl font-bold font-inter mr-4 text-left text-white">{name}</h1>
                            <button className=" font-bold rounded border-2 border-white text-white p-2 px-5 font-inter hover:bg-white hover:text-green-900 transition-colors duration-300">
                                Follow+
                            </button>
                        </div>
                        <div className="italic mb-4 font-inter text-left text-white">{fullAddress}</div>
                        <div className="mb-6 text-left font-inter text-justify text-white">
                            {bio}
                        </div>
                    </div>
                    
                    {/* Stats Section */}
                    <div className="flex flex-col w-1/4 text-white justify-items-center pl-[15vh] my-auto">
                        <div className="flex items-center mb-4 w-auto">
                            <div className="mr-2">
                                <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                            </div>
                            <div className="text-left font-inter w-auto">
                                <strong>Followers:</strong> {followers}
                            </div>
                        </div>
                        <div className="flex items-center mb-4 w-auto">
                            <div className="mr-2">
                                <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
                            </div>
                            <div className="text-left font-inter w-auto">
                                <strong>Rating:</strong> {rating} (1,304)
                            </div>
                        </div>
                        <div className="flex items-center w-auto">
                            <div className="mr-2">
                                <img src="../src/assets/ProductsIcon.png" alt="Products" />
                            </div>
                            <div className="text-left font-inter w-full">
                                <strong>Products:</strong> {numberOfProducts}
                            </div>
                        </div>
                    </div>
                </div>
            </div>









            {/* ----- start of body ----- */} 
            <div className="flex flex-col min-h-screen bg-gray-200">
                
                {/* Best Seller Section */}
                <div className="flex flex-col w-full sm:px-40 mb-4">
                    <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-5 mb-3 md:pl-0 pl-6">
                        BEST SELLERS
                    </div>
                    {/* Desktop view */}
                    <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.slice(0, 4).map((product) => (
                            <ProductCard key={product._id} {...product} />
                        ))}
                    </div>
                    {/* Mobile view */}
                    <div className="sm:hidden relative flex items-center justify-center">
                        <button
                            onClick={handlePrevProduct}
                            className="absolute left-0 z-10 p-2 bg-gray-200 rounded-full shadow-md"
                        >
                            <img src={LeftArrow} alt="Previous" className="w-8 h-8" />
                        </button>
                        <div className="w-full flex justify-center">
                            {products.length > 0 && (
                                <ProductCard {...products[currentProductIndex]} />
                            )}
                        </div>
                        <button
                            onClick={handleNextProduct}
                            className="absolute right-0 z-10 p-2 bg-gray-200 rounded-full shadow-md"
                        >
                            <img src={RightArrow} alt="Next" className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row w-full max-w-screen-xl mx-auto p-4">
                {/* Categories Section */}
                <div className="w-full sm:w-[15%] p-4">
                    {/* Mobile Collapse */}
                    <div className="block sm:hidden">
                    <button
                        onClick={() => setIsCollapseOpen(!isCollapseOpen)}
                        className="flex items-center cursor-pointer bg-[#0B472D] text-white p-2 rounded-md w-full text-left"
                    >
                        <span className="flex-1">Categories</span>
                        <svg
                        className={`w-4 h-4 transition-transform ${isCollapseOpen ? 'rotate-180' : 'rotate-0'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {isCollapseOpen && (
                        <div className="bg-[#67B045] text-white p-4 w-auto max-w-md mx-auto"> {/* Adjusted width */}
                        {['All Products', 'Vegetables', 'Meat', 'Fruits'].map((category) => (
                            <a
                            key={category}
                            href={`#${category.toLowerCase()}`}
                            className={`block text-[16px] ${selectedCategory === category ? 'font-bold text-gray-200' : 'text-gray-200'} mb-3 hover:text-blue-300`}
                            onClick={() => handleCategoryClick(category)}
                            >
                            {category}
                            </a>
                        ))}
                        </div>
                    )}
                    </div>
                    {/* Desktop Categories */}
                    <div className="hidden sm:block">
                    <div className="flex items-center text-gray-600 mb-3">
                        <img src={HorizontalLines} alt="Categories Icon" className="w-5 h-5" />
                        <span className="text-xl font-bold pl-2">Categories</span>
                    </div>
                    <div className="flex flex-col text-left">
                        {['All Products', 'Vegetables', 'Meat', 'Fruits'].map((category) => (
                        <a
                            key={category}
                            href={`#${category.toLowerCase()}`}
                            className={`text-[16px] ${selectedCategory === category ? 'font-bold text-gray-800' : 'text-gray-800'} mb-3 hover:text-blue-500`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category}
                        </a>
                        ))}
                    </div>
                    </div>
                </div>
                {/* Product Section */}
                <div className="w-full sm:w-[85%] px-4">
                    <div className="flex items-center justify-between px-4 py-2 mb-4 rounded-lg bg-[#0B472D] shadow-md">
                    {/* Sort by and Collapse */}
                    <div className="flex items-center space-x-4">
                        <span className="text-white text-lg sm:text-2xl font-inter">Sort by</span>
                        {/* Container for sort options */}
                        <div className="relative flex items-center space-x-2">
                        {/* Mobile Sort Options Toggle Button */}
                        <button
                            onClick={() => setIsSortOptionsOpen(!isSortOptionsOpen)}
                            className="block sm:hidden text-white bg-[#67B045] rounded px-4 py-2"
                        >
                            {selectedButton}
                        </button>
                        {/* Mobile Sort Options Menu */}
                        {isSortOptionsOpen && (
                            <div className="absolute top-full left-0 w-auto max-w-md bg-[#67B045] text-white rounded mt-2 p-2"> {/* Adjusted width and padding */}
                            <div
                                className={getButtonClassName('default')}
                                onClick={() => {
                                setSelectedButton('default');
                                setIsSortOptionsOpen(false);
                                }}
                            >
                                Default
                            </div>
                            <div
                                className={getButtonClassName('topSales')}
                                onClick={() => {
                                setSelectedButton('topSales');
                                setIsSortOptionsOpen(false);
                                }}
                            >
                                Top Sales
                            </div>
                            <div
                                className={getButtonClassName('topRated')}
                                onClick={() => {
                                setSelectedButton('topRated');
                                setIsSortOptionsOpen(false);
                                }}
                            >
                                Top Rated
                            </div>
                            </div>
                        )}
                        {/* Desktop Sort Options */}
                        <div className="hidden sm:flex items-center space-x-2">
                            <div
                            className={getButtonClassName('default')}
                            onClick={() => setSelectedButton('default')}
                            >
                            Default
                            </div>
                            <div
                            className={getButtonClassName('topSales')}
                            onClick={() => setSelectedButton('topSales')}
                            >
                            Top Sales
                            </div>
                            <div
                            className={getButtonClassName('topRated')}
                            onClick={() => setSelectedButton('topRated')}
                            >
                            Top Rated
                            </div>
                        </div>
                        </div>
                    </div>
                    {/* Ascending/Descending */}
                    <div className="flex items-center space-x-2">
                        <span className="text-white font-inter text-sm sm:text-lg">
                        {isAscending ? 'Ascending' : 'Descending'}
                        </span>
                        <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsAscending(!isAscending);
                        }}
                        className="flex items-center p-1"
                        >
                        <img
                            src={isAscending ? SortUp : SortDown}
                            alt={isAscending ? 'Sort Ascending' : 'Sort Descending'}
                            className="w-6 h-6"
                        />
                        </button>
                    </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {products?.map((product) => (
                        <ProductCard key={product._id} {...product} />
                    ))}
                    </div>
                </div>
                </div>

            </div>
            
        </div>
    );
};

export default ShopProfile;
