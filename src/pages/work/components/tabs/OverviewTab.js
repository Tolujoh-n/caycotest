import React, { useState, useEffect } from 'react';
import { FiEdit2, FiPlus, FiX, FiFile, FiFlag, FiLink, FiTrash2, FiCheck, FiUpload, FiExternalLink, FiDownload } from 'react-icons/fi';
import api from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../../components/ConfirmModal';

const OverviewTab = ({ projectId, teamId, type = 'project' }) => {
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState(null);
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [editing, setEditing] = useState({ description: false, milestone: null, resource: null });
  const [formData, setFormData] = useState({ 
    description: '', 
    milestoneTitle: '', 
    milestoneDate: '',
    linkUrl: ''
  });
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [currentPage, setCurrentPage] = useState({ files: 1, links: 1 });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, message: '' });
  const itemsPerPage = 5;
  const canEdit = hasPermission('work.manage');

  const fetchData = useCallback(async () => {
    try {
      if (type === 'project' && projectId) {
        const res = await api.get(`/projects/${projectId}`);
        setData(res.data.data);
        setMembers(res.data.data.members || []);
        setFormData(prev => ({ ...prev, description: res.data.data.description || '' }));
      } else if (type === 'team' && teamId) {
        const res = await api.get(`/teams/${teamId}`);
        setData(res.data.data);
        setMembers(res.data.data.members || []);
        setFormData(prev => ({ ...prev, description: res.data.data.description || '' }));
      }
      
      // Fetch files (only Key Resources)
      const filesRes = await api.get('/files', {
        params: { 
          [type === 'project' ? 'projectId' : 'teamId']: projectId || teamId,
          isKeyResource: true
        }
      });
      setFiles(filesRes.data.data || []);

      // Fetch links (only Key Resources)
      const linksRes = await api.get('/links', {
        params: { 
          [type === 'project' ? 'projectId' : 'teamId']: projectId || teamId,
          isKeyResource: true
        }
      });
      setLinks(linksRes.data.data || []);

      // Fetch milestones
      const milestonesRes = await api.get('/milestones', {
        params: { [type === 'project' ? 'projectId' : 'teamId']: projectId || teamId }
      });
      setMilestones(milestonesRes.data.data || []);

      // Fetch available users for adding members
      const usersRes = await api.get('/users');
      setAvailableUsers(usersRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [projectId, teamId, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateDescription = async () => {
    try {
      if (type === 'project') {
        await api.put(`/projects/${projectId}`, { description: formData.description });
      } else {
        await api.put(`/teams/${teamId}`, { description: formData.description });
      }
      setEditing({ ...editing, description: false });
      toast.success('Description updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update description');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const currentMembers = members.map(m => m._id || m.id);
      const updatedMembers = [...currentMembers, userId];
      
      if (type === 'project') {
        await api.put(`/projects/${projectId}`, { members: updatedMembers });
      } else {
        await api.put(`/teams/${teamId}`, { members: updatedMembers });
      }
      toast.success('Member added');
      setShowAddMember(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const updatedMembers = members.filter(m => (m._id || m.id) !== userId).map(m => m._id || m.id);
      
      if (type === 'project') {
        await api.put(`/projects/${projectId}`, { members: updatedMembers });
      } else {
        await api.put(`/teams/${teamId}`, { members: updatedMembers });
      }
      toast.success('Member removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('projectId', String(projectId));
      if (teamId) formData.append('teamId', String(teamId));
      formData.append('isKeyResource', 'true'); // Mark as Key Resource

      await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('File uploaded successfully');
      setEditing({ ...editing, resource: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteFile = async (fileId) => {
    setConfirmModal({
      isOpen: true,
      type: 'file',
      id: fileId,
      message: 'Are you sure you want to delete this file?'
    });
  };

  const confirmDeleteFile = async () => {
    try {
      await api.delete(`/files/${confirmModal.id}`);
      toast.success('File deleted');
      setConfirmModal({ isOpen: false, type: '', id: null, message: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleAddLink = async () => {
    if (!formData.linkUrl) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      const payload = {
        url: formData.linkUrl,
        isKeyResource: true // Mark as Key Resource
      };
      if (projectId) payload.projectId = String(projectId);
      if (teamId) payload.teamId = String(teamId);

      await api.post('/links', payload);
      toast.success('Link added successfully');
      setFormData({ ...formData, linkUrl: '' });
      setEditing({ ...editing, resource: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add link');
    }
  };

  const handleDeleteLink = async (linkId) => {
    setConfirmModal({
      isOpen: true,
      type: 'link',
      id: linkId,
      message: 'Are you sure you want to delete this link?'
    });
  };

  const confirmDeleteLink = async () => {
    try {
      await api.delete(`/links/${confirmModal.id}`);
      toast.success('Link deleted');
      setConfirmModal({ isOpen: false, type: '', id: null, message: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete link');
    }
  };

  const handleAddMilestone = async () => {
    if (!formData.milestoneTitle || !formData.milestoneDate) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const payload = {
        title: formData.milestoneTitle,
        dueDate: formData.milestoneDate
      };
      if (projectId) payload.projectId = projectId;
      if (teamId) payload.teamId = teamId;

      await api.post('/milestones', payload);
      toast.success('Milestone added');
      setFormData({ ...formData, milestoneTitle: '', milestoneDate: '' });
      setEditing({ ...editing, milestone: null });
      fetchData();
    } catch (error) {
      toast.error('Failed to add milestone');
    }
  };

  const handleToggleMilestone = async (milestoneId, completed) => {
    try {
      await api.put(`/milestones/${milestoneId}`, { completed: !completed });
      toast.success(completed ? 'Milestone marked as incomplete' : 'Milestone marked as completed');
      fetchData();
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    setConfirmModal({
      isOpen: true,
      type: 'milestone',
      id: milestoneId,
      message: 'Are you sure you want to delete this milestone?'
    });
  };

  const confirmDeleteMilestone = async () => {
    try {
      await api.delete(`/milestones/${confirmModal.id}`);
      toast.success('Milestone deleted');
      setConfirmModal({ isOpen: false, type: '', id: null, message: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete milestone');
    }
  };

  const handleDownloadFile = async (file) => {
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

  // Pagination helpers
  const getPaginatedFiles = () => {
    const start = (currentPage.files - 1) * itemsPerPage;
    return files.slice(start, start + itemsPerPage);
  };

  const getPaginatedLinks = () => {
    const start = (currentPage.links - 1) * itemsPerPage;
    return links.slice(start, start + itemsPerPage);
  };

  const totalPages = (items) => Math.ceil(items.length / itemsPerPage);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Description</h3>
          {canEdit && (
            <button
              onClick={() => setEditing({ ...editing, description: !editing.description })}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
          )}
        </div>
        {editing.description ? (
          <div className="space-y-3">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description..."
            />
            <div className="flex gap-2">
              <button onClick={handleUpdateDescription} className="btn btn-primary">
                Save
              </button>
              <button
                onClick={() => setEditing({ ...editing, description: false })}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">
            {data?.description || 'No description yet. Click edit to add one.'}
          </p>
        )}
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Members</h3>
          {canEdit && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="btn btn-sm btn-primary flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Member
            </button>
          )}
        </div>
        {showAddMember && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              {availableUsers
                .filter(u => !members.some(m => (m._id || m.id) === (u._id || u.id)))
                .map(u => (
                  <div key={u._id || u.id} className="flex items-center justify-between p-2 hover:bg-white rounded">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={`${u.firstName} ${u.lastName}`} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{u.firstName} {u.lastName}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(u._id || u.id)}
                      className="btn btn-sm btn-primary"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member._id || member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {member.avatar ? (
                  <img src={member.avatar} alt={`${member.firstName} ${member.lastName}`} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium">{member.firstName} {member.lastName}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
              {canEdit && (member._id || member.id) !== user?.id && (
                <button
                  onClick={() => handleRemoveMember(member._id || member.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Resources */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Key Resources</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing({ ...editing, resource: 'file' })}
              className="btn btn-sm btn-primary flex items-center gap-2"
            >
              <FiUpload className="h-4 w-4" />
              Add File
            </button>
            <button
              onClick={() => setEditing({ ...editing, resource: 'link' })}
              className="btn btn-sm btn-primary flex items-center gap-2"
            >
              <FiLink className="h-4 w-4" />
              Add Link
            </button>
          </div>
        </div>

        {/* Add File Form */}
        {editing.resource === 'file' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select File
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploadingFile}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {uploadingFile && <p className="mt-2 text-sm text-gray-600">Uploading...</p>}
            <button
              onClick={() => setEditing({ ...editing, resource: null })}
              className="mt-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Add Link Form */}
        {editing.resource === 'link' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              type="url"
              placeholder="Enter URL (e.g., https://example.com)"
              className="input w-full"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
            />
            <div className="flex gap-2">
              <button onClick={handleAddLink} className="btn btn-primary">
                Add Link
              </button>
              <button
                onClick={() => {
                  setEditing({ ...editing, resource: null });
                  setFormData({ ...formData, linkUrl: '' });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Files Section */}
        {files.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Files ({files.length})</h4>
            <div className="space-y-2">
              {getPaginatedFiles().map(file => {
                const isImage = file.mimeType?.startsWith('image/') || file.originalName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                return (
                  <div key={file._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isImage && file.cloudinaryUrl ? (
                        <img 
                          src={file.cloudinaryUrl} 
                          alt={file.originalName}
                          className="h-12 w-12 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <FiFile className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.originalName}</div>
                        <div className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="text-primary-600 hover:text-primary-700"
                        title="Download"
                      >
                        <FiDownload className="h-4 w-4" />
                      </button>
                      {file.uploadedBy?._id === user?.id && (
                        <button
                          onClick={() => handleDeleteFile(file._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages(files) > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setCurrentPage({ ...currentPage, files: currentPage.files - 1 })}
                  disabled={currentPage.files === 1}
                  className="btn btn-sm btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage.files} of {totalPages(files)}
                </span>
                <button
                  onClick={() => setCurrentPage({ ...currentPage, files: currentPage.files + 1 })}
                  disabled={currentPage.files >= totalPages(files)}
                  className="btn btn-sm btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Links Section */}
        {links.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Links ({links.length})</h4>
            <div className="space-y-3">
              {getPaginatedLinks().map(link => (
                <div key={link._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    {link.image && (
                      <img src={link.image} alt={link.title} className="w-20 h-20 object-cover rounded flex-shrink-0" />
                    )}
                    {!link.image && link.favicon && (
                      <img src={link.favicon} alt={link.siteName} className="w-6 h-6 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary-600 hover:text-primary-700 flex items-center gap-2"
                      >
                        {link.title || link.url}
                        <FiExternalLink className="h-3 w-3" />
                      </a>
                      {link.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{link.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {link.siteName && (
                          <span className="text-xs text-gray-500">{link.siteName}</span>
                        )}
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{new Date(link.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {link.addedBy?._id === user?.id && (
                      <button
                        onClick={() => handleDeleteLink(link._id)}
                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages(links) > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setCurrentPage({ ...currentPage, links: currentPage.links - 1 })}
                  disabled={currentPage.links === 1}
                  className="btn btn-sm btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage.links} of {totalPages(links)}
                </span>
                <button
                  onClick={() => setCurrentPage({ ...currentPage, links: currentPage.links + 1 })}
                  disabled={currentPage.links >= totalPages(links)}
                  className="btn btn-sm btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {files.length === 0 && links.length === 0 && (
          <p className="text-gray-500 text-center py-4">No resources added yet. Add files or links to get started.</p>
        )}
      </div>

      {/* Milestones */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
          {canEdit && (
            <button
              onClick={() => setEditing({ ...editing, milestone: 'new' })}
              className="btn btn-sm btn-primary flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Milestone
            </button>
          )}
        </div>
        {editing.milestone === 'new' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              type="text"
              placeholder="Milestone title"
              className="input"
              value={formData.milestoneTitle}
              onChange={(e) => setFormData({ ...formData, milestoneTitle: e.target.value })}
            />
            <input
              type="date"
              className="input"
              value={formData.milestoneDate}
              onChange={(e) => setFormData({ ...formData, milestoneDate: e.target.value })}
            />
            <div className="flex gap-2">
              <button onClick={handleAddMilestone} className="btn btn-primary">
                Add
              </button>
              <button
                onClick={() => setEditing({ ...editing, milestone: null })}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {milestones.map(milestone => (
            <div
              key={milestone._id}
              className={`flex items-center gap-3 p-3 border rounded-lg ${
                milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <button
                onClick={() => canEdit && handleToggleMilestone(milestone._id, milestone.completed)}
                className={`p-2 rounded-lg transition-colors ${
                  milestone.completed 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                } ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {milestone.completed ? (
                  <FiCheck className="h-4 w-4" />
                ) : (
                  <FiFlag className="h-4 w-4" />
                )}
              </button>
              <div className="flex-1">
                <div className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                  {milestone.title}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(milestone.dueDate).toLocaleDateString()}
                  {milestone.completed && milestone.completedBy && (
                    <span> • Completed by {milestone.completedBy.firstName} {milestone.completedBy.lastName}</span>
                  )}
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDeleteMilestone(milestone._id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {milestones.length === 0 && (
            <p className="text-gray-500 text-center py-4">No milestones yet. Add one to track progress.</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', id: null, message: '' })}
        onConfirm={() => {
          if (confirmModal.type === 'file') confirmDeleteFile();
          else if (confirmModal.type === 'link') confirmDeleteLink();
          else if (confirmModal.type === 'milestone') confirmDeleteMilestone();
        }}
        title="Confirm Action"
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default OverviewTab;
