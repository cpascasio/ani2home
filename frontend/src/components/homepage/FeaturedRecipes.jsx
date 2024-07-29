// import React from 'react';
// import Slider from 'react-slick';

// // Sample data for featured recipes
// const featuredRecipes = [
//   { id: 1, title: 'Recipe One', description: 'Delicious recipe one description', imageUrl: 'https://via.placeholder.com/150' },
//   { id: 2, title: 'Recipe Two', description: 'Tasty recipe two description', imageUrl: 'https://via.placeholder.com/150' },
//   { id: 3, title: 'Recipe Three', description: 'Yummy recipe three description', imageUrl: 'https://via.placeholder.com/150' },
//   { id: 4, title: 'Recipe Four', description: 'Scrumptious recipe four description', imageUrl: 'https://via.placeholder.com/150' },
//   { id: 5, title: 'Recipe Five', description: 'Flavorful recipe five description', imageUrl: 'https://via.placeholder.com/150' },
// ];

// const FeaturedRecipes = ({ height = '550px', width = '1000px', marginTop = '100px' }) => {
//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//   };

//   return (
//     <div
//       className="p-8 bg-white rounded-lg shadow-lg z-20"
//       style={{
//         height,
//         width,
//         marginTop, // Adjust margin-top here
//       }}
//     >
//       <h1
//         className="text-4xl font-bold mb-4 text-center"
//         style={{
//           color: '#1F934C',
//           textShadow: '2px 2px 3px rgba(0, 0, 0, 0.3)',
//           fontFamily: 'Arial, sans-serif',
//         }}
//       >
//         Featured Recipes
//       </h1>
//       <h3
//         className="text-lg mb-4 text-center"
//         style={{
//           color: '#0b472d',
//           fontFamily: 'Arial, sans-serif',
//         }}
//       >
//         Explore our curated selection of delicious recipes, highlighting the best of local produce and culinary creativity.
//       </h3>

//       <Slider {...settings}>
//         {featuredRecipes.map((recipe) => (
//           <div key={recipe.id} className="p-4">
//             <div className="flex flex-col items-center">
//               <div className="relative">
//                 <img
//                   src={recipe.imageUrl}
//                   alt={recipe.title}
//                   className="w-32 h-32 object-cover mb-4 rounded-lg transition-transform duration-300 ease-in-out hover:scale-110"
//                 />
//               </div>
//               <h3 className="text-xl font-semibold mb-2 text-blue-800">{recipe.title}</h3>
//               <p className="text-lg mb-2 text-center">{recipe.description}</p>
//             </div>
//           </div>
//         ))}
//       </Slider>
//     </div>
//   );
// };

// export default FeaturedRecipes;
