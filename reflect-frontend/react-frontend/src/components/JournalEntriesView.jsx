import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Loader2, Trash2, Search } from 'lucide-react';
import * as api from '../services/api';
import ConfirmDialog from './ConfirmDialog';

export default function JournalEntriesView({ userId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJournalEntries();
  }, [userId]);

  const loadJournalEntries = async () => {
    setLoading(true);
    try {
      const data = await api.getAllJournalEntries(userId);
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
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

  // Filter entries by search query
  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = entry.entry_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

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
        <h3 className="text-xl font-bold text-zinc-300 mb-2">No Journal Entries Yet</h3>
        <p className="text-zinc-500 mb-6">Start journaling to capture your thoughts and ideas</p>
        <p className="text-zinc-600 text-sm">Click "New Journal Entry" in the sidebar to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input
          type="text"
          placeholder="Search journal entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition-all"
        />
      </div>

      {filteredEntries.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <p className="text-zinc-400">No entries match "{searchQuery}"</p>
        </div>
      )}

      <div className="space-y-8">
        {Object.keys(groupedEntries).sort((a, b) => new Date(b) - new Date(a)).map((date) => (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center gap-3 sticky top-0 bg-zinc-950 py-2 z-10">
              <Calendar size={20} className="text-amber-400" />
              <h3 className="text-lg font-semibold text-zinc-300">
                {formatDate(date)}
              </h3>
              <div className="flex-1 h-px bg-zinc-800"></div>
            </div>

            {/* Entries for this date */}
            {groupedEntries[date].map((entry) => (
              <div
                key={entry.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-amber-400/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
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
