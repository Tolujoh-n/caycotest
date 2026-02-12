import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiChevronRight, FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiX, FiChevronLeft } from 'react-icons/fi';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import api from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import TaskDetailSidebar from '../TaskDetailSidebar';
import ConfirmModal from '../../../../components/ConfirmModal';

const columnHelper = createColumnHelper();

const ListTab = ({ projectId, teamId, type = 'project' }) => {
  const { hasPermission } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });
  const canManage = hasPermission('work.manage');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;
      
      const response = await api.get('/tasks', { params });
      // List tab only shows tasks that DON'T have a sectionId (list tasks, not board tasks)
      // Filter out calendar-specific tasks (those with startDate/endDate)
      // And exclude tasks that have a sectionId (those belong to board)
      const listTasks = (response.data.data || []).filter(task => 
        !task.startDate && 
        !task.endDate && 
        !task.sectionId
      );
      setTasks(listTasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, teamId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskUpdate = () => {
    fetchTasks();
    setShowTaskDetail(false);
  };

  const handleCreateTask = async () => {
    if (!newTaskData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const payload = {
        title: newTaskData.title,
        description: newTaskData.description || '',
        priority: newTaskData.priority,
        dueDate: newTaskData.dueDate || undefined,
        status: 'Not Started',
        projectId,
        teamId
      };
      
      await api.post('/tasks', payload);
      toast.success('Task created');
      setShowCreateModal(false);
      setNewTaskData({ title: '', description: '', priority: 'Medium', dueDate: '' });
      fetchTasks();
    } catch (error) {
      console.error('Task creation error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', ids: [], message: '' });

  const handleTaskDelete = async (taskId) => {
    setConfirmModal({
      isOpen: true,
      type: 'single',
      ids: [taskId],
      message: 'Are you sure you want to delete this task?'
    });
  };

  const confirmDeleteTask = async () => {
    try {
      await api.delete(`/tasks/${confirmModal.ids[0]}`);
      toast.success('Task deleted');
      setConfirmModal({ isOpen: false, type: '', ids: [], message: '' });
      fetchTasks();
      setSelectedRows(new Set());
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    setConfirmModal({
      isOpen: true,
      type: 'bulk',
      ids: Array.from(selectedRows),
      message: `Are you sure you want to delete ${selectedRows.size} task(s)?`
    });
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(confirmModal.ids.map(id => api.delete(`/tasks/${id}`)));
      toast.success(`${confirmModal.ids.length} task(s) deleted`);
      setConfirmModal({ isOpen: false, type: '', ids: [], message: '' });
      fetchTasks();
      setSelectedRows(new Set());
      setShowBulkActions(false);
    } catch (error) {
      toast.error('Failed to delete tasks');
    }
  };

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedRows(new Set(tasks.map(t => t._id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [tasks]);

  const handleSelectRow = useCallback((taskId, checked) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(taskId);
      } else {
        newSelected.delete(taskId);
      }
      setShowBulkActions(newSelected.size > 0);
      return newSelected;
    });
  }, []);

  useEffect(() => {
    setShowBulkActions(selectedRows.size > 0);
  }, [selectedRows]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={(e) => {
              table.toggleAllRowsSelected(e.target.checked);
              handleSelectAll(e.target.checked);
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.has(row.original._id)}
            onChange={(e) => handleSelectRow(row.original._id, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Name',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={info.row.original.status === 'Completed'}
                onChange={async (e) => {
                  const newStatus = e.target.checked ? 'Completed' : 'In Progress';
                  try {
                    await api.put(`/tasks/${info.row.original._id}`, { status: newStatus });
                    fetchTasks();
                  } catch (error) {
                    toast.error('Failed to update task');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded-full border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 appearance-none cursor-pointer checked:bg-primary-600 checked:border-primary-600"
                style={{ 
                  borderRadius: '50%',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  position: 'relative'
                }}
              />
              {info.row.original.status === 'Completed' && (
                <svg 
                  className="absolute top-0 left-0 h-4 w-4 pointer-events-none" 
                  style={{ top: '0', left: '0' }}
                  fill="none" 
                  viewBox="0 0 16 16"
                >
                  <path 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4 8l2 2 4-4"
                  />
                </svg>
              )}
            </div>
            <button
              onClick={() => handleTaskClick(info.row.original)}
              className="text-left hover:text-primary-600 font-medium"
            >
              {info.getValue()}
            </button>
          </div>
        ),
      }),
      columnHelper.accessor('assignedTo', {
        header: 'Assignee',
        cell: (info) => {
          const assignees = info.getValue() || [];
          if (assignees.length === 0) return <span className="text-gray-400">Unassigned</span>;
          return (
            <div className="flex -space-x-2">
              {assignees.slice(0, 3).map((assignee, idx) => (
                <div
                  key={assignee._id || idx}
                  className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700 border-2 border-white"
                  title={`${assignee.firstName} ${assignee.lastName}`}
                >
                  {assignee.firstName?.[0]}{assignee.lastName?.[0]}
                </div>
              ))}
              {assignees.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('dueDate', {
        header: 'Due Date',
        cell: (info) => {
          const date = info.getValue();
          if (!date) return <span className="text-gray-400">No date</span>;
          const dueDate = new Date(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isOverdue = dueDate < today && info.row.original.status !== 'Completed';
          return (
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {dueDate.toLocaleDateString()}
            </span>
          );
        },
      }),
      columnHelper.accessor('assignedTo', {
        id: 'collaborators',
        header: 'Collaborators',
        cell: (info) => {
          const assignees = info.getValue() || [];
          return (
            <div className="flex -space-x-1">
              {assignees.slice(0, 2).map((assignee, idx) => (
                <div
                  key={assignee._id || idx}
                  className="h-5 w-5 rounded-full bg-gray-200 border border-white"
                  title={`${assignee.firstName} ${assignee.lastName}`}
                />
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor('priority', {
        header: 'Priority',
        cell: (info) => {
          const priority = info.getValue();
          const colors = {
            Urgent: 'bg-red-100 text-red-800',
            High: 'bg-orange-100 text-orange-800',
            Medium: 'bg-yellow-100 text-yellow-800',
            Low: 'bg-gray-100 text-gray-800'
          };
          return (
            <span className={`px-2 py-1 text-xs font-medium rounded ${colors[priority] || colors.Medium}`}>
              {priority}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTaskClick(info.row.original)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
            {canManage && (
              <div className="relative group">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <FiMoreVertical className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleTaskClick(info.row.original)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleTaskDelete(info.row.original._id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ),
      }),
    ],
    [canManage, selectedRows, handleSelectAll, handleSelectRow, fetchTasks]
  );

  // Filter tasks based on global filter
  const filteredTasks = useMemo(() => {
    if (!globalFilter) return tasks;
    return tasks.filter(task => 
      task.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(globalFilter.toLowerCase()))
    );
  }, [tasks, globalFilter]);

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) return <div className="text-center py-8">Loading tasks...</div>;

  return (
    <div className="relative">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="input w-64"
            />
            {showBulkActions && (
              <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-primary-700">
                  {selectedRows.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setSelectedRows(new Set());
                    setShowBulkActions(false);
                  }}
                  className="p-1 hover:bg-primary-100 rounded"
                >
                  <FiX className="h-4 w-4 text-primary-600" />
                </button>
              </div>
            )}
          </div>
          {canManage && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Task
            </button>
          )}
        </div>

        <div className="overflow-x-auto" style={{ overflowY: 'hidden', maxHeight: 'none', height: 'auto' }}>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-2' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {table.getRowModel().rows.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No tasks found
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn btn-sm btn-secondary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn btn-sm btn-secondary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Task</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTaskData({ title: '', description: '', priority: 'Medium', dueDate: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
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
                  setShowCreateModal(false);
                  setNewTaskData({ title: '', description: '', priority: 'Medium', dueDate: '' });
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="btn btn-primary flex-1"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {showTaskDetail && selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          onClose={() => setShowTaskDetail(false)}
          onUpdate={handleTaskUpdate}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', ids: [], message: '' })}
        onConfirm={() => {
          if (confirmModal.type === 'single') confirmDeleteTask();
          else if (confirmModal.type === 'bulk') confirmBulkDelete();
        }}
        title="Confirm Delete"
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ListTab;
