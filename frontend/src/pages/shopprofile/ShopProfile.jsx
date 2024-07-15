import React from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import './shopprofile.css';
import FarmCover1 from '../../assets/FarmCover1.jpg';

const ShopProfile = () => {
    return (
        <div className="w-full">
            <Header />
             <div className="flex w-full h-auto bg-gradient-to-r from-green-900"> {/*banner */}
                <div className="flex flex-1 pl-[3%] pt-[2%] pb-[2%]"> {/*banner left side */}
                    <div className="flex flex-col items-center text-white"> {/*box for logo and stats*/}
                        <div className="flex justify-center items-center mb-4"> {/*logo */}
                            <img src="../src/assets/FarmShop1.jpg" alt="Shop Logo" className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
                        </div>
                        <div className="mt-[5%]"> {/*stats box */}
                            <div className="flex items-center mb-2"> {/*followers */}
                                <div className="mr-2">
                                    <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                                </div>
                                <div className="text-left">
                                    <strong>Followers:</strong> 1,203
                                </div>
                            </div>
                            <div className="flex items-center mb-2"> {/*ratings */}
                                <div className="mr-2">
                                    <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
                                </div>
                                <div className="text-left">
                                    <strong>Rating:</strong> 4.4 (1,304)
                                </div>
                            </div>
                            <div className="flex items-center mb-2"> {/*products */}
                                <div className="mr-2">
                                    <img src="../src/assets/ProductsIcon.png" alt="Products" />
                                </div>
                                <div className="text-left">
                                    <strong>Products:</strong> 67
                                </div>
                            </div>
                        </div>
                    </div> {/*end of box for logo and stats */}
                    <div className="flex flex-col flex-1 pl-[4%] pr-[4%] text-white items-start"> {/*Name, Location, Bio, Buttons */}
                        <h1 className="text-2xl font-bold mb-0">
                            Pogi Farms
                        </h1>
                        <div className="italic mb-4">
                            Dasmarinas, Cavite
                        </div>
                        <div className="mb-4 text-left"> {/*CHARACTERS MAXIMUM: 439 */}
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doxeee ands eiusmod tempor incididunt ut 
                        labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
                        aliquip ex ea commodo co.Duis aute irure dolor in reprehenderit in voluptate velita esse cillum dolore eu 
                        fugiat nulla pariatur. Excepteur sint occaecatellicid cupidatat non proident what is loooove.Maybe this
                        </div>
                        <button class="rounded border-2 border-white p-2 px-5 w-full">
                            Follow+
                        </button>
                    </div> {/*end of name etc of user profile */}
                </div> {/*banner left side end*/}
                <div className="flex flex-1"> {/*banner right side */}
                    {/* should insert cover photo here --> use FarmCover1.jpg */}
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded px-5 py-2 mb-2 mr-6">
                        View Seller
                    </button>
                </div> {/*banner right side end*/}
            </div> {/*banner end*/}
            <Footer />
        </div>
    );
};

export default ShopProfile;
