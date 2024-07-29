import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from "../../context/UserContext";

const InventoryTable = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const initialFormData = {
    productName: '',
    productDescription: '',
    category: '',
    type: '',
    isKilo: false,
    unit: 'kilo',
    price: '',
    stock: '',
    pictures: []
  };
  const [formData, setFormData] = useState(initialFormData);

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
      [name]: value,
      isKilo: name === 'unit' ? value === 'kilo' : prevState.isKilo
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Remove unit in formData
    const { unit, ...rest } = formData;

    console.log("FORMDATA");
    console.log(rest);

    try {
      await axios.post("http://localhost:3000/api/products/create-product", rest, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Reset form data and close modal
      setFormData(initialFormData);
      setShowModal(false);
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  const vegetables = ['Broccoli', 'Aubergine', 'Carrot', 'Chili', 'Lemon'];
  const fruits = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Grapes'];

  return (
    <div className="p-5 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-5">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 w-1/3 border border-gray-300 rounded-lg"
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={() => setShowModal(true)}
        >
          + Add Item
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border-b bg-gray-100">Item Code</th>
            <th className="p-2 border-b bg-gray-100">Photo</th>
            <th className="p-2 border-b bg-gray-100">Item Name</th>
            <th className="p-2 border-b bg-gray-100">Item Group</th>
            <th className="p-2 border-b bg-gray-100">Last Purchase</th>
            <th className="p-2 border-b bg-gray-100">On Hand</th>
            <th className="p-2 border-b bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-2 border-b">{item.code}</td>
              <td className="p-2 border-b">{item.photo}</td>
              <td className="p-2 border-b">{item.name}</td>
              <td className="p-2 border-b">{item.group}</td>
              <td className="p-2 border-b">{item.lastPurchase}</td>
              <td className="p-2 border-b">{item.onHand}</td>
              <td className="p-2 border-b">
                <button className="px-3 py-1 bg-blue-500 text-white rounded-lg mr-2">Edit</button>
                <button className="px-3 py-1 bg-red-500 text-white rounded-lg">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-5">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-3 py-1 border rounded-lg mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
            <span className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={() => {setShowModal(false); setFormData(initialFormData);}}>&times;</span>
            <h2 className="text-xl mb-5">Add New Item</h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-3">
                Name:
                <input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
              </label>
              <label className="block mb-3">
                Description:
                <input type="text" name="productDescription" value={formData.productDescription} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
              </label>
              <label className="block mb-3">
                Category:
                <select name="category" value={formData.category} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="">Select Category</option>
                  <option value="Vegetable">Vegetable</option>
                  <option value="Fruit">Fruit</option>
                </select>
              </label>
              {formData.category && (
                <label className="block mb-3">
                  Item:
                  <select name="type" value={formData.type} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg">
                    <option value="">Select Item</option>
                    {formData.category === 'vegetable' ? vegetables.map((veg, index) => (
                      <option key={index} value={veg}>{veg}</option>
                    )) : fruits.map((fruit, index) => (
                      <option key={index} value={fruit}>{fruit}</option>
                    ))}
                  </select>
                  {formData.type === '' && (
                    <input type="text" name="type" placeholder="Other" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg mt-2" />
                  )}
                </label>
              )}
              <label className="block mb-3">
                Unit:
                <select name="unit" value={formData.unit} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="kilo">Kilo</option>
                  <option value="pieces">Pieces</option>
                </select>
              </label>
              <label className="block mb-3">
                Price per {formData.unit}:
                <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
              </label>
              <label className="block mb-3">
                Stock:
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
              </label>
              <label className="block mb-3">
                Photo:
                <input type="file" name="photo" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
              </label>
              {formData.photo && (
                <img src={URL.createObjectURL(formData.photo)} alt="Item" className="mt-3 max-w-full" />
              )}
              <button type="submit" onClick={handleSubmit} className="w-full py-2 bg-blue-500 text-white rounded-lg">Add Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
