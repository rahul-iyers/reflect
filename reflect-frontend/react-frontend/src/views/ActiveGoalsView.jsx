import React, { useState } from 'react';
import { Target, Calendar, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ActiveGoalsView({ goals, onComplete, onDelete, loading }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-amber-400" size={48} />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
          <Target className="text-zinc-600" size={36} />
        </div>
        <h3 className="text-xl font-bold text-zinc-300 mb-2">No Active Goals</h3>
        <p className="text-zinc-500">Create your first goal to get started!</p>
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
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-amber-400/30 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Target className="text-amber-400" size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 font-medium leading-relaxed mb-2">
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
                  onClick={() => onComplete(goal.id)}
                  className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                  title="Mark as complete"
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(goal.id)}
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