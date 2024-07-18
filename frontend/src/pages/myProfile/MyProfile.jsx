import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
const MyProfile = () => {
  return (
    <div className='w-full'>
        <Header />
        <div className="flex w-full h-auto bg-gradient-to-r from-green-900"> {/*banner */}
                <div className="flex flex-1 pl-[3%] pt-[2%] pb-[2%]"> {/*banner left side */}
                    <div className="flex flex-col items-center text-white"> {/*box for logo and stats*/}
                        <div className="flex justify-center items-center mb-4">
                            <div className="bg-white rounded-full"> {/* White background */}
                                <img src="../src/assets/MyProfile pic.png" alt="Profile Pic" className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
                            </div>
                        </div>
                        <div className="mt-[5%]"> {/*stats box */}
                            <div className="flex items-center mb-2"> {/*followers */}
                                <div className="mr-2">
                                    <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                                </div>
                                <div className="text-left font-inter">
                                    <strong>Followers:</strong> 1,203
                                </div>
                            </div>
                            <div className="flex items-center mb-2"> {/*ratings */}
                                <div className="mr-2">
                                    <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
                                </div>
                                <div className="text-left font-inter">
                                    <strong>Rating:</strong> 4.4 (1,304)
                                </div>
                            </div>
                            <div className="flex items-center mb-2"> {/*products */}
                                <div className="mr-2">
                                    <img src="../src/assets/ProductsIcon.png" alt="Products" />
                                </div>
                                <div className="text-left font-inter">
                                    <strong>Products:</strong> 67
                                </div>
                            </div>
                        </div>
                    </div> {/*end of box for logo and stats */}
                    <div className="flex flex-col flex-1 pl-[4%] pr-[4%] text-white items-start relative"> {/*Name, Location, Bio, Buttons */}
                        <h1 className="text-4xl font-bold font-inter mb-0">
                            Fernando Lopez
                        </h1>
                        <div className="italic mb-4 font-inter">
                            Dasmarinas, Cavite
                        </div>
                        <div className="mb-6 text-justify font-inter"> {/*CHARACTERS MAXIMUM: 439 */}
                            Fernando is the proud owner of Pogi Farms where he passionately practices sustainable agriculture. He cultivates organiz produce on his
                            expansive land and welcomes visitors for educational farm tours, promoting community engagement and environmental awareness.
                        </div>
                        <button className="absolute bottom-0 right-0 rounded border border-[#D9D9D9] bg-[#D9D9D9] text-[#0C482E] p-2 px-5 font-inter font-bold mr-7 
                        transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500">
                            Get Verified
                        </button>
                    </div> {/*end of name etc of user profile */}
            </div> {/*banner left side end*/}
                
                <div className="flex flex-1 w-full"> {/*banner right side */}
                    {/* should insert cover photo here --> use FarmCover1.jpg */}
                    
                </div> {/*banner right side end*/}
            </div> {/*banner end*/}

            {/* ----- start of body ----- */} 
            <div className="px-40 bg-gray-200"> {/*main container for body*/}
                <div className="flex"> {/* Main div with left and right child divs */}
                    <div className="w-40% pr-40 pt-20"> {/* Left div */}
                        <div className="text-l font-bold mb-2 text-gray-600 pb-5">USER PROFILE</div>
                        <ul className="space-y-4 text-left">
                            <li>
                                <a href="#" className="text-gray-600 underline hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Profile</a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Orders</a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Shop</a>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 pt-20"> {/* Right div */}
                        <div className="text-l font-bold mb-2 text-left text-gray-600 pb-5">My Profile</div>

                        <div className="bg-white p-10 rounded shadow-md"> {/* white background */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-600">Personal Information</h2> 
                                <button className="relative overflow-hidden flex">          {/* edit button */}
                                    <span className="absolute inset-0 opacity-0 hover:opacity-100"></span>
                                    <img src="../../src/assets/edit button.png" alt="Edit" className="w-6 h-6 mr-2" />
                                    <img src="../../src/assets/edit button hover.png" alt="Edit" className="w-6 h-6 mr-2 opacity-0 hover:opacity-100  absolute inset-0" />
                                </button>
                            </div>

                            <div className="flex space-x-8"> {/* container for flex */}
                                <div className="w-3/4">
                                    <table className="table-auto w-full"> {/* table for forms */}
                                        <tbody>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium min-w-40">Name:</td>
                                                <td className="text-left px-8 pb-2">Fernando Lopez</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium">Username:</td>
                                                <td className="text-left px-8 pb-2">fernando_lopez</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium">Email:</td>
                                                <td className="text-left px-8 pb-2">fernando@example.com</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium w-100">Phone Number:</td>
                                                <td className="text-left px-8 pb-2">123-456-7890</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium">Location:</td>
                                                <td className="text-left px-8 pb-2">Dasmarinas, Cavite</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium">Bio:</td>
                                                <td className="text-justify px-8 pb-2">Fernando is the proud owner of Pogi Farms where he passionately practices sustainable agriculture. He cultivates organiz produce on his
                                                expansive land and welcomes visitors for educational farm tours, promoting community engagement and environmental awareness.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div> {/* end of table for forms */}

                                <div className="w-1/4 flex flex-col items-center justify-center"> {/* right side with prof pic and buttons */}
                                    <img src="../src/assets/MyProfile pic.png" alt="Profile Picture" className="w-28 h-28 rounded-full object-cover mb-12" />
                                    <button className="bg-none text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-400 hover:text-white mb-3 w-full border border-slate-400">
                                        Discard Changes
                                    </button>
                                    <button className="bg-green-900 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 w-full">
                                        Save
                                    </button>
                                </div> {/* end of box for prof pic and buttons */}
                            </div>  {/* end of flex box */}
                            
                            <div className="w-1/4 mt-8"> {/* Account Settings Section  */}
                            <h2 className="text-lg font-bold text-gray-600 text-left pb-5">Account Settings</h2>
                                <ul className="space-y-4 text-left pl-8 pb-2">
                                    <li>
                                        <button onClick="openModal('changePassword')" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">
                                            Change Password
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick="openModal('deleteShop')" className="text-gray-600 hover:text-red-500 hover:font-bold transition duration-800 ease-in-out">
                                            Delete Shop
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick="openModal('deleteAccount')" className="text-gray-600 hover:text-red-500 hover:font-bold transition duration-800 ease-in-out">
                                            Delete Account
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick="openModal('logOut')" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">
                                            Log Out
                                        </button>
                                    </li>
                                </ul>
                            </div> {/* END of Account Settings Section  */}
                        </div>
                        </div>
                    </div>
                </div>
        <Footer />
    </div>
  );
};

export default MyProfile;