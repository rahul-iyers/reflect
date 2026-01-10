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

/**
 * Get all journal entries for a user
 */
export const getAllJournalEntries = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/journal-entries`, {
    method: 'GET',
    headers: getHeaders(userId),
  });
  return handleResponse(response);
};

/**
 * Delete a journal entry
 */
export const deleteJournalEntry = async (userId, entryId) => {
  const response = await fetch(`${API_BASE_URL}/journal-entries/${entryId}`, {
    method: 'DELETE',
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
 * Get today's date in YYYY-MM-DD format (using local timezone)
 */
export const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get yesterday's date in YYYY-MM-DD format (using local timezone)
 */
export const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

/**
 * Get start and end dates for a given month
 */
export const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

// ==================== SCHEDULED TASKS ====================

/**
 * Create a new scheduled task
 */
export const createScheduledTask = async (userId, taskData) => {
  const response = await fetch(`${API_BASE_URL}/scheduled-tasks`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify(taskData),
  });
  return handleResponse(response);
};

/**
 * Get scheduled tasks for a date range (week)
 */
export const getScheduledTasks = async (userId, startDate, endDate) => {
  const response = await fetch(
    `${API_BASE_URL}/scheduled-tasks?start_date=${startDate}&end_date=${endDate}`,
    {
      method: 'GET',
      headers: getHeaders(userId),
    }
  );
  return handleResponse(response);
};

/**
 * Update a scheduled task
 */
export const updateScheduledTask = async (userId, taskId, updates) => {
  const response = await fetch(`${API_BASE_URL}/scheduled-tasks/${taskId}`, {
    method: 'PATCH',
    headers: getHeaders(userId),
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

/**
 * Delete a scheduled task
 */
export const deleteScheduledTask = async (userId, taskId) => {
  const response = await fetch(`${API_BASE_URL}/scheduled-tasks/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders(userId),
  });
  return handleResponse(response);
};

/**
 * Get start and end dates for the current week (Sunday - Saturday)
 */
export const getWeekDateRange = (date = new Date()) => {
  const currentDate = new Date(date);
  const day = currentDate.getDay();

  // Get Sunday of current week
  const sunday = new Date(currentDate);
  sunday.setDate(currentDate.getDate() - day);

  // Get Saturday of current week
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return {
    start: sunday.toISOString().split('T')[0],
    end: saturday.toISOString().split('T')[0],
    sunday,
    saturday
  };
};

// ==================== STATS ====================

/**
 * Get user statistics (streak, total reflections)
 */
export const getUserStats = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    method: 'GET',
    headers: getHeaders(userId),
  });
  return handleResponse(response);
};