import React from "react";
import HomePage from "../pages/homepage/HomePage";
import ShopProfile from "../pages/shopprofile/ShopProfile";
import Products from "../pages/products/Products";


const routes = [
    {/* CTRL + CLICK the elements to go to the file */ },
    { path: "/", element: <HomePage />, name: "Homepage" },
    { path: "/shopProfile", element: <ShopProfile />, name: "ShopProfile" },
    { path: "/products", element: <Products />, name: "Products" }
    
];

export default routes;

