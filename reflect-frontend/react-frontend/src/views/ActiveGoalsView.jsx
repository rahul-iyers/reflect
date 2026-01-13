import React, { useState } from 'react';
import { Target, Calendar, CheckCircle, Trash2, Loader2, Edit2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import GoalModal from './GoalModal';
import { useTheme } from '../contexts/ThemeContext';

export default function ActiveGoalsView({ goals, onComplete, onDelete, onUpdate, loading }) {
  const { timeOfDay } = useTheme();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [updating, setUpdating] = useState(false);

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-400' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-400' };
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: 'text-yellow-400' };
    return { text: date.toLocaleDateString(), color: 'text-zinc-400' };
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await onDelete(deleteConfirm);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting goal:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (description, deadline) => {
    if (!editingGoal) return;

    setUpdating(true);
    try {
      await onUpdate(editingGoal.id, { description, deadline });
      setEditingGoal(null);
    } catch (err) {
      console.error('Error updating goal:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className={`animate-spin ${timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'}`} size={48} />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          timeOfDay === 'morning'
            ? 'bg-zinc-800/50 border border-zinc-700'
            : 'bg-zinc-800/50 border border-zinc-700'
        }`}>
          <Target className={timeOfDay === 'morning' ? 'text-blue-400' : 'text-zinc-600'} size={36} />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${
          timeOfDay === 'morning' ? 'text-zinc-300' : 'text-zinc-300'
        }`}>No Active Goals</h3>
        <p className={timeOfDay === 'morning' ? 'text-zinc-500' : 'text-zinc-500'}>
          Create your first goal to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const deadlineInfo = goal.deadline ? formatDeadline(goal.deadline) : null;

        return (
          <div
            key={goal.id}
            className={`rounded-xl p-4 transition-all group cursor-pointer ${
              timeOfDay === 'morning'
                ? 'bg-zinc-900/50 border border-zinc-800 hover:border-blue-400/30'
                : 'bg-zinc-900/50 border border-zinc-800 hover:border-amber-400/30'
            }`}
            onClick={() => setEditingGoal(goal)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                timeOfDay === 'morning'
                  ? 'bg-gradient-to-br from-blue-400/20 to-sky-500/20 border border-blue-400/30'
                  : 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30'
              }`}>
                <Target className={timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'} size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-medium leading-relaxed mb-2 ${
                  timeOfDay === 'morning' ? 'text-zinc-200' : 'text-zinc-200'
                }`}>
                  {goal.description}
                </p>

                {deadlineInfo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className={deadlineInfo.color} />
                    <span className={deadlineInfo.color}>
                      {deadlineInfo.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingGoal(goal);
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    timeOfDay === 'morning'
                      ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                  title="Edit goal"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(goal.id);
                  }}
                  className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                  title="Mark as complete"
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(goal.id);
                  }}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  title="Delete goal"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Edit Modal */}
      {editingGoal && (
        <GoalModal
          isOpen={true}
          onClose={() => setEditingGoal(null)}
          onSubmit={handleUpdate}
          loading={updating}
          initialDescription={editingGoal.description}
          initialDeadline={editingGoal.deadline || ''}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}