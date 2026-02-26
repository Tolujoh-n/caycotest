import React, { useState, useEffect, useCallback } from 'react';
import { FiSave, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../../../../config/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../../components/ConfirmModal';

const NotesTab = ({ projectId, teamId, type = 'project' }) => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, noteId: null });

  const fetchNotes = useCallback(async () => {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (teamId) params.teamId = teamId;
      
      const response = await api.get('/notes', { params });
      setNotes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notes');
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [projectId, teamId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = () => {
    setActiveNote(null);
    setNoteTitle('');
    setNoteContent('');
    // Scroll to editor or ensure it's visible
    setTimeout(() => {
      const editor = document.querySelector('textarea[placeholder="Start writing your note..."]');
      if (editor) {
        editor.focus();
      }
    }, 100);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    try {
      const payload = {
        content: noteContent,
        title: noteTitle || noteContent.substring(0, 50),
        [type === 'project' ? 'projectId' : 'teamId']: projectId || teamId
      };
      
      if (activeNote) {
        await api.put(`/notes/${activeNote._id}`, payload);
        toast.success('Note updated');
      } else {
        await api.post('/notes', payload);
        toast.success('Note created');
      }
      
      setActiveNote(null);
      setNoteTitle('');
      setNoteContent('');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    setConfirmModal({ isOpen: true, noteId });
  };

  const confirmDeleteNote = async () => {
    try {
      await api.delete(`/notes/${confirmModal.noteId}`);
      toast.success('Note deleted');
      if (activeNote?._id === confirmModal.noteId) {
        setActiveNote(null);
        setNoteTitle('');
        setNoteContent('');
      }
      setConfirmModal({ isOpen: false, noteId: null });
      fetchNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading notes...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Notes List */}
      <div className="lg:col-span-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Notes</h3>
          <button
            onClick={handleCreateNote}
            className="btn btn-sm btn-primary flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {notes.map(note => (
            <div
              key={note._id}
              onClick={() => {
                setActiveNote(note);
                setNoteContent(note.content);
                setNoteTitle(note.title || note.content.substring(0, 50) + (note.content.length > 50 ? '...' : ''));
              }}
              className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                activeNote?._id === note._id ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="text-sm font-medium mb-1 line-clamp-2 text-gray-900 dark:text-white">
                {note.content.substring(0, 50)}{note.content.length > 50 ? '...' : ''}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No notes yet
            </div>
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {activeNote ? 'Edit Note' : 'New Note'}
          </h3>
          <div className="flex gap-2">
            {activeNote && (
              <button
                onClick={() => handleDeleteNote(activeNote._id)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSaveNote}
              className="btn btn-primary flex items-center gap-2"
            >
              <FiSave className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <textarea
            className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Start writing your note..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, noteId: null })}
        onConfirm={confirmDeleteNote}
        title="Confirm Delete"
        message="Are you sure you want to delete this note?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default NotesTab;
