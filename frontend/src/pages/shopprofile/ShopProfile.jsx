import React from 'react';
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

const ShopProfile = () => {
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
                            Fresh Onion 18 inch harvested last night 800mg sale emeru...
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
                            <div className="text-[10px] font-inter text-[#737373] ml-1 mt-1">2.1k sold</div>
                        </div>
                    </div>
                    <div className="w-[244px] h-[364px] bg-white flex flex-col items-center"> {/* white box */}
                        <img src={Garlic} alt="Garlic" className="w-[244px] h-[244px] object-cover mb-2" />
                        <div className="p-2 pt-3 pb-1 pl-5 pr-3 w-full text-[15px] font-inter text-[#737373] text-left mt-[-5px]"> {/* description text box */}
                            Fresh Garlic 18 inch harvested last night 800mg sale emeru...
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
                            <div className="text-[10px] font-inter text-[#737373] ml-1 mt-1">7.8k sold</div>
                        </div>
                    </div>
                </div>
                {/* End of best sellers */}

                {/* Categories Section */}
                <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-5 flex items-center">
                    <img src={HorizontalLines} alt="Horizontal Lines" className="w-[20px] h-[20px] mr-2" />
                    Categories
                </div>
                <div className="flex flex-col items-start pl-5 pt-2">
                    <a href="#" className="text-[18px] font-inter text-[#737373] hover:text-[#E11919] transition-colors duration-300">
                        Carrots
                    </a>
                    <a href="#" className="text-[18px] font-inter text-[#737373] hover:text-[#E11919] transition-colors duration-300">
                        Cabbage
                    </a>
                    <a href="#" className="text-[18px] font-inter text-[#737373] hover:text-[#E11919] transition-colors duration-300">
                        Onion
                    </a>
                    <a href="#" className="text-[18px] font-inter text-[#737373] hover:text-[#E11919] transition-colors duration-300">
                        Garlic
                    </a>
                </div>
                {/* End of categories */}
            </div>
            <Footer />
        </div>
    );
}

export default ShopProfile;
