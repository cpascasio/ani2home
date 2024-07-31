import React, { useContext } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { format } from 'date-fns';


const ProductCard = (product) => {  
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart(product);
    navigate('/cart');
  };


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
    className="w-full h-[178px] object-cover"
  />
  <div className="p-3">
    <h2 className="text-left text-sm font-bold text-gray-900 truncate">{product.productName}</h2> 
    <p className="text-left text-xs text-gray-600 mt-1 line-clamp-2"> 
      {product.productDescription}
    </p>
    <p className="text-left text-xs text-red-500 mt-1">Rating: {product.rating}</p>
  </div>
  <button
    className="bg-green-900 text-white py-2 px-4 rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-300 mx-4 mb-4"
    onClick={handleAddToCart} 
  >
    Add To Cart
  </button>
</div>



  );
};

export default ProductCard;
