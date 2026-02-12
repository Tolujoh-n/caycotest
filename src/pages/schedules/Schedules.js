import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { FiCalendar, FiList } from 'react-icons/fi';
import SchedulesCalendar from './SchedulesCalendar';

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // calendar or list

  useEffect(() => {
    if (view === 'list') {
      fetchSchedules();
    }
  }, [view]);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Scheduling</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
          >
            <FiCalendar className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
          >
            <FiList className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <SchedulesCalendar />
      ) : (
        <div className="card">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : schedules.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No schedules found</p>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {schedule.customerId?.firstName} {schedule.customerId?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {format(new Date(schedule.startTime), 'PPpp')} - {format(new Date(schedule.endTime), 'p')}
                      </p>
                    </div>
                    <span className={`badge ${
                      schedule.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;