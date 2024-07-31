import React from 'react';
import Slider from 'react-slick';

import strawberrySpinachSalad from '../../assets/recipe1.jpg';
import bananaPancakes from '../../assets/recipe2.jpg';
import mangoSalsa from '../../assets/recipe3.jpg';
import roastedCarrots from '../../assets/recipe4.jpg';
import broccoliStirFry from '../../assets/recipe5.jpg';

const featuredRecipes = [
  { id: 1, title: 'Strawberry Spinach Salad', imageUrl: strawberrySpinachSalad, description: 'Fresh strawberries, spinach, and a tangy vinaigrette.' },
  { id: 2, title: 'Banana Pancakes', imageUrl: bananaPancakes, description: 'Ripe bananas mixed into a fluffy pancake batter.' },
  { id: 3, title: 'Mango Salsa', imageUrl: mangoSalsa, description: 'Juicy mangoes with onions, tomatoes, and cilantro.' },
  { id: 4, title: 'Roasted Carrots', imageUrl: roastedCarrots, description: 'Sweet roasted carrots with a honey glaze.' },
  { id: 5, title: 'Broccoli Stir Fry', imageUrl: broccoliStirFry, description: 'Crisp broccoli sautéed with garlic and soy sauce.' },
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
  };

  return (
    <div
      className="absolute p-8 bg-white rounded-lg shadow-lg z-20"
      style={{
        top: '123%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        backgroundColor: '#efefef',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        height: '600px',
        width: '1050px',
      }}
    >
      <br/>
      <h1 className="text-5xl font-bold mb-4 text-center"
        style={{
          color: '#1F934C',
          textShadow: '2px 2px 2px rgba(0, 0, 0, 0.3)',
          fontFamily: 'Arial, sans-serif',
        }}
      > 
        Featured Recipes
      </h1>
      <h3 className="text-1xl mb-4 text-center"
        style={{
          color: '#0b472d',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Explore our curated selection of recipes, highlighting <br/>
        the freshest fruits and vegetables for a wholesome meal experience.
      </h3>

      <br/>
      <Slider {...settings}>
        {featuredRecipes.map((recipe) => (
          <div key={recipe.id} className="p-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-48 h-48 object-cover mb-4 rounded-lg transition-transform duration-300 ease-in-out hover:scale-110"
                />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-green-800">{recipe.title}</h4>
              <p className="text-sm text-center text-gray-500">{recipe.description}</p>
            </div>
          </div>
        ))}
      </Slider>
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
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
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
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </div>
  );
};

export default FeaturedRecipes;
