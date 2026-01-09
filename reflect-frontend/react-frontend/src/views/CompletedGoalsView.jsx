import React from 'react';
import { CheckCircle, Undo2, Calendar, Loader2 } from 'lucide-react';

export default function CompletedGoalsView({ goals, onReopen, loading }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
          <CheckCircle className="text-zinc-600" size={36} />
        </div>
        <h3 className="text-xl font-bold text-zinc-300 mb-2">No Completed Goals Yet</h3>
        <p className="text-zinc-500">Complete some active goals to see them here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 text-center">
        <p className="text-amber-400 font-semibold text-lg">
          🎉 {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'} Completed!
        </p>
      </div>

      {goals.map((goal) => (
        <div
          key={goal.id}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 opacity-75 hover:opacity-100 hover:border-green-500/30 transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
              <CheckCircle className="text-green-400" size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 font-medium leading-relaxed mb-2 line-through decoration-zinc-600">
                {goal.description}
              </p>
              
              {goal.created_at && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar size={14} />
                  <span>Completed on {formatDate(goal.created_at)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onReopen(goal.id)}
              className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all opacity-0 group-hover:opacity-100"
              title="Reopen goal"
            >
              <Undo2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}