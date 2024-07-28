// Layout.js
import React from "react";
import { UserProvider } from "../src/context/UserContext";
import { CartProvider } from "../src/context/CartContext";
import PageRouter from "../src/components/PageRouter";
import { BrowserRouter as Router } from "react-router-dom";


const Layout = () => {
  return (
    <UserProvider>
    <CartProvider>
    <Router>
        <PageRouter />
    </Router>
    </CartProvider>
    </UserProvider>
  );
};

export default Layout;
