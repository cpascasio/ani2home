import React from 'react';
import PropTypes from 'prop-types';
import FeaturedRecipes from "./FeaturedRecipes.jsx";


const Empty = ({ height, backgroundColor }) => {
  return (
    <div
      style={{
        height: height || '420px', 
        backgroundColor: backgroundColor || '#F5F0EC', 
      }}
      className="w-full" 
    >

    {/* Featured Recipes - Overlapping */}
    <FeaturedRecipes />
    </div>
  );
};

export default Empty;
