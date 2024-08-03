import React from 'react';

const SellerBanner = () => {
  return (
    <div className="flex w-full h-auto bg-gradient-to-r from-green-900"> {/*banner */}
      <div className="flex flex-1 pl-[3%] pt-[2%] pb-[2%]"> {/*banner left side */}
        <div className="flex flex-col items-center text-white"> {/*box for logo and stats*/}
          <div className="flex justify-center items-center mb-4">
            <div className="bg-white rounded-full"> {/* White background */}
              <img
                src="../src/assets/MyProfile pic.png"
                alt="Profile Pic"
                className="w-[10vw] h-[10vw] max-w-[162px] max-h-[162px] rounded-full object-cover"
              />
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
            Fernando is the proud owner of Pogi Farms where he passionately practices sustainable agriculture. He cultivates organic produce on his
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
    </div> 
  );
};

export default SellerBanner;
