import React from "react";
import Slider from "react-slick";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBowlFood } from "@fortawesome/free-solid-svg-icons"; 
import PropTypes from "prop-types";

import strawberrySpinachSalad from "../../assets/recipe1.jpg";
import bananaPancakes from "../../assets/recipe2.jpg";
import mangoSalsa from "../../assets/recipe3.jpg";
import roastedCarrots from "../../assets/recipe4.jpg";
import broccoliStirFry from "../../assets/recipe5.jpg";

const featuredRecipes = [
  {
    id: 1,
    title: "Strawberry Spinach Salad",
    imageUrl: strawberrySpinachSalad,
    description: "Fresh strawberries, spinach, and a tangy vinaigrette.",
  },
  {
    id: 2,
    title: "Banana Pancakes",
    imageUrl: bananaPancakes,
    description: "Ripe bananas mixed into a fluffy pancake batter.",
  },
  {
    id: 3,
    title: "Mango Salsa",
    imageUrl: mangoSalsa,
    description: "Juicy mangoes with onions, tomatoes, and cilantro.",
  },
  {
    id: 4,
    title: "Roasted Carrots",
    imageUrl: roastedCarrots,
    description: "Sweet roasted carrots with a honey glaze.",
  },
  {
    id: 5,
    title: "Broccoli Stir Fry",
    imageUrl: broccoliStirFry,
    description: "Crisp broccoli sautéed with garlic and soy sauce.",
  },
];

const FeaturedRecipes = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div
      className="p-8 shadow-lg z-20 mx-auto"
      style={{
        backgroundColor: "#0B472D",
        width: "100%",
        maxWidth: "2500px",
        margin: "0 auto",
        height: "700px",
      }}
    >
      <div className="flex items-center justify-center">
        <FontAwesomeIcon
          icon={faBowlFood}
          className="text-white text-4xl mr-4"
        />
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center"
          style={{
            color: "#EFEFEF",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Featured Recipes
        </h1>
        <FontAwesomeIcon
          icon={faBowlFood}
          className="text-white text-4xl ml-4"
        />
      </div>
      <br />
      <p
        className="text-md md:text-lg lg:text-xl text-center max-w-2xl"
        style={{
          color: "#D2E5B9",
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.5",
          margin: "0 auto",
        }}
      >
        Discover our curated selection of recipes featuring the freshest fruits
        and vegetables from Ani2Home's local farmers and markets. Perfect for a
        wholesome and delightful meal experience.
      </p>
      <br />
      <div className="relative overflow-hidden pl-24">
        <Slider {...settings} className="relative z-10">
          {featuredRecipes.map((recipe) => (
            <div key={recipe.id} className="p-4 flex">
              <div
                className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
                style={{
                  height: "100%",
                  maxWidth: "300px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-60 object-cover mb-1 rounded-t-lg"
                  style={{ borderBottom: "4px solid #0059B8" }}
                />
                <div className="p-4 flex flex-col justify-between flex-1">
                  <h4 className="text-lg font-semibold mb-2 text-green-800">
                    {recipe.title}
                  </h4>
                  <p className="text-sm text-gray-600">{recipe.description}</p>
                </div>
              </div>
              <br />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer bg-blue-900 p-3 rounded-full text-white shadow-lg z-20"
      aria-label="Next arrow"
    >
      <svg
        className="w-8 h-8"
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

NextArrow.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      className="absolute top-1/2 left-0 transform -translate-y-1/2 cursor-pointer bg-blue-900 p-3 rounded-full text-white shadow-lg z-20"
      style={{ left: "-80px" }}
      aria-label="Previous arrow"
    >
      <svg
        className="w-8 h-8"
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

PrevArrow.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default FeaturedRecipes;
