import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

const perOrder = () => {
    const [isCollapseOpen, setIsCollapseOpen] = useState(false);

    // Example userData for demonstration purposes
    const userData = {
        userProfilePic: 'path/to/profile-pic.jpg', // Update with actual path
        followers: 150,
        name: 'John Doe',
        address: '123 Farm Lane',
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    };

    return (
        <div className="w-full">
            <Header />
            <div className="flex flex-col md:flex-row w-full h-auto bg-gradient-to-r from-green-900">
                <div className="flex flex-col md:flex-row md:pl-[3%] md:pt-[2%] md:pb-[2%] p-4 w-full md:w-1/2">
                    <div className="flex flex-col items-center text-white mb-4 md:mb-0">
                        <div className="flex justify-center items-center mb-4">
                            <div className="bg-white rounded-full">
                                <img src={userData.userProfilePic} alt="Profile Pic" className="w-[30vw] h-[30vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center mb-2">
                                <div className="mr-2">
                                    <img src="/assets/FollowersIcon.png" alt="Followers" />
                                </div>
                                <div className="text-left font-inter text-sm">
                                    <strong>Followers:</strong> {userData.followers}
                                </div>
                            </div>
                            <div className="flex items-center mb-2">
                                <div className="mr-2">
                                    <img src="/assets/RatingsIcon.png" alt="Ratings" />
                                </div>
                                <div className="text-left font-inter text-sm">
                                    <strong>Rating:</strong> 4.4 (1,304)
                                </div>
                            </div>
                            <div className="flex items-center mb-2">
                                <div className="mr-2">
                                    <img src="/assets/ProductsIcon.png" alt="Products" />
                                </div>
                                <div className="text-left font-inter text-sm">
                                    <strong>Products:</strong> 67
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 pl-0 md:pl-[4%] pr-0 md:pr-[4%] text-white items-start relative">
                        <h1 className="text-2xl md:text-4xl font-bold font-inter mb-2 md:mb-0">
                            {userData.name}
                        </h1>
                        <div className="italic mb-2 md:mb-4 font-inter text-sm md:text-base">
                            {userData.address}
                        </div>
                        <div className="mb-4 md:mb-6 text-justify font-inter text-sm md:text-base">
                            {userData.bio}
                        </div>
                        <button className="absolute bottom-0 right-0 rounded border border-[#D9D9D9] bg-[#D9D9D9] text-[#0C482E] p-2 px-5 font-inter font-bold mr-4 md:mr-7 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500">
                            Get Verified
                        </button>
                    </div>
                </div>
                <div className="flex flex-1 w-full md:w-1/2">
                    <img src="/assets/FarmCover1.jpg" alt="Cover Photo" className="w-full h-auto object-cover" />
                </div>
            </div>

            <div className="w-full min-h-screen bg-gray-200">
                <div className="flex flex-col min-h-screen sm:flex-row w-full max-w-screen-xl mx-auto p-4 bg-gray-200">
                    <div className="w-full sm:w-[15%] p-4">
                        <div className="block lg:hidden w-full">
                            <button
                                onClick={() => setIsCollapseOpen(!isCollapseOpen)}
                                className="flex items-center cursor-pointer bg-[#0B472D] text-white p-2 rounded-md w-full text-left mb-3"
                            >
                                <span className="flex-1">USER PROFILE</span>
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
                                <div className="bg-[#67B045] text-white p-4 w-auto max-w-md mx-auto">
                                    <ul className="space-y-4 text-left lg:pr-11">
                                        <li>
                                            <a href="#" className="block text-[16px] text-gray-200 underline hover:text-blue-300">
                                                My Profile
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/myOrders" className="block text-[16px] text-gray-200 hover:text-blue-300">
                                                My Orders
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/myShop" className="block text-[16px] text-gray-200 hover:text-blue-300">
                                                My Shop
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:block w-full">
                            <div className="text-lg font-bold text-gray-600 pb-5 text-left flex items-center lg:mb-2 lg:mt-4 lg:ml-4">USER PROFILE</div>
                            <ul className="space-y-4 text-left">
                                <li>
                                    <a href="/myProfile" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out lg:ml-4">My Profile</a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 underline hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out lg:ml-4">My Orders</a>
                                </li>
                                <li>
                                    <a href="/myShop" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out lg:ml-4">My Shop</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="w-full sm:w-[85%] px-4 lg:pb-12">
                        <div className="text-lg font-bold mb-3 text-left text-gray-600 lg:my-5 lg:pb-3 lg:mt-8">My Orders</div>
                        {/* Add your content here */}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default perOrder;
