import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiPlus, FiSearch, FiAlertTriangle } from 'react-icons/fi';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '', lowStock: false });

  useEffect(() => {
    fetchInventory();
  }, [filters]);

  const fetchInventory = async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.lowStock) params.lowStock = 'true';

      const response = await api.get('/purchasing/inventory', { params });
      setInventory(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input sm:w-48"
          >
            <option value="">All Categories</option>
            <option value="Materials">Materials</option>
            <option value="Tools">Tools</option>
            <option value="Equipment">Equipment</option>
            <option value="Supplies">Supplies</option>
            <option value="Other">Other</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.lowStock}
              onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => {
          const isLowStock = item.quantity <= item.reorderPoint;
          return (
            <div
              key={item._id}
              className={`card ${isLowStock ? 'border-yellow-300 bg-yellow-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.sku && (
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  )}
                </div>
                {isLowStock && (
                  <FiAlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Cost:</span>
                  <span className="font-medium">${(item.unitCost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium">${(item.totalValue || 0).toLocaleString()}</span>
                </div>
                {item.reorderPoint > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reorder Point:</span>
                    <span className="font-medium">{item.reorderPoint} {item.unit}</span>
                  </div>
                )}
              </div>

              {item.location && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Location: {item.location}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {inventory.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No inventory items found</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;