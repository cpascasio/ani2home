// Layout.js
import React from "react";
import { UserProvider } from "../src/context/UserContext";
import { CartProvider } from "../src/context/CartContext";
import PageRouter from "../src/components/PageRouter";
import { BrowserRouter as Router } from "react-router-dom";
// import header
import Header from '../src/components/Header';
// import footer
import Footer from '../src/components/Footer';


const Layout = () => {
  return (
    <UserProvider>
    <CartProvider>
    <Router>
    <Header/>
      <PageRouter />
    <Footer/>
    </Router>
    </CartProvider>
    </UserProvider>
  );
};

export default Layout;
