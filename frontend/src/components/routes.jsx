import React from "react";
import HomePage from "../pages/homepage/HomePage";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register"
import Products from "../pages/products/Products";


const routes = [
    {/* CTRL + CLICK the elements to go to the file */ },
    { path: "/", element: <HomePage />, name: "Homepage" },
    { path: "/login", element: <Login />, name: "Login" },
    { path: "/register", element: <Register />, name: "Register" },
    { path: "/products", element: <Products />, name: "Products" }
    
];

export default routes;

