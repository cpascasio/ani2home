import React from "react";
import HomePage from "./pages/homepage/HomePage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Products from "./pages/products/Products";
import AboutUs from "./pages/about/About";
import Seller from "./pages/seller/Seller";
import ShopProfile from "./pages/shopprofile/ShopProfile";
import MyProfile from "./pages/myProfile/MyProfile";
import MyOrders from "./pages/myOrders/MyOrders";
import MyShop from "./pages/myShop/MyShop";
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import Confirmation from "./pages/confirmation/Confirmation";
import ItemPage from "./pages/itemPage/ItemPage";
import EnableMFA from "./pages/enableMfa/EnableMFA";

import AuthzGate from "./security/AuthzGate";
import { POLICIES } from "./security/routePolicy";

const wrap = (path, element, name) => {
  const policy = POLICIES[path];
  if (!policy) return { path, element, name };

  return {
    path,
    name,
    element: (
      <AuthzGate require={policy} redirectTo="/login">
        {element}
      </AuthzGate>
    ),
  };
};

const routes = [
  wrap("/", <HomePage />, "Homepage"),
  { path: "/login", element: <Login />, name: "Login" },
  { path: "/register", element: <Register />, name: "Register" },
  wrap("/aboutus", <AboutUs />, "AboutUs"),
  wrap("/products", <Products />, "Products"),
  wrap("/seller", <Seller />, "Seller"),
  { path: "/profile/:sellerId", element: <ShopProfile />, name: "ShopProfile" },
  wrap("/myProfile", <MyProfile />, "MyProfile"),
  wrap("/myOrders", <MyOrders />, "MyOrders"),
  wrap("/myShop", <MyShop />, "MyShop"),
  wrap("/cart", <Cart />, "Cart"),
  { path: "/checkout/:sellerId", element: (
      <AuthzGate require={POLICIES["/checkout/:sellerId"]} redirectTo="/login">
        <Checkout />
      </AuthzGate>
    ), name: "Checkout" },
  { path: "/confirmation/:orderId", element: <Confirmation />, name: "Confirmation" },
  { path: "/item/:productId", element: <ItemPage />, name: "ItemPage" },
  { path: "/enable-mfa", element: <EnableMFA />, name: "EnableMFA" },
];

export default routes;