import React from 'react';
import backgroundImage from '../../assets/product-categories-bg.svg';
import category1Image from '../../assets/category1.png';
import category2Image from '../../assets/category2.png';
import category3Image from '../../assets/category3.png';
import TopRated from "../../components/homepage/TopRated.jsx";


const ProductCategories = () => {
  return (
    <div
      className="relative w-full"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        width: '100%',
        height: '900px',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Container for Title and Buttons */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Title */}
        <h1
          className="text-5xl font-bold mb-3 text-center"
          style={{
            color: '#1F934C',
            textShadow: '2px 2px 3px rgba(0, 0, 0, 0.3)',
            fontFamily: 'Arial, sans-serif',
            transform: 'translateY(-220px)',
          }}
        >
          Our Products
        </h1>
        <h3
          className="text-1xl mb-3 text-center"
          style={{
            color: '#0b472d',
            fontFamily: 'Arial, sans-serif',
            transform: 'translateY(-215px)',
          }}
        >
          Explore a curated selection of fresh, local produce and artisanal food, <br/>
          directly sourced from nearby farmers and markets, and discover the essence of farm-to-table living.
        </h3>

        {/* Buttons Container */}
        <div className="flex space-x-40" style={{ transform: 'translateY(-180px)' }}>
          {/* Category Button 1 */}
          <button
            className="relative flex items-center justify-center w-56 h-56 rounded-full bg-green-600 text-white font-bold text-xl hover:bg-green-700 transition-all duration-300 hover:scale-110"
            style={{
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              backgroundImage: `url(${category1Image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <span className="z-10">Fruits</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 rounded-full"></div>
            {/* Hover Effects */}
            <div className="absolute inset-0 bg-black/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </button>

          {/* Category Button 2 */}
          <button
            className="relative flex items-center justify-center w-56 h-56 rounded-full bg-green-600 text-white font-bold text-xl hover:bg-green-700 transition-all duration-300 hover:scale-110"
            style={{
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              backgroundImage: `url(${category2Image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <span className="z-10">Vegetables</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 rounded-full"></div>
            {/* Hover Effects */}
            <div className="absolute inset-0 bg-black/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </button>

          {/* Category Button 3 */}
          <button
            className="relative flex items-center justify-center w-56 h-56 rounded-full bg-green-600 text-white font-bold text-xl hover:bg-red-700 transition-all duration-300 hover:scale-110"
            style={{
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              backgroundImage: `url(${category3Image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <span className="z-10">Artisanal Food</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 rounded-full"></div>
            {/* Hover Effects */}
            <div className="absolute inset-0 bg-black/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </button>
        </div>
      </div>

      {/* Top Rated - Overlapping */}
        <TopRated />
    </div>
  );
};

export default ProductCategories;
