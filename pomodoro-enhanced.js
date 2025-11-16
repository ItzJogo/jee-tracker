// -------------------------------------------------------------
// POMODORO-ENHANCED.JS — Professional Pomodoro with Persistence
// -------------------------------------------------------------
// Features:
// - Single interval management
// - localStorage persistence (reload-safe)
// - Session logging with timestamps
// - Auto-start cycles
// - Subject tracking

const POMO_STATE_KEY = 'jee_pomo_state_v1';
const POMO_SESSIONS_KEY = 'jee_pomo_sessions_v1';

// State Model
let pomoState = {
  endTs: null,              // Timestamp when current session ends (null = idle)
  type: 'idle',             // 'focus' | 'break' | 'idle'
  durationMin: 25,          // Duration in minutes
  autoStart: false,         // Auto-start next session
  currentSubject: null,     // Subject being studied (for focus sessions)
  sessionStartTs: null      // When current session started
};

let timerInterval = null;
let pomoTimerEl = null;
let miniTimerEl = null;

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------

export function initEnhancedPomodoro(pomoTimerElement, miniTimerElement) {
  pomoTimerEl = pomoTimerElement;
  miniTimerEl = miniTimerElement;
  
  // Load persisted state
  loadPomoState();
  
  // Restore running timer if applicable
  if (pomoState.endTs && pomoState.endTs > Date.now()) {
    startTimerInterval();
  } else if (pomoState.endTs && pomoState.endTs <= Date.now()) {
    // Session finished while app was closed
    handleSessionComplete();
  }
  
  // Update display
  updateTimerDisplay();
  
  console.log('✅ Enhanced Pomodoro initialized', pomoState);
}

// -------------------------------------------------------------
// STATE PERSISTENCE
// -------------------------------------------------------------

function savePomoState() {
  try {
    localStorage.setItem(POMO_STATE_KEY, JSON.stringify(pomoState));
  } catch (e) {
    console.error('Failed to save pomodoro state', e);
  }
}

