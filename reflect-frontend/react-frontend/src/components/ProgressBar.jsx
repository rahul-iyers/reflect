import React from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ProgressBar({
  currentQuestion,
  totalQuestions,
  currentDate
}) {
  const { timeOfDay } = useTheme();

  return (
    <div className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock size={20} className={timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'} />
          <div>
            <h2 className="text-sm font-medium text-zinc-300">
              {timeOfDay === 'morning' ? 'Morning Insights' : 'Evening Reflection'}
            </h2>
            <p className="text-xs text-zinc-500">{currentDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentQuestion
                    ? timeOfDay === 'morning'
                      ? 'bg-blue-400 w-6'
                      : 'bg-amber-400 w-6'
                    : i < currentQuestion
                    ? timeOfDay === 'morning'
                      ? 'bg-blue-400/50'
                      : 'bg-amber-400/50'
                    : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-500 ml-2">
            {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
      </div>
    </div>
  );
}