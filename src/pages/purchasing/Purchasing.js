import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiPackage, FiShoppingCart } from 'react-icons/fi';
import PurchaseOrders from './PurchaseOrders';
import Inventory from './Inventory';

const Purchasing = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchasing</h1>
          <p className="text-gray-600 mt-1">Manage purchase orders and inventory</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiShoppingCart className="inline h-5 w-5 mr-2" />
            Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiPackage className="inline h-5 w-5 mr-2" />
            Inventory
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' && <PurchaseOrders />}
        {activeTab === 'inventory' && <Inventory />}
      </div>
    </div>
  );
};

export default Purchasing;