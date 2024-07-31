import React, { useState } from 'react';
import { FaLeaf, FaSeedling, FaHandHoldingHeart } from 'react-icons/fa';
import PropTypes from 'prop-types';
import localImage from '../../assets/whyus-bg.svg';
import logo from '../../assets/logo.png';

const WhyUs = ({ height, backgroundColor, backgroundImage }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const style = {
    height: height || '600px',
    backgroundColor: backgroundColor || '#f0f0f0',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : `url(${localImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
  };

  const accordionItems = [
    {
      icon: <FaLeaf className="text-blue-500 mr-2" />,
      title: 'Support Local Farmers and Communities',
      content: 'By purchasing from Ani2Home, you directly support local farmers and public markets, contributing to the sustainability and growth of local agriculture while fostering community resilience and economic development.',
    },
    {
      icon: <FaSeedling className="text-yellow-500 mr-2" />,
      title: 'Fresh, High-Quality Produce',
      content: 'Ani2Home offers a selection of fresh, seasonal, and sustainably grown products sourced directly from local farms, ensuring that you receive the highest quality produce, often fresher than what you would find in traditional retail stores.',
    },
    {
      icon: <FaHandHoldingHeart className="text-red-500 mr-2" />,
      title: 'Sustainability and Social Impact',
      content: 'Ani2Home promotes environmental sustainability and social responsibility through its reward system, which supports tree planting and feeding programs, allowing you to make a positive impact with every purchase.',
    },
  ];

  return (
    <div style={style} className="flex flex-col items-center justify-center p-8 relative">
      <div className="absolute right-36 w-full max-w-xl bg-white rounded-lg shadow-lg">
        {/* Title Section */}
        <div className="p-4 text-center flex items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mr-2">
            Why Choose <span style={{ color: '#67B045' }}>Ani2Home</span>
          </h2>
          <img src={logo} alt="Ani2Home Logo" className="h-9 mr-3" />
        </div>

        {/* Accordion Section */}
        {accordionItems.map((item, index) => (
          <div key={index} className="border-b">
            <button
              className={`w-full flex items-center justify-between p-4 text-left focus:outline-none 
              rounded-lg shadow-md transition-shadow duration-300 ease-in-out ${
                activeIndex === index ? 'bg-green-200' : 'bg-white'
              }`}
              style={{ backgroundColor: activeIndex === index ? '#67B045' : '#FFFFFF', 
                      transition: 'background-color 0.3s ease' }} 
              onClick={() => handleToggle(index)}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="font-semibold text-gray-800">{item.title}</span>
              </div>
              <span>{activeIndex === index ? '-' : '+'}</span>
            </button>
            {activeIndex === index && (
              <div className="p-4 text-gray-600">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

WhyUs.propTypes = {
  height: PropTypes.string,
  backgroundColor: PropTypes.string,
  backgroundImage: PropTypes.string,
};

export default WhyUs;
