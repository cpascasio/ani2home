import React from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import './shopprofile.css';
import FarmCover1 from '../../assets/FarmCover1.jpg';

const ShopProfile = () => {
    return (
        <div className="w-full">
            <Header />
            <div className="flex w-full max-h-[330px]">
                <div className="flex flex-1 pl-[3%] pt-[2%] pb-[2%] bg-gradient-to-r from-green-900 via-green-900 to-transparent">
                    <div className="flex flex-col items-center text-white">
                        <div className="flex justify-center items-center mb-4">
                            <img src="../src/assets/FarmShop1.jpg" alt="Shop Logo" className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
                        </div>
                        <div className="mt-[5%]">
                            <div className="flex items-center mb-2">
                                <div className="mr-2">
                                    <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                                </div>
                                <div>
                                    <strong>Followers:</strong> 1,203
                                </div>
                            </div>
                            <div className="flex items-center mb-2">
                                <div className="mr-2">
                                    <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
                                </div>
                                <div>
                                    <strong>Rating:</strong> 4.4 (1,304)
                                </div>
                            </div>
                            <div className="flex items-center mb-2">
                                <div className="mr-2">
                                    <img src="../src/assets/ProductsIcon.png" alt="Products" />
                                </div>
                                <div>
                                    <strong>Products:</strong> 67
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col pl-[3%] pr-[3%] text-white items-start">
                        <h1 className="text-2xl font-bold mb-2">
                            Pogi Farms
                        </h1>
                        <div className="italic mb-2">
                            Dasmarinas, Cavite
                        </div>
                        <div className="mb-4">
                            Real eyes realize real lies. You miss the opportunities you don’t take.
                        </div>
                        <div>
                            follow and write a review button here
                        </div>
                    </div>
                </div>
                <div className="flex flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${FarmCover1})` }}>
                    <div className="p-4">
                        View Seller Button here
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ShopProfile;
