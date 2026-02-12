import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const EstimateDetail = () => {
  const { id } = useParams();
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimate();
  }, [id]);

  const fetchEstimate = async () => {
    try {
      const response = await api.get(`/estimates/${id}`);
      setEstimate(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch estimate');
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

  if (!estimate) return <div>Estimate not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/estimates" className="text-primary-600 hover:text-primary-700">← Back to Estimates</Link>
      <h1 className="text-2xl font-bold">Estimate {estimate.estimateNumber}</h1>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Line Items</h2>
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {estimate.lineItems?.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">${item.unitPrice}</td>
                <td className="text-right py-2">${item.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-right py-2 font-semibold">Total</td>
              <td className="text-right py-2 font-semibold">${(estimate.total || 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default EstimateDetail;