import React, { useState, useEffect } from 'react';
import { FiX, FiEdit2, FiTrash2, FiMessageSquare, FiPaperclip, FiCheck, FiPlus, FiUsers, FiUpload, FiDownload, FiImage } from 'react-icons/fi';
import api from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';

const TaskDetailSidebar = ({ task, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editingAssignees, setEditingAssignees] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'Not Started',
    priority: task.priority || 'Medium',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    assignedTo: task.assignedTo?.map(a => a._id || a) || []
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, message: '' });
  const [subtaskModal, setSubtaskModal] = useState({ isOpen: false, title: '' });
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '', name: '' });

  const isAdmin = user?.role === 'Company Owner' || user?.role === 'Operations Manager';

  useEffect(() => {
    fetchComments();
    fetchAttachments();
    if (editingAssignees) {
      fetchUsers();
    }
  }, [task._id, editingAssignees]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get('/messages', { params: { taskId: String(task._id) } });
      const fetchedComments = res.data.data || [];
      
      // Merge with existing comments to avoid losing optimistically added comments
      setComments(prev => {
        const commentMap = new Map();
        // Add existing comments first
        prev.forEach(comment => {
          if (comment._id) commentMap.set(comment._id.toString(), comment);
        });
        // Add/update with fetched comments
        fetchedComments.forEach(comment => {
          if (comment._id) commentMap.set(comment._id.toString(), comment);
        });
        // Convert back to array and sort by createdAt
        return Array.from(commentMap.values()).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchAttachments = async () => {
    try {
      const res = await api.get('/files', { params: { taskId: task._id } });
      setAttachments(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch attachments');
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/tasks/${task._id}`, formData);
      toast.success('Task updated');
      setEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleSaveAssignees = async () => {
    try {
      await api.put(`/tasks/${task._id}`, { assignedTo: formData.assignedTo });
      toast.success('Assignees updated');
      setEditingAssignees(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update assignees');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await api.post('/messages', {
        taskId: String(task._id),
        content: newComment
      });
      
      // Immediately add the new comment to the list for instant feedback
      if (response.data.data) {
        setComments(prev => {
          // Check if comment already exists to avoid duplicates
          const exists = prev.some(c => c._id === response.data.data._id);
          if (exists) return prev;
          return [...prev, response.data.data];
        });
      }
      
      setNewComment('');
      
      // Fetch after a short delay to ensure consistency
      // But don't overwrite the new comment we just added
      setTimeout(() => {
        fetchComments();
      }, 500);
      
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', String(task._id));
      
      // Ensure IDs are strings, not objects
      if (task.projectId) {
        const projectId = typeof task.projectId === 'string' ? task.projectId : (task.projectId._id || task.projectId);
        formData.append('projectId', String(projectId));
      }
      if (task.teamId) {
        const teamId = typeof task.teamId === 'string' ? task.teamId : (task.teamId._id || task.teamId);
        formData.append('teamId', String(teamId));
      }

      await api.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('File uploaded');
      fetchAttachments();
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    setConfirmModal({
      isOpen: true,
      type: 'attachment',
      id: fileId,
      message: 'Are you sure you want to delete this attachment?'
    });
  };

  const confirmDeleteAttachment = async () => {
    try {
      await api.delete(`/files/${confirmModal.id}`);
      toast.success('Attachment deleted');
      setConfirmModal({ isOpen: false, type: '', id: null, message: '' });
      fetchAttachments();
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  const handleAddSubtask = () => {
    setSubtaskModal({ isOpen: true, title: '' });
  };

  const confirmAddSubtask = () => {
    if (!subtaskModal.title.trim()) {
      toast.error('Please enter a subtask title');
      return;
    }
    setSubtasks([...subtasks, { title: subtaskModal.title, completed: false }]);
    setSubtaskModal({ isOpen: false, title: '' });
    toast.success('Subtask added');
  };

  const handleDownloadAttachment = async (file) => {
    try {
      const url = file.cloudinaryUrl || `/api/files/${file._id}/download`;
      
      if (file.cloudinaryUrl) {
        // For Cloudinary URLs, fetch and download
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        // For local files, use direct download
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleToggleSubtask = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Task Title & Description */}
        <div>
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                className="input font-semibold text-lg"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                className="input"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add description..."
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>In Review</option>
                  <option>Completed</option>
                  <option>Blocked</option>
                </select>
                <select
                  className="input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <input
                type="date"
                className="input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn btn-primary flex-1">
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description || 'No description'}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded">
                  {task.status}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 rounded">
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assignees */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <FiUsers className="h-4 w-4" />
              Assigned To
            </h4>
            {isAdmin && !editingAssignees && (
              <button
                onClick={() => {
                  setEditingAssignees(true);
                  fetchUsers();
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Edit
              </button>
            )}
          </div>
          {editingAssignees ? (
            <div className="space-y-2">
              <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700/50">
                {users.map((u) => (
                  <label key={u._id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(u._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            assignedTo: [...formData.assignedTo, u._id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            assignedTo: formData.assignedTo.filter(id => id !== u._id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {u.firstName} {u.lastName}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingAssignees(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignees}
                  className="btn btn-primary flex-1"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {task.assignedTo && task.assignedTo.length > 0 ? (
                task.assignedTo.map((assignee, idx) => (
                  <div
                    key={assignee._id || idx}
                    className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-200"
                  >
                    {assignee.avatar ? (
                      <img src={assignee.avatar} alt={`${assignee.firstName} ${assignee.lastName}`} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                        {assignee.firstName?.[0]}{assignee.lastName?.[0]}
                      </div>
                    )}
                    <span>{assignee.firstName} {assignee.lastName}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">No assignees</span>
              )}
            </div>
          )}
        </div>

        {/* Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Subtasks</h4>
            <button
              onClick={handleAddSubtask}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {subtasks.map((subtask, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                <button
                  onClick={() => handleToggleSubtask(idx)}
                  className={`p-1 rounded ${subtask.completed ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'border border-gray-300 dark:border-gray-600'}`}
                >
                  <FiCheck className="h-3 w-3" />
                </button>
                <span className={subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-200'}>
                  {subtask.title}
                </span>
              </div>
            ))}
            {subtasks.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No subtasks</p>
            )}
          </div>
        </div>

        {/* Comments */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Comments</h4>
          <div className="space-y-3 mb-4">
            {comments.map(comment => (
              <div key={comment._id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xs font-medium text-primary-700 dark:text-primary-400">
                    {comment.sender?.firstName?.[0]}{comment.sender?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.sender?.firstName} {comment.sender?.lastName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button onClick={handleAddComment} className="btn btn-primary">
              <FiMessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <FiPaperclip className="h-4 w-4" />
              Attachments
            </h4>
            <label className="cursor-pointer">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-primary-600 dark:text-primary-400">
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                ) : (
                  <FiUpload className="h-4 w-4 text-primary-600" />
                )}
              </div>
            </label>
          </div>
          <div className="space-y-2">
            {attachments.map(file => {
              const isImage = file.mimeType?.startsWith('image/') || file.originalName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
              const imageUrl = file.cloudinaryUrl || (file.filePath ? `/api/files/${file._id}/download` : null);
              
              return (
                <div key={file._id} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isImage && imageUrl ? (
                      <div 
                        className="cursor-pointer"
                        onClick={() => setImageModal({ isOpen: true, url: imageUrl, name: file.originalName || file.name })}
                      >
                        <img 
                          src={imageUrl} 
                          alt={file.originalName || file.name}
                          className="h-20 w-20 object-cover rounded hover:opacity-90 transition-opacity"
                        />
                      </div>
                    ) : (
                      <FiPaperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-sm truncate text-gray-900 dark:text-gray-200">{file.originalName || file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadAttachment(file)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                      title="Download"
                    >
                      <FiDownload className="h-4 w-4" />
                    </button>
                    {file.uploadedBy?._id === user?.id && (
                      <button
                        onClick={() => handleDeleteAttachment(file._id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {attachments.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No attachments</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', id: null, message: '' })}
        onConfirm={confirmDeleteAttachment}
        title="Confirm Delete"
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75" onClick={() => setImageModal({ isOpen: false, url: '', name: '' })}>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative max-w-3xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4">
              <button
                onClick={() => setImageModal({ isOpen: false, url: '', name: '' })}
                className="absolute top-2 right-2 z-10 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                <FiX className="h-5 w-5" />
              </button>
              <img 
                src={imageModal.url} 
                alt={imageModal.name}
                className="w-full h-auto rounded-lg max-h-[70vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">{imageModal.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Subtask Modal */}
      {subtaskModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSubtaskModal({ isOpen: false, title: '' })}></div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Add Subtask</h3>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Subtask title"
                  value={subtaskModal.title}
                  onChange={(e) => setSubtaskModal({ ...subtaskModal, title: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      confirmAddSubtask();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmAddSubtask}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 dark:bg-primary-500 text-base font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setSubtaskModal({ isOpen: false, title: '' })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailSidebar;
