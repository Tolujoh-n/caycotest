import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiX, FiImage } from 'react-icons/fi';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import TaskDetailSidebar from '../TaskDetailSidebar';
import ConfirmModal from '../../../../components/ConfirmModal';

const TaskCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const priorityColors = {
    Urgent: 'border-l-red-500',
    High: 'border-l-orange-500',
    Medium: 'border-l-yellow-500',
    Low: 'border-l-gray-300'
  };

  // Get latest attachment image if any
  const latestImage = task.attachments?.filter(a => a.mimeType?.startsWith('image/'))?.[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`bg-white dark:bg-gray-800 border-l-4 ${priorityColors[task.priority] || priorityColors.Medium} border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
    >
      {latestImage && (
        <div className="mb-2 rounded overflow-hidden">
          <img
            src={`/api/files/${latestImage._id}/download`}
            alt={latestImage.originalName}
            className="w-full h-24 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex -space-x-2">
          {task.assignedTo?.slice(0, 3).map((assignee, idx) => (
            <div
              key={assignee._id || idx}
              className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xs font-medium text-primary-700 dark:text-primary-400 border-2 border-white dark:border-gray-800"
              title={`${assignee.firstName} ${assignee.lastName}`}
            >
              {assignee.firstName?.[0]}{assignee.lastName?.[0]}
            </div>
          ))}
          {task.assignedTo?.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
              +{task.assignedTo.length - 3}
            </div>
          )}
        </div>
        {task.dueDate && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

const DroppableColumn = ({ column, tasks, onTaskClick, onAddTask, onRename, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id || column.id
  });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-72" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full flex flex-col ${isOver ? 'ring-2 ring-primary-500' : ''}`}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {column.name || column.title} ({tasks.length})
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddTask(column._id || column.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
              title="Add task"
            >
              <FiPlus className="h-4 w-4" />
            </button>
            <div className="relative group">
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                <FiMoreVertical className="h-4 w-4" />
              </button>
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => {
                    const newName = window.prompt('Enter new section name:', column.name || column.title);
                    if (newName && newName.trim()) {
                      onRename(column._id || column.id, newName.trim());
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-white"
                >
                  <FiEdit2 className="h-4 w-4" />
                  Rename
                </button>
                <button
                  onClick={() => onDelete(column._id || column.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 flex items-center gap-2"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden min-h-[200px] max-h-[calc(100vh-280px)] pr-2 custom-scrollbar">
            {tasks.map(task => (
              <TaskCard key={task._id} task={task} onClick={onTaskClick} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                No tasks
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

const BoardTab = ({ projectId, teamId, type = 'project' }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewColumnModal, setShowNewColumnModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newTaskSectionId, setNewTaskSectionId] = useState('');
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchSections();
    fetchTasks();
  }, [projectId, teamId]);

  const fetchSections = async () => {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;
      
      const response = await api.get('/board-sections', { params });
      const sectionsData = response.data.data || [];
      
      // Remove duplicates by _id
      const uniqueSections = sectionsData.filter((section, index, self) =>
        index === self.findIndex(s => (s._id || s.id) === (section._id || section.id))
      );
      
      setSections(uniqueSections);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      toast.error('Failed to load board sections');
    }
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;
      
      const response = await api.get('/tasks', { params });
      const tasksData = response.data.data || [];
      // Board tab only shows tasks that have a sectionId (board tasks)
      // Filter out calendar-specific tasks (those with startDate/endDate)
      // And only include tasks that have a sectionId
      const boardTasks = tasksData.filter(task => 
        !task.startDate && 
        !task.endDate && 
        task.sectionId
      );
      setTasks(boardTasks);
      
      // Fetch attachments for each task
      const tasksWithAttachments = await Promise.all(
        boardTasks.map(async (task) => {
          try {
            const filesRes = await api.get('/files', { params: { taskId: task._id } });
            return { ...task, attachments: filesRes.data.data || [] };
          } catch {
            return { ...task, attachments: [] };
          }
        })
      );
      
      setTasks(tasksWithAttachments);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    // Find the task being dragged
    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    // Find target section
    const targetSection = sections.find(sec => (sec._id || sec.id) === over.id);
    if (!targetSection) return;

    const targetSectionId = targetSection._id || targetSection.id;
    const currentSectionId = activeTask.sectionId?._id || activeTask.sectionId;

    // If dragging within same section, just reorder (optional - can implement later)
    if (currentSectionId === targetSectionId) {
      return;
    }

    // Update task sectionId when moving between sections
    try {
      await api.put(`/tasks/${activeTask._id}`, { sectionId: targetSectionId });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to move task');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleAddTask = (sectionId) => {
    setNewTaskSectionId(sectionId);
    setNewTaskData({ title: '', description: '', priority: 'Medium', dueDate: '' });
    setShowTaskModal(true);
  };

  const handleCreateTask = async () => {
    if (!newTaskData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (!newTaskSectionId) {
      toast.error('Please select a section');
      return;
    }

    try {
      const payload = {
        title: newTaskData.title,
        description: newTaskData.description || '',
        priority: newTaskData.priority,
        dueDate: newTaskData.dueDate || undefined,
        sectionId: newTaskSectionId,
        status: 'Not Started'
      };
      
      if (projectId) payload.projectId = projectId;
      if (teamId) payload.teamId = teamId;
      
      await api.post('/tasks', payload);
      toast.success('Task created');
      setShowTaskModal(false);
      setNewTaskData({ title: '', description: '', priority: 'Medium', dueDate: '' });
      setNewTaskSectionId('');
      fetchTasks();
    } catch (error) {
      console.error('Task creation error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      toast.error('Please enter a section name');
      return;
    }

    try {
      const payload = {
        name: newColumnName.trim(),
        projectId,
        teamId
      };
      await api.post('/board-sections', payload);
      toast.success('Section created');
      setNewColumnName('');
      setShowNewColumnModal(false);
      fetchSections();
    } catch (error) {
      toast.error('Failed to create section');
    }
  };

  const handleRenameColumn = async (sectionId, newName) => {
    try {
      await api.put(`/board-sections/${sectionId}`, { name: newName });
      toast.success('Section renamed');
      fetchSections();
    } catch (error) {
      toast.error('Failed to rename section');
    }
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, sectionId: null });

  const handleDeleteColumn = async (sectionId) => {
    setConfirmModal({ isOpen: true, sectionId });
  };

  const confirmDeleteColumn = async () => {
    try {
      await api.delete(`/board-sections/${confirmModal.sectionId}`);
      toast.success('Section deleted');
      setConfirmModal({ isOpen: false, sectionId: null });
      fetchSections();
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  // Group tasks by section
  const columnsWithTasks = useMemo(() => {
    return sections.map(section => ({
      ...section,
      tasks: tasks.filter(task => {
        const taskSectionId = task.sectionId?._id || task.sectionId;
        return taskSectionId === (section._id || section.id);
      })
    }));
  }, [sections, tasks]);

  if (loading) return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading board...</div>;

  return (
    <div className="relative w-full h-full flex flex-col" style={{ overflow: 'hidden', maxWidth: '100%' }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .board-header {
          width: 100%;
          max-width: 100%;
          flex-shrink: 0;
          margin-bottom: 1rem;
        }
        .board-wrapper {
          width: 100%;
          max-width: 100%;
          flex: 1;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 1rem;
          position: relative;
          min-width: 0;
          box-sizing: border-box;
        }
        .board-wrapper::-webkit-scrollbar {
          height: 8px;
        }
        .board-wrapper::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .board-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .board-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .board-wrapper::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .board-wrapper::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .board-wrapper::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .board-columns {
          display: inline-flex;
          flex-direction: row;
          max-width: 500px;
          gap: 1rem;
          padding-right: 1rem;
          height: 100%;
          align-items: flex-start;
        }
      `}</style>

      <div className="board-header flex items-center justify-between">
        <h2 className="text-lg font-semibold flex-shrink-0 text-gray-900 dark:text-white">Board</h2>
        <button
          onClick={() => setShowNewColumnModal(true)}
          className="btn btn-sm btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <FiPlus className="h-4 w-4" />
          New Section
        </button>
      </div>

      {showNewColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Section</h3>
              <button
                onClick={() => {
                  setShowNewColumnModal(false);
                  setNewColumnName('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Section name..."
              className="input w-full mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowNewColumnModal(false);
                  setNewColumnName('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddColumn}
                className="btn btn-primary flex-1"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Task</h3>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setNewTaskData({ title: '', description: '', priority: 'Medium', dueDate: '' });
                  setNewTaskSectionId('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                placeholder="Task title *"
                className="input w-full"
                required
              />
              <textarea
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="input w-full"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newTaskData.priority}
                  onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                  className="input"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <input
                  type="date"
                  value={newTaskData.dueDate}
                  onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setNewTaskData({ title: '', description: '', priority: 'Medium', dueDate: '' });
                  setNewTaskSectionId('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="btn btn-primary flex-1"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-wrapper">
          <div className="board-columns">
            {columnsWithTasks.map(column => (
              <DroppableColumn
                key={column._id || column.id}
                column={column}
                tasks={column.tasks}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
                onRename={handleRenameColumn}
                onDelete={handleDeleteColumn}
              />
            ))}
          </div>
          
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg w-64 text-gray-900 dark:text-white">
              {tasks.find(t => t._id === activeId)?.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showTaskDetail && selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          onClose={() => setShowTaskDetail(false)}
          onUpdate={fetchTasks}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, sectionId: null })}
        onConfirm={confirmDeleteColumn}
        title="Confirm Delete"
        message="Are you sure you want to delete this section? Tasks will be moved to the first section."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default BoardTab;
