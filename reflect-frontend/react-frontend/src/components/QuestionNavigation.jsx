import React from 'react';
import { Loader2 } from 'lucide-react';

export default function QuestionNavigation({ 
  currentQuestion, 
  totalQuestions, 
  canProceed, 
  loading, 
  onPrevious, 
  onNext, 
  onSubmit 
}) {
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const isFirstQuestion = currentQuestion === 0;

  return (
    <div className="flex gap-4 justify-between pt-8">
      <button
        onClick={onPrevious}
        disabled={isFirstQuestion || loading}
        className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
      >
        Previous
      </button>
      
      {isLastQuestion ? (
        <button
          onClick={onSubmit}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 hover:shadow-lg hover:shadow-amber-500/30 transition-all font-bold disabled:opacity-50 flex items-center gap-2"
          disabled={!canProceed || loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Saving...
            </>
          ) : (
            'Complete Reflection ✨'
          )}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canProceed || loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 hover:shadow-lg hover:shadow-amber-500/30 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Question →
        </button>
      )}
    </div>
  );
}