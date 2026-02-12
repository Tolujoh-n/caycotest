import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

const EstimateCreate = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    description: '',
    lineItems: [
      { description: '', quantity: 1, unit: 'ea', unitPrice: 0, markup: 25, category: 'Labor' }
    ],
    taxRate: 8,
    discount: 0,
    validUntil: ''
  });
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  const calculateTotals = () => {
    setCalculating(true);
    const subtotal = formData.lineItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
      const withMarkup = itemTotal * (1 + (item.markup || 0) / 100);
      return sum + withMarkup;
    }, 0);

    const afterDiscount = subtotal - (formData.discount || 0);
    const taxAmount = afterDiscount * ((formData.taxRate || 0) / 100);
    const total = afterDiscount + taxAmount;

    setCalculating(false);
    return { subtotal, taxAmount, total };
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...formData.lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate item total
    if (field === 'quantity' || field === 'unitPrice' || field === 'markup') {
      const item = updatedItems[index];
      const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
      updatedItems[index].total = itemTotal * (1 + (item.markup || 0) / 100);
    }
    
    setFormData({ ...formData, lineItems: updatedItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { description: '', quantity: 1, unit: 'ea', unitPrice: 0, markup: 25, category: 'Labor' }
      ]
    });
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length > 1) {
      setFormData({
        ...formData,
        lineItems: formData.lineItems.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      await api.post('/estimates', {
        ...formData,
        subtotal,
        taxAmount,
        total,
        validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined
      });
      toast.success('Estimate created successfully!');
      navigate('/estimates');
    } catch (error) {
      toast.error('Failed to create estimate');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Estimate</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Basic Info */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimate Details</h2>
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
                        {customer.firstName} {customer.lastName} {customer.company ? `- ${customer.company}` : ''}
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
                    placeholder="e.g., Kitchen Renovation Estimate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="btn btn-secondary flex items-center gap-2 text-sm"
                >
                  <FiPlus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Markup %</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="input text-sm"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input text-sm w-20"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="input text-sm w-20"
                            value={item.unit}
                            onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input text-sm w-24"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            className="input text-sm w-20"
                            value={item.markup}
                            onChange={(e) => handleLineItemChange(index, 'markup', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          ${((item.quantity || 1) * (item.unitPrice || 0) * (1 + (item.markup || 0) / 100)).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          {formData.lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Discount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input text-sm"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="input text-sm"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/estimates')}
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
                {loading ? 'Saving...' : 'Save Estimate'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EstimateCreate;