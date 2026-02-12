import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFileText, FiBook, FiTag } from 'react-icons/fi';
import api from '../../../../config/api';

const KnowledgeTab = ({ teamId }) => {
  const [knowledge, setKnowledge] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchKnowledge = useCallback(async () => {
    try {
      // For now, we'll use messages and files as knowledge base
      // Later we can create a dedicated Knowledge model
      const [messagesRes, filesRes] = await Promise.all([
        api.get('/messages', { params: { teamId } }),
        api.get('/files', { params: { teamId } })
      ]);

      const knowledgeItems = [
        ...(messagesRes.data.data || []).map(msg => ({
          id: msg._id,
          type: 'message',
          title: msg.content.substring(0, 100),
          content: msg.content,
          author: `${msg.sender?.firstName} ${msg.sender?.lastName}`,
          date: msg.createdAt,
          tags: []
        })),
        ...(filesRes.data.data || []).map(file => ({
          id: file._id,
          type: 'file',
          title: file.originalName,
          content: file.description || '',
          author: `${file.uploadedBy?.firstName} ${file.uploadedBy?.lastName}`,
          date: file.createdAt,
          tags: file.tags || []
        }))
      ];

      setKnowledge(knowledgeItems);
    } catch (error) {
      console.error('Failed to fetch knowledge');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const filteredKnowledge = knowledge.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-8">Loading knowledge base...</div>;

  return (
    <div className="card">
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredKnowledge.map(item => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-2">
              {item.type === 'file' ? (
                <FiFileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
              ) : (
                <FiBook className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{item.title}</h4>
                {item.content && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>By {item.author}</span>
                  <span>•</span>
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1"
                      >
                        <FiTag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredKnowledge.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FiBook className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>{searchQuery ? 'No results found' : 'No knowledge articles yet'}</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeTab;
