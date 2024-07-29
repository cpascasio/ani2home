import React, { useState } from 'react';
import './InventoryTable.css';

const InventoryTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const inventoryData = [
    { code: 'V01456', photo: '🥦', name: 'Broccoli', group: 'Vegetable', lastPurchase: '03 May 2021', onHand: '10 Kg' },
    { code: 'V01457', photo: '🍆', name: 'Aubergine', group: 'Vegetable', lastPurchase: '04 May 2021', onHand: '8 Kg' },
    { code: 'V01458', photo: '🥕', name: 'Carrot', group: 'Vegetable', lastPurchase: '04 May 2021', onHand: '12 Kg' },
    { code: 'V01459', photo: '🌶️', name: 'Chili', group: 'Vegetable', lastPurchase: '05 May 2021', onHand: '4.5 Kg' },
    { code: 'V01460', photo: '🍋', name: 'Lemon', group: 'Vegetable', lastPurchase: '03 May 2021', onHand: '1 Kg' },
    { code: 'M01461', photo: '🍗', name: 'Chicken', group: 'Meat', lastPurchase: '02 May 2021', onHand: '56 P' },
    { code: 'M01462', photo: '🥩', name: 'Beef Liver', group: 'Meat', lastPurchase: '03 May 2021', onHand: '4 Kg' },
    { code: 'M01463', photo: '🥩', name: 'Beef', group: 'Meat', lastPurchase: '02 May 2021', onHand: '43 Kg' },
    { code: 'F01464', photo: '🐟', name: 'Salmon Fish', group: 'Fish', lastPurchase: '06 May 2021', onHand: '23 Kg' },
    { code: 'F01465', photo: '🍤', name: 'Shrimp', group: 'Fish', lastPurchase: '02 May 2021', onHand: '13 Kg' },
    // Add more items as needed
  ];

  const filteredData = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="inventory-table">
      <div className="header">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-button">+ Add Item</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item Code</th>
            <th>Photo</th>
            <th>Item Name</th>
            <th>Item Group</th>
            <th>Last Purchase</th>
            <th>On Hand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((item, index) => (
            <tr key={index}>
              <td>{item.code}</td>
              <td>{item.photo}</td>
              <td>{item.name}</td>
              <td>{item.group}</td>
              <td>{item.lastPurchase}</td>
              <td>{item.onHand}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? 'active' : ''}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InventoryTable;
