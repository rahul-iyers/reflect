import React, { useState } from 'react';
import { X, Target, Calendar, Loader2 } from 'lucide-react';

export default function GoalModal({ isOpen, onClose, onSubmit, loading }) {
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please enter a goal description');
      return;
    }

    try {
      await onSubmit(description, deadline || null);
      setDescription('');
      setDeadline('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create goal');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-amber-400/20 max-w-md w-full shadow-2xl shadow-amber-500/10 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center">
              <Target className="text-amber-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              Create New Goal
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
              What do you want to achieve?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Complete the project, Learn React, Exercise 3x/week..."
              className="w-full h-32 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition-all resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-400/50 transition-all"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              disabled={loading || !description.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                'Create Goal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}