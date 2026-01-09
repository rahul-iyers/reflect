import React, { useState } from 'react';
import { X, PenSquare, Loader2 } from 'lucide-react';

export default function JournalModal({ isOpen, onClose, onSubmit, loading }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
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
      <div className="bg-zinc-900 rounded-2xl border border-amber-400/20 max-w-2xl w-full shadow-2xl shadow-amber-500/10 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center">
              <PenSquare className="text-amber-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              New Journal Entry
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
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely... This is your space to vent, capture ideas, or dump thoughts."
              className="w-full h-96 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition-all resize-none text-base leading-relaxed"
              disabled={loading}
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <p className="text-xs text-zinc-600 mt-2 text-right">
              {content.length} characters
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
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 hover:shadow-lg hover:shadow-amber-500/30 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}