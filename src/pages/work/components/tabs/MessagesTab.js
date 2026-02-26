import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSend, FiPaperclip, FiDownload, FiFile, FiX } from 'react-icons/fi';
import api from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';

const MessagesTab = ({ projectId, teamId, type = 'project' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '', name: '' });
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;
      
      const response = await api.get('/messages', { params });
      const fetchedMessages = response.data.data || [];
      
      // Merge with existing messages to avoid losing optimistically added messages
      setMessages(prev => {
        const messageMap = new Map();
        // Add existing messages first
        prev.forEach(msg => {
          if (msg._id) messageMap.set(msg._id.toString(), msg);
        });
        // Add/update with fetched messages
        fetchedMessages.forEach(msg => {
          if (msg._id) messageMap.set(msg._id.toString(), msg);
        });
        // Convert back to array and sort by createdAt
        return Array.from(messageMap.values()).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
      
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [projectId, teamId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = ''; // Reset input
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('content', newMessage || '');
      
      // Add files
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });
      
      if (projectId) formData.append('projectId', projectId);
      if (teamId) formData.append('teamId', teamId);
      
      const response = await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Immediately add the new message to the list for instant feedback
      if (response.data.data) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m._id === response.data.data._id);
          if (exists) return prev;
          return [...prev, response.data.data];
        });
      }
      
      setNewMessage('');
      setSelectedFiles([]);
      
      // Fetch after a short delay to get updated unread count and ensure consistency
      // But don't overwrite the new message we just added
      setTimeout(() => {
        fetchMessages();
      }, 500);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const url = file.cloudinaryUrl || `/api/files/${file._id}/download`;
      
      if (file.cloudinaryUrl) {
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

  // Function to detect and make links clickable
  const renderMessageContent = (content) => {
    if (!content) return '';
    
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (loading) return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading messages...</div>;

  return (
    <>
      {unreadCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-800 dark:text-blue-300">
            {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
      <div className="flex flex-col h-[600px] bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => {
            const isOwnMessage = message.sender?._id === user?.id;
            return (
              <div
                key={message._id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.sender?.avatar ? (
                    <img 
                      src={message.sender.avatar} 
                      alt={`${message.sender.firstName} ${message.sender.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                      {message.sender?.firstName?.[0]}{message.sender?.lastName?.[0]}
                    </div>
                  )}
                </div>
                
                {/* Message Content */}
                <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {message.sender?.firstName} {message.sender?.lastName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div
                    className={`inline-block p-3 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {renderMessageContent(message.content)}
                      </p>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className={`mt-2 space-y-2 ${message.content ? 'mt-3' : ''}`}>
                        {message.attachments.map((attachment, idx) => {
                          const isImage = isImageFile(attachment);
                          return (
                            <div key={attachment._id || idx} className="relative group">
                              {isImage && attachment.cloudinaryUrl ? (
                                <div
                                  onClick={() => setImageModal({ 
                                    isOpen: true, 
                                    url: attachment.cloudinaryUrl, 
                                    name: attachment.originalName 
                                  })}
                                  className="cursor-pointer"
                                >
                                  <img 
                                    src={attachment.cloudinaryUrl} 
                                    alt={attachment.originalName}
                                    className="max-w-xs rounded-lg hover:opacity-90 transition-opacity"
                                  />
                                </div>
                              ) : (
                                <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                  isOwnMessage ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-600'
                                }`}>
                                  <FiFile className={`h-4 w-4 ${isOwnMessage ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                                  <span className={`text-xs truncate ${isOwnMessage ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {attachment.originalName}
                                  </span>
                                  <button
                                    onClick={() => handleDownloadFile(attachment)}
                                    className={`p-1 rounded hover:bg-opacity-80 ${isOwnMessage ? 'text-white hover:bg-primary-400' : 'text-gray-600 hover:bg-gray-200'}`}
                                    title="Download"
                                  >
                                    <FiDownload className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Mentions */}
                    {message.mentions && message.mentions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.mentions.map((mention, idx) => (
                          <span
                            key={mention._id || idx}
                            className={`text-xs px-2 py-1 rounded ${
                              isOwnMessage 
                                ? 'bg-white/20 text-white' 
                                : 'bg-primary-100 text-primary-700'
                            }`}
                          >
                            @{mention.firstName} {mention.lastName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => {
                const isImage = file.type?.startsWith('image/');
                const previewUrl = isImage ? URL.createObjectURL(file) : null;
                return (
                  <div key={index} className="relative">
                    {isImage && previewUrl ? (
                      <div className="relative">
                        <img 
                          src={previewUrl} 
                          alt={file.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <FiFile className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                rows="2"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="flex gap-2">
              <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-600 dark:text-gray-400" title="Attach file">
                <FiPaperclip className="h-5 w-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <button
                onClick={handleSendMessage}
                disabled={uploading || (!newMessage.trim() && selectedFiles.length === 0)}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FiSend className="h-4 w-4" />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setImageModal({ isOpen: false, url: '', name: '' })}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setImageModal({ isOpen: false, url: '', name: '' })}
                className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <FiX className="h-5 w-5" />
              </button>
              <img 
                src={imageModal.url} 
                alt={imageModal.name}
                className="w-full h-auto rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">{imageModal.name}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessagesTab;
