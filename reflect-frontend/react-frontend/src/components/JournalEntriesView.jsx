import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Loader2, Trash2, Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import * as api from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import { useTheme } from '../contexts/ThemeContext';

export default function JournalEntriesView({ userId }) {
  const { timeOfDay } = useTheme();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'week', 'month', '3months', '6months', 'year'
  const [visibleMonths, setVisibleMonths] = useState(3); // Start with 3 months visible
  const [collapsedMonths, setCollapsedMonths] = useState(new Set()); // Track collapsed month sections

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

  const toggleMonthCollapse = (monthYear) => {
    setCollapsedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthYear)) {
        newSet.delete(monthYear);
      } else {
        newSet.add(monthYear);
      }
      return newSet;
    });
  };

  // Filter entries by search query and date range
  const getFilteredEntries = () => {
    let filtered = entries.filter(entry =>
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (dateFilter) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= cutoffDate;
      });
    }

    return filtered;
  };

  const filteredEntries = getFilteredEntries();

  // Group entries by month
  const groupedByMonth = filteredEntries.reduce((groups, entry) => {
    const entryDate = new Date(entry.entry_date);
    const monthYear = `${entryDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

    if (!groups[monthYear]) {
      groups[monthYear] = {
        entries: [],
        dates: {}
      };
    }

    const date = entry.entry_date;
    if (!groups[monthYear].dates[date]) {
      groups[monthYear].dates[date] = [];
    }
    groups[monthYear].dates[date].push(entry);
    groups[monthYear].entries.push(entry);

    return groups;
  }, {});

  // Sort months newest to oldest
  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
    const dateA = new Date(groupedByMonth[a].entries[0].entry_date);
    const dateB = new Date(groupedByMonth[b].entries[0].entry_date);
    return dateB - dateA;
  });

  // Limit visible months
  const displayedMonths = sortedMonths.slice(0, visibleMonths);
  const hasMoreMonths = sortedMonths.length > visibleMonths;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className={`animate-spin ${timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'}`} size={48} />
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
          className={`w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all ${
            timeOfDay === 'morning' ? 'focus:border-blue-400/50' : 'focus:border-amber-400/50'
          }`}
        />
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-500 flex-shrink-0" />
          <span className="text-xs text-zinc-500 flex-shrink-0">Show:</span>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'week', 'month', '3months', '6months', 'year'].map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                dateFilter === filter
                  ? timeOfDay === 'morning'
                    ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                    : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                  : 'bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {filter === 'all' ? 'All Time' :
               filter === 'week' ? 'Week' :
               filter === 'month' ? 'Month' :
               filter === '3months' ? '3 Months' :
               filter === '6months' ? '6 Months' :
               'Year'}
            </button>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <p className="text-zinc-400">No entries match "{searchQuery}"</p>
        </div>
      )}

      {filteredEntries.length === 0 && !searchQuery && dateFilter !== 'all' && (
        <div className="text-center py-16">
          <p className="text-zinc-400">No entries in this time range</p>
        </div>
      )}

      <div className="space-y-6">
        {displayedMonths.map((monthYear) => {
          const monthData = groupedByMonth[monthYear];
          const isCollapsed = collapsedMonths.has(monthYear);
          const entryCount = monthData.entries.length;

          return (
            <div key={monthYear} className="space-y-4">
              {/* Month Header - Collapsible */}
              <button
                onClick={() => toggleMonthCollapse(monthYear)}
                className={`w-full flex items-center gap-3 sticky top-0 bg-zinc-950 py-3 px-4 rounded-xl border border-zinc-800 transition-all group ${
                  timeOfDay === 'morning' ? 'hover:border-blue-400/30' : 'hover:border-amber-400/30'
                }`}
              >
                <Calendar size={20} className={timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'} />
                <h3 className="text-lg font-semibold text-zinc-200">
                  {monthYear}
                </h3>
                <span className="text-sm text-zinc-500">
                  ({entryCount} {entryCount === 1 ? 'entry' : 'entries'})
                </span>
                <div className="flex-1 h-px bg-zinc-800 group-hover:bg-zinc-700"></div>
                {isCollapsed ? (
                  <ChevronDown size={20} className={`text-zinc-500 ${timeOfDay === 'morning' ? 'group-hover:text-blue-400' : 'group-hover:text-amber-400'}`} />
                ) : (
                  <ChevronUp size={20} className={`text-zinc-500 ${timeOfDay === 'morning' ? 'group-hover:text-blue-400' : 'group-hover:text-amber-400'}`} />
                )}
              </button>

              {/* Month Content - Show/Hide based on collapse state */}
              {!isCollapsed && (
                <div className="space-y-6 pl-2">
                  {Object.keys(monthData.dates)
                    .sort((a, b) => new Date(b) - new Date(a))
                    .map((date) => (
                      <div key={date} className="space-y-3">
                        {/* Date Subheader */}
                        <div className="flex items-center gap-2 pl-4">
                          <div className={`w-2 h-2 rounded-full ${timeOfDay === 'morning' ? 'bg-blue-400/50' : 'bg-amber-400/50'}`}></div>
                          <h4 className="text-sm font-medium text-zinc-400">
                            {formatDate(date)}
                          </h4>
                          <div className="flex-1 h-px bg-zinc-800/50"></div>
                        </div>

                        {/* Entries for this date */}
                        {monthData.dates[date].map((entry) => (
                          <div
                            key={entry.id}
                            className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all ml-6 ${
                              timeOfDay === 'morning' ? 'hover:border-blue-400/30' : 'hover:border-amber-400/30'
                            }`}
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
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMoreMonths && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleMonths(prev => prev + 3)}
            className={`px-6 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-300 hover:bg-zinc-800 transition-all font-medium ${
              timeOfDay === 'morning' ? 'hover:border-blue-400/30' : 'hover:border-amber-400/30'
            }`}
          >
            Load More Months ({sortedMonths.length - visibleMonths} remaining)
          </button>
        </div>
      )}

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
