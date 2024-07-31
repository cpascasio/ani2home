import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import Hero from "../../components/homepage/Hero.jsx";
import ProductCategories from "../../components/homepage/ProductCategories.jsx";
import WhyUs from '../../components/homepage/WhyUs.jsx';
import FeaturedRecipes from "../../components/homepage/FeaturedRecipes.jsx";


const HomePage = () => {
  return (
    <div className='w-full'>
      <Header />
      <ProductCategories />
      <WhyUs />
      <FeaturedRecipes/>
      {/* <Footer /> */}
    </div>
  );
};

export default HomePage;
