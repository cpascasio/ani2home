// Layout.js
import React from "react";
import { UserProvider } from "../src/context/UserContext";
import PageRouter from "../src/components/PageRouter";
import { BrowserRouter as Router } from "react-router-dom";


const Layout = () => {
  return (
    <UserProvider>
    <Router>
        <PageRouter />
    </Router>
    </UserProvider>
  );
};

export default Layout;
