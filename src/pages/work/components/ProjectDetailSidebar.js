import React, { useEffect, useState } from 'react';
import { FiX, FiSave, FiMessageSquare } from 'react-icons/fi';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';

const ProjectDetailSidebar = ({ project, onClose, onUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(project?.comments || []);
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'Active'
  });

  useEffect(() => {
    setComments(project?.comments || []);
    setForm({
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'Active'
    });
  }, [project]);

  const saveProject = async () => {
    setSaving(true);
    try {
      await api.put(`/projects/${project._id}`, form);
      toast.success('Project updated');
      onUpdated();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const optimistic = {
      _id: `temp-${Date.now()}`,
      text: newComment.trim(),
      createdBy: { firstName: 'You' },
      createdAt: new Date().toISOString()
    };
    setComments((prev) => [...prev, optimistic]);
    setNewComment('');
    try {
      const res = await api.post(`/projects/${project._id}/comments`, { text: optimistic.text });
      const persisted = res.data?.comment;
      setComments((prev) => prev.map(c => (c._id === optimistic._id ? (persisted || c) : c)));
      onUpdated();
    } catch (e) {
      setComments((prev) => prev.filter(c => c._id !== optimistic._id));
      toast.error(e.response?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Details</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Active</option>
            <option>On Hold</option>
            <option>Completed</option>
            <option>Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><FiMessageSquare /> Comments</p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {comments.map((c, idx) => (
              <div key={idx} className="p-2 rounded bg-gray-50 dark:bg-gray-700/40">
                <p className="text-sm text-gray-800 dark:text-gray-200">{c.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.createdBy?.firstName || 'User'} • {new Date(c.createdAt || Date.now()).toLocaleString()}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="input"
              placeholder="Add comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addComment();
                }
              }}
            />
            <button className="btn btn-secondary" onClick={addComment} disabled={saving}>Add</button>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-primary flex items-center gap-2" onClick={saveProject} disabled={saving}>
            <FiSave className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailSidebar;

