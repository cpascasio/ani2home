import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./config/axiosConfig.js";
import "./index.css";
import "./config/firebase-config";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
