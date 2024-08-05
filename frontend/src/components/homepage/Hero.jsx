import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import backgroundImage from '../../assets/hero-section-bg.svg';

const Hero = () => {
  const navigate = useNavigate(); 

  const handleShopAllClick = () => {
    navigate('/products'); 
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Hero Section */}
      <div
        className="relative w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'right center',
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-start items-center px-8 z-10 md:px-16 lg:px-24 xl:px-32">
          <div className="mt-24 md:mt-32 lg:mt-40">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-center"
                style={{
                    color: '#0059B8',
                    textShadow: '2px 2px 2px rgba(0, 0, 0, 0.3)',
                    fontFamily: 'Arial, sans-serif'
                }}>
                Freshness from Farm to Doorstep
            </h1>
            <p className="text-base md:text-lg lg:text-xl mb-4 text-center text-gray-500"
                style={{
                    fontFamily: 'Arial, sans-serif'
                }}>
                Nurturing Communities, One Delivery at a Time.
            </p>
            <button
              className="font-bold py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 rounded-full mb-10"
              style={{
                backgroundColor: '#67B045',
                color: '#FFFFFF',
                transition: 'background-color 0.3s ease',
              }}
              onClick={handleShopAllClick} 
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#072C1C';
                e.currentTarget.style.color = '#67B045';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#67B045';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              Shop All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
