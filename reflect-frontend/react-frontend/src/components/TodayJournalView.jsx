import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, Clock, Trash2 } from 'lucide-react';
import * as api from '../services/api';
import ConfirmDialog from './ConfirmDialog';

export default function TodayJournalView({ userId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTodayEntries();
  }, [userId]);

  const loadTodayEntries = async () => {
    setLoading(true);
    try {
      const today = api.getTodayDate();
      const data = await api.getJournalEntriesForDate(userId, today);
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleDeleteEntry = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await api.deleteJournalEntry(userId, deleteConfirm);
      setEntries(entries.filter(entry => entry.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-amber-400" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="text-zinc-600" size={36} />
        </div>
        <h3 className="text-xl font-bold text-zinc-300 mb-2">No Journal Entries Today</h3>
        <p className="text-zinc-500 mb-6">You haven't written anything today yet</p>
        <p className="text-zinc-600 text-sm">Click "New Journal Entry" in the sidebar to start writing</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center">
            <BookOpen className="text-amber-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              Today's Journal
            </h2>
            <p className="text-zinc-400 text-sm">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">
            {api.formatDate(api.getTodayDate())}
          </p>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-amber-400/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Clock size={16} />
                <span>{formatTime(entry.created_at)}</span>
              </div>
              <button
                onClick={() => setDeleteConfirm(entry.id)}
                className="text-zinc-500 hover:text-red-400 transition-colors"
                title="Delete entry"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteEntry}
        title="Delete Journal Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}
