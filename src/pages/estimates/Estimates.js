import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

const Estimates = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      const response = await api.get('/estimates');
      setEstimates(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch estimates');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
        <Link to="/estimates/new" className="btn btn-primary flex items-center gap-2">
          <FiPlus className="h-5 w-5" />
          New Estimate
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimate #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estimates.map((estimate) => (
              <tr key={estimate._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{estimate.estimateNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{estimate.customerId?.firstName} {estimate.customerId?.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${
                    estimate.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    estimate.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {estimate.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">${(estimate.total || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link to={`/estimates/${estimate._id}`} className="text-primary-600 hover:text-primary-900">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Estimates;