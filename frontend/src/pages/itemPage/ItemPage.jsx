import React, { useState, useEffect } from "react";
import Carrot from "../../assets/carrot.png";
import Star from "../../assets/Star.png";
import StarFilled from "../../assets/StarFilled.png";
import MyProfilePic from "../../assets/MyProfile pic.png"; // Update with your profile pic
import StorefrontIcon from "../../assets/storefront.png"; // Add your storefront icon import
import VerifiedUserIcon from "../../assets/verifiedUser.png"; // Add your verified user icon import
import SortIcon from "../../assets/sort.png"; // Add sort icon import
import FilterIcon from "../../assets/filter.png"; // Add filter icon import
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import { useUser } from "../../context/UserContext";

// Function to generate star elements based on the rating
const generateStars = (rating, isProductCard = false) => {
  const starElements = [];
  const starClass = isProductCard ? "w-6 h-6" : "w-5 h-5"; // Adjust size for product card
  for (let k = 0; k < Math.floor(rating); k++) {
    starElements.push(
      <img
        key={`filled-${k}`}
        alt="Star"
        src={StarFilled}
        className={starClass} // Adjusted size to match "/ 5"
      />
    );
  }
  for (let k = 0; k < 5 - Math.floor(rating); k++) {
    starElements.push(
      <img
        key={`empty-${k}`}
        alt="Star"
        src={Star}
        className={starClass} // Adjusted size to match "/ 5"
      />
    );
  }
  return starElements;
};

