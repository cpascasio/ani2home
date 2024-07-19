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
                          <div className="text-lg font-bold mb-2 text-gray-600 pb-5">USER PROFILE</div>
                          <ul className="space-y-4 text-left">
                              <li>
                                  <a href="/myProfile" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Profile</a>
                              </li>
                              <li>
                                  <a href="#" className="text-gray-600 underline hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Orders</a>
                              </li>
                              <li>
                                  <a href="/myShop" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Shop</a>
                              </li>
                          </ul>
                      </div>

                      <div className="flex-1 pt-20"> {/* Right div */}
                        <div className="text-lg font-bold mb-2 text-left text-gray-600 pb-5">My Orders</div>

                        {/* ----- where every item starts ------- */}
                        <div className="bg-white shadow-md cursor-pointer mb-8"> {/* white background and clickable */}
                          <div className="flex"> {/* flex container with padding */}

                            <div className="flex-shrink-0 w-auto pr-5"> {/* for product image */}
                              <img src="../../src/assets/carrot.png" alt="Product Image" className="w-40 h-auto object-cover" /> {/* product image */}
                            </div>
                            <div className="flex-1 pt-5 text-left"> {/* product details */}
                              <div className="text-base font-bold mb-2 text-left text-gray-600">Carrots</div> 
                              <div className="text-gray-500 text-sm line-clamp-2">Fresh Carrot 18 inch harvested last night 800mg Lorem ipsum dolor sit amet, consectetur adipiscing elit</div> {/* added limit to only two lines. will show ... if more than} */}
                              <div className="text-gray-500 text-sm pt-8 italic">Out for Delivery</div> 
                            </div>
                            <div className="w-1/6 flex items-center justify-center px-4 mb-3"> {/*quantity */}
                              <div className="text-gray-500 text-sm">x1</div>
                            </div>
                            <div className="w-auto pl-4 flex flex-col items-center text-center pr-8"> {/* total price container */}
                              <div className="text-base mt-11 text-gray-600">Total Price</div> {/* total price label */}
                              <div className="text-red-500 text-base mt-1">₱99.99</div> {/* total price amount */}
                              <div className="w-full text-right mt-6"> {/* right-aligned link container */}
                                <a href="#" className="text-gray-400 underline hover:text-blue-500">View Shop</a> {/* view shop link */}
                              </div>
                            </div>

                          </div>
                        </div>
                        {/* ----- where every item ends ------- */}

                        {/* ----- FOR MULTIPLE ITEMS ON ONE ORDER AND WITH ESTIMATED DELIVERY DATE ------- */}
                        <div className="bg-white shadow-md cursor-pointer mb-8"> {/* white background and clickable */}
                          <div className=""> {/* container for multiple orders */}
                            {/* first order */}
                            <div className="flex mb-0"> {/* flex container for first order; remove bottom margin */}
                              <div className="flex-shrink-0 w-auto pr-5"> {/* for product image */}
                                <img src="../../src/assets/carrot.png" alt="Product Image" className="w-40 h-auto object-cover" /> {/* product image */}
                              </div>
                              <div className="flex-1 pt-5 text-left"> {/* product details */}
                                <div className="text-base font-bold mb-2 text-gray-600">Carrots</div> 
                                <div className="text-gray-500 text-sm line-clamp-2">Fresh Carrot 18 inch harvested last night 800mg Lorem ipsum dolor sit amet, consectetur adipiscing elit</div> {/* added limit to only two lines; will show ... if more than */}
                                <div className="flex items-center space-x-4 pt-8"> {/* container for "Seller to Pack" with expected delivery date */}
                                  <div className="text-gray-500 text-sm">Seller to Pack</div>
                                  <div className="px-2 py-1 border border-blue-500 text-sm text-blue-500 rounded">Get by Aug 02</div>
                                </div>
                              </div>
                              <div className="w-1/6 flex items-center justify-center px-4 mb-0"> {/* quantity; remove bottom margin */}
                                <div className="text-gray-500 text-sm">x1</div>
                              </div>
                              <div className="w-auto pl-4 flex flex-col items-center text-center pr-8"> {/* total price container */}
                                <div className="text-base mt-11 text-gray-600">Total Price</div> {/* total price label */}
                                <div className="text-red-500 text-base mt-1">₱99.99</div> {/* total price amount */}
                                <div className="w-full text-right mt-6"> {/* right-aligned link container */}
                                  <a href="#" className="text-gray-400 underline hover:text-blue-500">View Shop</a> {/* view shop link */}
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-300 my-0"></div> {/* styled divider with no vertical margin */}

                            {/* second order */}
                            <div className="flex mb-0"> {/* flex container for second order; remove bottom margin */}
                              <div className="flex-shrink-0 w-auto pr-5"> {/* for product image */}
                                <img src="../../src/assets/onion.png" alt="Product Image" className="w-40 h-auto object-cover" /> {/* product image */}
                              </div>
                              <div className="flex-1 pt-5 text-left"> {/* product details */}
                                <div className="text-base font-bold mb-2 text-gray-600">Onions</div> 
                                <div className="text-gray-500 text-sm line-clamp-2">Fresh Onions 18 inch harvested last night 800mg Lorem ipsum dolor sit amet, consectetur adipiscing elit</div> {/* added limit to only two lines; will show ... if more than */}
                                <div className="flex items-center space-x-4 pt-8"> {/* container for "Seller to Pack" with expected delivery date */}
                                  <div className="text-gray-500 text-sm">Seller to Pack</div>
                                  <div className="px-2 py-1 border border-blue-500 text-sm text-blue-500 rounded">Get by Aug 02</div>
                                </div>
                              </div>
                              <div className="w-1/6 flex items-center justify-center px-4 mb-0"> {/* quantity; remove bottom margin */}
                                <div className="text-gray-500 text-sm">x1</div>
                              </div>
                              <div className="w-auto pl-4 flex flex-col items-center text-center pr-8"> {/* total price container */}
                                <div className="text-base mt-11 text-gray-600">Total Price</div> {/* total price label */}
                                <div className="text-red-500 text-base mt-1">₱99.99</div> {/* total price amount */}
                                <div className="w-full text-right mt-6"> {/* right-aligned link container */}
                                  <a href="#" className="text-gray-400 underline hover:text-blue-500">View Shop</a> {/* view shop link */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* ----- MULTIPLE ITEM ON ONE ORDER ends ------- */}



                        {/* ------ PAGINATION ------- */}
                        <div className="flex justify-center my-12 ">
                          <nav aria-label="Page navigation">
                            <ul className="flex list-none space-x-2">

                              {/* -- Previous Button -- */}
                              <li>
                                <a href="#" className="px-3 py-1 text-gray-500 border border-gray-300 rounded bg-white hover:bg-blue-500 hover:text-white" aria-label="Previous">
                                  &laquo;
                                </a>
                              </li>
                              
                              {/* -- Page Number Buttons -- */}
                              <li>
                                <a href="#" className="px-3 py-1 text-white border border-gray-300 rounded bg-green-900 hover:bg-blue-500 hover:text-white">1</a> {/*for selected/active page*/}
                              </li>
                              <li>
                                <a href="#" className="px-3 py-1 text-gray-700 border border-gray-300 rounded bg-white hover:bg-blue-500 hover:text-white">2</a>
                              </li>
                              <li>
                                <a href="#" className="px-3 py-1 text-gray-700 border border-gray-300 rounded bg-white hover:bg-blue-500 hover:text-white">3</a>
                              </li>
                              <li>
                                <a href="#" className="px-3 py-1 text-gray-700 border border-gray-300 rounded bg-white hover:bg-blue-500 hover:text-white">4</a>
                              </li>
                              
                              {/* -- Next Button -- */}
                              <li>
                                <a href="#" className="px-3 py-1 text-gray-500 border border-gray-300 rounded bg-white hover:bg-blue-500 hover:text-white" aria-label="Next">
                                  &raquo;
                                </a>
                              </li>
                            </ul>
                          </nav>
                        </div>

                      </div>

                    </div>
                </div>
      <Footer />
    </div>
  );
};

export default MyOrders;