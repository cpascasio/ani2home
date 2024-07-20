import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
const Checkout = () => {
  return (
    <div className='w-full'>
      <Header />
        <div className="px-40 bg-gray-200"> {/* main container for body */}
                <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
                    YOUR CART
                </div>
        </div>
      <Footer />
    </div>
  );
};

export default Checkout;