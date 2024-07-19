import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
const MyOrders = () => {
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
                                  <a href="#" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Profile</a>
                              </li>
                              <li>
                                  <a href="#" className="text-gray-600 underline hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Orders</a>
                              </li>
                              <li>
                                  <a href="#" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Shop</a>
                              </li>
                          </ul>
                      </div>

                      <div className="flex-1 pt-20"> {/* Right div */}
                        <div className="text-l font-bold mb-2 text-left text-gray-600 pb-5">My Orders</div>

                        <div className="bg-white shadow-md cursor-pointer"> {/* white background and clickable */}
                          <div className="flex p-4"> {/* flex container with padding */}
                            <div className="flex-shrink-0 w-1/4 pr-4"> {/* first column: product image */}
                              <img src="path/to/product-image.jpg" alt="Product Image" className="w-full h-auto" /> {/* product image */}
                            </div>
                            <div className="flex-1 pr-4"> {/* second column: product details */}
                              <div className="font-bold text-lg">Product Title</div> {/* product title */}
                              <div className="text-gray-600 mt-1">Product Description</div> {/* product description */}
                              <div className="text-gray-500 mt-1">Order Status</div> {/* order status */}
                            </div>
                            <div className="w-1/6 text-right px-4"> {/* third column: quantity */}
                              <div className="text-lg font-medium">x1</div> {/* quantity */}
                            </div>
                            <div className="w-1/4 text-center px-4"> {/* fourth column: total price */}
                              <div className="text-lg font-medium">Total Price</div> {/* total price label */}
                              <div className="text-red-500 text-xl font-bold mt-1">$99.99</div> {/* numerical total price */}
                              <a href="#" className="text-blue-500 underline mt-1 block">View Shop</a> {/* view shop link */}
                            </div>
                          </div>
                        </div>



                      </div>

                    </div>
                </div>
      <Footer />
    </div>
  );
};

export default MyOrders;