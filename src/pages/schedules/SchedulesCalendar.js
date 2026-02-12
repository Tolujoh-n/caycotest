import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';

const SchedulesCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month'); // month, week, day

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchSchedules = async () => {
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      const response = await api.get('/schedules', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      setSchedules(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSchedulesForDay = (day) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return isSameDay(scheduleDate, day);
    });
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiChevronRight className="h-5 w-5" />
          </button>
          <button onClick={goToToday} className="btn btn-secondary text-sm">
            Today
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('month')}
            className={`btn ${view === 'month' ? 'btn-primary' : 'btn-secondary'} text-sm`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`btn ${view === 'week' ? 'btn-primary' : 'btn-secondary'} text-sm`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, idx) => {
            const daySchedules = getSchedulesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                className={`min-h-24 bg-white p-2 ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className={`text-sm mb-1 ${isToday ? 'font-bold text-primary-600' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule) => (
                    <div
                      key={schedule._id}
                      className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200"
                      title={schedule.title}
                    >
                      {format(new Date(schedule.startTime), 'h:mm a')} - {schedule.title}
                    </div>
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{daySchedules.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span className="text-gray-600">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 ring-2 ring-primary-500 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </div>
  );
};

export default SchedulesCalendar;