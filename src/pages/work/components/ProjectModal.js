import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';

const ProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#4F46E5',
    status: 'Active',
    startDate: '',
    dueDate: '',
    members: []
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#F97316'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (project) {
        setFormData({
          name: project.name || '',
          description: project.description || '',
          color: project.color || '#4F46E5',
          status: project.status || 'Active',
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
          members: project.members?.map(m => m._id || m.id) || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          color: '#4F46E5',
          status: 'Active',
          startDate: '',
          dueDate: '',
          members: []
        });
      }
    }
  }, [isOpen, project]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setAvailableUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (project) {
        await api.put(`/projects/${project._id}`, formData);
        toast.success('Project updated successfully');
      } else {
        await api.post('/projects', formData);
        toast.success('Project created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId) => {
    setFormData({
      ...formData,
      members: formData.members.includes(userId)
        ? formData.members.filter(id => id !== userId)
        : [...formData.members, userId]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="input"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-10 w-10 rounded-lg border-2 ${
                    formData.color === color ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              className="mt-2 h-10 w-full rounded-lg cursor-pointer"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option>Active</option>
                <option>On Hold</option>
                <option>Completed</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Members
            </label>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-700/30">
              {availableUsers.map(user => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.members.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                  />
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
