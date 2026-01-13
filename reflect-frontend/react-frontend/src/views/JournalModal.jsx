import React, { useState } from 'react';
import { X, PenSquare, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import RichTextEditor from '../components/RichTextEditor';
import '../components/RichTextEditor.css';

export default function JournalModal({ isOpen, onClose, onSubmit, loading, initialContent = '', isEditing = false }) {
  const { timeOfDay } = useTheme();
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');

  // Update content when initialContent changes (for edit mode)
  React.useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Helper to get text length from HTML
  const getTextLength = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent.length || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const textLength = getTextLength(content);
    if (textLength === 0 || !content.trim()) {
      setError('Please write something in your journal');
      return;
    }

    try {
      await onSubmit(content);
      setContent('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create journal entry');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-zinc-900 rounded-2xl border max-w-2xl w-full shadow-2xl animate-fade-in ${
        timeOfDay === 'morning'
          ? 'border-blue-400/20 shadow-blue-500/10'
          : 'border-amber-400/20 shadow-amber-500/10'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              timeOfDay === 'morning'
                ? 'bg-gradient-to-br from-blue-400/20 to-sky-500/20 border-blue-400/30'
                : 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border-amber-400/30'
            }`}>
              <PenSquare className={timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'} size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              What's on your mind?
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write freely... This is your space to vent, capture ideas, or dump thoughts."
              disabled={loading}
            />
            <p className="text-xs text-zinc-600 mt-2 text-right">
              {getTextLength(content)} characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-xl text-zinc-900 hover:shadow-lg transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2 ${
                timeOfDay === 'morning'
                  ? 'bg-gradient-to-r from-blue-400 to-sky-500 hover:shadow-blue-500/30'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:shadow-amber-500/30'
              }`}
              disabled={loading || getTextLength(content) === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Entry' : 'Save Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}