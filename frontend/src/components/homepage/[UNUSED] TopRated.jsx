import React from "react";
import Slider from "react-slick";
import FeaturedRecipes from "./FeaturedRecipes.jsx";

const topRatedProducts = [
  {
    id: 1,
    name: "Strawberry",
    price: "₱10.00",
    rating: 4,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Banana",
    price: "₱20.00",
    rating: 5,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Mango",
    price: "₱15.00",
    rating: 5,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "Carrots",
    price: "₱30.00",
    rating: 5,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    name: "Broccoli",
    price: "₱5.00",
    rating: 4,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 6,
    name: "Cabbage",
    price: "₱25.00",
    rating: 5,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 7,
    name: "Honey",
    price: "₱45.00",
    rating: 5,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 8,
    name: "Jam",
    price: "₱300.00",
    rating: 4,
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: 9,
    name: "Wine",
    price: "₱1,500.00",
    rating: 5,
    imageUrl: "https://via.placeholder.com/150",
  },
];

const TopRated = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div
      className="absolute p-8 bg-white rounded-lg shadow-lg z-20"
      style={{
        top: "123%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "20px",
        backgroundColor: "#efefef",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        height: "550px",
        width: "1000px",
      }}
    >
      <br />
      <h1
        className="text-5xl font-bold mb-4 text-center"
        style={{
          color: "#1F934C",
          textShadow: "2px 2px 3px rgba(0, 0, 0, 0.3)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Top Rated
      </h1>
      <h3
        className="text-1xl mb-4 text-center"
        style={{
          color: "#0b472d",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Discover the finest local produce and artisanal foods with our Top Rated
        section, <br />
        featuring highly recommended products cherished by our customers.
      </h3>

      <br />
      <Slider {...settings}>
        {topRatedProducts.map((product) => (
          <div key={product.id} className="p-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-32 h-32 object-cover mb-4 rounded-lg transition-transform duration-300 ease-in-out hover:scale-110"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-800">
                {product.name}
              </h3>
              <p className="text-lg mb-2">{product.price}</p>
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`w-5 h-5 ${index < product.rating ? "text-yellow-500" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.27l-7.19-.62L12 2 9.19 8.65 2 9.27l5.46 4.7L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <FeaturedRecipes />
    </div>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer bg-green-900 p-2 rounded-full text-white z-10"
      onClick={onClick}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        ></path>
      </svg>
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 left-4 transform -translate-y-1/2 cursor-pointer bg-green-900 p-2 rounded-full text-white z-10"
      onClick={onClick}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
    </div>
  );
};

export default TopRated;
