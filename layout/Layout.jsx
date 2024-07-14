// Layout.js
import React from "react";
import PageRouter from "../src/components/PageRouter";
import { BrowserRouter as Router } from "react-router-dom";


const Layout = () => {
  return (
    <Router>
        <PageRouter />
    </Router>
  );
};

export default Layout;
