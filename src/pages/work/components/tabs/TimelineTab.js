import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle } from 'react-icons/fi';
import api from '../../../../config/api';
import { toast } from 'react-hot-toast';

const TimelineTab = ({ projectId, teamId, type = 'project' }) => {
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
      const tasksData = response.data.data || [];
      // Sort by due date
      tasksData.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      setTasks(tasksData);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const groupTasksByDate = () => {
    const grouped = {};
    tasks.forEach(task => {
      if (!task.dueDate) {
        if (!grouped['No Date']) grouped['No Date'] = [];
        grouped['No Date'].push(task);
        return;
      }
      const dateKey = new Date(task.dueDate).toLocaleDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(task);
    });
    return grouped;
  };

  if (loading) return <div className="text-center py-8">Loading timeline...</div>;

  const groupedTasks = groupTasksByDate();

  return (
    <div className="card">
      <div className="relative max-h-[600px] overflow-y-auto">
        {Object.entries(groupedTasks).map(([date, dateTasks], idx) => (
          <div key={date} className="relative pb-8">
            {idx < Object.keys(groupedTasks).length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
            )}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <FiClock className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{date}</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {dateTasks.slice(0, 5).map(task => (
                    <div
                      key={task._id}
                      className={`p-4 border rounded-lg ${
                        task.status === 'Completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {task.status === 'Completed' && (
                              <FiCheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            <h4 className="font-medium">{task.title}</h4>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                              task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-gray-500">{task.status}</span>
                            {task.assignedTo && task.assignedTo.length > 0 && (
                              <div className="flex -space-x-2">
                                {task.assignedTo.slice(0, 3).map((assignee, idx) => (
                                  <div
                                    key={assignee._id || idx}
                                    className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700 border-2 border-white"
                                    title={`${assignee.firstName} ${assignee.lastName}`}
                                  >
                                    {assignee.firstName?.[0]}{assignee.lastName?.[0]}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dateTasks.length > 5 && (
                    <div className="text-center py-2 text-sm text-gray-500">
                      +{dateTasks.length - 5} more task{dateTasks.length - 5 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineTab;
