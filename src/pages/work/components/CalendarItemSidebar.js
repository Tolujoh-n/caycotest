import React, { useState, useEffect } from 'react';
import { FiX, FiEdit2, FiTrash2, FiCalendar, FiClock, FiMapPin, FiUsers, FiTag } from 'react-icons/fi';
import api from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';

const CalendarItemSidebar = ({ item, itemType, onClose, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editingAssignees, setEditingAssignees] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
    startTime: item?.startDate ? new Date(item.startDate).toTimeString().slice(0, 5) : '',
    endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
    endTime: item?.endDate ? new Date(item.endDate).toTimeString().slice(0, 5) : '',
    allDay: item?.allDay || false,
    location: item?.location || '',
    color: item?.color || '#3B82F6',
    attendees: item?.attendees?.map(a => a._id || a) || item?.assignedTo?.map(a => a._id || a) || [],
    priority: item?.priority || 'Medium',
    status: item?.status || 'Not Started'
  });

  useEffect(() => {
    fetchUsers();
    if (item) {
      setFormData({
        title: item?.title || '',
        description: item?.description || '',
        startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        startTime: item?.startDate ? new Date(item.startDate).toTimeString().slice(0, 5) : '',
        endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
        endTime: item?.endDate ? new Date(item.endDate).toTimeString().slice(0, 5) : '',
        allDay: item?.allDay || false,
        location: item?.location || '',
        color: item?.color || '#3B82F6',
        attendees: item?.attendees?.map(a => a._id || a) || item?.assignedTo?.map(a => a._id || a) || [],
        priority: item?.priority || 'Medium',
        status: item?.status || 'Not Started'
      });
    }
  }, [item]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const canEdit = () => {
    if (!user) return false;
    const isCreator = item?.createdBy?._id === user?.id || item?.createdBy === user?.id;
    const isAdmin = user.role === 'Company Owner' || user.role === 'Operations Manager';
    return isCreator || isAdmin;
  };

  const canEditAssignees = () => {
    if (!user) return false;
    const isAdmin = user.role === 'Company Owner' || user.role === 'Operations Manager';
    return isAdmin;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const startDateTime = formData.allDay 
        ? new Date(formData.startDate)
        : new Date(`${formData.startDate}T${formData.startTime}`);
      
      const endDateTime = formData.allDay
        ? new Date(formData.endDate)
        : new Date(`${formData.endDate}T${formData.endTime}`);

      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: formData.allDay,
        location: formData.location,
        color: formData.color
      };

      if (itemType === 'Task') {
        payload.priority = formData.priority;
        payload.status = formData.status;
        payload.assignedTo = formData.attendees; // Tasks use assignedTo
        await api.put(`/tasks/${item._id}`, payload);
      } else if (itemType === 'Event') {
        payload.attendees = formData.attendees;
        await api.put(`/events/${item._id}`, payload);
      } else if (itemType === 'Appointment') {
        payload.status = formData.status;
        payload.attendees = formData.attendees;
        await api.put(`/appointments/${item._id}`, payload);
      }

      toast.success(`${itemType} updated successfully`);
      setEditing(false);
      setEditingAssignees(false);
      onUpdate();
    } catch (error) {
      toast.error(`Failed to update ${itemType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignees = async () => {
    setLoading(true);
    try {
      const payload = {};
      
      if (itemType === 'Task') {
        payload.assignedTo = formData.attendees;
        await api.put(`/tasks/${item._id}`, payload);
      } else if (itemType === 'Event') {
        payload.attendees = formData.attendees;
        await api.put(`/events/${item._id}`, payload);
      } else if (itemType === 'Appointment') {
        payload.attendees = formData.attendees;
        await api.put(`/appointments/${item._id}`, payload);
      }

      toast.success('Assignees updated successfully');
      setEditingAssignees(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update assignees');
    } finally {
      setLoading(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const handleDelete = async () => {
    setConfirmModal({ isOpen: true });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      if (itemType === 'Task') {
        await api.delete(`/tasks/${item._id}`);
      } else if (itemType === 'Event') {
        await api.delete(`/events/${item._id}`);
      } else if (itemType === 'Appointment') {
        await api.delete(`/appointments/${item._id}`);
      }

      toast.success(`${itemType} deleted successfully`);
      setConfirmModal({ isOpen: false });
      onDelete();
      onClose();
    } catch (error) {
      toast.error(`Failed to delete ${itemType}`);
    } finally {
      setLoading(false);
    }
  };

  const isCreator = item?.createdBy?._id === user?.id || item?.createdBy === user?.id;

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Yellow', value: '#FCD34D' },
    { name: 'Gray', value: '#6B7280' }
  ];

  if (!item) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{itemType} Details</h2>
        <div className="flex items-center gap-2">
          {canEdit() && !editing && !editingAssignees && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Edit"
              >
                <FiEdit2 className="h-5 w-5" />
              </button>
              {isCreator && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Delete"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {editing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="input w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="input w-full" />
              </div>
            </div>

            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time *</label>
                  <input type="time" required value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time *</label>
                  <input type="time" required value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="input w-full" />
                </div>
              </div>
            )}

            {itemType === 'Task' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input w-full">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input w-full">
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 ${formData.color === color.value ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300 dark:border-gray-500'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="btn btn-primary flex-1 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color || '#3B82F6' }} />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              </div>
              {item.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiCalendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(item.startDate).toLocaleDateString()} {!item.allDay && new Date(item.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endDate).toLocaleDateString()} {!item.allDay && new Date(item.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {item.location && (
                <div className="flex items-start gap-3">
                  <FiMapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <FiUsers className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{itemType === 'Task' ? 'Assigned To' : 'Attendees'}</p>
                    {canEditAssignees() && !editingAssignees && (
                      <button onClick={() => setEditingAssignees(true)} className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Edit</button>
                    )}
                  </div>
                  {editingAssignees ? (
                    <div className="space-y-2">
                      <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700/30">
                        {users.map((user) => (
                          <label key={user._id} className="flex items-center py-1 cursor-pointer">
                            <input type="checkbox" checked={formData.attendees.includes(user._id)} onChange={(e) => {
                              if (e.target.checked) setFormData({ ...formData, attendees: [...formData.attendees, user._id] });
                              else setFormData({ ...formData, attendees: formData.attendees.filter(id => id !== user._id) });
                            }} className="mr-2" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{user.firstName} {user.lastName}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingAssignees(false)} className="btn btn-secondary flex-1 text-sm py-1">Cancel</button>
                        <button onClick={handleSaveAssignees} disabled={loading} className="btn btn-primary flex-1 text-sm py-1 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(item.attendees || item.assignedTo) && (item.attendees || item.assignedTo).length > 0 ? (
                        (item.attendees || item.assignedTo).map((person, idx) => (
                          <span key={person._id || idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                            {person.firstName} {person.lastName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No {itemType === 'Task' ? 'assignees' : 'attendees'}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {itemType === 'Task' && (
                <>
                  <div className="flex items-start gap-3">
                    <FiTag className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                        item.priority === 'Urgent' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300' :
                        item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300' :
                        item.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiTag className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                      <span className="inline-block px-2 py-1 rounded text-xs mt-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {itemType === 'Appointment' && (
                <div className="flex items-start gap-3">
                  <FiTag className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                    <span className="inline-block px-2 py-1 rounded text-xs mt-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                      {item.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete this ${itemType.toLowerCase()}?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CalendarItemSidebar;
