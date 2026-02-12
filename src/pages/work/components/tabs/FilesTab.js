import React, { useState, useEffect } from 'react';
import { FiUpload, FiDownload, FiTrash2, FiFile, FiImage, FiFileText, FiX } from 'react-icons/fi';
import api from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../../components/ConfirmModal';

const FilesTab = ({ projectId, teamId, type = 'project' }) => {
  const { user, hasPermission } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '', name: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, fileId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const canManage = hasPermission('work.manage');

  useEffect(() => {
    fetchFiles();
  }, [projectId, teamId]);

  const fetchFiles = async () => {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;
      
      const response = await api.get('/files', { params });
      setFiles(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('projectId', projectId);
      if (teamId) formData.append('teamId', teamId);

      await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('File uploaded successfully');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId) => {
    setConfirmModal({ isOpen: true, fileId });
  };

  const confirmDeleteFile = async () => {
    try {
      await api.delete(`/files/${confirmModal.fileId}`);
      toast.success('File deleted');
      setConfirmModal({ isOpen: false, fileId: null });
      fetchFiles();
    } catch (error) {
      toast.error('Failed to delete file');
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

  const isImageFile = (file) => {
    return file.mimeType?.startsWith('image/') || file.originalName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <FiImage className="h-5 w-5 text-blue-500" />;
    if (mimeType?.includes('pdf') || mimeType?.includes('document')) return <FiFileText className="h-5 w-5 text-red-500" />;
    return <FiFile className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Pagination
  const totalPages = Math.ceil(files.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = files.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div className="text-center py-8">Loading files...</div>;

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Files ({files.length})</h3>
          {canManage && (
            <label className="btn btn-primary flex items-center gap-2 cursor-pointer">
              <FiUpload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload File'}
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedFiles.map(file => {
            const isImage = isImageFile(file);
            const imageUrl = file.cloudinaryUrl || (file.filePath ? `/api/files/${file._id}/download` : null);
            
            return (
              <div
                key={file._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {isImage && imageUrl ? (
                  <div 
                    className="mb-3 cursor-pointer"
                    onClick={() => setImageModal({ isOpen: true, url: imageUrl, name: file.originalName })}
                  >
                    <img 
                      src={imageUrl} 
                      alt={file.originalName}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex justify-center">
                    {getFileIcon(file.mimeType)}
                  </div>
                )}
                
                <div className="mb-3">
                  <h4 className="font-medium text-sm truncate mb-1">{file.originalName}</h4>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="flex-1 btn btn-sm btn-secondary flex items-center justify-center gap-2"
                  >
                    <FiDownload className="h-4 w-4" />
                    Download
                  </button>
                  {canManage && file.uploadedBy?._id === user?.id && (
                    <button
                      onClick={() => handleDeleteFile(file._id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {file.description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{file.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {files.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiFile className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No files uploaded yet</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="btn btn-sm btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75" onClick={() => setImageModal({ isOpen: false, url: '', name: '' })}>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative max-w-3xl w-full bg-white rounded-lg shadow-2xl p-4">
              <button
                onClick={() => setImageModal({ isOpen: false, url: '', name: '' })}
                className="absolute top-2 right-2 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <FiX className="h-5 w-5" />
              </button>
              <img 
                src={imageModal.url} 
                alt={imageModal.name}
                className="w-full h-auto rounded-lg max-h-[70vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-2 text-center text-sm text-gray-600">{imageModal.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, fileId: null })}
        onConfirm={confirmDeleteFile}
        title="Confirm Delete"
        message="Are you sure you want to delete this file?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default FilesTab;
