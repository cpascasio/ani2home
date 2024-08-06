import React from 'react';
import backgroundImage from '../../assets/product-categories-bg.svg';
import category1Image from '../../assets/category1.png';
import category2Image from '../../assets/category2.png';
import category3Image from '../../assets/category3.png';
import { useNavigate } from "react-router-dom";

const ProductCategories = () => {

  const navigate = useNavigate();

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Container for Title and Buttons */}
      <div className="absolute inset-0 flex flex-col items-center justify-start p-4 md:p-8 space-y-4">
        {/* Title */}
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center"
          style={{
            color: '#1F934C',
            textShadow: '2px 2px 3px rgba(0, 0, 0, 0.3)',
            fontFamily: 'Arial, sans-serif',
            marginTop: '1%', // Adjust vertical position
          }}
        >
          Our Products
        </h1>
        <p
          className="text-md md:text-lg lg:text-xl text-center max-w-2xl"
          style={{
            color: '#0b472d',
            fontFamily: 'Arial, sans-serif',
            marginTop: '1%', // Adjust vertical position
          }}
        >
          Explore a selection of <strong> fresh, local produce and artisanal food</strong>, directly sourced 
          from nearby farmers and markets, and discover the essence of <strong>farm-to-table living</strong>.
        </p>

        {/* Buttons Container */}
        <div className="flex flex-wrap justify-center gap-10 md:gap-12 lg:gap-14 pt-6 mt-4">
          {/* Category Button 1 */}
          <button
            className="relative flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-green-600 text-white font-bold text-base sm:text-lg md:text-xl hover:bg-green-700 transition-all duration-300 hover:scale-110"
            style={{
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              backgroundImage: `url(${category1Image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={() => navigate('/products#fruits')}
          >
            <span className="z-10">Fruits</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 rounded-full"></div>
            <div className="absolute inset-0 bg-black/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </button>

          {/* Category Button 2 */}
          <button
            className="relative flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-green-600 text-white font-bold text-base sm:text-lg md:text-xl hover:bg-green-700 transition-all duration-300 hover:scale-110"
            style={{
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              backgroundImage: `url(${category2Image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={() => navigate('/products#vegetables')}
          >
            <span className="z-10">Vegetables</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 rounded-full"></div>
            <div className="absolute inset-0 bg-black/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </button>

          {/* Category Button 3 */}
          <button
            className="relative flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-green-600 text-white font-bold text-base sm:text-lg md:text-xl hover:bg-red-700 transition-all duration-300 hover:scale-110"
            style={{
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              backgroundImage: `url(${category3Image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={() => navigate('/products#artisanal%20food')}
          >
            <span className="z-10">Artisanal Food</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 rounded-full"></div>
            <div className="absolute inset-0 bg-black/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;
