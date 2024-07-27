import React from 'react';
import { useState } from 'react';
const [products, setProducts] = useState([]);

const { data: productsFetch } = useFetch("/api/products");

useEffect(() => {
    if (productsFetch) {
        setProducts(productsFetch);
    }
}, [productsFetch]);

const ProductCard = () => {
  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <figure className="px-10 pt-10">
        <img
          src={productsFetch.pictures[0]}
          alt="Shoes"
          className="rounded-xl"
        />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{productsFetch.productName}</h2>
        <p>{productsFetch.productDescription}</p>
        <div className="card-actions">
          <button className="btn btn-primary">Add To Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
