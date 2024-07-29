import { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import useFetch from '../../../hooks/useFetch';

import ProductCard from '../../components/ProductCard';



// Importing images
import HorizontalLines from '../../assets/horizontallines.png';
import Carrot from '../../assets/carrot.png';
import StarFilled from '../../assets/StarFilled.png';
import StarHalfEmpty from '../../assets/StarHalfEmpty.png';
import Star from '../../assets/Star.png';
import SortUp from '../../assets/SortUp.png';
import SortDown from '../../assets/SortDown.png';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedButton, setSelectedButton] = useState('default');
  const [isAscending, setIsAscending] = useState(true);

  const { data: productsFetch } = useFetch("/api/products");

  useEffect(() => {
    if (productsFetch) {
      setProducts(productsFetch);
    }
  }, [productsFetch]);

  useEffect(() => {
    console.log(products);
  }, [products]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const getButtonClassName = (buttonType) => {
    return `text-[12px] font-inter rounded px-4 py-2 ml-4 w-[86px] h-[32px] flex items-center justify-center cursor-pointer transition-colors duration-300 ${
        selectedButton === buttonType ? 'bg-[#67B045] text-white' : 'bg-white text-[#1E1E1E]'
    }`;
};

  return (
    // <div className="flex w-full border-2">
    //     <button className="btn btn-outline btn-info">Info</button>
    //     {
    //       products?.map((product) => (
    //         <ProductCard key={product._id} {...product} />
    //       ))
    //     }
    <div className="w-full">
      <Header />
      {/* ----- start of body ----- */}
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-gray-200 flex flex-col items-center justify-center w-full max-w-screen-lg mx-auto p-4">
        {/* Categories Section */}
        <div className="flex mt-7">
          <div className="w-[200px]">
            <div className="flex items-center text-gray-600 mb-3">
              <img src={HorizontalLines} alt="Categories Icon" className="w-[20px] h-[20px]" />
              <span className="text-[18px] font-inter font-bold pl-2">Categories</span>
            </div>
            <div className="flex flex-col text-left mx-3">
              {['All Products', 'Vegetables', 'Meat', 'Fruits'].map((category) => (
                <a
                  key={category}
                  href={`#${category.toLowerCase()}`}
                  className={`text-[16px] ${selectedCategory === category ? 'font-bold text-gray-800' : 'text-gray-800'} mb-3 hover:text-blue-500`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col ml-6 w-full">
            <div className="w-full max-w-screen-lg h-auto bg-[#0B472D] flex items-center px-4 py-2 mb-4">
              <span className="text-white text-2xl font-inter mx-2">Sort by</span>
              <div
                className={getButtonClassName('default')}
                onClick={() => setSelectedButton('default')}
              >
                Default
              </div>
              <div
                className={getButtonClassName('topSales')}
                onClick={() => setSelectedButton('topSales')}
              >
                Top Sales
              </div>
              <div
                className={getButtonClassName('topRated')}
                onClick={() => setSelectedButton('topRated')}
              >
                Top Rated
              </div>
              <div className="flex-1 flex items-center justify-end">
                <form className="flex items-center">
      
                  <div className="flex items-center ml-4">
                    <span className="text-white font-inter text-[18px] mr-2" style={{ minWidth: '100px' }}>
                      {isAscending ? 'Ascending' : 'Descending'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAscending(!isAscending);
                      }}
                      className="flex items-center p-1"
                    >
                      <img
                        src={isAscending ? SortUp : SortDown}
                        alt={isAscending ? 'Sort Ascending' : 'Sort Descending'}
                        className="w-8 h-8 mr-4"
                      />
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex w-full border-2">
              {
                products?.map((product) => (
                  <ProductCard key={product._id} {...product} />
                ))
              }
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
