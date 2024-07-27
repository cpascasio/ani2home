// import ProductCard component
import { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import useFetch from '../../../hooks/useFetch'



const Products = () => { // function name should match the file name

  const [products, setProducts] = useState([]);

  const { data: productsFetch } = useFetch("/api/products");
  

  useEffect(() => {
    if (productsFetch) {
      setProducts(productsFetch);
    }
  }
  , [productsFetch]);


  useEffect(() => {
    console.log(products)
  }
  , [products]);


    return (
      <div className="flex w-full border-2">
        <button className="btn btn-outline btn-info">Info</button>
        {
          products?.map((product) => (
            <ProductCard key={product._id} {...product} />
          ))
        }

      </div>
    );
  };
  
  export default Products; // name should match the file name