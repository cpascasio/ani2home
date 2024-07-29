import React, { useState } from 'react';
import './InventoryTable.css';

const InventoryTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    item: '',
    unit: 'kilo',
    price: '',
    stock: '',
    photo: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    setShowModal(false);
  };

  const vegetables = ['Broccoli', 'Aubergine', 'Carrot', 'Chili', 'Lemon'];
  const fruits = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Grapes'];

  return (
    <div className="inventory-table">
      <div className="header">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-button" onClick={() => setShowModal(true)}>+ Add Item</button>
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
      
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Add New Item</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </label>
              <label>
                Description:
                <input type="text" name="description" value={formData.description} onChange={handleChange} required />
              </label>
              <label>
                Category:
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option value="vegetable">Vegetable</option>
                  <option value="fruit">Fruit</option>
                </select>
              </label>
              {formData.category && (
                <label>
                  Item:
                  <select name="item" value={formData.item} onChange={handleChange} required>
                    <option value="">Select Item</option>
                    {formData.category === 'vegetable' ? vegetables.map((veg, index) => (
                      <option key={index} value={veg}>{veg}</option>
                    )) : fruits.map((fruit, index) => (
                      <option key={index} value={fruit}>{fruit}</option>
                    ))}
                  </select>
                  {formData.item === '' && (
                    <input type="text" name="item" placeholder="Other" onChange={handleChange} required />
                  )}
                </label>
              )}
              <label>
                Unit:
                <select name="unit" value={formData.unit} onChange={handleChange} required>
                  <option value="kilo">Kilo</option>
                  <option value="pieces">Pieces</option>
                </select>
              </label>
              <label>
                Price per {formData.unit}:
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
              </label>
              <label>
                Stock:
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
              </label>
              <label>
                Photo:
                <input type="file" name="photo" onChange={handleChange} />
              </label>
              {formData.photo && (
                <img src={URL.createObjectURL(formData.photo)} alt="Item" />
              )}
              <button type="submit">Add Item</button>
            </form>
          </div>
        </div>
      
    </div>
  );
};

export default InventoryTable;
