import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const OrdersTable = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const orders = [
    {
      orderNumber: '12345',
      dateCreated: '2024-08-01',
      customer: 'Ceejay',
      orderStatus: 'Shipped',
      total: '₱150.00',
      products: ['Apple', 'Banana', 'Orange']
    },
    {
      orderNumber: '67890',
      dateCreated: '2024-08-02',
      customer: 'Minette Armada',
      orderStatus: 'Pending',
      total: '₱200.00',
      products: ['Broccoli', 'Carrot', 'Chili']
    },
    {
      orderNumber: '54321',
      dateCreated: '2024-08-03',
      customer: 'Jolo Bueno',
      orderStatus: 'Delivered',
      total: '₱120.00',
      products: ['Grapes', 'Strawberry']
    },
    {
        orderNumber: '123456',
        dateCreated: '2024-08-01',
        customer: 'Ceejay',
        orderStatus: 'Shipped',
        total: '₱150.00',
        products: ['Apple', 'Banana', 'Orange']
      },
      {
        orderNumber: '678909',
        dateCreated: '2024-08-02',
        customer: 'Minette Armada',
        orderStatus: 'Pending',
        total: '₱200.00',
        products: ['Broccoli', 'Carrot', 'Chili']
      },
      {
        orderNumber: '543213',
        dateCreated: '2024-08-03',
        customer: 'Jolo Bueno',
        orderStatus: 'Delivered',
        total: '₱120.00',
        products: ['Grapes', 'Strawberry']
      },
      {
        orderNumber: '123458',
        dateCreated: '2024-08-01',
        customer: 'Ceejay',
        orderStatus: 'Shipped',
        total: '₱150.00',
        products: ['Apple', 'Banana', 'Orange']
      },
      {
        orderNumber: '678906',
        dateCreated: '2024-08-02',
        customer: 'Minette Armada',
        orderStatus: 'Pending',
        total: '₱200.00',
        products: ['Broccoli', 'Carrot', 'Chili']
      },
      {
        orderNumber: '543214',
        dateCreated: '2024-08-03',
        customer: 'Jolo Bueno',
        orderStatus: 'Delivered',
        total: '₱120.00',
        products: ['Grapes', 'Strawberry']
      },
  ];

  // Filter orders based on the search query
  const filteredOrders = orders.filter(order =>
    order.orderNumber.includes(searchQuery) ||
    order.dateCreated.includes(searchQuery) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.total.includes(searchQuery)
  );

  const handleToggle = (orderNumber) => {
    setSelectedOrder(prevOrderNumber =>
      prevOrderNumber === orderNumber ? null : orderNumber
    );
  };

  return (
    <div className="p-4 md:p-5 bg-white rounded-lg shadow-lg mt-5 md:mt-10">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-lg w-full border-[#209D48] focus:outline-none focus:ring focus:ring-[#67B045] focus:border-transparent"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border-b rounded-l-lg border-b text-white bg-green-900">Order Number</th>
              <th className="p-2 border-b text-white bg-green-900">Date Created</th>
              <th className="p-2 border-b text-white bg-green-900">Customer</th>
              <th className="p-2 border-b text-white bg-green-900">Order Status</th>
              <th className="p-2 border-b text-white bg-green-900">Total</th>
              <th className="p-2 border-b rounded-r-lg border-b text-white bg-green-900">Products</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <React.Fragment key={index}>
                <tr className="hover:bg-gray-50">
                  <td className="p-2 border-b break-words">{order.orderNumber}</td>
                  <td className="p-2 border-b break-words">{order.dateCreated}</td>
                  <td className="p-2 border-b break-words">{order.customer}</td>
                  <td className="p-2 border-b break-words">{order.orderStatus}</td>
                  <td className="p-2 border-b break-words">{order.total}</td>
                  <td className="p-2 border-b break-words">
                    <div className="relative flex justify-center items-center">
                      <button
                        className="flex items-center px-3 py-1 bg-green-700 text-white rounded-lg"
                        onClick={() => handleToggle(order.orderNumber)}
                      >
                        {order.products.length}
                        {selectedOrder === order.orderNumber ? (
                          <FaChevronUp className="ml-2" />
                        ) : (
                          <FaChevronDown className="ml-2" />
                        )}
                      </button>
                      {selectedOrder === order.orderNumber && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-40 z-10">
                          <ul>
                            {order.products.map((product, i) => (
                              <li key={i} className="p-2 border-b last:border-b-0">
                                {product}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                {selectedOrder === order.orderNumber && (
                  <tr>
                    <td colSpan="6" className="bg-gray-100">
                      <div className="p-4">
                        <ul>
                          {order.products.map((product, i) => (
                            <li key={i} className="p-2 border-b last:border-b-0">
                              {product}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
