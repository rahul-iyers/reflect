import React, { useState } from 'react';
import { Sunrise, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import MorningInsights from './MorningInsights';

export default function DailyReflectionTabs({
  userId,
  reflectionContent,
  initialTab = 'insights',
  onNavigate
}) {
  const { timeOfDay } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    {
      id: 'insights',
      label: 'Morning Insights',
      icon: Sunrise
    },
    {
      id: 'reflection',
      label: 'Evening Reflection',
      icon: Moon
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-center gap-2 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
                isActive
                  ? timeOfDay === 'morning'
                    ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10'
                    : 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'insights' ? (
          <MorningInsights userId={userId} onNavigate={onNavigate} />
        ) : (
          reflectionContent
        )}
      </div>
    </div>
  );
}
