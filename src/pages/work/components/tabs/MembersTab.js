import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiMail, FiPhone } from 'react-icons/fi';
import api from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';

const MembersTab = ({ teamId }) => {
  const { user, hasPermission } = useAuth();
  const [team, setTeam] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const canManage = hasPermission('work.manage');

  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchAvailableUsers();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      setTeam(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch team');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/users');
      setAvailableUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const currentMembers = team.members.map(m => m._id || m.id);
      const updatedMembers = [...currentMembers, userId];
      
      await api.put(`/teams/${teamId}`, { members: updatedMembers });
      toast.success('Member added');
      setShowAddMember(false);
      fetchTeam();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const updatedMembers = team.members
        .filter(m => (m._id || m.id) !== userId)
        .map(m => m._id || m.id);
      
      await api.put(`/teams/${teamId}`, { members: updatedMembers });
      toast.success('Member removed');
      fetchTeam();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return <div className="text-center py-8">Loading members...</div>;
  if (!team) return <div className="text-center py-8">Team not found</div>;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-gray-600 mt-1">{team.members.length} members</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {showAddMember && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Add Team Member</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableUsers
              .filter(u => !team.members.some(m => (m._id || m.id) === (u._id || u.id)))
              .map(u => (
                <div key={u._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-medium">{u.firstName} {u.lastName}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <FiMail className="h-3 w-3" />
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <FiPhone className="h-3 w-3" />
                          {u.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(u._id)}
                    className="btn btn-sm btn-primary"
                  >
                    Add
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.members.map(member => (
          <div
            key={member._id || member.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-lg">
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{member.firstName} {member.lastName}</div>
                  <div className="text-sm text-gray-500 truncate">{member.email}</div>
                  {member.role && (
                    <div className="text-xs text-gray-600 mt-1">{member.role}</div>
                  )}
                </div>
              </div>
              {canManage && (member._id || member.id) !== user?.id && (
                <button
                  onClick={() => handleRemoveMember(member._id || member.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersTab;
