import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiPlus, FiSearch, FiTool, FiAlertCircle } from 'react-icons/fi';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });

  useEffect(() => {
    fetchEquipment();
  }, [filters]);

  const fetchEquipment = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;

      const response = await api.get('/equipment', { params });
      setEquipment(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Repair': 'bg-red-100 text-red-800',
      'Retired': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your equipment and vehicles</p>
        </div>
        <Link to="/equipment/new" className="btn btn-primary flex items-center gap-2">
          <FiPlus className="h-5 w-5" />
          Add Equipment
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search equipment..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Repair">Repair</option>
            <option value="Retired">Retired</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input sm:w-48"
          >
            <option value="">All Types</option>
            <option value="Vehicle">Vehicle</option>
            <option value="Machinery">Machinery</option>
            <option value="Tool">Tool</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <Link
            key={item._id}
            to={`/equipment/${item._id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.equipmentNumber}</p>
              </div>
              <span className={`badge ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {item.make && item.model && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Make/Model:</span>
                  <span className="font-medium">{item.make} {item.model}</span>
                </div>
              )}
              {item.type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{item.type}</span>
                </div>
              )}
              {item.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned To:</span>
                  <span className="font-medium">
                    {item.assignedTo.firstName} {item.assignedTo.lastName}
                  </span>
                </div>
              )}
              {item.nextMaintenance && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Maintenance:</span>
                  <span className="font-medium">
                    {new Date(item.nextMaintenance).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {item.totalMaintenanceCost > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Total Maintenance Cost: ${item.totalMaintenanceCost.toLocaleString()}
                </p>
              </div>
            )}
          </Link>
        ))}
      </div>

      {equipment.length === 0 && (
        <div className="card text-center py-12">
          <FiTool className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No equipment found</p>
        </div>
      )}
    </div>
  );
};

export default Equipment;