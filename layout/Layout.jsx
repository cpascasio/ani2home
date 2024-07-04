// Layout.js
import React from "react";
import PageRouter from "../src/components/PageRouter";
import { BrowserRouter as Router } from "react-router-dom";


const Layout = () => {
  return (
    <Router>
      <div>
        <PageRouter />
      </div>
    </Router>
  );
};

export default Layout;
