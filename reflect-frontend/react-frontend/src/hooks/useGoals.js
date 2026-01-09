import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function useGoals(userId) {
  const [activeGoals, setActiveGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const active = await api.getGoals(userId, 'active');
      const completed = await api.getGoals(userId, 'completed');
      setActiveGoals(active);
      setCompletedGoals(completed);
    } catch (err) {
      console.error('Error loading goals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewGoal = async (description, deadline = null) => {
    try {
      const newGoal = await api.createGoal(userId, description, deadline);
      setActiveGoals([...activeGoals, newGoal]);
      return newGoal;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateGoalStatus = async (goalId, newStatus) => {
    try {
      const updated = await api.updateGoal(userId, goalId, { status: newStatus });
      
      if (newStatus === 'completed') {
        setActiveGoals(activeGoals.filter(g => g.id !== goalId));
        setCompletedGoals([...completedGoals, updated]);
      } else if (newStatus === 'active') {
        setCompletedGoals(completedGoals.filter(g => g.id !== goalId));
        setActiveGoals([...activeGoals, updated]);
      }
      
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    activeGoals,
    completedGoals,
    loading,
    error,
    loadGoals,
    createNewGoal,
    updateGoalStatus
  };
}