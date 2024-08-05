import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { Dialog } from '@headlessui/react';
import Star from '../../components/StarRating.jsx';


const MyOrders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isOrderReceived, setIsOrderReceived] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [starRating, setStarRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const userData = {
    userProfilePic: '/assets/userProfilePic.png',
    followers: 1234,
    name: 'Placeholder name',
    address: "1234 Elm St, Springfield, IL",
    // max: 422 cHARACTERS
    bio: "I was supposed to be sent away But they forgot to come and get me I was a functioning alcoholic Til nobody noticed my new aesthetic All of this to say I hope you're okay But you're the reason And no one here's to blame But what about your quiet treason? And for a fortnight there, we were forever Run into you sometimes, ask about the weather Now you're in my backyard, turned into good neighbors Your wife waters flowers"
  };

  const handleOrderReceivedClick = () => {
    setIsOrderReceived(true);
  };

  const handleWriteReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleCancelOrder = () => {
    setIsModalOpen(true);
  };

  const handleCancelOrderSubmit = () => {
    // Logic to cancel the order
    console.log('Order Cancelled');
    console.log('Reason:', cancelReason);
    console.log('Additional Comments:', additionalComments);
    setIsModalOpen(false);
  };

  const handleSubmitReview = () => {
    // Logic to submit the review
    console.log('Review Submitted');
    console.log('Rating:', starRating);
    console.log('Comment:', reviewComment);
    setIsReviewModalOpen(false);
    setHasReviewed(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };


  // Function to close the Order Received modal
  const handleCloseOrderReceivedModal = () => {
    setIsOrderReceived(false);
  };

  // Function to confirm the Order Received
  const handleConfirmOrderReceived = () => {
    setIsOrderReceived(true); // Mark order as received
    setIsOrderReceived(false); // Close the modal
    
    if (!hasReviewed) {
      setIsReviewModalOpen(true);
    }
  };

  return (
    <div className="w-full">
      <Header />
      <div className="flex flex-col md:flex-row w-full h-auto bg-gradient-to-r from-green-900 md:pt-[6%]">
  <div className="flex flex-col md:flex-row md:pl-[3%] p-4 w-full md:w-1/2">
    <div className="flex flex-col items-center text-white mb-4 md:mb-0">
      <div className="flex justify-center items-center mb-4">
        <div className="bg-white rounded-full">
          <img src={userData.userProfilePic} alt="Profile Pic" className="w-[30vw] h-[30vw] max-w-[162px] max-h-[162px] rounded-full object-cover" />
        </div>
      </div>
      <div className="mt-4 w-full flex justify-center">
        <button className="rounded border border-[#D9D9D9] bg-[#D9D9D9] text-[#0C482E] p-2 px-5 font-inter font-bold transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:border-blue-500">
          Get Verified
        </button>
      </div>
    </div>
    <div className="flex flex-col flex-1 pl-0 md:pl-[4%] pr-0 md:pr-[4%] text-white items-start relative">
      <h1 className="text-2xl md:text-4xl font-bold font-inter mb-2 md:mb-0">
        {userData.name}
      </h1>
      <div className="italic mb-2 md:mb-4 font-inter text-sm md:text-base">
        {userData.address}
      </div>
      <div className="md:mb-6 text-justify font-inter text-sm md:text-base">
        {userData.bio}
      </div>
    </div>
  </div>
  <div className="flex flex-1 w-full md:w-1/2">
    <img src="../src/assets/FarmCover1.jpg" alt="Cover Photo" className="w-full h-auto object-cover" />
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
                      <a href="/seller" className="block text-[16px] text-gray-200 hover:text-blue-300">
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
                  <a href="/seller" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out lg:ml-4">My Shop</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full sm:w-[85%] px-4 lg:pb-12">
            <div className="text-lg font-bold mb-3 text-left text-gray-600 lg:my-5 lg:pb-3 lg:mt-8">My Orders</div>

            <button className="bg-white rounded shadow-md w-full max-w-full mx-auto overflow-auto hover:bg-gray-500">
            <div className="block md:hidden bg-white shadow rounded-lg overflow-hidden">
              
              {/* Mobile view */}
              <div className="flex flex-col">
                {/* First Row: Product Image and Details */}
                <div className="flex flex-row p-4">
                  {/* Product Image Column */}
                  <div className="flex-shrink-0 w-24 h-24 mr-4">
                    <img src="../../src/assets/carrot.png" alt="Product Image" className="w-full h-full object-cover rounded" />
                  </div>
                  
                  {/* Product Details Column */}
                  <div className="flex-1">
                    <div className="text-lg font-bold text-gray-600 mb-1 text-left">Carrot</div>
                    <div className="text-gray-500 text-sm mb-2 line-clamp-3 text-justify">
                      Fresh Carrot 18 inch harvested last night 800mg Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                    </div>
                  </div>
                </div>

                {/* Second Row: Quantity, Order ID, and Delivery Status */}
                <div className="flex flex-row p-4 py-0">
                  {/* First Column: Quantity and Total Price */}
                  <div className="flex-1 pr-2">
                    <div className="text-gray-600 text-sm mb-1">Qty: 1</div>
                    <div className="text-gray-600 text-sm mb-1">Total Price</div>
                    <div className="text-red-500 text-sm font-bold">₱99.99</div>
                  </div>

                  {/* Second Column: Order ID and Delivery Status */}
                  <div className="flex-1 px-2">
                    <div className="text-gray-500 text-sm mb-1">
                      <span className="font-bold">Order ID:</span>
                      <span className="block">647832832687</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      <span className="text-blue-500">Out for Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Third Row: Buttons */}
                <div className="p-4 flex flex-col items-center space-y-2">
                  <div className="flex flex-row space-x-2">
                    <button
                      onClick={handleCancelOrder}
                      className="border border-solid border-red-600 text-red-600 bg-white text-sm py-2 px-4 rounded hover:bg-red-600 hover:text-white transition duration-300"
                    >
                      Cancel Order
                    </button>
                    {!isOrderReceived && (
                      <button
                        onClick={handleOrderReceivedClick}  
                        className="bg-green-900 text-white text-sm py-2 px-4 rounded hover:bg-blue-500 transition duration-300"
                      >
                        Order Received
                      </button>
                    )}
                    {isOrderReceived && !hasReviewed && (
                      <button
                        onClick={handleWriteReview}
                        className="bg-green-900 text-white text-sm py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

              {/* <!-- Web View --> */}
              <div className="hidden md:flex bg-white shadow rounded-lg overflow-hidden">
                {/* Product Image */}
                <div className="flex-shrink-0 w-44 h-44">
                  <img src="../../src/assets/carrot.png" alt="Product Image" className="w-full h-full object-cover" />
                </div>

                {/* Right Side: Top and Bottom Sections */}
                <div className="flex flex-col flex-1 p-4 pr-8">
                  {/* Top Section: Product Details */}
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div className="flex-1 max-w-[500px]">
                      <div className="text-base font-bold text-gray-600 mb-2 text-left">Carrot</div>
                      <div className="text-gray-500 text-sm line-clamp-2 text-justify">
                        Fresh Carrot 18 inch harvested last night 800mg Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                      </div>
                    </div>
                    <div className="w-1/6 flex items-center justify-center px-4 mb-0">
                      <div className="text-gray-500 text-sm">x1</div>
                    </div>
                    <div className="w-auto flex flex-col justify-center lg:px-7">
                      <div className="text-gray-600 text-sm">Total Price</div>
                      <div className="text-red-500 text-base">₱99.99</div>
                    </div>
                  </div>

                  {/* Bottom Section: Order Details and Buttons */}
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-bold mr-4">Order ID:</span>
                        <span>647832832687</span>
                      </div>
                      <div className="flex items-center mt-2 italic">
                        <span className="text-blue-500">Out for Delivery</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex space-x-4 lg:mt-2">
                      <button
                        onClick={handleCancelOrder}
                        className="border border-solid border-red-600 text-red-600 bg-white text-sm py-2 px-4 rounded hover:bg-red-600 hover:text-white transition duration-300"
                      >
                        Cancel Order
                      </button>
                      {!isOrderReceived && (
                        <button
                          onClick={() => {
                            handleOrderReceivedClick(); // Open modal or set state
                            setIsOrderReceivedModalOpen(true); // Show modal for confirmation
                          }}
                          className="bg-green-900 text-white text-sm py-2 px-4 rounded hover:bg-blue-500 transition duration-300"
                        >
                          Order Received
                        </button>
                      )}
                      {isOrderReceived && !hasReviewed && (
                        <button
                          onClick={handleWriteReview}
                          className="bg-green-900 text-white text-sm py-2 px-4 rounded hover:bg-blue-500 transition duration-300"
                        >
                          Write a Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Order Received Modal */}
            <Dialog open={isOrderReceived} onClose={handleCloseOrderReceivedModal}>
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <Dialog.Panel className="bg-white rounded p-6 max-w-sm mx-auto">
                  <h2 className="text-lg font-bold mb-4 text-left text-gray-600">Order Received</h2>
                  <p className="mb-4 text-gray-600">Are you sure you have received the order?</p>
                  <div className="flex justify-end">
                    
                    <button
                      onClick={handleCloseOrderReceivedModal}
                      className="bg-gray-400 text-white p-2 px-5 rounded mr-2"
                    >
                      Cancel
                    </button><button
                      onClick={handleConfirmOrderReceived}
                      className="bg-green-900 text-white p-2 px-5 rounded transition duration-300 ease-in-out hover:bg-blue-500 "
                    >
                      Confirm
                    </button>

                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>

            {/* Cancel Order Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 px-4 py-6">
                <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
                  <Dialog.Title className="text-lg font-bold mb-4 text-gray-600 text-left">
                    Cancel Order
                  </Dialog.Title>
                  <Dialog.Description className="text-justify mb-4 text-gray-600">
                    Please select a reason for canceling your order and provide any additional comments.
                  </Dialog.Description>
                  <div className="mb-4">
                    <label htmlFor="cancel-reason" className="block text-gray-700 mb-2">Reason for Cancellation</label>
                    <div className="relative">
                      <select
                        id="cancel-reason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full p-2 border-gray-300 border-2 bg-white rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-600"
                      >
                        <option value="">Select a reason</option>
                        <option value="Change of mind">Change of mind</option>
                        <option value="Wrong item received">Wrong item received</option>
                        <option value="Item arrived damaged">Item arrived damaged</option>
                        <option value="Late delivery">Late delivery</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  {cancelReason === 'Other' && (
                    <div className="mb-4">
                      <label htmlFor="additional-comments" className="block text-gray-600 mb-2">Additional Comments</label>
                      <textarea
                        id="additional-comments"
                        value={additionalComments}
                        onChange={(e) => setAdditionalComments(e.target.value)}
                        rows="4"
                        className="w-full border-gray-300 border-2 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-600 p-2"
                      ></textarea>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={handleCloseModal}
                      className="bg-gray-400 text-white py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCancelOrderSubmit}
                      className="bg-red-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out hover:bg-red-700"
                    >
                      Confirm Cancellation
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>


            {/* Review Modal */}
            <Dialog open={isReviewModalOpen} onClose={handleCloseReviewModal} className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50">
                <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
                  <Dialog.Title className="text-lg font-bold mb-4 text-left text-gray-600">
                    Write a Review
                  </Dialog.Title>
                  <Dialog.Description className="text-center mb-4 text-gray-600">
                    Please provide your rating and comment for the product.
                  </Dialog.Description>
                  <div className="mb-4">
                    <div className="flex items-center justify-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          filled={starRating >= star}
                          onClick={() => setStarRating(star)}
                        />
                      ))}
                    </div>
                    <div className="mb-4">
                      <label htmlFor="review-comment" className="block text-gray-700 mb-2">Comment</label>
                      <textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows="4"
                        className="w-full border-gray-300 border-2 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-600 p-2"
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleCloseReviewModal}
                      className="bg-gray-400 text-white p-2 px-5 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="bg-green-600 text-white p-2 px-5 rounded transition duration-300 ease-in-out hover:bg-blue-500"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyOrders;