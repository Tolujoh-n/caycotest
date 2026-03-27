import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const CustomerCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    type: 'Residential',
    status: 'Lead',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    notes: '',
    tags: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        tags: Array.isArray(formData.tags) ? formData.tags : []
      };
      const res = await api.post('/customers', payload);
      toast.success('Customer created successfully!');
      navigate(`/customers/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/customers" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-2 inline-block">
            ← Back to Customers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Customer</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Add a customer to your CRM</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <input className="input" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <input className="input" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input type="email" className="input" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company (optional)</label>
              <input className="input" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
              <input className="input" value={formData.address.street} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input className="input" value={formData.address.city} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <input className="input" value={formData.address.state} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
                <input className="input" value={formData.address.zipCode} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
              <input className="input" value={formData.address.country} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })} />
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
            <textarea className="input" rows={4} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Profile</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select className="input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
              <input
                className="input"
                placeholder="comma separated e.g. VIP, referral"
                value={formData.tags.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/customers')} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerCreate;

