import React, { useState } from 'react';
import { Moon, CheckCircle, TrendingUp, BookOpen, Calendar } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ProgressBar from './components/ProgressBar';
import ReflectionQuestion from './components/ReflectionQuestion';
import QuestionNavigation from './components/QuestionNavigation';
import Notification from './components/Notification';
import ReflectionSummary from './components/ReflectionSummary';
import GoalModal from './views/GoalModal';
import JournalModal from './views/JournalModal';
import ActiveGoalsView from './views/ActiveGoalsView';
import CompletedGoalsView from './views/CompletedGoalsView';
import JournalEntriesView from './components/JournalEntriesView';
import PreviousDaysView from './components/PreviousDaysView';
import useReflection from './hooks/useReflection';
import useGoals from './hooks/useGoals';
import * as api from './services/api';

export default function ReflectionApp() {
  const USER_ID = 1;
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('evening-reflection');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [goalLoading, setGoalLoading] = useState(false);
  const [journalLoading, setJournalLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const reflection = useReflection(USER_ID);
  const goals = useGoals(USER_ID);
  
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour >= 6 && currentHour < 18 ? 'morning' : 'evening';
  const currentStreak = 12;

  const reflectionQuestions = [
    {
      id: 1,
      question: "How was your day?",
      placeholder: "Write a brief summary of your day...",
      icon: Moon,
      subtext: "Take a moment to reflect on the highs and lows",
      field: 'summary'
    },
    {
      id: 2,
      question: "What did you accomplish?",
      placeholder: "List your wins, big or small...",
      icon: CheckCircle,
      subtext: "Celebrate your progress",
      field: 'accomplishments'
    },
    {
      id: 3,
      question: "What do you want to improve tomorrow?",
      placeholder: "One thing you'll focus on...",
      icon: TrendingUp,
      subtext: "Set your intention for tomorrow",
      field: 'improvements_to_make'
    }
  ];

  const handleViewChange = (viewId) => {
    if (viewId === 'new-goal') {
      setGoalModalOpen(true);
    } else if (viewId === 'new-journal') {
      setJournalModalOpen(true);
    } else {
      setActiveView(viewId);
    }
  };

  const handleCreateGoal = async (description, deadline) => {
    setGoalLoading(true);
    try {
      await goals.createNewGoal(description, deadline);
      setNotification({
        type: 'success',
        title: 'Goal created! 🎯',
        message: 'Your new goal has been added.'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      throw err;
    } finally {
      setGoalLoading(false);
    }
  };

  const handleCreateJournal = async (content) => {
    setJournalLoading(true);
    try {
      const today = api.getTodayDate();
      await api.createJournalEntry(USER_ID, content, today);
      setNotification({
        type: 'success',
        title: 'Journal entry saved! 📝',
        message: 'Your thoughts have been captured.'
      });
      setTimeout(() => setNotification(null), 3000);
      
      // If we're on journal view, we might want to refresh
      if (activeView === 'journal-entries') {
        // Trigger a re-render by changing key or using a refresh function
        setActiveView('journal-entries-refresh');
        setTimeout(() => setActiveView('journal-entries'), 10);
      }
    } catch (err) {
      throw err;
    } finally {
      setJournalLoading(false);
    }
  };

  const handleCompleteGoal = async (goalId) => {
    try {
      await goals.updateGoalStatus(goalId, 'completed');
      setNotification({
        type: 'success',
        title: 'Goal completed! 🎉',
        message: 'Great work on completing your goal!'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update goal'
      });
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await api.deleteGoal(USER_ID, goalId);
      await goals.loadGoals(); // Refresh goals list
      setNotification({
        type: 'success',
        title: 'Goal deleted',
        message: 'Goal has been removed.'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete goal'
      });
    }
  };

  const handleReopenGoal = async (goalId) => {
    try {
      await goals.updateGoalStatus(goalId, 'active');
      setNotification({
        type: 'success',
        title: 'Goal reopened',
        message: 'Goal moved back to active.'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to reopen goal'
      });
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'evening-reflection':
        // Show summary if completed, otherwise show questions
        if (reflection.completed) {
          return (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-8 py-16">
                {reflection.success && (
                  <Notification
                    type="success"
                    title="Reflection updated! ✨"
                    message="Your changes have been saved."
                  />
                )}
                {reflection.error && (
                  <Notification
                    type="error"
                    title="Error"
                    message={reflection.error}
                    onClose={() => reflection.setError(null)}
                  />
                )}
                <ReflectionSummary
                  reflection={reflection.savedReflection}
                  onUpdate={reflection.handleUpdateReflection}
                  loading={reflection.loading}
                />
              </div>
            </div>
          );
        }
        
        return (
          <>
            <ProgressBar
              currentQuestion={reflection.currentQuestion}
              totalQuestions={reflectionQuestions.length}
              currentDate={api.formatDate(api.getTodayDate())}
            />
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-8 py-16">
                {reflection.success && (
                  <Notification
                    type="success"
                    title="Reflection saved successfully! ✨"
                    message="Great job reflecting on your day."
                  />
                )}
                {reflection.error && (
                  <Notification
                    type="error"
                    title="Error"
                    message={reflection.error}
                    onClose={() => reflection.setError(null)}
                  />
                )}
                <ReflectionQuestion
                  question={reflectionQuestions[reflection.currentQuestion]}
                  value={reflection.answers[reflection.currentQuestion]}
                  onChange={reflection.handleAnswerChange}
                  disabled={reflection.loading}
                />
                <QuestionNavigation
                  currentQuestion={reflection.currentQuestion}
                  totalQuestions={reflectionQuestions.length}
                  canProceed={!!reflection.answers[reflection.currentQuestion]}
                  loading={reflection.loading}
                  onPrevious={reflection.handlePrevious}
                  onNext={reflection.handleNext}
                  onSubmit={reflection.handleSubmitReflection}
                />
              </div>
            </div>
          </>
        );

      case 'active-goals':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-16">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Active Goals
                </h1>
                <p className="text-zinc-400">Track and manage your current goals</p>
              </div>
              <ActiveGoalsView
                goals={goals.activeGoals}
                onComplete={handleCompleteGoal}
                onDelete={handleDeleteGoal}
                loading={goals.loading}
              />
            </div>
          </div>
        );

      case 'completed-goals':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-16">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Completed Goals
                </h1>
                <p className="text-zinc-400">Celebrate your achievements</p>
              </div>
              <CompletedGoalsView
                goals={goals.completedGoals}
                onReopen={handleReopenGoal}
                loading={goals.loading}
              />
            </div>
          </div>
        );

      case 'journal-entries':
      case 'journal-entries-refresh':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-16">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Journal Entries
                </h1>
                <p className="text-zinc-400">Your thoughts and reflections over time</p>
              </div>
              <JournalEntriesView userId={USER_ID} key={activeView} />
            </div>
          </div>
        );

      case 'previous-days':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-8 py-16">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-amber-400" size={32} />
                  <h1 className="text-4xl font-bold text-zinc-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Previous Days
                  </h1>
                </div>
                <p className="text-zinc-400">Browse your past reflections</p>
              </div>
              <PreviousDaysView userId={USER_ID} />
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-zinc-600" size={36} />
              </div>
              <h1 className="text-3xl font-bold text-zinc-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Coming Soon
              </h1>
              <p className="text-zinc-400">AI-powered insights are under development</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Updated sidebar items to include journal entries
  const sidebarItemsConfig = [
    { 
      id: 'evening-reflection', 
      label: timeOfDay === 'evening' ? 'Tonight\'s Reflection' : 'Morning Insights', 
      icon: timeOfDay === 'evening' ? Moon : TrendingUp,
      badge: timeOfDay === 'evening' ? 'Now' : null,
      highlight: true
    },
    { type: 'divider' },
    { id: 'new-goal', label: 'New Goal', icon: Plus, action: true },
    { id: 'new-journal', label: 'New Journal Entry', icon: PenSquare, action: true },
    { type: 'divider' },
    { id: 'journal-entries', label: 'Journal Entries', icon: BookOpen },
    { id: 'active-goals', label: 'Active Goals', icon: Target, badge: goals.activeGoals.length || null },
    { id: 'completed-goals', label: 'Completed Goals', icon: CheckCircle, badge: goals.completedGoals.length || null },
    { id: 'previous-days', label: 'Previous Days', icon: Calendar },
    { id: 'insights', label: 'AI Insights', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeView={activeView}
        onViewChange={handleViewChange}
        currentStreak={currentStreak}
        activeGoalsCount={goals.activeGoals.length}
        completedGoalsCount={goals.completedGoals.length}
        timeOfDay={timeOfDay}
        userId={USER_ID}
      />

      <main className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <div className="h-screen flex flex-col bg-zinc-950">
          {notification && (
            <div className="absolute top-4 right-4 z-50 animate-fade-in">
              <div className="bg-zinc-900 border border-amber-400/20 rounded-xl shadow-2xl">
                <Notification
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  onClose={() => setNotification(null)}
                />
              </div>
            </div>
          )}

          {renderContent()}
        </div>
      </main>

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
        loading={goalLoading}
      />

      <JournalModal
        isOpen={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        onSubmit={handleCreateJournal}
        loading={journalLoading}
      />
    </div>
  );
}