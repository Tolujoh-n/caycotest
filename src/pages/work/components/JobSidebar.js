import React, { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';

const JobSidebar = ({ job, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    title: job?.title || '',
    description: job?.description || '',
    status: job?.status || 'Quote',
    priority: job?.priority || 'Medium'
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/jobs/${job._id}`, form);
      toast.success('Job updated');
      onUpdated?.();
      onClose?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (!job) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Details</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Quote">Quote</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="btn btn-primary flex items-center gap-2" onClick={save} disabled={saving}>
            <FiSave className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSidebar;

