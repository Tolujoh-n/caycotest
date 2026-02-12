import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers, FiTag } from 'react-icons/fi';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';

const CalendarItemModal = ({ isOpen, onClose, selectedDate, itemType: initialItemType, projectId, teamId, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemType, setItemType] = useState(initialItemType || 'Task');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: '',
    color: '#3B82F6',
    attendees: [],
    priority: 'Medium',
    status: 'Not Started'
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (selectedDate) {
        const date = new Date(selectedDate);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().slice(0, 5);
        setFormData(prev => ({
          ...prev,
          startDate: dateStr,
          startTime: timeStr,
          endDate: dateStr,
          endTime: new Date(date.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5)
        }));
      }
      // Reset form when item type changes
      const defaultColor = itemType === 'Task' ? '#3B82F6' : itemType === 'Event' ? '#10B981' : '#F59E0B';
      setFormData(prev => ({
        ...prev,
        color: defaultColor,
        status: itemType === 'Appointment' ? 'Scheduled' : 'Not Started'
      }));
    }
  }, [isOpen, selectedDate, itemType]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      if (projectId) payload.projectId = projectId;
      if (teamId) payload.teamId = teamId;

      if (itemType === 'Task') {
        payload.priority = formData.priority;
        payload.status = formData.status;
        payload.assignedTo = formData.attendees; // Tasks use assignedTo
        await api.post('/tasks', payload);
      } else if (itemType === 'Event') {
        payload.attendees = formData.attendees;
        await api.post('/events', payload);
      } else if (itemType === 'Appointment') {
        payload.status = formData.status;
        payload.attendees = formData.attendees;
        await api.post('/appointments', payload);
      }

      toast.success(`${itemType} created successfully`);
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      toast.error(`Failed to create ${itemType}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      allDay: false,
      location: '',
      color: '#3B82F6',
      attendees: [],
      priority: 'Medium',
      status: 'Not Started'
    });
    setItemType('Task');
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Create Calendar Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setItemType('Task');
                  setFormData(prev => ({ ...prev, color: '#3B82F6', status: 'Not Started' }));
                }}
                className={`px-4 py-2 rounded-md border-2 transition-colors ${
                  itemType === 'Task'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemType('Event');
                  setFormData(prev => ({ ...prev, color: '#10B981' }));
                }}
                className={`px-4 py-2 rounded-md border-2 transition-colors ${
                  itemType === 'Event'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Event
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemType('Appointment');
                  setFormData(prev => ({ ...prev, color: '#F59E0B', status: 'Scheduled' }));
                }}
                className={`px-4 py-2 rounded-md border-2 transition-colors ${
                  itemType === 'Appointment'
                    ? 'border-orange-600 bg-orange-50 text-orange-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Appointment
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={`Enter ${itemType.toLowerCase()} title`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiCalendar className="inline mr-1" /> Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiCalendar className="inline mr-1" /> End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">
              All day
            </label>
          </div>

          {!formData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiClock className="inline mr-1" /> Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiClock className="inline mr-1" /> End Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiMapPin className="inline mr-1" /> Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add location..."
            />
          </div>

          {itemType === 'Task' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          {itemType === 'Appointment' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiTag className="inline mr-1" /> Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiUsers className="inline mr-1" /> {itemType === 'Task' ? 'Assign To' : 'Attendees'}
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {users.map((user) => (
                <label key={user._id} className="flex items-center py-1">
                  <input
                    type="checkbox"
                    checked={formData.attendees.includes(user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          attendees: [...formData.attendees, user._id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          attendees: formData.attendees.filter(id => id !== user._id)
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : `Create ${itemType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarItemModal;
