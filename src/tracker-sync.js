/**
 * tracker-sync.js - Local to Cloud Sync Logic
 * 
 * This module syncs local localStorage data to the backend server.
 * 
 * ASSUMPTIONS (based on state.js analysis):
 * - Syllabus progress stored in localStorage key: "yash_syllabus_progress_v9"
 * - Structure: { [subject]: { [chapter]: { status, progress, ... } } }
 * - Backend expects: topicId (subject:chapter format) and flags { theory, practice, pyq }
 * 
 * The sync process:
 * 1. Check for valid token (prompt login if missing)
 * 2. Read syllabus progress from localStorage
 * 3. For each subject/chapter with progress, call updateProgress API
 * 4. Return summary { uploadedCount, failedCount, errors[] }
 * 
 * Non-destructive: Only reads from localStorage, writes to backend.
 */

import { getToken } from './auth.js';
import { updateProgress, getProgressSummary } from './lib/api.js';

// localStorage key from state.js
const SYLLABUS_PROGRESS_KEY = 'yash_syllabus_progress_v9';

/**
 * Sync local syllabus progress to the cloud
 * @returns {Promise<{uploadedCount: number, failedCount: number, errors: Array}>}
 */
export async function syncLocalToServer() {
  console.log('[Sync] Starting local to cloud sync...');
  
  const token = getToken();
  if (!token) {
    console.warn('[Sync] No auth token found - user needs to login');
    throw new Error('Not authenticated. Please login first.');
  }
  
  // Read local syllabus progress
  const syllabusProgress = getLocalSyllabusProgress();
  
  if (!syllabusProgress || Object.keys(syllabusProgress).length === 0) {
    console.log('[Sync] No local progress data to sync');
    return {
      uploadedCount: 0,
      failedCount: 0,
      errors: [],
      message: 'No local progress data to sync'
    };
  }
  
  // Convert localStorage structure to API format and sync
  const results = await syncProgressData(token, syllabusProgress);
  
  console.log('[Sync] Sync completed:', results);
  return results;
}

/**
 * Read syllabus progress from localStorage
 * @returns {Object} Syllabus progress data
 */
function getLocalSyllabusProgress() {
  try {
    const data = localStorage.getItem(SYLLABUS_PROGRESS_KEY);
    if (!data) {
      console.log('[Sync] No syllabus progress found in localStorage');
      return {};
    }
    
    const progress = JSON.parse(data);
    console.log('[Sync] Loaded local progress:', Object.keys(progress));
    return progress;
  } catch (error) {
    console.error('[Sync] Failed to read local progress:', error);
    return {};
  }
}

/**
 * Sync progress data to the backend
 * @param {string} token - Auth token
 * @param {Object} syllabusProgress - Local syllabus progress data
 * @returns {Promise<Object>} Sync results
 */
async function syncProgressData(token, syllabusProgress) {
  const results = {
    uploadedCount: 0,
    failedCount: 0,
    errors: []
  };
  
  // Iterate through subjects and chapters
  for (const subject of Object.keys(syllabusProgress)) {
    const chapters = syllabusProgress[subject];
    
    for (const chapter of Object.keys(chapters)) {
      const chapterData = chapters[chapter];
      
      // Skip if no meaningful progress
      if (!chapterData.status || chapterData.status === 'pending') {
        console.log(`[Sync] Skipping ${subject}:${chapter} - no progress`);
        continue;
      }
      
      try {
        // Convert to backend format
        const topicId = `${subject}:${chapter}`;
        const flags = convertToApiFlags(chapterData);
        
        console.log(`[Sync] Uploading ${topicId}:`, flags);
        
        // Call API to update progress
        await updateProgress(token, topicId, flags);
        
        results.uploadedCount++;
        console.log(`[Sync] ✓ Uploaded ${topicId}`);
      } catch (error) {
        console.error(`[Sync] ✗ Failed to upload ${subject}:${chapter}:`, error);
        results.failedCount++;
        results.errors.push({
          subject,
          chapter,
          error: error.message
        });
      }
    }
  }
  
  return results;
}

/**
 * Convert local chapter data to API flags format
 * 
 * Backend expects: { theory?: boolean, practice?: boolean, pyq?: boolean }
 * Local data has: { status: 'pending'|'in-progress'|'done', progress: number, ... }
 * 
 * Conversion logic:
 * - If status is 'done', set all flags to true
 * - If status is 'in-progress', set based on progress percentage
 * - Otherwise, set all to false
 * 
 * @param {Object} chapterData - Local chapter progress data
 * @returns {Object} API flags object
 */
function convertToApiFlags(chapterData) {
  const flags = {
    theory: false,
    practice: false,
    pyq: false
  };
  
  // If chapter is marked as done, set all flags
  if (chapterData.status === 'done') {
    flags.theory = true;
    flags.practice = true;
    flags.pyq = true;
  } 
  // If in progress, mark theory as done and practice based on progress
  else if (chapterData.status === 'in-progress') {
    flags.theory = true;
    
    // If more than 50% progress, mark practice as done
    if (chapterData.progress && chapterData.progress > 50) {
      flags.practice = true;
    }
    
    // If more than 80% progress, mark pyq as done
    if (chapterData.progress && chapterData.progress > 80) {
      flags.pyq = true;
    }
  }
  
  return flags;
}

/**
 * Get progress summary from backend (after sync)
 * @returns {Promise<Object>} Progress summary
 */
export async function getCloudProgressSummary() {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated. Please login first.');
  }
  
  return await getProgressSummary(token);
}

/**
 * Format sync results for display
 * @param {Object} results - Sync results
 * @returns {string} Formatted message
 */
export function formatSyncResults(results) {
  if (results.uploadedCount === 0 && results.failedCount === 0) {
    return results.message || 'No data to sync';
  }
  
  let message = `✅ Synced ${results.uploadedCount} items`;
  
  if (results.failedCount > 0) {
    message += `\n❌ Failed: ${results.failedCount} items`;
    
    if (results.errors && results.errors.length > 0) {
      message += '\n\nErrors:';
      results.errors.slice(0, 3).forEach(err => {
        message += `\n- ${err.subject}:${err.chapter} - ${err.error}`;
      });
      
      if (results.errors.length > 3) {
        message += `\n... and ${results.errors.length - 3} more`;
      }
    }
  }
  
  return message;
}
