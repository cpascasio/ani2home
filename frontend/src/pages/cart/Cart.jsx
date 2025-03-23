import { useState, useEffect, useContext } from "react";
import CartItem from "../../components/CartItem";
import { CartContext } from "../../context/CartContext";
import useFetch from "../../../hooks/useFetch";
import { useUser } from "../../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import VerifiedUserIcon from "../../assets/verifiedUser.png";
import StorefrontIcon from "../../assets/storefront.png";
import StarFilled from "../../assets/StarFilled.png";
import Star from "../../assets/Star.png";

// Function to generate star elements based on the rating
const generateStars = (rating, isProductCard = false) => {
  const starElements = [];
  const starClass = isProductCard ? "w-6 h-6" : "w-5 h-5"; // Adjust size for product card
  for (let k = 0; k < Math.floor(rating); k++) {
    starElements.push(
      <img
        key={`filled-${k}`}
        alt="Star"
        src={StarFilled}
        className={starClass} // Adjusted size to match "/ 5"
      />
    );
  }
  for (let k = 0; k < 5 - Math.floor(rating); k++) {
    starElements.push(
      <img
        key={`empty-${k}`}
        alt="Star"
        src={Star}
        className={starClass} // Adjusted size to match "/ 5"
      />
    );
  }
  return starElements;
};

const Cart = () => {
  const { user } = useUser();

  const { data: cartFetch } = useFetch(`/api/cart/${user?.userId}`);

  const [cartNew, setCartNew] = useState([]);

  //const { cart } = useContext(CartContext);
  // const navigate = useNavigate();

  // add console log for user
  //console.log('Current user:', user);
  const navigate = useNavigate();

  const handleViewShop = (sellerId) => {
    navigate("/profile/" + sellerId); // Navigate to shop profile
  };

  useEffect(() => {
    if (cartFetch) {
      setCartNew(cartFetch);
    }
    console.log(cartFetch);
  }, [cartFetch]);

  useEffect(() => {
    console.log("Cart Page: ", cartNew);
  }, [cartNew]);

  // useEffect(() => {
  //   if (cartFetch) {
  //     setCartNew(cartFetch);
  //   }
  // }
  // , [cartFetch]);

  // useEffect(() => {
  //   console.log(cartNew)
  // }
  // , [cartNew]);

  // const handleCheckout = () => {
  //     checkout(product);
  //     navigate('/checkout');
  //   };
  const handleCheckout = (sellerId) => {
    if (cartNew?.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate(`/checkout/${sellerId}`);
    console.log("handleCheckout", sellerId);
  };

  return (
    <div style={{ backgroundColor: "#e5e7eb" }} className="w-full pt-24">
      <div className="px-4 md:px-20 lg:px-40 bg-gray-200 min-h-screen">
        {" "}
        {/* main container for body */}
        <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
          YOUR CART
        </div>
        <div className="space-y-4">
          {cartNew?.length === 0 ? (
            <div className="flex justify-center items-center h-[400px]">
              <p className="text-gray-600 font-inter font-bold text-[18px]">
                Your cart is empty
              </p>
            </div>
          ) : (
            cartNew?.map((item) => (
              <div key={item.sellerId}>
                {/* {item?.sellerId} */}
                {/* White Rectangle with Profile Pic and Shop Info */}
                <div className="my-6 bg-white border border-gray-300 rounded-lg shadow-md p-4 flex md:flex-row items-start md:items-center justify-between">
                  <div className="flex items-start md:items-center flex-1">
                    <img
                      src={
                        item?.seller?.userProfilePic ||
                        "../src/assets/FarmShop1.jpg"
                      }
                      alt="Profile"
                      className="w-12 h-12 bg-gray-300 rounded-full object-cover"
                    />
                    <div className="flex md:flex-row items-start md:items-center flex-1">
                      <div className="ml-2 md:ml-4">
                        {" "}
                        {/* Adjust margin for mobile view */}
                        <div className="text-gray-900 text-md font-semibold truncate w-auto">
                          {item?.seller?.name}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-[#2979FF]">
                            Verified
                          </span>
                          <img
                            src={VerifiedUserIcon}
                            alt="Verified"
                            className="w-5 h-5 ml-2"
                          />
                        </div>
                      </div>
                      <div className="border-l border-gray-500 h-20 md:h-8 mx-4 mt-1 ml-3 mr-3 md:ml-8 md:mt-0 md:mx-6"></div>{" "}
                      {/* Adjust margin for the border */}
                      <div className="flex flex-col md:flex-row md:items-center">
                        <button
                          onClick={() => handleViewShop(item?.sellerId)}
                          className="hidden md:block bg-blue-500 text-white font-bold text-xs py-2 px-2 rounded-md hover:bg-blue-700 transition-colors duration-300 mt-4 md:ml-6 md:mt-0"
                        >
                          <img
                            src={StorefrontIcon}
                            alt="Storefront"
                            className="w-4 h-4 inline-block mr-1 mb-0.5"
                          />
                          View Shop
                        </button>
                        {/* Button for mobile view */}
                        <button
                          onClick={() => handleViewShop(item?.sellerId)}
                          className="block md:hidden bg-blue-500 text-white font-bold text-xs py-2 px-2 rounded-md hover:bg-blue-700 transition-colors duration-300 mt-4"
                        >
                          <img
                            src={StorefrontIcon}
                            alt="Storefront"
                            className="w-4 h-4 inline-block mr-1 mb-0.5"
                          />
                          View Shop
                        </button>
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className="flex items-center mt-2 md:mt-0 md:ml-4">
                            <span className="md:mr-2 mr-5 text-xs md:text-sm">
                              Followers:
                            </span>
                            <span className="text-[#E11919] font-bold text-xs md:text-sm md:mr-6">
                              {item?.seller?.followers?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center mt-2 md:mt-0 md:ml-5">
                          <div className="flex items-center">
                            <span className="md:mr-2 mr-8 text-xs md:text-sm">
                              Ratings:
                            </span>
                            <span className="text-[#E11919] font-bold text-xs md:text-sm md:mr-5">
                              4.0
                            </span>
                          </div>
                          <div className="flex items-center mt-2 md:mt-0 md:ml-4">
                            <span className="mr-2 text-xs md:text-sm">
                              Shop Rating:
                            </span>
                            <div className="flex items-center">
                              {generateStars(4)}
                              <span className="ml-2 text-xs text-gray-700 md:mr-5">
                                {(4.0).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {item.items?.map((product) => (
                  <CartItem key={product.productId} product={product} />
                ))}
                <div className="flex justify-center mt-10">
                  {" "}
                  {/* container for checkout button */}
                  <button
                    onClick={() => handleCheckout(item?.sellerId)}
                    className="w-full max-w-[212px] h-[40px] bg-green-900 rounded-md text-[16px] font-inter font-bold text-white border border-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition duration-300 ease-in-out"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <br />
      </div>
    </div>
  );
};

export default Cart;
