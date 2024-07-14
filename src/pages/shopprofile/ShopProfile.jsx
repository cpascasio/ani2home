import React from 'react';
import {useState} from "react"

const ShopProfile = () => {
  const [count, setCount] = useState(0);

  const incrementCounter = () => {
    setCount(count + 1);
  };




  return (
    <nav className="navbar">
      <div className="logo">


      <p>Count: {count}</p>
      <button onClick={incrementCounter}>Increment</button>
      <a href="/">
          <img src="images/Ani2Home Logo.png" alt="Ani2Home Logo" />
        </a>
      </div>
      <div className="nav-items">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact Us</a></li>
        </ul>
      </div>
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
        <button type="submit">Search</button>
      </div>
      <div className="user-nav">
        <a href="/cart">asd</a>
        <a href="/profile">asd</a>
      </div>
    </nav>
  );
};

export default ShopProfile;
