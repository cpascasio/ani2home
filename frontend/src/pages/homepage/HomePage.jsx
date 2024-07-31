import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import Hero from "../../components/homepage/Hero.jsx";
import ProductCategories from "../../components/homepage/ProductCategories.jsx";
import Empty from "../../components/homepage/Empty.jsx";
import WhyUs from '../../components/homepage/WhyUs.jsx';


const HomePage = () => {
  return (
    <div className='w-full'>
      <Header />
      <Hero />
      <ProductCategories />
      <Empty/>
      <WhyUs />
      <Footer />
    </div>
  );
};

export default HomePage;
