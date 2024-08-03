import React, { useEffect, useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { useUser } from '../../context/UserContext';

const SellerBanner = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState({});
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const { data: userFetch } = useFetch(`/api/users/${user?.userId}`);

  useEffect(() => {
    if (userFetch) {
      setUserData(userFetch.data);
    }
  }, [userFetch]);

  return (
    <div style={{ backgroundColor: '#e5e7eb' }} className='w-full pt-24'>
      <div className="flex flex-col md:flex-row w-full h-auto bg-gradient-to-r from-green-900 pt-4 md:pt-0">
        <div className="flex flex-col md:flex-row md:pl-[3%] md:pt-[2%] md:pb-[2%] w-full md:w-1/2">
          <div className="flex flex-col items-center text-white mb-4 md:mb-0">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-white rounded-full">
                <img
                  src={userData.userProfilePic || "../src/assets/MyProfile pic.png"}
                  alt="Profile Pic"
                  className="w-[30vw] h-[30vw] max-w-[162px] max-h-[162px] rounded-full object-cover"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <div className="mr-2">
                  <img src="../src/assets/FollowersIcon.png" alt="Followers" />
                </div>
                <div className="text-left font-inter text-sm">
                  <strong>Followers:</strong> {userData.followers || '0'}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="mr-2">
                  <img src="../src/assets/RatingsIcon.png" alt="Ratings" />
                </div>
                <div className="text-left font-inter text-sm">
                  <strong>Rating:</strong> {userData.rating || '4.4'} (1,304)
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="mr-2">
                  <img src="../src/assets/ProductsIcon.png" alt="Products" />
                </div>
                <div className="text-left font-inter text-sm">
                  <strong>Products:</strong> {userData.products || '0'}
                </div>
              </div>
              {/* Get Verified Button in Mobile View */}
              <button className="block md:hidden rounded border border-[#D9D9D9] bg-[#D9D9D9] text-[#0C482E] p-2 px-5 font-inter font-bold mb-4 
                transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500">
                Get Verified
              </button>
            </div>
          </div>
          <div className="flex flex-col flex-1 pl-0 md:pl-[4%] pr-0 md:pr-[4%] text-white items-start relative">
            <h1 className="text-2xl md:text-4xl font-bold font-inter mb-2 md:mb-0 pl-5 pr-5">
              {userData.name || 'Fernando Lopez'}
            </h1>
            <div className="italic mb-2 md:mb-4 font-inter text-sm md:text-base pl-5 pr-5">
              {userData.address || 'Dasmarinas, Cavite'}
            </div>
            <div className="mb-4 md:mb-6 text-justify font-inter text-sm md:text-base pl-5 pr-5">
              {userData.bio || 'Fernando is the proud owner of Pogi Farms where he passionately practices sustainable agriculture. He cultivates organic produce on his expansive land and welcomes visitors for educational farm tours, promoting community engagement and environmental awareness.'}
            </div>
            {/* Get Verified Button in Desktop View */}
            <button className="hidden md:block absolute bottom-0 right-0 rounded border border-[#D9D9D9] bg-[#D9D9D9] text-[#0C482E] p-2 px-5 font-inter font-bold mr-4 md:mr-7 
              transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500">
              Get Verified
            </button>
          </div>
        </div>
        <div className="flex flex-1 w-full md:w-1/2">
          <img src="../src/assets/FarmCover1.jpg" alt="Cover Photo" className="w-full h-auto object-cover" />
        </div>
      </div>
      </div>
  );
};

export default SellerBanner;
