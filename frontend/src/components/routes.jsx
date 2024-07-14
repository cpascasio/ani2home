import React from "react";
import HomePage from "../pages/homepage/HomePage";
import Products from "../pages/products/Products";


const routes = [
    {/* CTRL + CLICK the elements to go to the file */ },
    { path: "/", element: <HomePage />, name: "Homepage" },
    { path: "/products", element: <Products />, name: "Products" }
    
];

export default routes;

