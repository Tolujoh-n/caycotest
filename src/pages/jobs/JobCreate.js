import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiX } from 'react-icons/fi';

const JobCreate = () => {
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    description: '',
    status: 'Quote',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    assignedTo: [],
    location: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    costs: {
      labor: { estimated: 0, actual: 0 },
      materials: { estimated: 0, actual: 0 },
      equipment: { estimated: 0, actual: 0 },
      subcontractors: { estimated: 0, actual: 0 },
      overhead: { estimated: 0, actual: 0 }
    },
    revenue: 0
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/jobs', formData);
      toast.success('Job created successfully!');
      navigate('/jobs');
    } catch (error) {
      toast.error('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    return Object.values(formData.costs).reduce((sum, cost) => {
      return sum + (cost.estimated || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                  <select
                    required
                    className="input"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.firstName} {customer.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="input"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Quote">Quote</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="input"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
              <div className="space-y-4">
                {Object.entries(formData.costs).map(([key, cost]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key} (Estimated)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={cost.estimated}
                      onChange={(e) => setFormData({
                        ...formData,
                        costs: {
                          ...formData.costs,
                          [key]: { ...cost, estimated: parseFloat(e.target.value) || 0 }
                        }
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignments</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <label key={user._id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.assignedTo.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              assignedTo: [...formData.assignedTo, user._id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedTo: formData.assignedTo.filter(id => id !== user._id)
                            });
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">
                        {user.firstName} {user.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Cost</span>
                  <span className="font-medium">${calculateTotalCost().toLocaleString()}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Revenue</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold text-gray-900">Estimated Profit</span>
                  <span className={`font-semibold ${(formData.revenue - calculateTotalCost()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(formData.revenue - calculateTotalCost()).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <FiSave className="h-4 w-4" />
                {loading ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobCreate;