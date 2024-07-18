import React from "react";
import HomePage from "../pages/homepage/HomePage";
import Login from "../pages/login/Login";
import Products from "../pages/products/Products";
import ShopProfile from "../pages/shopprofile/ShopProfile";
import Cart from "../pages/cart/Cart";

const routes = [
    {/* CTRL + CLICK the elements to go to the file */ },
    { path: "/", element: <HomePage />, name: "Homepage" },
    { path: "/login", element: <Login />, name: "Login" },
    { path: "/products", element: <Products />, name: "Products" },
    { path: "/shopProfile", element: <ShopProfile />, name: "ShopProfile" },
    { path: "/cart", element: <Cart />, name: "Cart" }
];

export default routes;

