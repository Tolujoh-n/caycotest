import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/customers', { params });
      setCustomers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value === '') {
      fetchCustomers();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
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
        <h1 className="text-2xl font-bold text-gray-900">CRM - Customers</h1>
        <Link to="/customers/new" className="btn btn-primary flex items-center gap-2">
          <FiPlus className="h-5 w-5" />
          New Customer
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSearchSubmit} className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search customers..."
            className="input pl-10"
            value={search}
            onChange={handleSearch}
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <Link
            key={customer._id}
            to={`/customers/${customer._id}`}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h3>
                {customer.company && (
                  <p className="text-sm text-gray-600">{customer.company}</p>
                )}
              </div>
              <span className={`badge ${
                customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                customer.status === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {customer.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{customer.email}</p>
              {customer.phone && <p>{customer.phone}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
              <span className="text-gray-600">Jobs: <span className="font-medium">{customer.totalJobs || 0}</span></span>
              <span className="text-gray-600">Revenue: <span className="font-medium">${(customer.totalRevenue || 0).toLocaleString()}</span></span>
            </div>
          </Link>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No customers found</p>
        </div>
      )}
    </div>
  );
};

export default Customers;