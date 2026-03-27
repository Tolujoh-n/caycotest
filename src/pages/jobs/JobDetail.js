import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { FiEdit2 } from 'react-icons/fi';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editData, setEditData] = useState({
    customerId: '',
    title: '',
    description: '',
    status: 'Quote',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    assignedTo: [],
    assignedTeams: [],
    location: { street: '', city: '', state: '', zipCode: '', country: '' },
    costs: {
      labor: { estimated: 0, actual: 0 },
      materials: { estimated: 0, actual: 0 },
      equipment: { estimated: 0, actual: 0 },
      subcontractors: { estimated: 0, actual: 0 },
      overhead: { estimated: 0, actual: 0 }
    },
    revenue: 0
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      const j = response.data.data;
      setJob(j);
      setEditData({
        customerId: j.customerId?._id || '',
        title: j.title || '',
        description: j.description || '',
        status: j.status || 'Quote',
        priority: j.priority || 'Medium',
        startDate: j.startDate ? new Date(j.startDate).toISOString().slice(0, 10) : '',
        endDate: j.endDate ? new Date(j.endDate).toISOString().slice(0, 10) : '',
        assignedTo: (j.assignedTo || []).map(a => a._id || a),
        assignedTeams: (j.assignedTeams || []).map(t => t._id || t),
        location: {
          street: j.location?.street || '',
          city: j.location?.city || '',
          state: j.location?.state || '',
          zipCode: j.location?.zipCode || '',
          country: j.location?.country || ''
        },
        costs: {
          labor: { estimated: j.costs?.labor?.estimated || 0, actual: j.costs?.labor?.actual || 0 },
          materials: { estimated: j.costs?.materials?.estimated || 0, actual: j.costs?.materials?.actual || 0 },
          equipment: { estimated: j.costs?.equipment?.estimated || 0, actual: j.costs?.equipment?.actual || 0 },
          subcontractors: { estimated: j.costs?.subcontractors?.estimated || 0, actual: j.costs?.subcontractors?.actual || 0 },
          overhead: { estimated: j.costs?.overhead?.estimated || 0, actual: j.costs?.overhead?.actual || 0 }
        },
        revenue: j.revenue || 0
      });
    } catch (error) {
      toast.error('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEditLookups = async () => {
    try {
      const [cRes, uRes, tRes] = await Promise.all([
        api.get('/customers'),
        api.get('/users'),
        api.get('/teams')
      ]);
      setCustomers(cRes.data.data || []);
      setUsers(uRes.data.data || []);
      setTeams(tRes.data.data || []);
    } catch (e) {
      // non-blocking
    }
  };

  const openEdit = async () => {
    await fetchEditLookups();
    setEditOpen(true);
  };

  const saveJob = async () => {
    if (!editData.customerId || !editData.title.trim()) {
      toast.error('Customer and Title are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editData,
        startDate: editData.startDate ? new Date(editData.startDate) : undefined,
        endDate: editData.endDate ? new Date(editData.endDate) : undefined
      };
      await api.put(`/jobs/${id}`, payload);
      toast.success('Job updated');
      setEditOpen(false);
      await fetchJob();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
            ← Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{job.jobNumber}</p>
        </div>
        <button type="button" onClick={openEdit} className="btn btn-secondary flex items-center gap-2">
          <FiEdit2 className="h-4 w-4" />
          Edit Job
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{job.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">{job.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">{job.priority}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Labor</span>
                <span className="font-medium">
                  ${(job.costs?.labor?.actual || job.costs?.labor?.estimated || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Materials</span>
                <span className="font-medium">
                  ${(job.costs?.materials?.actual || job.costs?.materials?.estimated || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Equipment</span>
                <span className="font-medium">
                  ${(job.costs?.equipment?.actual || job.costs?.equipment?.estimated || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total Cost</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  ${(job.costs?.total?.actual || job.costs?.total?.estimated || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                <span className="font-medium text-green-600">
                  ${(job.revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Cost</span>
                <span className="font-medium text-red-600">
                  ${(job.costs?.total?.actual || job.costs?.total?.estimated || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Profit</span>
                <span className={`font-semibold ${(job.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(job.profit || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Profit Margin</span>
                <span className="font-medium">
                  {job.profitMargin ? `${job.profitMargin.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer</h2>
            <p className="text-gray-900 dark:text-gray-100">
              {job.customerId?.firstName} {job.customerId?.lastName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{job.customerId?.email}</p>
          </div>
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Job</h3>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setEditOpen(false)}>
                ✕
              </button>
            </div>

            <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
                  <select className="input" value={editData.customerId} onChange={(e) => setEditData({ ...editData, customerId: e.target.value })}>
                    <option value="">Select customer</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input className="input" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea className="input" rows={4} value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select className="input" value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                    <option value="Quote">Quote</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select className="input" value={editData.priority} onChange={(e) => setEditData({ ...editData, priority: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input type="date" className="input" value={editData.startDate} onChange={(e) => setEditData({ ...editData, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input type="date" className="input" value={editData.endDate} onChange={(e) => setEditData({ ...editData, endDate: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Assigned Users</p>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {users.map(u => (
                      <label key={u._id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={editData.assignedTo.includes(u._id)}
                          onChange={(e) => {
                            if (e.target.checked) setEditData({ ...editData, assignedTo: [...editData.assignedTo, u._id] });
                            else setEditData({ ...editData, assignedTo: editData.assignedTo.filter(x => x !== u._id) });
                          }}
                        />
                        {u.firstName} {u.lastName}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Assigned Teams</p>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {teams.map(t => (
                      <label key={t._id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={editData.assignedTeams.includes(t._id)}
                          onChange={(e) => {
                            if (e.target.checked) setEditData({ ...editData, assignedTeams: [...editData.assignedTeams, t._id] });
                            else setEditData({ ...editData, assignedTeams: editData.assignedTeams.filter(x => x !== t._id) });
                          }}
                        />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || '#10B981' }} />
                        {t.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Costs (Estimated)</p>
                  {Object.entries(editData.costs).map(([k, v]) => (
                    <div key={k} className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">{k}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input"
                        value={v.estimated}
                        onChange={(e) => setEditData({
                          ...editData,
                          costs: { ...editData.costs, [k]: { ...v, estimated: parseFloat(e.target.value) || 0 } }
                        })}
                      />
                    </div>
                  ))}
                </div>
                <div className="card p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Revenue</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    value={editData.revenue}
                    onChange={(e) => setEditData({ ...editData, revenue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button className="btn btn-secondary" type="button" onClick={() => setEditOpen(false)}>Cancel</button>
                <button className="btn btn-primary disabled:opacity-50" type="button" onClick={saveJob} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;