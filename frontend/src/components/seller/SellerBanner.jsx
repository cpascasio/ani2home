import React, { useEffect, useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { useUser } from '../../context/UserContext';

const SellerBanner = ({ user }) => {
  const [userData, setUserData] = useState(user);
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  // const { data: userFetch } = useFetch(`/api/users/${user?.userId}`);

  useEffect(() => {
    console.log("SELLERBANNER");
    console.log(user);
  }, []);

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  return (
    <div className="flex flex-col md:flex-row w-full h-auto bg-gradient-to-r from-[#072c1c] to-[#83c763] pt-[6%]"> 
      {/* Mobile View: Profile and Follow Button */}
      <div className="flex flex-row md:hidden w-full p-6 pt-[8vh]">
        <div className="flex justify-center items-center w-1/3">
          <div className="bg-white rounded-full">
            <img
              src={userData?.userProfilePic || "../src/assets/FarmShop1.jpg"}
              alt="Shop Logo"
              className="w-[30vw] h-[30vw] max-w-[162px] max-h-[162px] rounded-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center text-white w-2/3 pl-4">
          <h1 className="text-2xl font-bold font-inter mb-2">{userData?.name || 'Pogi Farms'}</h1>
          <div className="italic mb-2 font-inter text-sm">{userData?.address?.fullAddress || 'Dasmarinas, Cavite'}</div>
          <button className="rounded border border-[#D9D9D9] text-white p-2 px-5 mx-[20%] mt-2 font-inter font-bold transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500">
            Follow+
          </button>
        </div>
      </div>

      {/* Mobile View: Bio Section */}
      <div className="md:hidden flex flex-col p-6 py-0 text-white">
        <div className="text-justify font-inter text-sm">
          {userData?.bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
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
              <strong>Followers:</strong> {userData?.followers || '1,203'}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-white">
          <div className="flex items-center">
            <div className="mr-1">
              <img src="../src/assets/RatingsIcon.png" alt="Ratings" className="w-5 h-5" />
            </div>
            <div className="text-center font-inter text-xs">
              <strong>Rating:</strong> {userData?.rating || '4.4'} (1,304)
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-white">
          <div className="flex items-center">
            <div className="mr-1">
              <img src="../src/assets/ProductsIcon.png" alt="Products" className="w-5 h-5" />
            </div>
            <div className="text-center font-inter text-xs">
              <strong>Products:</strong> {userData?.products || '67'}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-row w-full px-4 py-2">
        {/* Profile Picture */}
        <div className="flex flex-col items-center w-1/4 pr-4">
          <div className="flex justify-center items-center mb-4">
            <img
              src={userData?.userProfilePic || "../src/assets/FarmShop1.jpg"}
              alt="Shop Logo"
              className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover"
            />
          </div>
        </div>

        {/* Bio and Follow Button Section */}
        <div className="flex flex-col w-1/2 pr-8">
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold font-inter mr-4 text-left text-white">
              {userData?.name || 'Pogi Farms'}
            </h1>
            <button className="font-bold rounded border-2 border-white text-white p-2 px-5 font-inter hover:bg-white hover:text-green-900 transition-colors duration-300">
              Follow+
            </button>
          </div>
          <div className="italic mb-4 font-inter text-left text-white">
            {userData?.address?.fullAddress || 'Dasmarinas, Cavite'}
          </div>
          <div className="mb-6 text-left font-inter text-justify text-white">
            {userData?.bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col w-1/4 text-white justify-items-center pl-[15vh] my-auto">
          <div className="flex items-center mb-4 w-auto">
            <div className="mr-2">
              <img src="../src/assets/FollowersIcon.png" alt="Followers" />
            </div>
            <div className="text-left font-inter w-auto">
              <strong>Followers:</strong> {userData?.followers || '1,203'}
            </div>
          </div>
          <div className="flex items-center mb-4 w-auto">
            <div className="mr-2">
              <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
            </div>
            <div className="text-left font-inter w-auto">
              <strong>Rating:</strong> {userData?.rating || '4.4'} (1,304)
            </div>
          </div>
          <div className="flex items-center w-auto">
            <div className="mr-2">
              <img src="../src/assets/ProductsIcon.png" alt="Products" />
            </div>
            <div className="text-left font-inter w-full">
              <strong>Products:</strong> {userData?.products || '67'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerBanner;
