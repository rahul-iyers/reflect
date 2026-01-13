import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import * as api from '../services/api';

export default function PreviousDaysView({ userId }) {
  const { timeOfDay } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reflections, setReflections] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState(null);

  useEffect(() => {
    loadReflectionsForMonth();
  }, [currentDate, userId]);

  const loadReflectionsForMonth = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const range = api.getMonthDateRange(year, month);
      
      const data = await api.getReflectionsInRange(userId, range.start, range.end);
      
      // Convert array to object keyed by date
      const reflectionsMap = {};
      data.forEach(r => {
        reflectionsMap[r.reflection_date] = r;
      });
      setReflections(reflectionsMap);
    } catch (err) {
      console.error('Error loading reflections:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getDateString = (day) => {
    if (!day) return null;
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasReflection = (day) => {
    if (!day) return false;
    const dateString = getDateString(day);
    return reflections[dateString] != null;
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dateString = getDateString(day);
    const reflection = reflections[dateString];
    if (reflection) {
      setSelectedReflection(reflection);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatReflectionDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-100" style={{ fontFamily: "'Playfair Display', serif" }}>
          {monthYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className={`animate-spin ${timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'}`} size={36} />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const hasRefl = hasReflection(day);
              const today = isToday(day);
              
              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!day || !hasRefl}
                  className={`
                    aspect-square rounded-lg p-2 text-sm font-medium transition-all
                    ${!day ? 'invisible' : ''}
                    ${today ? `ring-2 ${timeOfDay === 'morning' ? 'ring-blue-400' : 'ring-amber-400'}` : ''}
                    ${hasRefl
                      ? timeOfDay === 'morning'
                        ? 'bg-gradient-to-br from-blue-400/20 to-sky-500/20 border border-blue-400/30 text-blue-400 hover:from-blue-400/30 hover:to-sky-500/30 cursor-pointer'
                        : 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 text-amber-400 hover:from-amber-400/30 hover:to-orange-500/30 cursor-pointer'
                      : 'bg-zinc-800/30 text-zinc-600 cursor-default'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${
            timeOfDay === 'morning'
              ? 'bg-gradient-to-br from-blue-400/20 to-sky-500/20 border border-blue-400/30'
              : 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30'
          }`}></div>
          <span>Has reflection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-800/30"></div>
          <span>No reflection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-amber-400"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Reflection Detail Modal */}
      {selectedReflection && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-zinc-900 rounded-2xl border max-w-2xl w-full shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto ${
            timeOfDay === 'morning'
              ? 'border-blue-400/20 shadow-blue-500/10'
              : 'border-amber-400/20 shadow-amber-500/10'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <div>
                <h3 className="text-2xl font-bold text-zinc-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {formatReflectionDate(selectedReflection.reflection_date)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReflection(null)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className={`font-semibold mb-2 ${timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'}`}>How was your day?</h4>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedReflection.summary || <span className="text-zinc-600 italic">No answer</span>}
                  </p>
                </div>

                <div>
                  <h4 className={`font-semibold mb-2 ${timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'}`}>What did you accomplish?</h4>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedReflection.accomplishments || <span className="text-zinc-600 italic">No answer</span>}
                  </p>
                </div>

                <div>
                  <h4 className={`font-semibold mb-2 ${timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'}`}>What to improve tomorrow?</h4>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedReflection.improvements_to_make || <span className="text-zinc-600 italic">No answer</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}