import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiShield, FiUsers, FiUserPlus, FiUserMinus, FiLock } from 'react-icons/fi';

const RolesPermissions = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleMembers, setRoleMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const resources = [
    { id: 'jobs', label: 'Jobs' },
    { id: 'schedules', label: 'Schedules' },
    { id: 'customers', label: 'Customers' },
    { id: 'estimates', label: 'Estimates' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'reports', label: 'Reports' },
    { id: 'users', label: 'Users' },
    { id: 'purchasing', label: 'Purchasing' },
    { id: 'equipment', label: 'Equipment' }
  ];

  const actions = [
    { id: 'view', label: 'View' },
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' },
    { id: 'manage', label: 'Manage' }
  ];

  useEffect(() => {
    // Only fetch data if user is Company Owner
    if (user?.role === 'Company Owner') {
      fetchRoles();
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data);
      // Fetch members for each role
      const membersData = {};
      for (const role of response.data.data) {
        try {
          const membersResponse = await api.get(`/roles/${role._id}/members`);
          membersData[role._id] = membersResponse.data.data;
        } catch (error) {
          membersData[role._id] = [];
        }
      }
      setRoleMembers(membersData);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRoleMembers = async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}/members`);
      setRoleMembers(prev => ({
        ...prev,
        [roleId]: response.data.data
      }));
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch role members:', error);
      return [];
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
  };

  const togglePermission = (resource, action) => {
    setFormData(prev => {
      const resourceIndex = prev.permissions.findIndex(p => p.resource === resource);
      
      if (resourceIndex >= 0) {
        const newPermissions = [...prev.permissions];
        const actionIndex = newPermissions[resourceIndex].actions.indexOf(action);
        
        if (actionIndex >= 0) {
          newPermissions[resourceIndex].actions.splice(actionIndex, 1);
          if (newPermissions[resourceIndex].actions.length === 0) {
            newPermissions.splice(resourceIndex, 1);
          }
        } else {
          newPermissions[resourceIndex].actions.push(action);
        }
        
        return { ...prev, permissions: newPermissions };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, { resource, actions: [action] }]
        };
      }
    });
  };

  const hasPermission = (resource, action) => {
    const perm = formData.permissions.find(p => p.resource === resource);
    return perm && perm.actions.includes(action);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole._id}`, formData);
        toast.success('Role updated successfully!');
      } else {
        await api.post('/roles', formData);
        toast.success('Role created successfully!');
      }
      handleCloseModal();
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }
    try {
      await api.delete(`/roles/${roleId}`);
      toast.success('Role deleted successfully!');
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleOpenMemberModal = async (role) => {
    setSelectedRole(role);
    await fetchRoleMembers(role._id);
    setShowMemberModal(true);
  };

  const handleAssignUser = async (userId) => {
    try {
      await api.put(`/roles/${selectedRole._id}/assign`, { userId });
      toast.success('User assigned to role successfully!');
      await fetchRoleMembers(selectedRole._id);
      fetchUsers(); // Refresh users to update their roles
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign user');
    }
  };

  const handleUnassignUser = async (userId) => {
    try {
      await api.put(`/roles/${selectedRole._id}/unassign`, { userId });
      toast.success('User removed from role successfully!');
      await fetchRoleMembers(selectedRole._id);
      fetchUsers(); // Refresh users to update their roles
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    }
  };

  const isUserInRole = (userId) => {
    if (!selectedRole || !roleMembers[selectedRole._id]) return false;
    return roleMembers[selectedRole._id].some(member => member._id === userId);
  };

  // Check if user is Company Owner - after all hooks
  if (user?.role !== 'Company Owner') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FiLock className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-sm text-gray-600 text-center max-w-md">
          Only Company Owners can access roles and permissions management. Please contact your Company Owner for assistance.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Roles & Permissions</h2>
          <p className="text-sm text-gray-600">Manage roles and their permissions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="h-5 w-5" />
          New Role
        </button>
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const members = roleMembers[role._id] || [];
          const memberCount = members.length;
          
          return (
            <div key={role._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    {role.isSystemRole && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        System
                      </span>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  )}
                </div>
                {!role.isSystemRole && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(role)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit role"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(role._id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete role"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Members Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUsers className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Members ({memberCount})
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenMemberModal(role)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <FiUserPlus className="h-3 w-3" />
                    Manage
                  </button>
                </div>
                
                {memberCount > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {members.slice(0, 3).map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
                          {member.firstName?.[0] || member.email[0].toUpperCase()}
                        </div>
                        <span className="text-gray-700">
                          {member.firstName && member.lastName
                            ? `${member.firstName} ${member.lastName}`
                            : member.email}
                        </span>
                      </div>
                    ))}
                    {memberCount > 3 && (
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                        +{memberCount - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No members assigned</p>
                )}
              </div>

              {/* Permissions Section */}
              <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.length > 0 ? (
                    role.permissions.map((perm, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {perm.resource}: {perm.actions.join(', ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No permissions set</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={editingRole?.isSystemRole}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Permissions</label>
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{resource.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                          <label
                            key={action.id}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={hasPermission(resource.id, action.id)}
                              onChange={() => togglePermission(resource.id, action.id)}
                              disabled={editingRole?.isSystemRole}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">{action.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={editingRole?.isSystemRole}
                >
                  <FiSave className="h-4 w-4" />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMemberModal && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Members - {selectedRole.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Add or remove team members from this role
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMemberModal(false);
                    setSelectedRole(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Members */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Current Members ({roleMembers[selectedRole._id]?.length || 0})
                </h4>
                {roleMembers[selectedRole._id] && roleMembers[selectedRole._id].length > 0 ? (
                  <div className="space-y-2">
                    {roleMembers[selectedRole._id].map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
                            {member.firstName?.[0] || member.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.firstName && member.lastName
                                ? `${member.firstName} ${member.lastName}`
                                : member.email}
                            </p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassignUser(member._id)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                        >
                          <FiUserMinus className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic py-4">No members assigned to this role</p>
                )}
              </div>

              {/* Available Users */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Add Members</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users
                    .filter(user => !isUserInRole(user._id) && user.isActive)
                    .map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignUser(user._id)}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
                        >
                          <FiUserPlus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    ))}
                  {users.filter(user => !isUserInRole(user._id) && user.isActive).length === 0 && (
                    <p className="text-sm text-gray-400 italic py-4">All active users are already assigned to this role</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;