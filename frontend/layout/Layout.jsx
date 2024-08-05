import React from "react";
import { UserProvider } from "../src/context/UserContext";
import { CartProvider } from "../src/context/CartContext";
import PageRouter from "../src/components/PageRouter";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { APIProvider } from "@vis.gl/react-google-maps";

const Layout = () => {
  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      region="PH"
      libraries={[]}
    >
      <UserProvider>
        <CartProvider>
          <Router>
            <Header />
            <PageRouter />
            {/* <Footer /> */}
          </Router>
        </CartProvider>
      </UserProvider>
    </APIProvider>
  );
};

export default Layout;
