import React from "react";
import HomePage from "../pages/homepage/HomePage";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register"
import Products from "../pages/products/Products";
import AboutUs from "../pages/about/About";
import Seller from "../pages/seller/Seller";
import ShopProfile from "../pages/shopprofile/ShopProfile";
import MyProfile from "../pages/myProfile/MyProfile";
import MyOrders from "../pages/myOrders/MyOrders";
import MyShop from "../pages/myShop/MyShop";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/checkout/Checkout";
import Confirmation from "../pages/confirmation/Confirmation";
import ItemPage from "../pages/itemPage/ItemPage";

const routes = [
    {/* CTRL + CLICK the elements to go to the file */ },
    { path: "/", element: <HomePage />, name: "Homepage" },
    { path: "/login", element: <Login />, name: "Login" },
    { path: "/register", element: <Register />, name: "Register" },
    { path: "/aboutus", element: <AboutUs />, name: "AboutUs" },
    { path: "/products", element: <Products />, name: "Products" },
    { path: "/seller", element: <Seller />, name: "Seller" },
    { path: "/profile/:sellerId", element: <ShopProfile />, name: "ShopProfile" },
    { path: "/myProfile", element: <MyProfile />, name: "MyProfile" },
    { path: "/myOrders", element: <MyOrders />, name: "MyOrders" },
    { path: "/myShop", element: <MyShop />, name: "MyShop" },
    { path: "/cart", element: <Cart />, name: "Cart" },
    { path: "/checkout/:sellerId", element: <Checkout />, name: "Checkout" },
    { path: "/confirmation", element: <Confirmation />, name: "Confirmation" },
    { path: "/item/:productId", element: <ItemPage />, name: "ItemPage" }
    
];

export default routes;

