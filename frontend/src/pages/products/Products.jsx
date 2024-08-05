import { useState, useEffect } from 'react';
import useFetch from '../../../hooks/useFetch';
import ProductCard from '../../components/ProductCard';

// Importing images
import HorizontalLines from '../../assets/horizontallines.png';
import SortUp from '../../assets/SortUp.png';
import SortDown from '../../assets/SortDown.png';
import Footer from '../../components/Footer';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedButton, setSelectedButton] = useState('default');
  const [isAscending, setIsAscending] = useState(true);
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const [isSortOptionsOpen, setIsSortOptionsOpen] = useState(false);

  const { data: productsFetch } = useFetch("/api/products");

  useEffect(() => {
    if (productsFetch) {
      setProducts(productsFetch);
    }
  }, [productsFetch]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsCollapseOpen(false);
  };

  const getButtonClassName = (buttonType) => {
    return `text-base font-inter rounded px-4 py-2 w-auto h-auto flex items-center justify-center cursor-pointer transition-colors duration-300 ${
      selectedButton === buttonType ? 'bg-[#67B045] text-white' : 'bg-white text-[#1E1E1E]'
    }`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 pt-24">
      <div className="flex flex-col flex-grow bg-gray-200">
        <div className="flex flex-col sm:flex-row w-full max-w-screen-xl mx-auto p-4">
          {/* Categories Section */}
          <div className="w-full sm:w-[15%] p-4">
            {/* Mobile Collapse */}
            <div className="block sm:hidden">
              <button
                onClick={() => setIsCollapseOpen(!isCollapseOpen)}
                className="flex items-center cursor-pointer bg-[#0B472D] text-white p-2 rounded-md w-full text-left"
              >
                <span className="flex-1">Categories</span>
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
                <div className="bg-[#67B045] text-white p-4 w-auto max-w-md mx-auto"> {/* Adjusted width */}
                  {['All Products', 'Fruits', 'Vegetables', 'Artisanal Food'].map((category) => (
                    <a
                      key={category}
                      href={`#${category.toLowerCase()}`}
                      className={`block text-[16px] ${selectedCategory === category ? 'font-bold text-gray-200' : 'text-gray-200'} mb-3 hover:text-blue-300`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {/* Desktop Categories */}
            <div className="hidden sm:block">
              <div className="flex items-center text-gray-600 mb-3">
                <img src={HorizontalLines} alt="Categories Icon" className="w-5 h-5" />
                <span className="text-xl font-bold pl-2">Categories</span>
              </div>
              <div className="flex flex-col text-left">
                {['All Products', 'Fruits', 'Vegetables', 'Artisanal Food'].map((category) => (
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
          </div>
          {/* Product Section */}
          <div className="w-full sm:w-[85%] px-4">
            <div className="flex items-center justify-between px-4 py-2 mb-4 rounded-lg bg-[#0B472D] shadow-md">
              {/* Sort by and Collapse */}
              <div className="flex items-center space-x-4">
                <span className="text-white text-lg sm:text-2xl font-inter">Sort by</span>
                {/* Container for sort options */}
                <div className="relative flex items-center space-x-2">
                  {/* Mobile Sort Options Toggle Button */}
                  <button
                    onClick={() => setIsSortOptionsOpen(!isSortOptionsOpen)}
                    className="block sm:hidden text-white bg-[#67B045] rounded px-4 py-2"
                  >
                    {selectedButton}
                  </button>
                  {/* Mobile Sort Options Menu */}
                  {isSortOptionsOpen && (
                    <div className="absolute top-full left-0 w-auto max-w-md bg-[#67B045] text-white rounded mt-2 p-2"> {/* Adjusted width and padding */}
                      <div
                        className={getButtonClassName('default')}
                        onClick={() => {
                          setSelectedButton('default');
                          setIsSortOptionsOpen(false);
                        }}
                      >
                        Default
                      </div>
                      <div
                        className={getButtonClassName('topSales')}
                        onClick={() => {
                          setSelectedButton('topSales');
                          setIsSortOptionsOpen(false);
                        }}
                      >
                        Top Sales
                      </div>
                      <div
                        className={getButtonClassName('topRated')}
                        onClick={() => {
                          setSelectedButton('topRated');
                          setIsSortOptionsOpen(false);
                        }}
                      >
                        Top Rated
                      </div>
                    </div>
                  )}
                  {/* Desktop Sort Options */}
                  <div className="hidden sm:flex items-center space-x-2">
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
                  </div>
                </div>
              </div>
              {/* Ascending/Descending */}
              <div className="flex items-center space-x-2">
                <span className="text-white font-inter text-sm sm:text-lg">
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
                    className="w-6 h-6"
                  />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products?.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0B472D] text-white p-4 mt-auto">
      </footer>
    </div>
  );
};

export default Products;
