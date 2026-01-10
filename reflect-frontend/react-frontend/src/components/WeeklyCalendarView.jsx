import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Loader2, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import * as api from '../services/api';

export default function WeeklyCalendarView({ userId, onOpenTaskModal }) {
  const { timeOfDay } = useTheme();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

  useEffect(() => {
    loadWeekTasks();
  }, [currentWeek, userId]);

  const loadWeekTasks = async () => {
    setLoading(true);
    try {
      const { start, end } = api.getWeekDateRange(currentWeek);
      const data = await api.getScheduledTasks(userId, start, end);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const { sunday } = api.getWeekDateRange(currentWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays();

  const formatDayHeader = (date) => {
    const isToday = date.toDateString() === new Date().toDateString();
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday
    };
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const getTasksForDayAndHour = (date, hour) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (task.task_date !== dateStr) return false;
      const taskStartHour = parseInt(task.start_time.split(':')[0]);
      return taskStartHour === hour;
    });
  };

  const calculateTaskHeight = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return Math.max(durationMinutes / 60, 0.5); // Minimum 0.5 hour height
  };

  const handleToggleComplete = async (task) => {
    try {
      await api.updateScheduledTask(userId, task.id, {
        is_completed: !task.is_completed
      });
      await loadWeekTasks();
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  const isTaskPast = (task) => {
    const now = new Date();
    const taskDate = new Date(task.task_date + 'T' + task.end_time);
    return taskDate < now;
  };

  const handleAddTask = (date, hour) => {
    const dateStr = date.toISOString().split('T')[0];
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    onOpenTaskModal({
      task_date: dateStr,
      start_time: startTime,
      end_time: endTime
    });
  };

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

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek(-1)}
          className={`p-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 transition-all ${
            timeOfDay === 'morning' ? 'hover:text-blue-400' : 'hover:text-amber-400'
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-100">
            {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-sm text-zinc-500">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => navigateWeek(1)}
          className={`p-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 transition-all ${
            timeOfDay === 'morning' ? 'hover:text-blue-400' : 'hover:text-amber-400'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px bg-zinc-800 border border-zinc-800 rounded-t-xl overflow-hidden">
            <div className="bg-zinc-950 p-3"></div>
            {weekDays.map((day, i) => {
              const { dayName, dayNum, isToday } = formatDayHeader(day);
              return (
                <div
                  key={i}
                  className={`bg-zinc-950 p-3 text-center ${
                    isToday
                      ? timeOfDay === 'morning'
                        ? 'bg-blue-400/10'
                        : 'bg-amber-400/10'
                      : ''
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    isToday
                      ? timeOfDay === 'morning'
                        ? 'text-blue-400'
                        : 'text-amber-400'
                      : 'text-zinc-400'
                  }`}>
                    {dayName}
                  </div>
                  <div className={`text-lg font-bold ${
                    isToday
                      ? timeOfDay === 'morning'
                        ? 'text-blue-400'
                        : 'text-amber-400'
                      : 'text-zinc-200'
                  }`}>
                    {dayNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          <div className="border-l border-r border-b border-zinc-800 rounded-b-xl overflow-hidden">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[80px_repeat(7,1fr)] gap-px bg-zinc-800"
                style={{ minHeight: '80px' }}
              >
                {/* Hour Label */}
                <div className="bg-zinc-950 p-2 text-xs font-medium text-zinc-500 flex items-start justify-center pt-1">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>

                {/* Day Cells */}
                {weekDays.map((day, dayIndex) => {
                  const dayTasks = getTasksForDayAndHour(day, hour);
                  const isPast = new Date() > new Date(day.toISOString().split('T')[0] + 'T' + `${hour + 1}:00`);

                  return (
                    <div
                      key={dayIndex}
                      className={`bg-zinc-950 p-1 relative group transition-colors ${
                        isPast ? 'opacity-60' : 'hover:bg-zinc-900'
                      }`}
                    >
                      {/* Add Task Button */}
                      {dayTasks.length === 0 && (
                        <button
                          onClick={() => handleAddTask(day, hour)}
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus size={16} className={`text-zinc-600 ${
                            timeOfDay === 'morning' ? 'group-hover:text-blue-400' : 'group-hover:text-amber-400'
                          }`} />
                        </button>
                      )}

                      {/* Tasks */}
                      {dayTasks.map((task) => {
                        const height = calculateTaskHeight(task.start_time, task.end_time);
                        const taskIsPast = isTaskPast(task);

                        return (
                          <button
                            key={task.id}
                            onClick={() => onOpenTaskModal(task)}
                            className={`w-full text-left p-2 rounded-lg border transition-all ${
                              task.is_completed
                                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                                : taskIsPast
                                ? 'bg-zinc-800/50 border-zinc-700 text-zinc-500'
                                : timeOfDay === 'morning'
                                ? 'bg-blue-400/20 border-blue-400/40 text-blue-100 hover:bg-blue-400/30'
                                : 'bg-amber-400/20 border-amber-400/40 text-amber-100 hover:bg-amber-400/30'
                            }`}
                            style={{
                              height: `${height * 80}px`,
                              minHeight: '40px'
                            }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-semibold truncate ${
                                  task.is_completed ? 'line-through' : ''
                                }`}>
                                  {task.title}
                                </div>
                                <div className="text-[10px] opacity-75 mt-0.5">
                                  {task.start_time} - {task.end_time}
                                </div>
                              </div>
                              {task.is_completed && (
                                <Check size={12} className="flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