const ItemPage = () => {
  const { user } = useUser(); // Get user data
  const storedUser = localStorage.getItem("user");
  const { productId } = useParams(); // Get product ID from URL
  const { data: productFetch } = useFetch(`/api/products/product/${productId}`); // Fetch product data

  const [product, setProduct] = useState(""); // State for product data
  const [seller, setSeller] = useState(""); // State for seller data
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1); // State for quantity
  const [sortOrder, setSortOrder] = useState("Ascending"); // State for sorting
  const [filterRating, setFilterRating] = useState("All Stars"); // State for filtering
  const [rating, setRating] = useState(4.9); // Example rating
  const [shopRating, setShopRating] = useState(4.7); // Example shop rating
  const [shopName, setShopName] = useState("Shop Name"); // Example shop name
  const [pictures, setPictures] = useState([]); // Example pictures
  const [productDescription, setProductDescription] = useState(""); // Example product description
  //const rating = 4.9; // Example product rating
  //const shopRating = 4.7; // Example shop rating
  const [price, setPrice] = useState(100); // Example price
  //const price = 100; // Example price
  const [productName, setProductName] = useState("Carrot"); // Example product name
  //const productName = "Carrot"; // Example product name
  const [numberOfRatings, setNumberOfRatings] = useState(100); // Example number of received ratings
  //const numberOfRatings = 100; // Example number of received ratings
  const [numberOfProducts, setNumberOfProducts] = useState(50); // Example number of products in the shop
  //const numberOfProducts = 50; // Example number of products in the shop
  const [numberOfFollowers, setNumberOfFollowers] = useState(1200); // Example number of followers

  useEffect(() => {
    console.log(productId);
  }, []);

  useEffect(() => {
    if (productFetch) {
      setProduct(productFetch.product);
      setSeller(productFetch.seller);
    }
  }, [productFetch]);

  useEffect(() => {
    if (product) {
      setRating(product?.rating);
      setPrice(product?.price);
      setProductName(product?.productName);
      setPictures(product?.pictures);
      setProductDescription(product?.productDescription);
    }
  }, [product]);

  useEffect(() => {
    if (seller) {
      setShopName(seller?.name);
    }
  }, [seller]);

  const [ratingCounts, setRatingCounts] = useState({
    5: 10, // Example count for 5-star reviews
    4: 4, // Example count for 4-star reviews
    3: 1, // Example count for 3-star reviews
    2: 7, // Example count for 2-star reviews
    1: 0, // Example count for 1-star reviews
  });

  const handleAddToCart = async () => {
    // Include user ID in the product data

    try {
      // Create Axios POST request
      await axios.post("http://localhost:3000/api/cart/add-to-cart", {
        userId: user?.userId,
        sellerId: product?.storeId,
        productId: product?.id,
        quantity: quantity,
      });

      navigate("/cart");
    } catch (error) {
      console.error("hello Error adding to cart:", error);
    }
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(prev - 1, 1)); // Ensure minimum is 1
  };

  const handleViewShop = () => {
    navigate("/profile/" + product?.storeId); // Navigate to shop profile
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterRating(e.target.value);
  };

  return (
    <div style={{ backgroundColor: "#e5e7eb" }} className="w-full pt-24">
      <div className="pt-5">
        {/* Breadcrumb Navigation Container */}
        <div className="relative w-full max-w-screen-md">
          {/* Flex container for positioning */}
          <div className="absolute top-0 left-0 w-full px-4 mt-2">
            <nav className="text-gray-600 text-sm font-semibold">
              <a href="http://localhost:5173/" className="hover:text-blue-500">
                Homepage
              </a>
              {" > "}
              <a
                href="http://localhost:5173/products"
                className="hover:text-blue-500"
              >
                Products
              </a>
              {" > "}
              <span>{productName}</span>
            </nav>
          </div>
        </div>
        <div className="flex flex-col w-full max-w-screen-lg mx-auto p-4 mt-10">
          {/* Product Card Container */}
          <div className="flex flex-col md:flex-row border border-gray-300 rounded-lg overflow-hidden shadow-md w-full bg-white">
            {/* Image Section */}
            <div className="w-full md:w-1/3 flex justify-center items-center">
              <img
                src={pictures[0]}
                alt="No Image"
                className="object-cover w-full h-full"
              />
            </div>
            {/* Product Details Section */}
            <div className="w-full md:w-2/3 flex flex-col p-4 md:p-7">
              <h2 className="text-left text-xl font-bold text-gray-900 truncate">
                {productName}
              </h2>
              <p className="text-left text-xs text-gray-600 mt-1 line-clamp-2">
                {productDescription}
              </p>
              <div className="flex flex-col mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-left text-[15px] text-[#E11919]">
                    <span className="text-black">Price: </span>
                    {`₱${price.toFixed(2)}`}
                  </div>

                  {storedUser && (
                    <div className="flex items-center space-x-2 lg:mr-6">
                      <div className="text-left text-[15px] text-[#737373] mr-2">
                        Quantity
                      </div>
                      <button
                        onClick={handleDecrease}
                        className="w-[30px] h-[30px] flex items-center justify-center text-[20px] font-inter text-[#737373] bg-gray-200 border border-gray-300 hover:bg-gray-300 transition-colors duration-300"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-[40px] h-[30px] bg-white text-center border border-gray-300 mx-1"
                      />
                      <button
                        onClick={handleIncrease}
                        className="w-[30px] h-[30px] flex items-center justify-center text-[20px] font-inter text-[#737373] bg-gray-200 border border-gray-300 hover:bg-gray-300 transition-colors duration-300"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    {generateStars(rating, true)}
                    <span className="ml-2 text-xs text-gray-700">
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  {storedUser && (
                    <button
                      className="bg-green-900 text-white py-2 px-4 md:px-20 text-sm rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-300"
                      onClick={handleAddToCart}
                    >
                      Add To Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* White Rectangle with Profile Pic and Shop Info */}
          <div className="my-6 bg-white border border-gray-300 rounded-lg shadow-md p-4 flex md:flex-row items-start md:items-center justify-between">
            <div className="flex items-start md:items-center flex-1">
              <img
                src={MyProfilePic}
                alt="Profile"
                className="w-12 h-12 bg-gray-300 rounded-full object-cover"
              />
              <div className="flex md:flex-row items-start md:items-center flex-1">
                <div className="ml-2 md:ml-4">
                  {" "}
                  {/* Adjust margin for mobile view */}
                  <div className="text-gray-900 text-md font-semibold truncate w-auto">
                    {shopName}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-[#2979FF]">Verified</span>
                    <img
                      src={VerifiedUserIcon}
                      alt="Verified"
                      className="w-5 h-5 ml-2"
                    />
                  </div>
                </div>
                <div className="border-l border-gray-500 h-20 md:h-8 mx-4 mt-1 ml-3 mr-3 md:ml-8 md:mt-0 md:mx-6"></div>{" "}
                {/* Adjust margin for the border */}
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex items-center md:mt-0 md:ml-4">
                      <span className="md:mr-2 mr-6 text-xs md:text-sm ">
                        Products:
                      </span>
                      <span className="text-[#E11919] font-bold text-xs md:text-sm md:mr-6">
                        {numberOfProducts}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0 md:ml-4">
                      <span className="md:mr-2 mr-5 text-xs md:text-sm">
                        Followers:
                      </span>
                      <span className="text-[#E11919] font-bold text-xs md:text-sm md:mr-6">
                        {numberOfFollowers}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center mt-2 md:mt-0 md:ml-5">
                    <div className="flex items-center">
                      <span className="md:mr-2 mr-8 text-xs md:text-sm">
                        Ratings:
                      </span>
                      <span className="text-[#E11919] font-bold text-xs md:text-sm md:mr-5">
                        {numberOfRatings}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0 md:ml-4">
                      <span className="mr-2 text-xs md:text-sm">
                        Shop Rating:
                      </span>
                      <div className="flex items-center">
                        {generateStars(shopRating)}
                        <span className="ml-2 text-xs text-gray-700 md:mr-5">
                          {shopRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleViewShop}
                    className="hidden md:block bg-blue-500 text-white font-bold text-xs py-2 px-2 rounded-md hover:bg-blue-700 transition-colors duration-300 mt-4 md:ml-6 md:mt-0"
                  >
                    <img
                      src={StorefrontIcon}
                      alt="Storefront"
                      className="w-4 h-4 inline-block mr-1 mb-0.5"
                    />
                    View Shop
                  </button>
                  {/* Button for mobile view */}
                  <button
                    onClick={handleViewShop}
                    className="block md:hidden bg-blue-500 text-white font-bold text-xs py-2 px-2 rounded-md hover:bg-blue-700 transition-colors duration-300 mt-4"
                  >
                    <img
                      src={StorefrontIcon}
                      alt="Storefront"
                      className="w-4 h-4 inline-block mr-1 mb-0.5"
                    />
                    View Shop
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details Box */}
          <div className="mt-4 bg-white border border-gray-300 rounded-lg shadow-md">
            <div className="bg-green-900 p-3 rounded-t-lg text-left">
              <h3 className="text-base font-semibold text-white ml-2">
                Ratings and Reviews of {productName}
              </h3>
            </div>
            <div className="p-5">
              {/* Rating Number Container */}
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold text-black">
                  {rating.toFixed(1)}
                </span>
                <span className="text-xl text-gray-600 ml-2">/ 5</span>
              </div>
              {/* Stars Container */}
              <div className="flex mb-2">{generateStars(rating)}</div>
              {/* Number of Ratings Container */}
              <div className="flex items-left text-xs text-gray-600 mb-4">
                {numberOfRatings} Product Ratings
              </div>

              {/* Sorting and Filtering Dropdowns */}
              <hr className="my-4 border-gray-300" />
              <div className="flex flex-col md:flex-row items-center justify-between mt-4">
                <div className="text-sm font-semibold text-black mb-2 md:mb-0">
                  Product Reviews
                </div>

                {/* Sorting and Filtering Dropdowns */}
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                  <div className="flex items-center space-x-2">
                    <img src={SortIcon} alt="Sort" className="w-5 h-5" />
                    <select
                      value={sortOrder}
                      onChange={handleSortChange}
                      className="text-black border border-gray-300 rounded-md px-2 py-1 text-sm bg-white transition duration-300 ease-in-out hover:bg-gray-100 custom-select"
                    >
                      <option value="Ascending">
                        Sort by Rating (Low to High)
                      </option>
                      <option value="Descending">
                        Sort by Rating (High to Low)
                      </option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={FilterIcon} alt="Filter" className="w-5 h-5" />
                    <select
                      value={filterRating}
                      onChange={handleFilterChange}
                      className="text-black border border-gray-300 rounded-md px-2 py-1 text-sm bg-white transition duration-300 ease-in-out hover:bg-gray-100 custom-select"
                    >
                      <option value="All Stars">Filter by Rating</option>
                      {Object.entries(ratingCounts).map(([stars, count]) => (
                        <option key={stars} value={`${stars} Stars`}>
                          {stars} Stars ({count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <hr className="my-4 border-gray-300" />

              {/* Customer Reviews */}
              <div className="space-y-4">
                {/* Review 1 */}
                <div className="flex items-start space-x-4">
                  <img
                    src={MyProfilePic} // Using the imported profile picture
                    alt="Customer"
                    className="w-10 h-10 bg-gray-300 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold mb-1 text-left">
                      {/* Name here */}John Doe
                    </div>
                    <div className="flex items-center mb-2">
                      {generateStars(Math.floor(Math.random() * 5) + 1)}{" "}
                      {/* Random rating */}
                    </div>
                    <div className="text-gray-800 text-left">
                      {/* Comment here */}
                      This product is amazing! The quality exceeded my
                      expectations, and the customer service was top-notch.
                    </div>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="flex items-start space-x-4">
                  <img
                    src={MyProfilePic} // Using the imported profile picture
                    alt="Customer"
                    className="w-10 h-10 bg-gray-300 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold mb-1 text-left">
                      {/* Name here */}Jane Smith
                    </div>
                    <div className="flex items-center mb-2">
                      {generateStars(Math.floor(Math.random() * 5) + 1)}{" "}
                      {/* Random rating */}
                    </div>
                    <div className="text-gray-800 text-left">
                      {/* Comment here */}I had a great experience with this
                      product. It’s exactly what I needed and works perfectly.
                    </div>
                  </div>
                </div>

                {/* Add more reviews as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
