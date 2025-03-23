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
    storeId: user?.userId,
    pictures: []
  };

  const [formData, setFormData] = useState(initialFormData);

  const { data: fetchProducts } = useFetch(`/api/products/user/${user?.userId}`);
  const [products, setProducts] = useState([]);
  const [pictures, setPictures] = useState([]);

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

  const handleFileChange = (e) => {
    const files = e.target.files;
    const fileReaders = [];
    let isCancel = false;

    const readFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isCancel) {
            reject(new Error("File reading cancelled"));
          } else {
            resolve(reader.result);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    const handleFiles = async () => {
      try {
        const base64Files = await Promise.all(Array.from(files).map(file => readFile(file)));
        setPictures(base64Files);
        console.log("FINISHED READING FILES");
      } catch (error) {
        console.error("Error reading files", error);
      }
    };

    handleFiles();

    return () => {
      isCancel = true;
      fileReaders.forEach(reader => reader.abort());
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const { unit, ...rest } = formData;

    if(pictures.length > 0) {
      rest.pictures = pictures;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/products/create-product", rest, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      const newProduct = response.data.product;
      setProducts(prevProducts => [...prevProducts, newProduct]);
      setPictures([]);
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
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    console.log("Deleting product with ID:", productId);
  
    try {
      await axios.delete(`http://localhost:3000/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
  
      setProducts(products.filter(product => product.productId !== productId));
  
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("There was an error!", error);
  
      // Optional: Show an error message to the user
      alert("Failed to delete the product. Please try again.");
    }
  };

  const vegetable = ['Broccoli', 'Aubergine', 'Carrot', 'Chili', 'Lemon'];
  const fruit = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Grapes'];

  return (
    <div className="p-4 md:p-5 bg-white rounded-lg shadow-lg mt-5 md:mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 w-full">
          <div className="flex-grow mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 w-full rounded-lg border border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
            />
          </div>
          <button
            className="px-4 py-2 bg-[#67b045] text-white rounded-lg hover:bg-green-700"
            onClick={() => setShowModal(true)}
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 rounded-l-lg border-b text-white bg-green-900">Product Code</th>
              <th className="p-2 border-b text-white bg-green-900">Photo</th>
              <th className="p-2 border-b text-white bg-green-900">Product Name</th>
              <th className="p-2 border-b text-white bg-green-900">Category</th>
              <th className="p-2 border-b text-white bg-green-900">Type</th>
              <th className="p-2 border-b text-white bg-green-900">Stock</th>
              <th className="p-2 rounded-r-lg border-b text-white bg-green-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border-b break-words">{item.id}</td>
                <td className="p-2 border-b break-words">
                  <img src={item?.pictures[0] && item.pictures[0]} alt={item.productName} className="w-10 h-10 object-cover" />
                </td>
                <td className="p-2 border-b break-words">{item.productName}</td>
                <td className="p-2 border-b break-words">{item.category}</td>
                <td className="p-2 border-b break-words">{item.type}</td>
                <td className="p-2 border-b break-words">{item.stock} {item.isKilo ? "kg" : "pcs"}</td>
                <td className="p-2 border-b break-words flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <button
                    className="px-2 py-1 text-xs md:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 text-xs md:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
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
            className={`px-3 py-1 border rounded-lg mx-1 my-1 ${currentPage === index + 1 ? 'bg-green-900 text-white' : 'bg-white text-black'}`}
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
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                >
                  <option value="">Select Category</option>
                  <option value="Vegetable">Vegetable</option>
                  <option value="Fruit">Fruit</option>
                </select>
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
                  <option value="piece">Piece</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block text-gray-700">Price</label>
                <input
                  type="number"
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
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="pictures" className="block text-gray-700">Pictures</label>
                <input
                  type="file"
                  id="pictures"
                  name="pictures"
                  multiple
                  onChange={handleFileChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Add Product</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedProduct && (
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
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                >
                  <option value="">Select Category</option>
                  <option value="Vegetable">Vegetable</option>
                  <option value="Fruit">Fruit</option>
                </select>
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
                  <option value="piece">Piece</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block text-gray-700">Price</label>
                <input
                  type="number"
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
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="pictures" className="block text-gray-700">Pictures</label>
                <input
                  type="file"
                  id="pictures"
                  name="pictures"
                  multiple
                  onChange={handleFileChange}
                  className="p-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Update Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