function loadPomoState() {
  try {
    const saved = localStorage.getItem(POMO_STATE_KEY);
    if (saved) {
      pomoState = { ...pomoState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load pomodoro state', e);
  }
}

// -------------------------------------------------------------
// SESSION LOGGING
// -------------------------------------------------------------

function logSession(sessionData) {
  try {
    const sessions = JSON.parse(localStorage.getItem(POMO_SESSIONS_KEY) || '[]');
    sessions.push({
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTs: sessionData.startTs,
      endTs: sessionData.endTs,
      subject: sessionData.subject || null,
      type: sessionData.type, // 'focus' | 'break'
      durationMin: sessionData.durationMin,
      completed: true,
      date: new Date(sessionData.endTs).toISOString().split('T')[0]
    });
    
    // Keep only last 1000 sessions (performance)
    if (sessions.length > 1000) {
      sessions.splice(0, sessions.length - 1000);
    }
    
    localStorage.setItem(POMO_SESSIONS_KEY, JSON.stringify(sessions));
    console.log('📝 Session logged:', sessions[sessions.length - 1]);
    
    return sessions[sessions.length - 1];
  } catch (e) {
    console.error('Failed to log session', e);
    return null;
  }
}

export function getSessions(filters = {}) {
  try {
    let sessions = JSON.parse(localStorage.getItem(POMO_SESSIONS_KEY) || '[]');
    
    // Apply filters
    if (filters.type) {
      sessions = sessions.filter(s => s.type === filters.type);
    }
    if (filters.subject) {
      sessions = sessions.filter(s => s.subject === filters.subject);
    }
    if (filters.startDate) {
      sessions = sessions.filter(s => s.date >= filters.startDate);
    }
    if (filters.endDate) {
      sessions = sessions.filter(s => s.date <= filters.endDate);
    }
    
    return sessions;
  } catch (e) {
    console.error('Failed to get sessions', e);
    return [];
  }
}

export function getSessionStats(days = 7) {
  const sessions = getSessions();
  const today = new Date();
  const stats = {
    totalSessions: 0,
    totalMinutes: 0,
    focusSessions: 0,
    focusMinutes: 0,
    bySubject: {},
    byDay: {}
  };
  
  // Calculate date range
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  sessions.forEach(session => {
    if (session.date < startDateStr) return;
    
    stats.totalSessions++;
    stats.totalMinutes += session.durationMin;
    
    if (session.type === 'focus') {
      stats.focusSessions++;
      stats.focusMinutes += session.durationMin;
      
      if (session.subject) {
        if (!stats.bySubject[session.subject]) {
          stats.bySubject[session.subject] = { sessions: 0, minutes: 0 };
        }
        stats.bySubject[session.subject].sessions++;
        stats.bySubject[session.subject].minutes += session.durationMin;
      }
    }
    
    if (!stats.byDay[session.date]) {
      stats.byDay[session.date] = { sessions: 0, minutes: 0 };
    }
    stats.byDay[session.date].sessions++;
    stats.byDay[session.date].minutes += session.durationMin;
  });
  
  return stats;
}

// -------------------------------------------------------------
// TIMER CONTROLS
// -------------------------------------------------------------

export function startFocusSession(durationMin = 25, subject = null) {
  // Stop any existing timer
  stopTimer();
  
  pomoState = {
    endTs: Date.now() + (durationMin * 60 * 1000),
    type: 'focus',
    durationMin: durationMin,
    autoStart: pomoState.autoStart,
    currentSubject: subject,
    sessionStartTs: Date.now()
  };
  
  savePomoState();
  startTimerInterval();
  updateTimerDisplay();
  
  console.log('▶️ Focus session started', pomoState);
}

export function startBreakSession(durationMin = 5) {
  // Stop any existing timer
  stopTimer();
  
  pomoState = {
    endTs: Date.now() + (durationMin * 60 * 1000),
    type: 'break',
    durationMin: durationMin,
    autoStart: pomoState.autoStart,
    currentSubject: null,
    sessionStartTs: Date.now()
  };
  
  savePomoState();
  startTimerInterval();
  updateTimerDisplay();
  
  console.log('☕ Break session started', pomoState);
}

export function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Save remaining time
  if (pomoState.endTs) {
    const remaining = pomoState.endTs - Date.now();
    pomoState.endTs = null; // Mark as paused
    pomoState.pausedRemaining = Math.max(0, remaining);
    savePomoState();
  }
  
  console.log('⏸️ Timer paused');
}

export function resumeTimer() {
  if (pomoState.pausedRemaining && pomoState.pausedRemaining > 0) {
    pomoState.endTs = Date.now() + pomoState.pausedRemaining;
    pomoState.pausedRemaining = null;
    savePomoState();
    startTimerInterval();
    updateTimerDisplay();
    
    console.log('▶️ Timer resumed');
  }
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  pomoState = {
    endTs: null,
    type: 'idle',
    durationMin: pomoState.durationMin,
    autoStart: pomoState.autoStart,
    currentSubject: null,
    sessionStartTs: null,
    pausedRemaining: null
  };
  
  savePomoState();
  updateTimerDisplay();
  
  console.log('⏹️ Timer stopped');
}

export function setAutoStart(enabled) {
  pomoState.autoStart = enabled;
  savePomoState();
}

export function getPomoState() {
  return { ...pomoState };
}

// -------------------------------------------------------------
// TIMER INTERVAL MANAGEMENT
// -------------------------------------------------------------

function startTimerInterval() {
  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Update every second
  timerInterval = setInterval(() => {
    const remaining = pomoState.endTs - Date.now();
    
    if (remaining <= 0) {
      handleSessionComplete();
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

function handleSessionComplete() {
  // Clear interval
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Log the completed session
  if (pomoState.sessionStartTs && pomoState.type !== 'idle') {
    const session = logSession({
      startTs: pomoState.sessionStartTs,
      endTs: pomoState.endTs || Date.now(),
      subject: pomoState.currentSubject,
      type: pomoState.type,
      durationMin: pomoState.durationMin
    });
    
    // Dispatch custom event for analytics
    if (session) {
      window.dispatchEvent(new CustomEvent('pomodoroComplete', { 
        detail: session 
      }));
    }
  }
  
  // Show notification
  if (pomoState.type === 'focus') {
    showNotification('🎉 Focus session complete! Time for a break.', 'success');
    
    // Auto-start break if enabled
    if (pomoState.autoStart) {
      setTimeout(() => {
        startBreakSession(5);
        showNotification('☕ Break started', 'info');
      }, 2000);
    } else {
      stopTimer();
    }
  } else if (pomoState.type === 'break') {
    showNotification('💪 Break over! Ready to focus?', 'info');
    
    // Auto-start focus if enabled
    if (pomoState.autoStart) {
      setTimeout(() => {
        startFocusSession(25, pomoState.currentSubject);
        showNotification('🎯 Focus session started', 'info');
      }, 2000);
    } else {
      stopTimer();
    }
  }
}

// -------------------------------------------------------------
// DISPLAY UPDATES
// -------------------------------------------------------------

function updateTimerDisplay() {
  const display = getTimerDisplay();
  
  if (pomoTimerEl) {
    pomoTimerEl.textContent = display;
  }
  if (miniTimerEl) {
    miniTimerEl.textContent = display;
  }
  
  // Update title for tab notification
  if (pomoState.type !== 'idle' && pomoState.endTs) {
    document.title = `${display} - JEE Focus Tracker`;
  } else {
    document.title = 'JEE Focus Tracker';
  }
}

function getTimerDisplay() {
  if (!pomoState.endTs) {
    // Idle or paused
    if (pomoState.pausedRemaining) {
      return formatTime(Math.floor(pomoState.pausedRemaining / 1000));
    }
    return formatTime(pomoState.durationMin * 60);
  }
  
  // Active timer
  const remaining = Math.max(0, pomoState.endTs - Date.now());
  return formatTime(Math.floor(remaining / 1000));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// -------------------------------------------------------------
// NOTIFICATION HELPER
// -------------------------------------------------------------

function showNotification(message, type = 'info') {
  // Use existing toast system if available
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
  
  // Try browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('JEE Focus Tracker', {
      body: message,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    });
  }
}

// Request notification permission on first use
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// -------------------------------------------------------------
// EXPORT UTILITIES
// -------------------------------------------------------------

export function exportSessions() {
  const sessions = getSessions();
  const stats = getSessionStats(30); // Last 30 days
  
  return {
    sessions,
    stats,
    exportedAt: new Date().toISOString()
  };
}
