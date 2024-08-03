import React from 'react';

const Overview = () => {
  const productsAvailable = 50; 
  const productsSold = 150; 

  const totalOrders = 20; 
  const pendingOrders = 5; 
  const shippedOrders = 10; 
  const deliveredOrders = 5; 

  return (
    <div className="p-4 md:p-5 bg-white rounded-lg shadow-lg mt-5 md:mt-10 h-[635px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col justify-between w-full bg-green-900 p-4 rounded-lg">
          <h2 className="text-lg text-white font-semibold mb-2">Products</h2>
          <div className="flex-1">
            <div className="bg-[#d9d9d9] p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
              <h4 className="text-sm font-medium">Number of Products Available</h4>
              <p className="text-xl font-bold">{productsAvailable}</p>
            </div>
          </div>
          <div className="flex-1 mt-3">
            <div className="bg-[#d9d9d9] p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
              <h4 className="text-sm font-medium">Number of Products Sold</h4>
              <p className="text-xl font-bold">{productsSold}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between w-full bg-green-900 p-4 rounded-lg">
          <h2 className="text-lg text-white font-semibold mb-2">Orders</h2>
          <div className="flex-1">
            <div className="bg-[#d9d9d9] p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
              <h4 className="text-sm font-medium">Total Number of Orders</h4>
              <p className="text-xl font-bold">{totalOrders}</p>
            </div>
          </div>
          <div className="flex-1 mt-3">
            <div className="bg-[#d9d9d9] p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
              <h4 className="text-sm font-medium">Number of Pending Orders</h4>
              <p className="text-xl font-bold">{pendingOrders}</p>
            </div>
          </div>
          <div className="flex-1 mt-3">
            <div className="bg-[#d9d9d9] p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
              <h4 className="text-sm font-medium">Number of Shipped Orders</h4>
              <p className="text-xl font-bold">{shippedOrders}</p>
            </div>
          </div>
          <div className="flex-1 mt-3">
            <div className="bg-[#d9d9d9] p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
              <h4 className="text-sm font-medium">Number of Delivered Orders</h4>
              <p className="text-xl font-bold">{deliveredOrders}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
