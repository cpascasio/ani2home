import React from 'react';
import './Menu.css';

const Menu = ({ onSelectMenu }) => {
  return (
    <div className="menu">
      <h2>INVENTORY</h2>
      <ul>
        <li onClick={() => onSelectMenu('dashboard')}>Dashboard</li>
        <li onClick={() => onSelectMenu('inventory')}>Inventory</li>
        <li onClick={() => onSelectMenu('summary')}>Summary</li>
        <li onClick={() => onSelectMenu('purchase')}>Purchase</li>
        <li onClick={() => onSelectMenu('suppliers')}>Suppliers</li>
        <li onClick={() => onSelectMenu('sales')}>Sales</li>
        <li onClick={() => onSelectMenu('invoice')}>Invoice</li>
        <li onClick={() => onSelectMenu('bill')}>Bill</li>
        <li onClick={() => onSelectMenu('customers')}>Customers</li>
      </ul>
    </div>
  );
};

export default Menu;
