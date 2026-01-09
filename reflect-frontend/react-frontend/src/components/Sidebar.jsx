import React from 'react';
import { 
  Menu, X, BookOpen, Target, CheckCircle, Calendar, 
  TrendingUp, PenSquare, Sunrise, Moon, Plus, ChevronRight
} from 'lucide-react';

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  activeView, 
  onViewChange,
  currentStreak,
  activeGoalsCount,
  completedGoalsCount,
  timeOfDay,
  userId
}) {
  const sidebarItems = [
    { 
      id: 'evening-reflection', 
      label: timeOfDay === 'evening' ? 'Tonight\'s Reflection' : 'Morning Insights', 
      icon: timeOfDay === 'evening' ? Moon : Sunrise,
      badge: timeOfDay === 'evening' ? 'Now' : null,
      highlight: true
    },
    { type: 'divider' },
    { id: 'new-goal', label: 'New Goal', icon: Plus, action: true },
    { id: 'new-journal', label: 'New Journal Entry', icon: PenSquare, action: true },
    { type: 'divider' },
    { id: 'active-goals', label: 'Active Goals', icon: Target, badge: activeGoalsCount || null },
    { id: 'completed-goals', label: 'Completed Goals', icon: CheckCircle, badge: completedGoalsCount || null },
    { id: 'previous-days', label: 'Previous Days', icon: Calendar },
    { id: 'insights', label: 'AI Insights', icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 text-amber-400 hover:bg-zinc-800 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950
          border-r border-amber-400/20 backdrop-blur-xl
          transition-all duration-500 ease-out z-40
          ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
        `}
      >
        {/* Decorative glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-amber-400/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <BookOpen className="text-zinc-900" size={20} />
              </div>
              {isOpen && (
                <div>
                  <h1 className="text-xl font-bold text-amber-400 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Reflect
                  </h1>
                  <p className="text-xs text-zinc-500">
                    Day {currentStreak}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Streak Badge */}
          {isOpen && (
            <div className="px-4 py-4">
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400 uppercase tracking-wider">Current Streak</p>
                    <p className="text-2xl font-bold text-amber-400">{currentStreak} days</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto">  
            <ul className="space-y-1">
              {sidebarItems.map((item, index) => {
                if (item.type === 'divider') {
                  return (
                    <li key={`divider-${index}`} className="py-2">
                      <div className="border-t border-zinc-800"></div>
                    </li>
                  );
                }

                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-300 group relative overflow-hidden
                        ${isActive 
                          ? 'bg-gradient-to-r from-amber-400/20 to-orange-400/10 text-amber-400 shadow-lg shadow-amber-500/10' 
                          : item.highlight
                            ? 'text-amber-300 bg-amber-500/5 hover:bg-amber-500/10'
                            : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50'
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full"></div>
                      )}
                      
                      <Icon size={20} />
                      
                      {isOpen && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">
                            {item.label}
                          </span>
                          
                          {item.badge && (
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                              item.badge === 'Now' 
                                ? 'bg-amber-500 text-zinc-900' 
                                : 'bg-zinc-700 text-zinc-300'
                            }`}>
                              {item.badge}
                            </span>
                          )}

                          {item.action && (
                            <ChevronRight size={16} className="opacity-50" />
                          )}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer - User */}
          <div className="p-4 border-t border-amber-400/20">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-all cursor-pointer ${!isOpen && 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-semibold shadow-lg">
                JS
              </div>
              {isOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-200">Jane Smith</p>
                  <p className="text-xs text-zinc-500">User #{userId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}