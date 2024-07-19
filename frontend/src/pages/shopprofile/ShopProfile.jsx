import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import './shopprofile.css';
import FarmCover1 from '../../assets/FarmCover1.jpg';
import Carrot from '../../assets/carrot.png';
import Cabbage from '../../assets/cabbage.png';
import Onion from '../../assets/onion.png';
import Garlic from '../../assets/garlic.png';
import StarFilled from '../../assets/StarFilled.png';
import StarHalfEmpty from '../../assets/StarHalfEmpty.png';
import Star from '../../assets/Star.png';
import HorizontalLines from '../../assets/horizontallines.png';
import SortUp from '../../assets/SortUp.png'; // Assuming you have these images
import SortDown from '../../assets/SortDown.png'; // Assuming you have these images

const ShopProfile = () => {
    const [selectedButton, setSelectedButton] = useState('default');
    const [isAscending, setIsAscending] = useState(true); // State for sorting direction
    const [selectedCategory, setSelectedCategory] = useState('All'); // State for selected category

    const getButtonClassName = (buttonType) => {
        return `text-[12px] font-inter rounded px-4 py-2 ml-4 w-[86px] h-[32px] flex items-center justify-center cursor-pointer transition-colors duration-300 ${
            selectedButton === buttonType ? 'bg-[#67B045] text-white' : 'bg-white text-[#1E1E1E]'
        }`;
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    useEffect(() => {
        // Redirect to the category section when the component mounts
        window.location.hash = '#category1'; // Modified line: Automatically add '#category1' to the URL
    }, []);

    return (
        <div className="w-full">
            <Header />
            <div className="flex w-full h-auto bg-gradient-to-r from-green-900"> {/* banner */}
                <div className="flex flex-1 pl-[3%] pt-[2%] pb-[2%]"> {/* banner left side */}
                    <div className="flex flex-col items-center text-white"> {/* box for logo and stats */}
                        <div className="flex justify-center items-center mb-4"> {/* logo */}
                            <img src="../src/assets/FarmShop1.jpg" alt="Shop Logo" className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
                        </div>
                        <div className="mt-[5%]"> {/* stats box */}
                            <div className="flex items-center mb-2"> {/* followers */}
                                <div className="mr-2">
                                    <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                                </div>
                                <div className="text-left font-inter">
                                    <strong>Followers:</strong> 1,203
                                </div>
                            </div>
                            <div className="flex items-center mb-2"> {/* ratings */}
                                <div className="mr-2">
                                    <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
                                </div>
                                <div className="text-left font-inter">
                                    <strong>Rating:</strong> 4.4 (1,304)
                                </div>
                            </div>
                            <div className="flex items-center mb-2"> {/* products */}
                                <div className="mr-2">
                                    <img src="../src/assets/ProductsIcon.png" alt="Products" />
                                </div>
                                <div className="text-left font-inter">
                                    <strong>Products:</strong> 67
                                </div>
                            </div>
                        </div>
                    </div> {/* end of box for logo and stats */}
                    <div className="flex flex-col flex-1 pl-[4%] pr-[4%] text-white items-start"> {/* Name, Location, Bio, Buttons */}
                        <h1 className="text-2xl font-bold font-inter mb-0">
                            Pogi Farms
                        </h1>
                        <div className="italic mb-4 font-inter">
                            Dasmarinas, Cavite
                        </div>
                        <div className="mb-6 text-left font-inter"> {/* CHARACTERS MAXIMUM: 439 */}
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doxeee ands eiusmod tempor incididunt ut 
                            labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
                            aliquip ex ea commodo co.Duis aute irure dolor in reprehenderit in voluptate velita esse cillum dolore eu 
                            fugiat nulla pariatur. Excepteur sint occaecatellicid cupidatat non proident what is loooove.Maybe this
                        </div>
                        <button className="rounded border-2 border-white p-2 px-5 w-full font-inter hover:bg-white hover:text-green-900 transition-colors duration-300">
                            Follow+
                        </button>
                    </div> {/* end of name etc of user profile */}
                </div> {/* banner left side end */}
                <div className="flex flex-1 items-end justify-end pr-[4%] pb-[2%]"> {/* banner right side */}
                    {/* should insert cover photo here --> use FarmCover1.jpg */}
                    <button className="bg-blue-500 text-white font-inter font-bold rounded px-4 py-2">
                        View Seller
                    </button>
                </div> {/* banner right side end */}
            </div> {/* banner end */}

            {/* ----- start of body ----- */} 
            <div className="px-40 bg-gray-200"> {/* main container for body */}
                <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-5">
                    BEST SELLERS
                </div>
                <div className="mt-4 flex justify-between"> {/* container for white boxes */}
                    <div className="w-[244px] h-[364px] bg-white flex flex-col items-center"> {/* white box */}
                        <img src={Carrot} alt="Carrot" className="w-[244px] h-[244px] object-cover mb-2" />
                        <div className="p-2 pt-3 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#737373] text-left mt-[-5px]"> {/* description text box */}
                            Fresh Carrot 18 inch harvested last night 800mg sale emeru...
                        </div>
                        <div className="p-2 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#E11919] text-left mt-[-10px]"> {/* price text box */}
                            ₱695.00
                        </div>
                        <div className="flex items-center justify-start w-full pl-4 mt-[-px]"> {/* star ratings */}
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarHalfEmpty} alt="Star Half Empty" className="w-4 h-4 mx-0.1" />
                            <img src={Star} alt="Star" className="w-4 h-4 mx-0.1" />
                            <div className="text-[10px] font-inter text-[#737373] ml-1 mt-1">4.5k sold</div>
                        </div>
                    </div>
                    <div className="w-[244px] h-[364px] bg-white flex flex-col items-center"> {/* white box */}
                        <img src={Cabbage} alt="Cabbage" className="w-[244px] h-[244px] object-cover mb-2" />
                        <div className="p-2 pt-3 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#737373] text-left mt-[-5px]"> {/* description text box */}
                            Fresh Carrot 18 inch harvested last night 800mg sale emeru...
                        </div>
                        <div className="p-2 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#E11919] text-left mt-[-10px]"> {/* price text box */}
                            ₱695.00
                        </div>
                        <div className="flex items-center justify-start w-full pl-4 mt-[-px]"> {/* star ratings */}
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarHalfEmpty} alt="Star Half Empty" className="w-4 h-4 mx-0.1" />
                            <img src={Star} alt="Star" className="w-4 h-4 mx-0.1" />
                            <div className="text-[10px] font-inter text-[#737373] ml-1 mt-1">3.2k sold</div>
                        </div>
                    </div>
                    <div className="w-[244px] h-[364px] bg-white flex flex-col items-center"> {/* white box */}
                        <img src={Onion} alt="Onion" className="w-[244px] h-[244px] object-cover mb-2" />
                        <div className="p-2 pt-3 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#737373] text-left mt-[-5px]"> {/* description text box */}
                            Fresh Carrot 18 inch harvested last night 800mg sale emeru...
                        </div>
                        <div className="p-2 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#E11919] text-left mt-[-10px]"> {/* price text box */}
                            ₱695.00
                        </div>
                        <div className="flex items-center justify-start w-full pl-4 mt-[-px]"> {/* star ratings */}
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarHalfEmpty} alt="Star Half Empty" className="w-4 h-4 mx-0.1" />
                            <img src={Star} alt="Star" className="w-4 h-4 mx-0.1" />
                            <div className="text-[10px] font-inter text-[#737373] ml-1 mt-1">1.1k sold</div>
                        </div>
                    </div>
                    <div className="w-[244px] h-[364px] bg-white flex flex-col items-center"> {/* white box */}
                        <img src={Garlic} alt="Garlic" className="w-[244px] h-[244px] object-cover mb-2" />
                        <div className="p-2 pt-3 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#737373] text-left mt-[-5px]"> {/* description text box */}
                            Fresh Carrot 18 inch harvested last night 800mg sale emeru...
                        </div>
                        <div className="p-2 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#E11919] text-left mt-[-10px]"> {/* price text box */}
                            ₱695.00
                        </div>
                        <div className="flex items-center justify-start w-full pl-4 mt-[-px]"> {/* star ratings */}
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarFilled} alt="Star Filled" className="w-4 h-4 mx-0.1" />
                            <img src={StarHalfEmpty} alt="Star Half Empty" className="w-4 h-4 mx-0.1" />
                            <img src={Star} alt="Star" className="w-4 h-4 mx-0.1" />
                            <div className="text-[10px] font-inter text-[#737373] ml-1 mt-1">2.5k sold</div>
                        </div>
                    </div>
                </div>

                <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
                    ALL PRODUCTS
                </div>
                {/* Categories Section */}
                <div className="flex mt-7">
                    <div className="w-[200px]">
                        <div className="flex items-center text-gray-600 mb-3">
                            <img src={HorizontalLines} alt="Categories Icon" className="w-[20px] h-[20px]" />
                            <span className="text-[18px] font-inter font-bold pl-2">Categories</span>
                        </div>
                        <div className="flex flex-col text-left mx-3">
                            <a
                                href="#category1"
                                className={`text-[16px] ${selectedCategory === 'All' ? 'font-bold text-gray-800' : 'text-gray-800'} mb-3 hover:underline`}
                                onClick={() => handleCategoryClick('All')}
                            >
                                All
                            </a>
                            <a
                                href="#category2"
                                className={`text-[16px] ${selectedCategory === 'Vegetables' ? 'font-bold text-gray-800' : 'text-gray-800'} mb-3 hover:underline`}
                                onClick={() => handleCategoryClick('Vegetables')}
                            >
                                Vegetables
                            </a>
                            <a
                                href="#category3"
                                className={`text-[16px] ${selectedCategory === 'Meat' ? 'font-bold text-gray-800' : 'text-gray-800'} mb-3 hover:underline`}
                                onClick={() => handleCategoryClick('Meat')}
                            >
                                Meat
                            </a>
                            <a
                                href="#category4"
                                className={`text-[16px] ${selectedCategory === 'Fruits' ? 'font-bold text-gray-800' : 'text-gray-800'} mb-3 hover:underline`}
                                onClick={() => handleCategoryClick('Fruits')}
                            >
                                Fruits
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col ml-6 w-full"> {/* Flex column for sorting and boxes */}
                        <div className="w-[1010px] h-[55px] bg-[#0B472D] flex items-center pl-4 mb-4"> {/* rectangle */}
                            <span className="text-white text-2xl font-inter mx-2">Sort by</span>
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
                            <div className="flex-1 flex items-center justify-end"> {/* Container for the search bar */}
                                <form className="flex items-center">
                                    <input
                                        className="w-[286px] h-[30px] bg-white rounded-full px-4 mr-3"
                                        type="text"
                                        placeholder="Vegetables, Fruits, Meat..."
                                        style={{ fontSize: '11px' }} // Inline style for placeholder text size
                                    />
                                    <div className="flex items-center ml-4">
    <span className="text-white font-inter text-[18px] mr-2" style={{ minWidth: '100px' }}>
        {isAscending ? 'Ascending' : 'Descending'}
    </span>
    <button
        onClick={(e) => {
            e.preventDefault(); // Prevent the default form submission
            setIsAscending(!isAscending);
        }}
        className="flex items-center p-1"
    >
        <img
            src={isAscending ? SortUp : SortDown}
            alt={isAscending ? 'Sort Ascending' : 'Sort Descending'}
            className="w-8 h-8 mr-4"
        />
    </button>
</div>
                                </form>
                            </div>
                        </div> {/* rectangle end */}
                        <div className="flex justify-between w-[1010px]"> {/* Container for white boxes */}
                            {[...Array(5)].map((_, index) => ( /* Create 5 white boxes */
                                <div key={index} className="w-[178px] h-[284px] bg-white border-2 border-gray-300"> {/* white box */}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Product cards section */}
                </div> {/* main container end */}

            </div>
            <Footer />
        </div>
    );
};

export default ShopProfile;
