/**
 * api.js - Minimal API wrapper for cloud sync integration
 * 
 * This module provides a thin wrapper around fetch() to communicate with the backend API.
 * All functions handle JSON request/response and include Authorization headers when needed.
 * 
 * Configuration:
 * - Base URL can be set via window.API_BASE_URL (for build-time env injection)
 * - Falls back to http://localhost:5000/api if not set
 */

// Base URL configuration
let baseUrl = window.API_BASE_URL || 'http://localhost:5000/api';

/**
 * Set the base URL for API requests
 * @param {string} url - The base URL (e.g., 'https://api.example.com/api')
 */
export function setBaseUrl(url) {
  baseUrl = url;
  console.log('[API] Base URL set to:', baseUrl);
}

/**
 * Get the current base URL
 * @returns {string} The current base URL
 */
export function getBaseUrl() {
  return baseUrl;
}

/**
 * Helper to make fetch requests with error handling
 * @private
 */
async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  
  try {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('[API] Request failed:', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error('[API] Network error:', error.message);
    throw error;
  }
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Promise<{token: string, user: Object}>} Token and user object
 */
export async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }
  
  const response = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  
  return response.data; // { token, user }
}

/**
 * Login an existing user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<{token: string, user: Object}>} Token and user object
 */
export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  return response.data; // { token, user }
}

/**
 * Get all available topics grouped by subject
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Topics grouped by subject
 */
export async function getTopics(token) {
  if (!token) {
    throw new Error('Authentication token is required');
  }
  
  const response = await request('/tracker/topics', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
}

/**
 * Update user's progress for a specific topic
 * @param {string} token - JWT authentication token
 * @param {string} topicId - The topic ID to update
 * @param {Object} flags - Progress flags (theory, practice, pyq)
 * @param {boolean} [flags.theory] - Theory completion status
 * @param {boolean} [flags.practice] - Practice completion status
 * @param {boolean} [flags.pyq] - PYQ completion status
 * @returns {Promise<Object>} Updated progress and summary
 */
export async function updateProgress(token, topicId, flags) {
  if (!token) {
    throw new Error('Authentication token is required');
  }
  
  if (!topicId) {
    throw new Error('Topic ID is required');
  }
  
  if (!flags || typeof flags !== 'object') {
    throw new Error('Flags object is required');
  }
  
  const response = await request('/tracker/update', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicId, flags }),
  });
  
  return response.data;
}

/**
 * Get user's progress summary with statistics
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Progress summary
 */
export async function getProgressSummary(token) {
  if (!token) {
    throw new Error('Authentication token is required');
  }
  
  const response = await request('/tracker/progress-summary', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
}
