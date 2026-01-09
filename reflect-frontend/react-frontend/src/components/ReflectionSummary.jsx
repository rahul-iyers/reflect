import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

export default function ReflectionSummary({ reflection, onUpdate, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState({
    summary: reflection?.summary || '',
    accomplishments: reflection?.accomplishments || '',
    improvements_to_make: reflection?.improvements_to_make || ''
  });

  const handleSave = async () => {
    await onUpdate(editedAnswers.summary, editedAnswers.accomplishments, editedAnswers.improvements_to_make);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedAnswers({
      summary: reflection?.summary || '',
      accomplishments: reflection?.accomplishments || '',
      improvements_to_make: reflection?.improvements_to_make || ''
    });
    setIsEditing(false);
  };

  const questions = [
    { label: 'How was your day?', field: 'summary' },
    { label: 'What did you accomplish?', field: 'accomplishments' },
    { label: 'What do you want to improve tomorrow?', field: 'improvements_to_make' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Today's Reflection Complete! ✨
          </h2>
          <p className="text-zinc-400">Here's what you reflected on today</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
          >
            <Edit2 size={18} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Reflection Content */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.field} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-amber-400">
                {index + 1}. {question.label}
              </h3>
            </div>
            
            {isEditing ? (
              <textarea
                value={editedAnswers[question.field]}
                onChange={(e) => setEditedAnswers({ ...editedAnswers, [question.field]: e.target.value })}
                className="w-full h-32 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-400/50 transition-all resize-none"
                disabled={loading}
              />
            ) : (
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {reflection?.[question.field] || <span className="text-zinc-600 italic">No answer provided</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all font-medium flex items-center gap-2"
            disabled={loading}
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 hover:shadow-lg hover:shadow-amber-500/30 transition-all font-bold flex items-center gap-2"
            disabled={loading}
          >
            <Check size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}