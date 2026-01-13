import React, { useState, useEffect } from 'react';
import { Sunrise, Target, TrendingUp, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import * as api from '../services/api';

export default function MorningInsights({ userId, onNavigate }) {
  const { timeOfDay } = useTheme();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [activeGoals, setActiveGoals] = useState([]);
  const [yesterdayReflection, setYesterdayReflection] = useState(null);

  useEffect(() => {
    loadMorningData();
  }, [userId]);

  const loadMorningData = async () => {
    setLoading(true);
    try {
      // Call AI insights API endpoint
      const aiInsights = await api.getMorningInsights(userId);
      setInsights(aiInsights);

      // Still load goals for display purposes
      const goalsData = await api.getGoals(userId, 'active');
      setActiveGoals(goalsData);

      // Load yesterday's reflection for reference
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      try {
        const reflection = await api.getReflectionForDate(userId, yesterdayDate);
        setYesterdayReflection(reflection);
      } catch (err) {
        // No reflection from yesterday is okay
        console.log('No reflection from yesterday');
      }
    } catch (err) {
      console.error('Error loading morning data:', err);
      // Fall back to local insights generation if API fails
      const goalsData = await api.getGoals(userId, 'active');
      setActiveGoals(goalsData);
      generateInsights(goalsData, null);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (goals, reflection) => {
    // TODO: Replace with actual AI API call
    // For now, generate simple insights based on available data
    const insightsList = [];

    // Insight about goals
    if (goals && goals.length > 0) {
      const urgentGoals = goals.filter(goal => {
        if (!goal.deadline) return false;
        const deadline = new Date(goal.deadline);
        const today = new Date();
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      });

      if (urgentGoals.length > 0) {
        insightsList.push({
          type: 'goal',
          icon: Target,
          title: 'Focus on Urgent Goals',
          message: `You have ${urgentGoals.length} goal${urgentGoals.length > 1 ? 's' : ''} with deadline${urgentGoals.length > 1 ? 's' : ''} this week. Consider prioritizing: ${urgentGoals[0].description}`,
          color: timeOfDay === 'morning' ? 'blue' : 'amber'
        });
      } else if (goals.length > 0) {
        insightsList.push({
          type: 'goal',
          icon: Target,
          title: 'Keep Your Goals in Mind',
          message: `You have ${goals.length} active goal${goals.length > 1 ? 's' : ''}. Today's a great day to make progress on: ${goals[0].description}`,
          color: timeOfDay === 'morning' ? 'blue' : 'amber'
        });
      }
    }

    // Insight from yesterday's reflection
    if (reflection && reflection.improvements_to_make) {
      insightsList.push({
        type: 'improvement',
        icon: TrendingUp,
        title: 'Yesterday\'s Intention',
        message: `You wanted to improve: "${reflection.improvements_to_make}". Let's make today count!`,
        color: timeOfDay === 'morning' ? 'sky' : 'orange'
      });
    }

    // General motivational insight
    insightsList.push({
      type: 'motivation',
      icon: Sparkles,
      title: 'Start Strong',
      message: 'Small, consistent actions lead to big results. Focus on making today 1% better than yesterday.',
      color: timeOfDay === 'morning' ? 'indigo' : 'yellow'
    });

    setInsights(insightsList);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className={`animate-spin ${timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'}`} size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
          timeOfDay === 'morning'
            ? 'bg-gradient-to-br from-blue-400/20 to-sky-500/20 border border-blue-400/30'
            : 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30'
        }`}>
          <Sunrise className={timeOfDay === 'morning' ? 'text-blue-400' : 'text-amber-400'} size={32} />
        </div>
        <h1 className={`text-4xl font-bold mb-2 ${
          timeOfDay === 'morning' ? 'text-zinc-100' : 'text-zinc-100'
        }`} style={{ fontFamily: "'Playfair Display', serif" }}>
          Good {timeOfDay === 'morning' ? 'Morning' : 'Evening'}!
        </h1>
        <p className={timeOfDay === 'morning' ? 'text-zinc-400' : 'text-zinc-400'}>
          Here's what to keep in mind for today
        </p>
      </div>

      {/* AI Insights */}
      {insights && insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`rounded-xl p-6 transition-all ${
                timeOfDay === 'morning'
                  ? insight.color === 'blue' ? 'bg-zinc-900/50 border border-blue-800/30 hover:border-blue-400/30' :
                    insight.color === 'sky' ? 'bg-zinc-900/50 border border-sky-800/30 hover:border-sky-400/30' :
                    insight.color === 'indigo' ? 'bg-zinc-900/50 border border-indigo-800/30 hover:border-indigo-400/30' :
                    'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700'
                  : insight.color === 'blue' ? 'bg-zinc-900/50 border border-blue-800/30 hover:border-blue-400/30' :
                    insight.color === 'amber' ? 'bg-zinc-900/50 border border-amber-800/30 hover:border-amber-400/30' :
                    insight.color === 'sky' ? 'bg-zinc-900/50 border border-sky-800/30 hover:border-sky-400/30' :
                    insight.color === 'orange' ? 'bg-zinc-900/50 border border-orange-800/30 hover:border-orange-400/30' :
                    insight.color === 'indigo' ? 'bg-zinc-900/50 border border-indigo-800/30 hover:border-indigo-400/30' :
                    'bg-zinc-900/50 border border-yellow-800/30 hover:border-yellow-400/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  insight.color === 'blue' ? 'bg-blue-400/20 border border-blue-400/30' :
                  insight.color === 'amber' ? 'bg-amber-400/20 border border-amber-400/30' :
                  insight.color === 'sky' ? 'bg-sky-400/20 border border-sky-400/30' :
                  insight.color === 'orange' ? 'bg-orange-400/20 border border-orange-400/30' :
                  insight.color === 'indigo' ? 'bg-indigo-400/20 border border-indigo-400/30' :
                  'bg-yellow-400/20 border border-yellow-400/30'
                }`}>
                  <insight.icon className={
                    insight.color === 'blue' ? 'text-blue-400' :
                    insight.color === 'amber' ? 'text-amber-400' :
                    insight.color === 'sky' ? 'text-sky-400' :
                    insight.color === 'orange' ? 'text-orange-400' :
                    insight.color === 'indigo' ? 'text-indigo-400' :
                    'text-yellow-400'
                  } size={24} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 ${
                    timeOfDay === 'morning' ? 'text-zinc-100' : 'text-zinc-100'
                  }`}>
                    {insight.title}
                  </h3>
                  <p className={`leading-relaxed ${
                    timeOfDay === 'morning' ? 'text-zinc-400' : 'text-zinc-400'
                  }`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            timeOfDay === 'morning'
              ? 'bg-zinc-800/50 border border-zinc-700'
              : 'bg-zinc-800/50 border border-zinc-700'
          }`}>
            <Lightbulb className={timeOfDay === 'morning' ? 'text-blue-400' : 'text-zinc-600'} size={36} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            timeOfDay === 'morning' ? 'text-zinc-300' : 'text-zinc-300'
          }`}>No Insights Yet</h3>
          <p className={timeOfDay === 'morning' ? 'text-zinc-500' : 'text-zinc-500'}>
            Set some goals and complete reflections to get personalized insights
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`border-t pt-6 ${
        timeOfDay === 'morning' ? 'border-zinc-800' : 'border-zinc-800'
      }`}>
        <p className={`text-sm text-center mb-4 ${
          timeOfDay === 'morning' ? 'text-zinc-500' : 'text-zinc-500'
        }`}>Ready to plan your day?</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('weekly-plan')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              timeOfDay === 'morning'
                ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            Open Planner
          </button>
        </div>
      </div>
    </div>
  );
}
