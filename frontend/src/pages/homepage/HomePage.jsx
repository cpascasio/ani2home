import Hero from "../../components/homepage/Hero.jsx";
import ProductCategories from "../../components/homepage/ProductCategories.jsx";
import WhyUs from '../../components/homepage/WhyUs.jsx';
import FeaturedRecipes from "../../components/homepage/FeaturedRecipes.jsx";


const HomePage = () => {
  return (
    <div className='w-full'>
      {/* <Header /> */}
      <Hero/>
      <ProductCategories />
      <WhyUs />
      <FeaturedRecipes/>
      {/* <Footer /> */}
    </div>
  );
};

export default HomePage;
