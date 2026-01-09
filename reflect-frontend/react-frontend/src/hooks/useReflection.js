import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function useReflection(userId) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [completed, setCompleted] = useState(false); // NEW: Track if reflection is completed
  const [savedReflection, setSavedReflection] = useState(null); // NEW: Store saved reflection data

  useEffect(() => {
    loadTodayReflection();
  }, [userId]);

  const loadTodayReflection = async () => {
    try {
      const today = api.getTodayDate();
      const reflection = await api.getReflectionForDate(userId, today);
      
      if (reflection) {
        setAnswers([
          reflection.summary || '',
          reflection.accomplishments || '',
          reflection.improvements_to_make || ''
        ]);
        setSavedReflection(reflection);
        // If all answers are filled, consider it completed
        if (reflection.summary && reflection.accomplishments && reflection.improvements_to_make) {
          setCompleted(true);
        }
      }
    } catch (err) {
      console.error('Error loading reflection:', err);
    }
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setError(null);
  };

  const handleNext = () => {
    if (currentQuestion < 2) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitReflection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = api.getTodayDate();
      
      const reflection = await api.createOrUpdateReflection(
        userId,
        today,
        answers[0], // summary
        answers[1], // accomplishments
        answers[2]  // improvements_to_make
      );
      
      setSavedReflection(reflection);
      setSuccess(true);
      setCompleted(true); // Mark as completed
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to save reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReflection = async (summary, accomplishments, improvementsToMake) => {
    setLoading(true);
    setError(null);
    
    try {
      const today = api.getTodayDate();
      
      const reflection = await api.createOrUpdateReflection(
        userId,
        today,
        summary,
        accomplishments,
        improvementsToMake
      );
      
      setAnswers([summary, accomplishments, improvementsToMake]);
      setSavedReflection(reflection);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to update reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    currentQuestion,
    answers,
    loading,
    error,
    success,
    completed,
    savedReflection,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    handleSubmitReflection,
    handleUpdateReflection,
    setError
  };
}