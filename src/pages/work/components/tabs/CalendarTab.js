import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FiPlus, FiEdit2, FiX } from 'react-icons/fi';
import api from '../../../../config/api';
import { toast } from 'react-hot-toast';
import CalendarItemModal from '../CalendarItemModal';
import CalendarItemSidebar from '../CalendarItemSidebar';

const locales = {
  'en-US': enUS,
};

// Create localizer outside component to avoid recreation
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarTab = ({ projectId, teamId, type = 'project' }) => {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [showItemSidebar, setShowItemSidebar] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [createItemType, setCreateItemType] = useState('Task');
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [showColorSettings, setShowColorSettings] = useState(false);

  // Load color preferences from localStorage
  const [colorPrefs, setColorPrefs] = useState(() => {
    const saved = localStorage.getItem('calendarColors');
    return saved ? JSON.parse(saved) : {
      task: '#3B82F6',
      event: '#10B981',
      appointment: '#F59E0B'
    };
  });

  useEffect(() => {
    fetchAllItems();
  }, [projectId, teamId, colorPrefs]);

  useEffect(() => {
    // Save color preferences to localStorage
    localStorage.setItem('calendarColors', JSON.stringify(colorPrefs));
  }, [colorPrefs]);

  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;

      // Fetch tasks
      const tasksRes = await api.get('/tasks', { params });
      const tasksData = tasksRes.data.data || [];
      setTasks(tasksData);

      // Fetch events
      const eventsRes = await api.get('/events', { params });
      const eventsData = eventsRes.data.data || [];
      setEvents(eventsData);

      // Fetch appointments
      const appointmentsRes = await api.get('/appointments', { params });
      const appointmentsData = appointmentsRes.data.data || [];
      setAppointments(appointmentsData);

      // Combine all items into calendar events
      const allEvents = [
        ...tasksData
          .filter(task => task.dueDate || task.startDate)
          .map(task => ({
            id: task._id,
            title: task.title,
            start: new Date(task.startDate || task.dueDate),
            end: new Date(task.endDate || task.dueDate || new Date(new Date(task.startDate || task.dueDate).getTime() + 60 * 60 * 1000)),
            resource: task,
            type: 'Task',
            color: task.color || colorPrefs.task
          })),
        ...eventsData.map(event => ({
          id: event._id,
          title: event.title,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          resource: event,
          type: 'Event',
          color: event.color || colorPrefs.event,
          allDay: event.allDay
        })),
        ...appointmentsData.map(appointment => ({
          id: appointment._id,
          title: appointment.title,
          start: new Date(appointment.startDate),
          end: new Date(appointment.endDate),
          resource: appointment,
          type: 'Appointment',
          color: appointment.color || colorPrefs.appointment,
          allDay: false
        }))
      ];

      setCalendarEvents(allEvents);
    } catch (error) {
      toast.error('Failed to fetch calendar items');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedDate(start);
    setCreateItemType('Task');
    setShowCreateModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedItem(event.resource);
    setSelectedItemType(event.type);
    setShowItemSidebar(true);
  };

  const eventStyleGetter = (event) => {
    const color = event.color || '#3B82F6';
    const isPast = new Date(event.end) < new Date();
    
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: '#fff',
        borderRadius: '4px',
        padding: '2px 4px',
        fontSize: '12px',
        opacity: isPast ? 0.6 : 1,
        cursor: 'pointer'
      }
    };
  };

  const handleCreateSuccess = () => {
    fetchAllItems();
  };

  const handleItemUpdate = () => {
    fetchAllItems();
    setShowItemSidebar(false);
  };

  const handleItemDelete = () => {
    fetchAllItems();
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

  if (loading) return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading calendar...</div>;

  return (
    <div className="relative">
      <style>{`
        .rbc-calendar {
          height: 600px;
          font-family: inherit;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 600;
        }
        .rbc-event {
          border-radius: 4px;
          padding: 2px 4px;
          cursor: pointer;
        }
        .rbc-today {
          background-color: #f0f9ff;
        }
        .rbc-toolbar {
          margin-bottom: 1rem;
        }
        .rbc-toolbar button {
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
        }
        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .rbc-time-slot {
          border-top: 1px solid #e5e7eb;
        }
        .rbc-time-header-content {
          border-left: 1px solid #e5e7eb;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }
        /* Dark mode: calendar grid and current day */
        .dark .rbc-calendar {
          background-color: #1f2937;
          color: #e5e7eb;
        }
        .dark .rbc-today {
          background-color: #1e3a5f !important;
        }
        .dark .rbc-header {
          background-color: #374151 !important;
          color: #f3f4f6;
          border-color: #4b5563;
        }
        .dark .rbc-month-row,
        .dark .rbc-day-bg {
          background-color: #1f2937;
        }
        .dark .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #374151;
        }
        .dark .rbc-month-view {
          border-color: #374151;
        }
        .dark .rbc-date-cell {
          color: #e5e7eb;
        }
        .dark .rbc-date-cell.rbc-now {
          color: #93c5fd;
        }
        .dark .rbc-off-range-bg {
          background-color: #111827;
        }
        .dark .rbc-off-range .rbc-date-cell {
          color: #6b7280;
        }
        .dark .rbc-toolbar button {
          color: #e5e7eb;
          border-color: #4b5563;
          background-color: #374151;
        }
        .dark .rbc-toolbar button:hover {
          background-color: #4b5563;
          color: #f9fafb;
        }
        .dark .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .dark .rbc-time-view {
          border-color: #374151;
        }
        .dark .rbc-time-header-content {
          border-left-color: #4b5563;
        }
        .dark .rbc-time-slot {
          border-top-color: #374151;
        }
        .dark .rbc-day-slot .rbc-time-slot {
          border-top-color: #374151;
        }
        .dark .rbc-timeslot-group {
          border-color: #374151;
        }
        .dark .rbc-time-content {
          border-top: 1px solid #374151;
        }
        .dark .rbc-allday-cell {
          background-color: #374151;
          border-color: #4b5563;
        }
        .dark .rbc-agenda-view {
          background-color: #1f2937;
          border-color: #374151;
        }
        .dark .rbc-agenda-view table.rbc-agenda-table {
          border-color: #374151;
        }
        .dark .rbc-agenda-view .rbc-agenda-date-cell,
        .dark .rbc-agenda-view .rbc-agenda-time-cell {
          color: #9ca3af;
        }
        .dark .rbc-agenda-view .rbc-agenda-event-cell {
          color: #e5e7eb;
        }
      `}</style>
      
      <div className="card">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn btn-sm btn-secondary"
            >
              Today
            </button>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (view === 'month') {
                  newDate.setMonth(newDate.getMonth() - 1);
                } else if (view === 'week') {
                  newDate.setDate(newDate.getDate() - 7);
                } else {
                  newDate.setDate(newDate.getDate() - 1);
                }
                setCurrentDate(newDate);
              }}
              className="btn btn-sm btn-secondary"
            >
              ←
            </button>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (view === 'month') {
                  newDate.setMonth(newDate.getMonth() + 1);
                } else if (view === 'week') {
                  newDate.setDate(newDate.getDate() + 7);
                } else {
                  newDate.setDate(newDate.getDate() + 1);
                }
                setCurrentDate(newDate);
              }}
              className="btn btn-sm btn-secondary"
            >
              →
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm rounded ${view === 'month' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-sm rounded ${view === 'week' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-sm rounded ${view === 'day' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                Day
              </button>
              <button
                onClick={() => setView('agenda')}
                className={`px-3 py-1 text-sm rounded ${view === 'agenda' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                Agenda
              </button>
            </div>
            
            <div className="relative">
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setCreateItemType('Task');
                  setShowCreateModal(true);
                }}
                className="btn btn-sm btn-primary flex items-center gap-2"
              >
                <FiPlus className="h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPrefs.task }} />
            <span>Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPrefs.event }} />
            <span>Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colorPrefs.appointment }} />
            <span>Appointments</span>
          </div>
          <button
            onClick={() => setShowColorSettings(!showColorSettings)}
            className="ml-auto flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <FiEdit2 className="h-4 w-4" />
            <span>Customize Colors</span>
          </button>
        </div>

        {showColorSettings && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Default Colors</h3>
              <button
                onClick={() => setShowColorSettings(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Tasks</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setColorPrefs({ ...colorPrefs, task: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        colorPrefs.task === color.value ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300 dark:border-gray-500'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Events</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setColorPrefs({ ...colorPrefs, event: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        colorPrefs.event === color.value ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300 dark:border-gray-500'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Appointments</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setColorPrefs({ ...colorPrefs, appointment: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        colorPrefs.appointment === color.value ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300 dark:border-gray-500'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          popup
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) => 
              `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
            dayFormat: 'dd MMM',
            dayHeaderFormat: 'EEEE, MMMM dd',
            dayRangeHeaderFormat: ({ start, end }) => 
              `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`,
            monthHeaderFormat: 'MMMM yyyy'
          }}
        />
      </div>

      {showCreateModal && (
        <CalendarItemModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
          selectedDate={selectedDate}
          itemType={createItemType}
          projectId={projectId}
          teamId={teamId}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showItemSidebar && selectedItem && (
        <CalendarItemSidebar
          item={selectedItem}
          itemType={selectedItemType}
          onClose={() => {
            setShowItemSidebar(false);
            setSelectedItem(null);
            setSelectedItemType(null);
          }}
          onUpdate={handleItemUpdate}
          onDelete={handleItemDelete}
        />
      )}
    </div>
  );
};

export default CalendarTab;
