// API Service for connecting to Flask backend
// Base URL - adjust this based on your Flask server configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Helper function to get headers with user ID
const getHeaders = (userId) => ({
  'Content-Type': 'application/json',
  'X-User-Id': userId.toString(),
});

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};

// ==================== REFLECTIONS ====================

/**
 * Create or update a daily reflection
 */
export const createOrUpdateReflection = async (userId, reflectionDate, summary, accomplishments, improvementsToMake) => {
  const response = await fetch(`${API_BASE_URL}/reflections`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify({
      reflection_date: reflectionDate,
      summary,
      accomplishments,
      improvements_to_make: improvementsToMake,
    }),
  });
  return handleResponse(response);
};

/**
 * Get reflection for a specific date
 */
export const getReflectionForDate = async (userId, date) => {
  const response = await fetch(`${API_BASE_URL}/reflections?date=${date}`, {
    method: 'GET',
    headers: getHeaders(userId),
  });
  return handleResponse(response);
};

/**
 * Get reflections in a date range
 */
export const getReflectionsInRange = async (userId, startDate, endDate) => {
  const response = await fetch(`${API_BASE_URL}/reflections?start=${startDate}&end=${endDate}`, {
    method: 'GET',
    headers: getHeaders(userId),
  });
  return handleResponse(response);
};

// ==================== JOURNAL ENTRIES ====================

/**
 * Create a journal entry
 */
export const createJournalEntry = async (userId, content, entryDate, reflectionId = null) => {
  const response = await fetch(`${API_BASE_URL}/journal-entries`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify({
      content,
      entry_date: entryDate,
      reflection_id: reflectionId,
    }),
  });
  return handleResponse(response);
};

/**
 * Get journal entries for a specific date
 */
export const getJournalEntriesForDate = async (userId, date) => {
  const response = await fetch(`${API_BASE_URL}/journal-entries?date=${date}`, {
    method: 'GET',
    headers: getHeaders(userId),
  });
  return handleResponse(response);
};

// ==================== GOALS ====================

/**
 * Create a new goal
 */
export const createGoal = async (userId, description, deadline = null) => {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify({
      description,
      deadline,
    }),
  });
  return handleResponse(response);
};

/**
 * Get goals for a user
 */
export const getGoals = async (userId, status = null) => {
  const url = status 
    ? `${API_BASE_URL}/goals?status=${status}`
    : `${API_BASE_URL}/goals`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(userId),
  });
  return handleResponse(response);
};

/**
 * Update a goal
 */
export const updateGoal = async (userId, goalId, updates) => {
  const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
    method: 'PATCH',
    headers: getHeaders(userId),
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

export const deleteGoal = async (userId, goalId) => {
  const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
    method: 'DELETE',
    headers: getHeaders(userId),
  });
  return handleResponse(response);
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};