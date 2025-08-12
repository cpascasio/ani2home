import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import Star from "../assets/Star.png";
import StarFilled from "../assets/StarFilled.png";

function generateStars(rating) {
  const starElements = [];

  for (let k = 0; k < rating; k++) {
    starElements.push(
      <img
        key={`filled-${k}`}
        alt="Star"
        src={StarFilled}
        className="w-4 h-4"
      />
    );
  }
  for (let k = 0; k < 5 - rating; k++) {
    starElements.push(
      <img key={`empty-${k}`} alt="Star" src={Star} className="w-4 h-4" />
    );
  }

  return starElements;
}

const ProductCard = (product) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");

  const handleAddToCart = async () => {
    try {
      // Get the stored user data which contains the token
      const userData = JSON.parse(storedUser);
      const token = userData?.token;

      if (!token) {
        console.error("No authentication token found");
        navigate("/login");
        return;
      }

      // Create Axios POST request - NO sellerId needed!
      await axios.post(
        "http://localhost:3000/api/cart/add-to-cart",
        {
          userId: user?.userId,
          productId: product.id, // Only send productId
          quantity: 1,
          // sellerId removed - backend will get it from product data
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);

      // If authentication fails, redirect to login
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleImageClick = () => {
    // Navigate to itemPage with product ID or other identifier
    navigate("/item/" + product.id);
  };

  const yellowStars = generateStars(product.rating);

  return (
    <div className="bg-white flex flex-col border border-gray-300 rounded-lg overflow-hidden shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      {/* Image section with proper button element */}
      <button
        className="w-full h-[178px] object-cover cursor-pointer focus:outline-none"
        onClick={handleImageClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleImageClick();
          }
        }}
        aria-label={`View details of ${product.productName}`}
      >
        <img
          src={product.pictures[0]}
          alt={product.productName}
          className="w-full h-[178px] object-cover"
        />
      </button>

      {/* Product description section */}
      <div className="flex flex-col flex-grow p-3">
        <h2 className="text-left text-sm font-bold text-gray-900 truncate">
          {product.productName}
        </h2>
        <p className="text-left text-xs text-gray-600 mt-1 line-clamp-2">
          {product.productDescription}
        </p>
        <div className="stars-wrapper flex mt-1">{yellowStars}</div>
        <p className="text-left text-xs text-red-500 mt-1">
          Rating: {product.rating}
        </p>
      </div>

      {/* Add to cart button */}

      {storedUser && (
        <button
          className="bg-green-900 text-white py-1 px-2 text-xs rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-300 mx-4 mb-4 sm:py-2 sm:px-4 sm:text-sm"
          onClick={handleAddToCart}
        >
          Add To Cart
        </button>
      )}
    </div>
  );
};

export default ProductCard;
