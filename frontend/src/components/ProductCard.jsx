import React from 'react';
import { useState } from 'react';
import { format } from 'date-fns';


const ProductCard = (product) => {  
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
          <button className="btn btn-primary">Add To Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
