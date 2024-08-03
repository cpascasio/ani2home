import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from "../../context/UserContext";
import useFetch from "../../../hooks/useFetch";

const InventoryTable = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const { data: fetchProducts } = useFetch("/api/products/");
  const [products, setProducts] = useState([]);

  const itemsPerPage = 10;

  useEffect(() => {
    if (fetchProducts != null) {
      setProducts(fetchProducts);
    }
  }, [fetchProducts]);

  const filteredData = products.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
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
    const { unit, ...rest } = formData;
    try {
      const response = await axios.post("http://localhost:3000/api/products/create-product", rest, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      const newProduct = response.data.product;
      setProducts(prevProducts => [...prevProducts, newProduct]);
      setFormData(initialFormData);
      setShowModal(false);
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { unit, productId, ...rest } = formData;
    try {
      await axios.put(`http://localhost:3000/api/products/${selectedProduct.productId}`, rest, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      setProducts(products.map(product =>
        product.productId === selectedProduct.productId ? { ...product, ...rest } : product
      ));
      setFormData(initialFormData);
      setShowEditModal(false);
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData(product);
    setShowEditModal(true);
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`http://localhost:3000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      setProducts(products.filter(product => product.productId !== productId));
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  const vegetables = ['Broccoli', 'Aubergine', 'Carrot', 'Chili', 'Lemon'];
  const fruits = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Grapes'];

  return (
    <div className="p-4 md:p-5 bg-white rounded-lg shadow-lg mt-5 md:mt-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 w-full md:w-1/3 border border-gray-300 rounded-lg mb-3 md:mb-0"
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={() => setShowModal(true)}
        >
          + Add Item
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border-b bg-gray-100">Product Code</th>
              <th className="p-2 border-b bg-gray-100">Photo</th>
              <th className="p-2 border-b bg-gray-100">Product Name</th>
              <th className="p-2 border-b bg-gray-100">Category</th>
              <th className="p-2 border-b bg-gray-100">Type</th>
              <th className="p-2 border-b bg-gray-100">Stock</th>
              <th className="p-2 border-b bg-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border-b break-words">{item.productId}</td>
                <td className="p-2 border-b break-words">{item.photo}</td>
                <td className="p-2 border-b break-words">{item.productName}</td>
                <td className="p-2 border-b break-words">{item.category}</td>
                <td className="p-2 border-b break-words">{item.type}</td>
                <td className="p-2 border-b break-words">{item.stock} {item.isKilo ? "kg" : "pcs"}</td>
                <td className="p-2 border-b break-words">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-lg mr-2" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded-lg" onClick={() => handleDelete(item.productId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-5 flex-wrap">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-3 py-1 border rounded-lg mx-1 my-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 md:p-5 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
            <span className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={() => { setShowModal(false); setFormData(initialFormData); }}>&times;</span>
            <h2 className="text-xl mb-5">Add New Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="productName" className="block text-gray-700">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="productDescription" className="block text-gray-700">Description</label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="type" className="block text-gray-700">Type</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="unit" className="block text-gray-700">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                >
                  <option value="kilo">Kilo</option>
                  <option value="pcs">Pieces</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block text-gray-700">Price</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="stock" className="block text-gray-700">Stock</label>
                <input
                  type="text"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              {/* Add other fields as necessary */}
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Add Product</button>
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 md:p-5 rounded-lg shadow-lg w-11/12 md:w-1/3 relative">
            <span className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={() => { setShowEditModal(false); setFormData(initialFormData); }}>&times;</span>
            <h2 className="text-xl mb-5">Edit Item</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="productName" className="block text-gray-700">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="productDescription" className="block text-gray-700">Description</label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="type" className="block text-gray-700">Type</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="unit" className="block text-gray-700">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                >
                  <option value="kilo">Kilo</option>
                  <option value="pcs">Pieces</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block text-gray-700">Price</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="stock" className="block text-gray-700">Stock</label>
                <input
                  type="text"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              {/* Add other fields as necessary */}
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Update Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
