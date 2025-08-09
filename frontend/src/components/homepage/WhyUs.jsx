import React, { useState } from "react";
import {
  FaLeaf,
  FaSeedling,
  FaHandHoldingHeart,
  FaShoppingCart,
  FaUsers,
} from "react-icons/fa"; // Import new icons
import PropTypes from "prop-types";
import localImage from "../../assets/whyus-bg-new.svg";
import logo from "../../assets/logo.png";

const WhyUs = ({ height, backgroundColor, backgroundImage }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const style = {
    height: height || "700px",
    backgroundColor: backgroundColor || "#f0f0f0",
    backgroundImage: backgroundImage
      ? `url(${backgroundImage})`
      : `url(${localImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100%",
  };

  const accordionItems = [
    {
      icon: <FaLeaf className="text-blue-500 mr-4 text-2xl" />,
      title: "Support Local Farmers and Communities",
      content:
        "By purchasing from Ani2Home, you directly support local farmers and public markets, contributing to the sustainability and growth of local agriculture while fostering community resilience and economic development.",
    },
    {
      icon: <FaSeedling className="text-yellow-500 mr-4 text-2xl" />,
      title: "Fresh, High-Quality Produce",
      content:
        "Ani2Home offers a selection of fresh, seasonal, and sustainably grown products sourced directly from local farms, ensuring that you receive the highest quality produce, often fresher than what you would find in traditional retail stores.",
    },
    {
      icon: <FaHandHoldingHeart className="text-red-500 mr-4 text-2xl" />,
      title: "Sustainability and Social Impact",
      content:
        "Ani2Home promotes environmental sustainability and social responsibility through its reward system, which supports tree planting and feeding programs, allowing you to make a positive impact with every purchase.",
    },
    {
      icon: <FaShoppingCart className="text-purple-500 mr-4 text-2xl" />,
      title: "Convenience and Transparency",
      content:
        "Ani2Home offers the convenience of browsing a wide variety of products and learning about the farmers who grow them, all from the comfort of your home. The app also provides market information and pricing transparency, ensuring that you make informed and fair purchases.",
    },
    {
      icon: <FaUsers className="text-teal-500 mr-4 text-2xl" />,
      title: "Community Engagement and Social Responsibility",
      content:
        "Ani2Home fosters a sense of community by enabling customers to engage in meaningful ways, such as participating in reward programs that contribute to social and environmental causes.",
    },
  ];

  return (
    <div
      style={style}
      className="flex flex-col items-center justify-center p-6 md:p-10 relative"
    >
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4 md:p-6">
        {/* Title Section */}
        <div className="pb-4 md:pb-6 text-center flex items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mr-3">
            Why Choose <span style={{ color: "#67B045" }}>Ani2Home</span>
          </h2>
          <img src={logo} alt="Ani2Home Logo" className="h-10 md:h-12 mr-4" />
        </div>

        {/* Accordion Section */}
        {accordionItems.map((item, index) => (
          <div key={index} className="border-b w-full">
            <button
              className={`w-full flex items-center justify-between p-4 md:p-6 text-left focus:outline-none 
              rounded-lg shadow-md transition-shadow duration-300 ease-in-out ${
                activeIndex === index ? "bg-green-200" : "bg-white"
              }`}
              style={{
                backgroundColor: activeIndex === index ? "#67B045" : "#EFEFEF",
                transition: "background-color 0.3s ease",
              }}
              onClick={() => handleToggle(index)}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="font-semibold text-lg md:text-xl text-gray-800">
                  {item.title}
                </span>
              </div>
              <span className="text-lg md:text-xl">
                {activeIndex === index ? "-" : "+"}
              </span>
            </button>
            {activeIndex === index && (
              <div className="p-4 md:p-6 text-gray-700 text-base md:text-lg">
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
