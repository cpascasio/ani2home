import { useState, useEffect } from "react";
import CartItem from "../../components/CartItem";
import apiClient from "../../utils/apiClient"; // Import the authenticated API client
import { useUser } from "../../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import VerifiedUserIcon from "../../assets/verifiedUser.png";
import StorefrontIcon from "../../assets/storefront.png";
import StarFilled from "../../assets/StarFilled.png";
import Star from "../../assets/Star.png";
import TokenDebugger from "../../components/TokenDebugger";

// Function to generate star elements based on the rating
const generateStars = (rating, isProductCard = false) => {
  const starElements = [];
  const starClass = isProductCard ? "w-6 h-6" : "w-5 h-5";
  for (let k = 0; k < Math.floor(rating); k++) {
    starElements.push(
      <img
        key={`filled-${k}`}
        alt="Star"
        src={StarFilled}
        className={starClass}
      />
    );
  }
  for (let k = 0; k < 5 - Math.floor(rating); k++) {
    starElements.push(
      <img key={`empty-${k}`} alt="Star" src={Star} className={starClass} />
    );
  }
  return starElements;
};

const Cart = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // State management
  const [cartNew, setCartNew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // // Check authentication on component mount
  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (!storedUser) {
  //     navigate("/login");
  //     return;
  //   }
  // }, [navigate]);

  // Fetch cart data when user is available
  useEffect(() => {
    if (user?.userId) {
      fetchCartData();
    }
  }, [user]);

  // Function to fetch cart data with authentication
  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.userId) {
        throw new Error("User not authenticated");
      }

      console.log("Fetching cart for user:", user.userId);

      // Use authenticated API client instead of useFetch
      const response = await apiClient.get(`/cart/${user.userId}`);

      console.log("Cart API response:", response.data);

      // The backend returns the cart data directly, not wrapped in a data object
      setCartNew(response.data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);

      // Handle different error types
      if (error.response?.status === 401) {
        setError("Please log in to view your cart");
        navigate("/login");
      } else if (error.response?.status === 404) {
        setError("Cart not found");
        setCartNew([]);
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load cart"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to add item to cart
  const addToCart = async (sellerId, productId, quantity = 1) => {
    try {
      const response = await apiClient.post("/cart/add-to-cart", {
        userId: user.userId,
        sellerId,
        productId,
        quantity,
      });

      if (response.data.message) {
        console.log("Item added to cart:", response.data.message);
        await fetchCartData(); // Refresh cart
        return true;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError(error.response?.data?.message || "Failed to add item to cart");
      return false;
    }
  };

  // Function to remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const response = await apiClient.delete("/cart/remove-from-cart", {
        data: {
          userId: user.userId,
          productId,
        },
      });

      if (response.data.message) {
        console.log("Item removed from cart:", response.data.message);
        await fetchCartData(); // Refresh cart
        return true;
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      setError(
        error.response?.data?.message || "Failed to remove item from cart"
      );
      return false;
    }
  };

  // Function to remove all items from a seller
  const removeSellerItems = async (sellerId) => {
    try {
      const response = await apiClient.put("/cart/remove-seller-items", {
        userId: user.userId,
        sellerId,
      });

      if (response.data.message) {
        console.log("Seller items removed:", response.data.message);
        await fetchCartData(); // Refresh cart
        return true;
      }
    } catch (error) {
      console.error("Error removing seller items:", error);
      setError(
        error.response?.data?.message || "Failed to remove seller items"
      );
      return false;
    }
  };

  const handleViewShop = (sellerId) => {
    navigate("/profile/" + sellerId);
  };

  const handleCheckout = (sellerId) => {
    if (cartNew?.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate(`/checkout/${sellerId}`);
    console.log("handleCheckout", sellerId);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ backgroundColor: "#e5e7eb" }} className="w-full pt-24">
        {/* Add this line for debugging */}
        <div className="px-4 md:px-20 lg:px-40 bg-gray-200 min-h-screen">
          <div className="flex justify-center items-center h-[400px]">
            <div className="text-gray-600 font-inter font-bold text-[18px]">
              Loading your cart...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#e5e7eb" }} className="w-full pt-24">
      <div className="px-4 md:px-20 lg:px-40 bg-gray-200 min-h-screen">
        <div className="font-inter font-bold text-[18px] text-gray-600 text-left pt-10">
          YOUR CART
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
            <p>{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-500 underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-4">
          {cartNew?.length === 0 ? (
            <div className="flex justify-center items-center h-[400px]">
              <div className="text-center">
                <p className="text-gray-600 font-inter font-bold text-[18px] mb-4">
                  Your cart is empty
                </p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-[#209D48] text-white px-6 py-2 rounded-md hover:bg-[#67B045] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            cartNew?.map((item) => (
              <div key={item.sellerId}>
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
                      onError={(e) => {
                        e.target.src = "../src/assets/FarmShop1.jpg";
                      }}
                    />
                    <div className="flex md:flex-row items-start md:items-center flex-1">
                      <div className="ml-2 md:ml-4">
                        <div className="text-gray-900 text-md font-semibold truncate w-auto">
                          {item?.seller?.name || "Unknown Seller"}
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
                      <div className="border-l border-gray-500 h-20 md:h-8 mx-4 mt-1 ml-3 mr-3 md:ml-8 md:mt-0 md:mx-6"></div>
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

                  {/* Remove all items from this seller button */}
                  <button
                    onClick={() => removeSellerItems(item.sellerId)}
                    className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                    title="Remove all items from this seller"
                  >
                    Remove All
                  </button>
                </div>

                {/* Render cart items */}
                {item.items?.map((product) => (
                  <CartItem
                    key={product.productId}
                    product={product}
                    onRemove={() => removeFromCart(product.productId)}
                  />
                ))}

                {/* Checkout button */}
                <div className="flex justify-center mt-10">
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
