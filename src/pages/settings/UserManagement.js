import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiMail, FiEdit2, FiTrash2, FiUserX, FiUserCheck, FiLock } from 'react-icons/fi';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'Staff' });
  const [sendingInvite, setSendingInvite] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    // Only fetch data if user is Company Owner
    if (user?.role === 'Company Owner') {
      fetchUsers();
      fetchRoles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (sendingInvite) return; // Prevent double submission
    
    setSendingInvite(true);
    try {
      await api.post('/auth/invite', inviteData);
      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'Staff' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);
    try {
      await api.delete(`/auth/user/${userId}`);
      toast.success('User removed from organization successfully');
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  // Check if user is Company Owner - after all hooks
  if (user?.role !== 'Company Owner') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FiLock className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access Restricted</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
          Only Company Owners can access team management. Please contact your Company Owner for assistance.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your team and invite new members</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="h-5 w-5" />
          Invite User
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${user.isActive ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(user._id, user.isActive)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? <FiUserX className="h-5 w-5" /> : <FiUserCheck className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => setUserToDelete(user)}
                      disabled={deletingUserId === user._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Remove from organization"
                    >
                      {deletingUserId === user._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <FiTrash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Remove team member</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to remove <strong>{userToDelete.firstName} {userToDelete.lastName}</strong> ({userToDelete.email}) from the organization? They will lose access to this organization.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={deletingUserId === userToDelete._id}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(userToDelete._id)}
                disabled={deletingUserId === userToDelete._id}
                className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 flex items-center gap-2"
              >
                {deletingUserId === userToDelete._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Removing...
                  </>
                ) : (
                  'Remove from organization'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                <select
                  required
                  className="input"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                >
                  {/* System Roles */}
                  <optgroup label="System Roles">
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Estimator">Estimator</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Staff">Staff</option>
                    <option value="Client">Client</option>
                  </optgroup>
                  {/* Custom Roles */}
                  {roles.filter(role => !role.isSystemRole && role.isActive).length > 0 && (
                    <optgroup label="Custom Roles">
                      {roles
                        .filter(role => !role.isSystemRole && role.isActive)
                        .map(role => (
                          <option key={role._id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={sendingInvite}
                >
                  {sendingInvite ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;