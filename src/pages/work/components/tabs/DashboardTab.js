import React, { useState, useEffect, useMemo } from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiList } from 'react-icons/fi';
import api from '../../../../config/api';
import { toast } from 'react-hot-toast';

const DashboardTab = ({ projectId, teamId, type = 'project' }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId, teamId]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;
      
      const response = await api.get('/tasks', { params });
      setTasks(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    const notStarted = tasks.filter(t => t.status === 'Not Started').length;

    return { total, completed, inProgress, overdue, notStarted };
  }, [tasks]);

  const priorityDistribution = useMemo(() => {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    return distribution;
  }, [tasks]);

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <FiList className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
            </div>
            <FiCheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.inProgress}</p>
            </div>
            <FiClock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Overdue</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdue}</p>
            </div>
            <FiAlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Task Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completed</span>
                <span className="font-medium">{stats.completed} ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>In Progress</span>
                <span className="font-medium">{stats.inProgress} ({stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Not Started</span>
                <span className="font-medium">{stats.notStarted} ({stats.total > 0 ? Math.round((stats.notStarted / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.notStarted / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(priorityDistribution).map(([priority, count]) => {
              const colors = {
                Urgent: 'bg-red-500',
                High: 'bg-orange-500',
                Medium: 'bg-yellow-500',
                Low: 'bg-gray-400'
              };
              return (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{priority}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[priority] || colors.Medium} h-2 rounded-full`}
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
        <div className="space-y-2">
          {tasks.slice(0, 5).map(task => (
            <div key={task._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-500">
                  {task.status} • {task.priority} priority
                </div>
              </div>
              {task.dueDate && (
                <span className="text-sm text-gray-500">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
