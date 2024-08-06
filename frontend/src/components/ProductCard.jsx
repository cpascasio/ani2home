import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import Star from '../assets/Star.png';
import StarFilled from '../assets/StarFilled.png';

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
      <img
        key={`empty-${k}`}
        alt="Star"
        src={Star}
        className="w-4 h-4"
      />
    );
  }

  return starElements;
}

const ProductCard = (product) => {
  const { user } = useUser();
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    // Include user ID in the product data

    try {
      // Create Axios POST request
      await axios.post('http://localhost:3000/api/cart/add-to-cart', {
          userId: user?.userId,
          sellerId: product.storeId,
          productId: product.id,
          quantity: 1,
      });

      navigate("/cart");
    } catch (error) {
      console.error('hello Error adding to cart:', error);
    }
  };

  const handleImageClick = () => {
    // Navigate to itemPage with product ID or other identifier
    navigate('/itemPage');
  };

  const yellowStars = generateStars(product.rating);

  return (
    // <div className="card bg-base-100 w-96 shadow-xl">
    //   <figure className="px-10 pt-10">
    //     <img
    //       src={product.pictures[0]}
    //       alt={product.productName}
    //       className="rounded-xl"
    //     />
    //   </figure>
    //   <div className="card-body items-center text-center">
    //     <h2 className="card-title">{product.productName}</h2>
    //     <p>{product.productDescription}</p>
    //     <p>Php {product.price}</p>
    //     <p>Rating: {product.rating}</p>
    //     {/* <p>Date: {product.productDate}</p> */}
    //     <div className="card-actions">
    //     <button className="btn btn-primary" onClick={handleAddToCart}>
    //         Add To Cart
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <div className="bg-white flex flex-col border border-gray-300 rounded-lg overflow-hidden shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <img
        src={product.pictures[0]}
        alt={product.productName}
        className="w-full h-[178px] object-cover cursor-pointer"
        onClick={handleImageClick}
      />
      <div className="flex flex-col flex-grow p-3">
        <h2 className="text-left text-sm font-bold text-gray-900 truncate">{product.productName}</h2>
        <p className="text-left text-xs text-gray-600 mt-1 line-clamp-2">
          {product.productDescription}
        </p>
        <div className="stars-wrapper flex mt-1">
          {yellowStars}
        </div>
        <p className="text-left text-xs text-red-500 mt-1">Rating: {product.rating}</p>
      </div>
      <button
        className="bg-green-900 text-white py-1 px-2 text-xs rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-300 mx-4 mb-4 sm:py-2 sm:px-4 sm:text-sm"
        onClick={handleAddToCart}
      >
        Add To Cart
      </button>
    </div>
  );
};

export default ProductCard;
