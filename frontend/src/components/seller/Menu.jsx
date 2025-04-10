import React, { useState } from "react";
import "./Menu.css";
import PropTypes from "prop-types";

const Menu = ({ onSelectMenu }) => {
  const [isShopCollapseOpen, setIsShopCollapseOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("overview");

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    onSelectMenu(menu); // Call the prop function to handle menu selection
  };

  return (
    <div className="menu-container w-full bg-gray-200">
      <div className="flex flex-col w-full max-w-screen-xl mx-auto p-4 bg-gray-200">
        {/* Sidebar Section */}
        <div className="sidebar w-full lg:w-1/5 p-4 flex flex-col space-y-4">
          {/* Mobile Collapse for My Shop */}
          <div className="block lg:hidden w-full">
            <button
              onClick={() => setIsShopCollapseOpen(!isShopCollapseOpen)}
              className="flex items-center cursor-pointer bg-[#0B472D] text-white p-2 rounded-md w-full text-left"
            >
              <span className="flex-1">MY SHOP</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isShopCollapseOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isShopCollapseOpen && (
              <div className="bg-[#67B045] text-white p-4 w-auto max-w-md mx-auto">
                <ul className="space-y-4 text-left lg:pr-11">
                  <li
                      role="button"
                      tabIndex={0}
                      onClick={() => handleMenuClick("overview")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleMenuClick("overview");
                        }
                      }}
                      className={`block text-[16px] ${
                        selectedMenu === "overview"
                          ? "text-green-900 font-bold"
                          : "text-gray-200"
                      } hover:text-green-700`}
                    >
                      Overview
                    </li>
                  <li
                    role="button"
                    tabIndex={0}
                    onClick={() => handleMenuClick("inventory")}
                    className={`block text-[16px] ${
                      selectedMenu === "inventory"
                        ? "text-green-900 font-bold"
                        : "text-gray-200"
                    } hover:text-green-700`}
                  >
                    Product Inventory
                  </li>
                  <li
                    role="button"
                    tabIndex={0}
                    onClick={() => handleMenuClick("orders")}
                    className={`block text-[16px] ${
                      selectedMenu === "orders"
                        ? "text-green-900 font-bold"
                        : "text-gray-200"
                    } hover:text-green-700`}
                  >
                    Orders
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Desktop View for My Shop */}
        <div className="hidden lg:block w-full lg:w-4/5 p-4">
          <div className="menu">
            <h2>MY SHOP</h2>
            <ul>
              <li
                onClick={() => handleMenuClick("overview")}
                className={`${
                  selectedMenu === "overview"
                    ? "text-[#a3d75d] font-bold"
                    : "text-[#d9d9d9]"
                } hover:text-white cursor-pointer`}
              >
                Overview
              </li>
              <li
                onClick={() => handleMenuClick("inventory")}
                className={`${
                  selectedMenu === "inventory"
                    ? "text-[#a3d75d] font-bold"
                    : "text-[#d9d9d9]"
                } hover:text-white cursor-pointer`}
              >
                Product Inventory
              </li>
              <li
                onClick={() => handleMenuClick("orders")}
                className={`${
                  selectedMenu === "orders"
                    ? "text-[#a3d75d] font-bold"
                    : "text-[#d9d9d9]"
                } hover:text-white cursor-pointer`}
              >
                Orders
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

Menu.propTypes = {
  onSelectMenu: PropTypes.func.isRequired, 
};

export default Menu;
