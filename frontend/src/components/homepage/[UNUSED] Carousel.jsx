import React from 'react';
import Slider from 'react-slick';

// Custom arrow components
const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer bg-gray-800 p-3 rounded-full text-white z-10"
      onClick={onClick}
    >
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 left-4 transform -translate-y-1/2 cursor-pointer bg-gray-800 p-3 rounded-full text-white z-10"
      onClick={onClick}
    >
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </div>
  );
};

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="w-full">
      <Slider {...settings} className="w-full">
        <div className="w-full h-full bg-white-800 flex justify-center items-center">
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold mb-4">Slide 1</h2>
            <p className="text-lg">This is the content for slide 1.</p>
          </div>
        </div>
        <div className="w-full h-full bg-white-700 flex justify-center items-center">
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold mb-4">Slide 2</h2>
            <p className="text-lg">This is the content for slide 2.</p>
          </div>
        </div>
        <div className="w-full h-full bg-white-600 flex justify-center items-center">
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold mb-4">Slide 3</h2>
            <p className="text-lg">This is the content for slide 3.</p>
          </div>
        </div>
      </Slider>
    </div>
  );
};

export default Carousel;
