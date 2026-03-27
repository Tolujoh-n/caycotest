import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiMail } from 'react-icons/fi';

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editData, setEditData] = useState({
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

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data.data);
      const c = response.data.data;
      setEditData({
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || '',
        type: c.type || 'Residential',
        status: c.status || 'Lead',
        address: {
          street: c.address?.street || '',
          city: c.address?.city || '',
          state: c.address?.state || '',
          zipCode: c.address?.zipCode || '',
          country: c.address?.country || ''
        },
        notes: c.notes || '',
        tags: Array.isArray(c.tags) ? c.tags : []
      });
      const historyRes = await api.get(`/customers/${id}/history`);
      setHistory(historyRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Please provide subject and message');
      return;
    }
    setSendingEmail(true);
    try {
      await api.post(`/customers/${id}/email`, {
        subject: emailData.subject.trim(),
        message: emailData.message.trim()
      });
      toast.success('Email sent to customer');
      setEmailModalOpen(false);
      setEmailData({ subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!editData.firstName.trim() || !editData.lastName.trim() || !editData.email.trim()) {
      toast.error('First name, last name and email are required');
      return;
    }
    setSavingEdit(true);
    try {
      await api.put(`/customers/${id}`, {
        ...editData,
        email: editData.email.trim().toLowerCase(),
        tags: Array.isArray(editData.tags) ? editData.tags : []
      });
      toast.success('Customer updated');
      setEditModalOpen(false);
      await fetchCustomer();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/customers" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
            ← Back to Customers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {customer.firstName} {customer.lastName}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEmailModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2"
            disabled={!customer.email}
            title={!customer.email ? 'Customer has no email' : 'Send email'}
          >
            <FiMail className="h-4 w-4" />
            Email Customer
          </button>
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2"
            title="Edit customer"
          >
            <FiEdit2 className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{customer.email}</p>
              </div>
              {customer.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">{customer.phone}</p>
                </div>
              )}
              {customer.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {customer.address.street}<br />
                    {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer History</h2>
            {!history ? (
              <p className="text-gray-600 dark:text-gray-400">Loading history…</p>
            ) : history.timeline.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No activity yet for this customer.</p>
            ) : (
              <div className="space-y-3">
                {history.timeline.slice(0, 20).map((item) => (
                  <div key={`${item.type}-${item.id}`} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.type}: {item.data.title || item.data.invoiceNumber || item.data.estimateNumber || item.data.jobNumber}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        {item.data.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Jobs</span>
                <span className="font-medium">{customer.totalJobs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                <span className="font-medium">${(customer.totalRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className={`badge ${
                  customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                  customer.status === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {customer.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email {customer.firstName}</h3>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setEmailModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input className="input" value={emailData.subject} onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea className="input" rows={6} value={emailData.message} onChange={(e) => setEmailData({ ...emailData, message: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn btn-secondary" type="button" onClick={() => setEmailModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary disabled:opacity-50" type="button" onClick={handleSendEmail} disabled={sendingEmail}>
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Customer</h3>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setEditModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input className="input" value={editData.firstName} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input className="input" value={editData.lastName} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input type="email" className="input" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input className="input" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                  <input className="input" value={editData.company} onChange={(e) => setEditData({ ...editData, company: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select className="input" value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })}>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select className="input" value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                  <input
                    className="input"
                    placeholder="comma separated"
                    value={editData.tags.join(', ')}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
                  <input className="input" value={editData.address.street} onChange={(e) => setEditData({ ...editData, address: { ...editData.address, street: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input className="input" value={editData.address.city} onChange={(e) => setEditData({ ...editData, address: { ...editData.address, city: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input className="input" value={editData.address.state} onChange={(e) => setEditData({ ...editData, address: { ...editData.address, state: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
                  <input className="input" value={editData.address.zipCode} onChange={(e) => setEditData({ ...editData, address: { ...editData.address, zipCode: e.target.value } })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <input className="input" value={editData.address.country} onChange={(e) => setEditData({ ...editData, address: { ...editData.address, country: e.target.value } })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea className="input" rows={4} value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-1">
                <button className="btn btn-secondary" type="button" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary disabled:opacity-50" type="button" onClick={handleSaveCustomer} disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;