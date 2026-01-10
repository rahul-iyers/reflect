import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Repeat, Trash2, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import * as api from '../services/api';

export default function TaskModal({ isOpen, onClose, userId, initialData, onSuccess }) {
  const { timeOfDay } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_date: '',
    start_time: '09:00',
    end_time: '10:00',
    is_recurring: false,
    recurrence_pattern: 'weekly'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = initialData && initialData.id;

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        task_date: initialData.task_date || '',
        start_time: initialData.start_time || '09:00',
        end_time: initialData.end_time || '10:00',
        is_recurring: initialData.is_recurring || false,
        recurrence_pattern: initialData.recurrence_pattern || 'weekly'
      });
    } else if (isOpen) {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        task_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        is_recurring: false,
        recurrence_pattern: 'weekly'
      });
    }
    setError(null);
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await api.updateScheduledTask(userId, initialData.id, formData);
      } else {
        await api.createScheduledTask(userId, formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setLoading(true);
    try {
      await api.deleteScheduledTask(userId, initialData.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await api.updateScheduledTask(userId, initialData.id, {
        is_completed: !initialData.is_completed
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-lg w-full shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-100">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all ${
                timeOfDay === 'morning' ? 'focus:border-blue-400/50' : 'focus:border-amber-400/50'
              }`}
              placeholder="e.g., Team Meeting"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all resize-none ${
                timeOfDay === 'morning' ? 'focus:border-blue-400/50' : 'focus:border-amber-400/50'
              }`}
              placeholder="Add details about this task..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Date *
            </label>
            <input
              type="date"
              value={formData.task_date}
              onChange={(e) => setFormData({ ...formData, task_date: e.target.value })}
              className={`w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none transition-all ${
                timeOfDay === 'morning' ? 'focus:border-blue-400/50' : 'focus:border-amber-400/50'
              }`}
              required
              disabled={loading}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Start Time *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className={`w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none transition-all ${
                  timeOfDay === 'morning' ? 'focus:border-blue-400/50' : 'focus:border-amber-400/50'
                }`}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Clock size={16} />
                End Time *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className={`w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none transition-all ${
                  timeOfDay === 'morning' ? 'focus:border-blue-400/50' : 'focus:border-amber-400/50'
                }`}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className={`w-5 h-5 rounded border-zinc-700 bg-zinc-800 focus:ring-offset-zinc-900 ${
                  timeOfDay === 'morning'
                    ? 'text-blue-400 focus:ring-blue-400'
                    : 'text-amber-400 focus:ring-amber-400'
                }`}
                disabled={loading}
              />
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Repeat size={16} />
                Recurring Event
              </div>
            </label>

            {formData.is_recurring && (
              <select
                value={formData.recurrence_pattern}
                onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                className={`w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none transition-all ${
                  timeOfDay === 'morning' ? 'focus:border-blue-400/50' : 'focus:border-amber-400/50'
                }`}
                disabled={loading}
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    initialData.is_completed
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                  disabled={loading}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Check size={18} />
                    {initialData.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                  disabled={loading}
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
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
              className={`flex-1 px-4 py-3 rounded-xl text-zinc-900 transition-all font-bold ${
                timeOfDay === 'morning'
                  ? 'bg-blue-400 hover:bg-blue-500'
                  : 'bg-amber-400 hover:bg-amber-500'
              }`}
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
