import React from 'react';
import backgroundImage from '../../assets/hero-section.svg';

const Hero = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center"
        style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: 'right center' 
          }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-start px-8 z-10" style={{ transform: 'translateY(-80px) translateX(30px)' }}>
          <h1 className="text-5xl font-bold mb-2 text-left" 
              style={{
                  color: '#FFFFFF', 
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', 
                  fontFamily: 'Arial, sans-serif'
              }}>
              Freshness from Farm to Doorstep
          </h1>
          <p className="text-xl mb-2 text-left" 
              style={{
                  color: '#FFFFFF',
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', 
                  fontFamily: 'Arial, sans-serif' 
              }}>
              Nurturing Communities, One Delivery at a Time.
          </p>
          <br/>
          <button className="font-bold py-4 px-6 rounded-full mb-10"
          style={{
              backgroundColor: '#0059b8', 
              color: '#FFFFFF', 
              transition: 'background-color 0.3s ease', 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d9d9d9'; 
            e.currentTarget.style.color = '#0059b8'; 
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0059b8'; 
            e.currentTarget.style.color = '#FFFFFF'; 
          }}
          >
          Shop All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
