import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';

const TeamModal = ({ isOpen, onClose, team, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#10B981',
    members: []
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#10B981',
    '#F59E0B', '#EF4444', '#6366F1', '#F97316', '#06B6D4'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (team) {
        setFormData({
          name: team.name || '',
          description: team.description || '',
          color: team.color || '#10B981',
          members: team.members?.map(m => m._id || m.id) || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          color: '#10B981',
          members: []
        });
      }
    }
  }, [isOpen, team]);

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
      if (team) {
        await api.put(`/teams/${team._id}`, formData);
        toast.success('Team updated successfully');
      } else {
        await api.post('/teams', formData);
        toast.success('Team created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save team');
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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {team ? 'Edit Team' : 'Create New Team'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              required
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter team name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="input"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter team description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-10 w-10 rounded-lg border-2 ${
                    formData.color === color ? 'border-gray-900' : 'border-gray-300'
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members
            </label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {availableUsers.map(user => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.members.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;
