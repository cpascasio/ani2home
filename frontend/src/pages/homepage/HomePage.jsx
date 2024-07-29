import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import Hero from "../../components/homepage/Hero.jsx";
import ProductCategories from "../../components/homepage/ProductCategories.jsx";
import Empty from "../../components/homepage/Empty.jsx";
import Carousel from "../../components/homepage/Carousel.jsx";
// import Empty2 from '../../components/homepage/Empty2.jsx';


const HomePage = () => {
  return (
    <div className='w-full'>
      <Header />
      <Hero />
      <ProductCategories />
      <Empty/>
      {/* <Empty2 /> */}
      {/*<Carousel />*/}
      <Footer />
    </div>
  );
};

export default HomePage;
