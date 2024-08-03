import React, { useState } from 'react';
import './Menu.css';

const Menu = ({ onSelectMenu }) => {
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const [isShopCollapseOpen, setIsShopCollapseOpen] = useState(false);

  return (
    <div className="menu-container w-full min-h-screen bg-gray-200">
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-4 bg-gray-200">
        {/* Sidebar Section */}
        <div className="sidebar w-full sm:w-[15%] p-4 flex flex-col space-y-4">
          {/* Mobile Collapse for User Profile */}
          <div className="block lg:hidden w-full">
            <button
              onClick={() => setIsCollapseOpen(!isCollapseOpen)}
              className="flex items-center cursor-pointer bg-[#0B472D] text-white p-2 rounded-md w-full text-left mb-3"
            >
              <span className="flex-1">USER PROFILE</span>
              <svg
                className={`w-4 h-4 transition-transform ${isCollapseOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isCollapseOpen && (
              <div className="bg-[#67B045] text-white p-4 w-auto max-w-md mx-auto">
                <ul className="space-y-4 text-left lg:pr-11">
                  <li>
                    <a href="#" className="block text-[16px] text-gray-200 underline hover:text-blue-300">
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a href="/myOrders" className="block text-[16px] text-gray-200 hover:text-blue-300">
                      My Orders
                    </a>
                  </li>
                  <li>
                    <a href="/seller" className="block text-[16px] text-gray-200 hover:text-blue-300">
                      My Shop
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Desktop View for User Profile */}
          <div className="hidden lg:block w-full">
            <div className="user-profile-menu">
              <div className="header">USER PROFILE</div>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-gray-600 underline hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Profile</a>
                </li>
                <li>
                  <a href="/myOrders" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Orders</a>
                </li>
                <li>
                  <a href="/seller" className="text-gray-600 hover:text-blue-500 hover:font-bold transition duration-800 ease-in-out">My Shop</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Collapse for My Shop */}
          <div className="block lg:hidden w-full">
            <button
              onClick={() => setIsShopCollapseOpen(!isShopCollapseOpen)}
              className="flex items-center cursor-pointer bg-[#0B472D] text-white p-2 rounded-md w-full text-left mb-3"
            >
              <span className="flex-1">MY SHOP</span>
              <svg
                className={`w-4 h-4 transition-transform ${isShopCollapseOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isShopCollapseOpen && (
              <div className="bg-[#67B045] text-white p-4 w-auto max-w-md mx-auto">
                <ul className="space-y-4 text-left lg:pr-11">
                  <li onClick={() => onSelectMenu('overview')}>
                    <a href="#" className="block text-[16px] text-gray-200 hover:text-blue-300">
                      Overview
                    </a>
                  </li>
                  <li onClick={() => onSelectMenu('inventory')}>
                    <a href="/inventory" className="block text-[16px] text-gray-200 hover:text-blue-300">
                      Product Inventory
                    </a>
                  </li>
                  <li onClick={() => onSelectMenu('orders')}>
                    <a href="/orders" className="block text-[16px] text-gray-200 hover:text-blue-300">
                      Orders
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Desktop View for My Shop */}
        <div className="hidden lg:block w-full sm:w-[85%] p-4">
          <div className="menu">
            <h2>MY SHOP</h2>
            <ul>
              <li onClick={() => onSelectMenu('overview')}>Overview</li>
              <li onClick={() => onSelectMenu('inventory')}>Product Inventory</li>
              <li onClick={() => onSelectMenu('orders')}>Orders</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
