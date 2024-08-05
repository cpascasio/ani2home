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
    console.log("🚀 ~ InventoryTable ~ fetchProducts:", fetchProducts)
  }, [fetchProducts]);

  useEffect(() => {
    console.log("🚀 ~ InventoryTable ~ products:", products);
  }, [products]);

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

    // Remove unit in formData and add storeId
    const { unit, ...rest } = formData;
    rest.storeId = user?.userId;
    
    try {
        const response = await axios.post("http://localhost:3000/api/products/create-product", rest, {
            headers: {
                'Authorization': `Bearer ${user?.token}`,
                'Content-Type': 'application/json'
            }
        });

        const newProduct = response.data.product;

        // Update products state
        setProducts(prevProducts => [...prevProducts, newProduct]);

        // Reset form data and close modal
        setFormData(initialFormData);
        setShowModal(false);
    } catch (error) {
        console.error("There was an error!", error);
    }
};

  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    // Remove unit and productId from formData
    const { unit, productId, ...rest } = formData;
  
    console.log('rest', rest);
  
    try {
      await axios.put(`http://localhost:3000/api/products/${selectedProduct.productId}`, rest, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
  
      // Update products state
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
              <td className="p-2 border-b break-all">{item.id}</td>
              <td className="p-2 border-b break-all">{item.photo}</td>
              <td className="p-2 border-b break-all">{item.productName}</td>
              <td className="p-2 border-b break-all">{item.category}</td>
              <td className="p-2 border-b break-all">{item.type}</td>
              <td className="p-2 border-b break-all">{item.stock} {item.isKilo ? "kg" : "pcs"}</td>
              <td className="p-2 border-b break-all">
                <button className="px-3 py-1 bg-blue-500 text-white rounded-lg mr-2" onClick={() => handleEdit(item)}>Edit</button>
                <button className="px-3 py-1 bg-red-500 text-white rounded-lg" onClick={() => handleDelete(item.productId)}>Delete</button>
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
            <span className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={() => { setShowModal(false); setFormData(initialFormData); }}>&times;</span>
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
                    {formData.category === 'Vegetable' ? vegetables.map((veg, index) => (
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
      {showEditModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
            <span className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={() => { setShowEditModal(false); setFormData(initialFormData); }}>&times;</span>
            <h2 className="text-xl mb-5">Edit Item</h2>
            <form onSubmit={handleEditSubmit}>
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
                    {formData.category === 'Vegetable' ? vegetables.map((veg, index) => (
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
              <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
