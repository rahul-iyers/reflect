import React from 'react';

export default function ReflectionQuestion({ 
  question, 
  value, 
  onChange, 
  disabled = false 
}) {
  const Icon = question.icon;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
          <Icon className="text-amber-400" size={36} />
        </div>
      </div>

      {/* Question */}
      <div className="text-center space-y-3">
        <h1 
          className="text-4xl md:text-5xl font-bold text-zinc-100 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {question.question}
        </h1>
        <p className="text-zinc-400 text-lg">
          {question.subtext}
        </p>
      </div>

      {/* Answer Textarea */}
      <div className="mt-12">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full h-64 px-6 py-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 focus:bg-zinc-900 transition-all resize-none text-lg leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif" }}
          disabled={disabled}
        />
        <p className="text-xs text-zinc-600 mt-2 text-right">
          {value.length} characters
        </p>
      </div>
    </div>
  );
}