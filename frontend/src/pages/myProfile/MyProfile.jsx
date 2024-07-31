import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import useFetch from '../../../hooks/useFetch.js';
import { useUser } from '../../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const MyProfile = () => {

    const  userLog = localStorage.getItem('user');

    const {user} = useUser();

    const { data: userFetch } = useFetch(`/api/users/${user?.userId}`);

    const [userData, setUserData] = useState({});

    const [editMode, setEditMode] = useState(false);

    const navigate = useNavigate();
    

    // if button is pressed, editmode to true
    // if editmode is true, show the edit form



    // if false, just display the user data

    useEffect(() =>{
        
        console.log(user);
        
    }, []);

    
    

    useEffect(() =>{
        if(userLog != null) {
        console.log(user);
        }else{
            navigate('/login');
        }
    }, [userLog]);

    

    useEffect(() =>{
        if(userFetch != null) {
            setUserData(userFetch.data);
        console.log(userFetch.data);
        }
    }, [userFetch]);


    


    useEffect(() =>{
        if(userData != null) {
        console.log("USERDATA: ");
        console.log(userData);
        }
    }, [userData]);





    //TODO:
    //1. conditionally render page if user is logged in from backend if not, redirect to login page
    //2. display userdata by userData.blahblah and display it in the 
    //3. make the edit user profile functionality work with backend endpoint.

    // create the handleSubmit function that gets the value of formData then does an axios.put to the route http://localhost:3000/api/users/edit-user with headers type application json and token given the formdata. 

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
    
        // Collect form data
        const formData = new FormData(event.target);
    
        // Create an object to hold form values
        const data = {};
    
        
        // Check if fields have been changed
        if (formData.get('newName') !== userData?.name) {
            data.name = formData.get('newName') || "";
        }
        if (formData.get('newUsername') !== userData?.userName) {
            data.userName = formData.get('newUsername');
        }
        if (formData.get('newEmail') !== userData?.email) {
            data.email = formData.get('newEmail');
        }
        if (formData.get('newLocation') !== userData?.address) {
            data.address = formData.get('newLocation') || "";
        }
        if (formData.get('newPhoneNumber') !== userData?.phoneNumber) {
            data.phoneNumber = formData.get('newPhoneNumber') || "";
        }
        if (formData.get('newBio') !== userData?.bio) {
            data.bio = formData.get('newBio') || "";
        }
    
        // Get the token from localStorage or any other source
        const token = user?.token; // Replace with your actual token retrieval method
    
        try {
            const response = await axios.put(
                `http://localhost:3000/api/users/edit-user/${user?.userId}`, // Include userId in the URL
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            console.log('Success:', response.data);
            // Handle success (e.g., show a success message or redirect)
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            // Handle error (e.g., show an error message)
        }
    };

  return (
    <div className='w-full'>
        <Header />
        <div className="flex w-full h-auto bg-gradient-to-r from-green-900"> {/*banner */}
                <div className="flex flex-1 pl-[3%] pt-[2%] pb-[2%]"> {/*banner left side */}
                    <div className="flex flex-col items-center text-white"> {/*box for logo and stats*/}
                        <div className="flex justify-center items-center mb-4">
                            <div className="bg-white rounded-full"> {/* White background */}
                                <img src={userData.userProfilePic} alt="Profile Pic" className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
                            </div>
                        </div>
                        <div className="mt-[5%]"> {/*stats box */}
                            <div className="flex items-center mb-2"> {/*followers */}
                                <div className="mr-2">
                                    <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                                </div>
                                <div className="text-left font-inter">
                                    <strong>Followers:</strong> {userData.followers}
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
                            {userData.name}
                        </h1>
                        <div className="italic mb-4 font-inter">
                            {userData.address}
                        </div>
                        <div className="mb-6 text-justify font-inter"> {/*CHARACTERS MAXIMUM: 439 */}
                            {userData.bio}
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
            <div className="flex flex-col lg:flex-row lg:space-x-8 p-4 lg:p-8 bg-gray-200 min-h-screen"> {/* Main container */}
                    <div className="w-full lg:w-1/3 lg:max-w-xs lg:pt-10 mx-auto flex flex-col items-center"> {/* Centered left div */}
                        <div className="text-lg font-bold mb-2 text-gray-600 pb-5 text-left">USER PROFILE</div>
                        <ul className="space-y-4 text-left lg:pr-11"> {/* Ensure the list takes full width */}
                            <li>
                                <a href="#" className="text-gray-600 underline hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Profile</a>
                            </li>
                            <li>
                                <a href="/myOrders" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Orders</a>
                            </li>
                            <li>
                                <a href="/myShop" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Shop</a>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 lg:pt-10"> {/* Right div */}
                        <div className="text-lg font-bold mb-2 text-left text-gray-600 pb-5 pl-5">My Profile</div>

                        <div className="bg-white p-4 md:p-6 lg:p-8 rounded shadow-md w-full max-w-full mx-auto overflow-auto"> {/* white background */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-600">Personal Information</h2> 
                                <button className="relative overflow-hidden flex"
                                    onClick={() => document.getElementById('modal_editProfile').showModal()}> {/* edit button */}
                                    <span className="absolute inset-0 opacity-0 hover:opacity-100"></span>
                                    <img src="../../src/assets/edit button.png" alt="Edit" className="w-6 h-6 mr-2" />
                                    <img src="../../src/assets/edit button hover.png" alt="Edit" className="w-6 h-6 mr-2 opacity-0 hover:opacity-100  absolute inset-0" />
                                </button>

                                <dialog id="modal_editProfile" className="modal fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                                    <div className="modal-box w-full max-w-lg bg-white shadow-lg rounded-md p-6 overflow-auto relative">
                                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                                onClick={() => document.getElementById('modal_editProfile').close()}>✕
                                        </button>
                                        <h3 className="text-lg font-bold text-gray-600 text-left pb-5">Edit Profile</h3>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="flex flex-col items-center mb-6">
                                                <label htmlFor="profilePicture" className="text-sm font-medium text-gray-600 mt-2 cursor-pointer text-left pb-4 w-full">
                                                    Change Profile Picture
                                                </label>
                                                <img src={userData.userProfilePic} alt="Profile Picture" className="w-28 h-auto rounded-full object-cover mb-4"/>
                                                <input type="file" id="profilePicture" name="profilePicture" accept="image/*" className="mt-2"
                                                    onChange={(e) => {
                                                        // Handle file upload here
                                                        console.log(e.target.files[0]);
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="newName" className="text-sm font-medium text-gray-600 text-left">Name</label>
                                                <input type="text" id="newName" name="newName" defaultValue={userData?.name}
                                                    className="input input-bordered bg-gray-200 text-gray-800" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="newUsername" className="text-sm font-medium text-gray-600 text-left">Username</label>
                                                <input type="text" id="newUsername" name="newUsername" defaultValue={userData?.userName}
                                                    className="input input-bordered bg-gray-200 text-gray-800" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="newEmail" className="text-sm font-medium text-gray-600 text-left">Email</label>
                                                <input type="email" id="newEmail" name="newEmail" defaultValue={userData?.email}
                                                    className="input input-bordered bg-gray-200 text-gray-800" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="newPhoneNumber" className="text-sm font-medium text-gray-600 text-left">Phone Number</label>
                                                <input type="tel" id="newPhoneNumber" pattern="(\+63|0)[1-9][0-9]{9}" name="newPhoneNumber" defaultValue={userData?.phoneNumber}
                                                    className="input input-bordered bg-gray-200 text-gray-800" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="newLocation" className="text-sm font-medium text-gray-600 text-left">Location</label>
                                                <input type="text" id="newLocation" name="newLocation" defaultValue={userData?.address}
                                                    className="input input-bordered bg-gray-200 text-gray-800" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="newBio" className="text-sm font-medium text-gray-600 text-left">Bio</label>
                                                <input type="textarea" id="newBio" name="newBio" defaultValue={userData?.bio}
                                                    className="input input-bordered bg-gray-200 text-gray-800" />
                                            </div>
                                            <div className="flex justify-end space-x-2 mt-4">
                                                <button type="button"
                                                        className="btn btn-sm bg-gray-500 rounded text-white hover:bg-red-500 border-none w-auto h-auto"
                                                        onClick={() => document.getElementById('modal_editProfile').close()}>Cancel
                                                </button>
                                                <button type="submit"
                                                        className="btn btn-sm bg-green-900 rounded text-white hover:bg-blue-500 border-none w-auto h-auto"
                                                        onClick={() => console.log('Save logic here')}>Save
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </dialog>



                            </div>

                            <div className="flex space-x-8"> {/* container for flex */}
                                <div className="w-3/4">
                                    <table className="table-auto w-full"> {/* table for forms */}
                                        <tbody>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium min-w-40">Name:</td>
                                                <td className="text-left px-8 pb-2">{userData?.name}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium">Username:</td>
                                                <td className="text-left px-8 pb-2">{userData?.userName}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium">Email:</td>
                                                <td className="text-left px-8 pb-2">{userData?.email}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium w-100">Phone Number:</td>
                                                <td className="text-left px-8 pb-2">{userData?.phoneNumber}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium">Location:</td>
                                                <td className="text-left px-8 pb-2">{userData?.address}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-left text-gray-500 pl-8 pb-2 font-medium align-top">Bio:</td>
                                                <td className="text-justify px-8 pb-2">{userData?.bio}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div> {/* end of table for forms */}

                                <div className="w-1/4 flex flex-col items-center justify-center"> {/* right side with prof pic and buttons */}
                                    <img src={userData.userProfilePic} alt="Profile Picture" className="w-28 h-28 rounded-full object-cover mb-12" />
                                </div> {/* end of box for prof pic and buttons */}
                            </div>  {/* end of flex box */}

                            {/* ------ Account Settings Section ------  */}
                            <div className="w-1/4 mt-8"> 
                            <h2 className="text-lg font-bold text-gray-600 text-left pb-5 whitespace-nowrap">Account Settings</h2>
                                <ul className="space-y-4 text-left pl-8 pb-2">

                                    {/* ------------- Change Password ------------ */}
                                    <li>
                                        <button className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                                                onClick={() => document.getElementById('modal_ChangePass').showModal()}>Change Password
                                        </button>
                                        <dialog id="modal_ChangePass" className="modal">
                                            <div className="modal-box w-11/12 max-w-lg p-6 bg-white shadow-lg rounded-md">
                                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                                        onClick={() => document.getElementById('modal_ChangePass').close()}>✕
                                                </button>
                                                <h3 className="text-lg font-bold text-gray-600 text-left pb-5">Change Password</h3>
                                                <form method="dialog" className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <label htmlFor="oldPassword" className="text-sm font-medium text-gray-600">Old Password</label>
                                                        <input type="password" id="oldPassword" name="oldPassword"
                                                            className="input input-bordered bg-gray-200 text-gray-800" required/>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="newPassword" className="text-sm font-medium text-gray-600">New Password</label>
                                                        <input type="password" id="newPassword" name="newPassword"
                                                            className="input input-bordered bg-gray-200 text-gray-800" required/>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-600">Confirm Password</label>
                                                        <input type="password" id="confirmPassword" name="confirmPassword"
                                                            className="input input-bordered bg-gray-200 text-gray-800" required/>
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <button type="button"
                                                                className="btn btn-sm bg-gray-500 rounded text-white hover:bg-red-500 border-none flex items-center justify-center w-auto h-auto"
                                                                onClick={() => document.getElementById('modal_ChangePass').close()}>Cancel
                                                        </button>
                                                        <button type="submit"
                                                                className="btn btn-sm bg-green-900 rounded text-white hover:bg-blue-500 border-none flex items-center justify-center w-auto h-auto"
                                                                onClick={() => console.log('Save logic here')}>Save
                                                        </button>
                                                    </div>

                                                </form>
                                            </div>
                                        </dialog>
                                    </li>

                                    {/* ------------- Delete Account ------------ */}
                                    <li>
                                        <button className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                                                onClick={() => document.getElementById('modal_DeleteAcc').showModal()}>Delete Account
                                        </button>
                                        <dialog id="modal_DeleteAcc" className="modal">
                                            <div className="modal-box w-8/12 max-w-md p-6 bg-white shadow-lg rounded-md">
                                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                                        onClick={() => document.getElementById('modal_DeleteAcc').close()}>✕
                                                </button>
                                                <h3 className="text-lg font-bold text-gray-600 text-left pb-5">Delete Account</h3>
                                                <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                                                <form method="dialog" className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <input type="text" id="confirmation" name="confirmation"
                                                            className="input input-bordered bg-gray-200 text-gray-800 border-gray-300 focus:border-red-500 mb-2"
                                                            required
                                                            onFocus={() => {
                                                                document.getElementById('confirmation').classList.add('border-red-500');
                                                            }}
                                                            onBlur={() => {
                                                                document.getElementById('confirmation').classList.remove('border-red-500');
                                                            }}
                                                            onInput={() => {
                                                                const input = document.getElementById('confirmation');
                                                                const deleteBtn = document.getElementById('deleteBtn');
                                                                deleteBtn.disabled = input.value !== 'CONFIRM';
                                                            }}/>
                                                        <label htmlFor="confirmation" className="text-sm text-gray-600 text-center pb-auto">
                                                            Please type <span className="font-bold">"CONFIRM"</span> to continue deleting your account
                                                        </label>
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <button type="button"
                                                                className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none w-auto h-auto"
                                                                onClick={() => document.getElementById('modal_DeleteAcc').close()}>Cancel
                                                        </button>
                                                        <button type="submit"
                                                                id="deleteBtn"
                                                                className="btn btn-sm bg-red-500 rounded text-white hover:bg-red-600 border-none w-auto h-auto"
                                                                disabled
                                                                onClick={() => console.log('Delete logic here')}>Delete
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </dialog>


                                    {/* ------------- Delete Shop ------------ */}
                                    </li>
                                    <li>
                                        <button className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                                                onClick={() => document.getElementById('modal_DeleteShop').showModal()}>Delete Shop
                                        </button>
                                        <dialog id="modal_DeleteShop" className="modal">
                                            <div className="modal-box w-8/12 max-w-md p-6 bg-white shadow-lg rounded-md">
                                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                                        onClick={() => document.getElementById('modal_DeleteShop').close()}>✕
                                                </button>
                                                <h3 className="text-lg font-bold text-gray-600 text-left pb-5">Delete Account</h3>
                                                <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete <span className="font-bold">Pogi Farms</span>? This action cannot be undone.</p>
                                                <form method="dialog" className="space-y-4">
                                                    <div className="flex flex-col">
                                                        <input type="text" id="confirmationShop" name="confirmation"
                                                            className="input input-bordered bg-gray-200 text-gray-800 border-gray-300 focus:border-red-500 mb-2"
                                                            required
                                                            onFocus={() => {
                                                                document.getElementById('confirmationShop').classList.add('border-red-500');
                                                            }}
                                                            onBlur={() => {
                                                                document.getElementById('confirmationShop').classList.remove('border-red-500');
                                                            }}
                                                            onInput={() => {
                                                                const input = document.getElementById('confirmation');
                                                                const deleteBtn = document.getElementById('deleteBtn');
                                                                deleteBtn.disabled = input.value !== 'CONFIRM';
                                                            }}/>
                                                        <label htmlFor="confirmation" className="text-sm text-gray-600 text-center pb-5">
                                                            Please type <span className="font-bold">"CONFIRM"</span> to continue deleting your account
                                                        </label>
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <button type="button"
                                                                className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none px-4"
                                                                onClick={() => document.getElementById('modal_DeleteShop').close()}>Cancel
                                                        </button>
                                                        <button type="submit"
                                                                id="deleteBtn"
                                                                className="btn btn-sm bg-red-500 rounded text-white hover:bg-red-600 border-none px-5"
                                                                disabled
                                                                onClick={() => console.log('Delete logic here')}>Delete
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </dialog>
                                    </li>

                                    {/* ------------- Log Out ------------ */}
                                    <li>
                                        <button className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out whitespace-nowrap rounded"
                                                onClick={() => document.getElementById('modal_Logout').showModal()}>Log Out
                                        </button>
                                        <dialog id="modal_Logout" className="modal">
                                            <div className="modal-box w-8/12 max-w-md p-6 bg-white shadow-lg rounded-md">
                                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                                        onClick={() => document.getElementById('modal_Logout').close()}>✕
                                                </button>
                                                <h3 className="text-lg font-bold text-gray-600 text-left pb-5">Delete Account</h3>
                                                <p className="text-sm text-gray-600 mb-4">Are you sure you want to log out? </p>
                                            
                                                <div className="flex justify-end space-x-2">
                                                    <button type="button"
                                                            className="btn btn-sm bg-gray-500 rounded text-white hover:bg-gray-600 border-none px-4"
                                                            onClick={() => document.getElementById('modal_Logout').close()}>Cancel
                                                    </button>
                                                    <button type="button"
                                                            className="btn btn-sm bg-blue-500 rounded text-white hover:bg-red-600 border-none px-5"
                                                            onClick={() => console.log('Delete logic here')}>Log Out
                                                    </button>
                                                </div>
                    
                                            </div>
                                        </dialog>
                                    </li>
                                </ul>
                            </div> {/* END of Account Settings Section  */}
                        </div>
                    </div>
                </div>
        <Footer />
    </div>
  );
};

export default MyProfile;