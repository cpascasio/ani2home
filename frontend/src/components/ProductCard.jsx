import React, { useContext } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { format } from 'date-fns';
import { useUser } from '../context/UserContext';
import axios from 'axios';


const ProductCard = (product) => {  
  const { user } = useUser();

  // add console log for user
  console.log('Current user:', user);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    // Include user ID in the product data
    const cartItem = { ...product, userId: user.id };

    try {
      // Create Axios POST request
      await axios.post('http://localhost:3000/api/cart/add-to-cart', {
        userId: user?.userId,
        productId: product?.id,
        quantity: 1
      });

      // Add to cart context
      addToCart(cartItem);
      navigate('/cart');
    } catch (error) {
      console.error('hello Error adding to cart:', error);
    }
  };


  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <figure className="px-10 pt-10">
        <img
          src={product.pictures[0]}
          alt={product.productName}
          className="rounded-xl"
        />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{product.productName}</h2>
        <p>{product.productDescription}</p>
        <p>Php {product.price}</p>
        <p>Rating: {product.rating}</p>
        {/* <p>Date: {product.productDate}</p> */}
        <div className="card-actions">
        <button className="btn btn-primary" onClick={handleAddToCart}>
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
