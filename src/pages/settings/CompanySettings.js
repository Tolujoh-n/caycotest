import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const CompanySettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    website: '',
    taxId: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    settings: {
      currency: 'USD',
      timezone: 'America/New_York'
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logo, setLogo] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/companies/me');
      const company = response.data.data;
      setLogo(company.logo || '');
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        industry: company.industry || '',
        website: company.website || '',
        taxId: company.taxId || '',
        address: company.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        settings: company.settings || {
          currency: 'USD',
          timezone: 'America/New_York'
        }
      });
    } catch (error) {
      toast.error('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/companies/me/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setLogo(response.data.data.logo);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/companies/me', formData);
      toast.success('Company settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update company settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Company Information</h2>
        <p className="text-sm text-gray-600">Update your company details</p>
      </div>

      {/* Logo Upload */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="relative">
          {logo ? (
            <img src={logo} alt="Company Logo" className="h-20 w-20 object-contain rounded" />
          ) : (
            <div className="h-20 w-20 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              No Logo
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
          <label className="btn btn-sm btn-secondary cursor-pointer">
            {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 5MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input
            type="text"
            required
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <input
            type="text"
            className="input"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            className="input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            className="input"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
          <input
            type="text"
            className="input"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          className="input mb-2"
          placeholder="Street Address"
          value={formData.address.street}
          onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            className="input"
            placeholder="City"
            value={formData.address.city}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
          />
          <input
            type="text"
            className="input"
            placeholder="State"
            value={formData.address.state}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
          />
          <input
            type="text"
            className="input"
            placeholder="ZIP Code"
            value={formData.address.zipCode}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              className="input"
              value={formData.settings.currency}
              onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, currency: e.target.value } })}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              className="input"
              value={formData.settings.timezone}
              onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, timezone: e.target.value } })}
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default CompanySettings;