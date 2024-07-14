import React from "react";
import HomePage from "../pages/homepage/HomePage";
import ShopProfile from "../pages/shopprofile/ShopProfile";


const routes = [
    {/* CTRL + CLICK the elements to go to the file */ },
    { path: "/", element: <HomePage />, name: "Homepage" },
    { path: "/profile", element: <ShopProfile />, name: "ShopProfile" },
    
];

export default routes;

