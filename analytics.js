// -------------------------------------------------------------
// ANALYTICS.JS — Weekly Analytics Dashboard
// -------------------------------------------------------------
// Generates 7-day statistics, subject heatmaps, and visualizations
// Uses inline SVG (no external libraries except Chart.js already present)

import { getSessions, getSessionStats } from './pomodoro-enhanced.js';
import { getTasks } from './state.js';

// -------------------------------------------------------------
// DATA AGGREGATION
// -------------------------------------------------------------

export function getWeeklyAnalytics() {
  const stats = getSessionStats(7);
  const tasks = getTasks();
  
  return {
    pomodoro: stats,
    tasks: aggregateTaskStats(tasks),
    combined: combinedStats(stats, tasks)
  };
}

function aggregateTaskStats(tasks) {
  const stats = {
    total: tasks.length,
    done: 0,
    missed: 0,
    pending: 0,
    totalMinutes: 0,
    doneMinutes: 0,
    bySubject: {},
    byPriority: { High: 0, Medium: 0, Low: 0 }
  };
  
  tasks.forEach(task => {
    if (task.status === 'Done') {
      stats.done++;
      stats.doneMinutes += task.expectedMinutes || 0;
    } else if (task.status === 'Missed') {
      stats.missed++;
    } else {
      stats.pending++;
    }
    
    stats.totalMinutes += task.expectedMinutes || 0;
    
    // By subject
    if (!stats.bySubject[task.subject]) {
      stats.bySubject[task.subject] = { total: 0, done: 0, minutes: 0 };
    }
    stats.bySubject[task.subject].total++;
    if (task.status === 'Done') {
      stats.bySubject[task.subject].done++;
      stats.bySubject[task.subject].minutes += task.expectedMinutes || 0;
    }
    
    // By priority
    if (task.priority) {
      stats.byPriority[task.priority]++;
    }
  });
  
  return stats;
}

function combinedStats(pomoStats, taskStats) {
  return {
    totalProductiveMinutes: pomoStats.focusMinutes + taskStats.doneMinutes,
    completionRate: taskStats.total > 0 ? (taskStats.done / taskStats.total * 100).toFixed(1) : 0,
    avgSessionLength: pomoStats.focusSessions > 0 ? (pomoStats.focusMinutes / pomoStats.focusSessions).toFixed(1) : 0
  };
}

// -------------------------------------------------------------
// 7-DAY BAR GRAPH (SVG)
// -------------------------------------------------------------

export function renderWeeklyBarGraph(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const stats = getSessionStats(7);
  const days = getLast7Days();
  
  // Prepare data
  const data = days.map(day => ({
    date: day,
    label: formatDayLabel(day),
    minutes: stats.byDay[day]?.minutes || 0
  }));
  
  const maxMinutes = Math.max(...data.map(d => d.minutes), 60); // At least 60 for scale
  
  // SVG dimensions
  const width = 100; // percentage
  const height = 200;
  const barWidth = 12; // percentage
  const gap = 2; // percentage
  
  // Create SVG
  const svg = `
    <svg viewBox="0 0 100 ${height}" class="analytics-bar-graph" style="width: 100%; height: auto;">
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Y-axis labels -->
      <text x="2" y="10" font-size="3" fill="#94a3b8">${maxMinutes}m</text>
      <text x="2" y="${height - 5}" font-size="3" fill="#94a3b8">0m</text>
      
      <!-- Bars -->
      ${data.map((d, i) => {
        const barHeight = (d.minutes / maxMinutes) * (height - 20);
        const x = 15 + (i * (barWidth + gap));
        const y = height - barHeight - 10;
        
        return `
          <g class="bar-group" data-day="${d.date}">
            <!-- Bar -->
            <rect 
              x="${x}%" 
              y="${y}" 
              width="${barWidth}%" 
              height="${barHeight}" 
              fill="url(#barGradient)" 
              rx="1"
              class="bar"
            />
            
            <!-- Value label -->
            ${d.minutes > 0 ? `
              <text 
                x="${x + barWidth / 2}%" 
                y="${y - 3}" 
                font-size="3" 
                fill="#e2e8f0" 
                text-anchor="middle"
              >${d.minutes}</text>
            ` : ''}
            
            <!-- Day label -->
            <text 
              x="${x + barWidth / 2}%" 
              y="${height - 2}" 
              font-size="3.5" 
              fill="#64748b" 
              text-anchor="middle"
            >${d.label}</text>
          </g>
        `;
      }).join('')}
      
      <!-- Grid lines -->
      ${[0.25, 0.5, 0.75].map(factor => {
        const y = height - (factor * (height - 20)) - 10;
        return `<line x1="15%" y1="${y}" x2="95%" y2="${y}" stroke="#ffffff" stroke-opacity="0.05" stroke-width="0.5"/>`;
      }).join('')}
    </svg>
  `;
  
  container.innerHTML = svg;
  
  // Add hover effects
  container.querySelectorAll('.bar-group').forEach(group => {
    const bar = group.querySelector('.bar');
    group.addEventListener('mouseenter', () => {
      bar.style.opacity = '0.8';
    });
    group.addEventListener('mouseleave', () => {
      bar.style.opacity = '1';
    });
  });
}

// -------------------------------------------------------------
// SUBJECT HEATMAP
// -------------------------------------------------------------

export function renderSubjectHeatmap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const stats = getSessionStats(7);
  const subjects = Object.keys(stats.bySubject);
  
  if (subjects.length === 0) {
    container.innerHTML = '<div class="empty-message">No subject data yet. Start studying!</div>';
    return;
  }
  
  // Sort by minutes
  const sortedSubjects = subjects
    .map(subj => ({
      name: subj,
      minutes: stats.bySubject[subj].minutes,
      sessions: stats.bySubject[subj].sessions
    }))
    .sort((a, b) => b.minutes - a.minutes);
  
  const maxMinutes = sortedSubjects[0]?.minutes || 1;
  
  // Color mapping
  const subjectColors = {
    'Physics': '#38bdf8',
    'Chemistry': '#f87171',
    'Math': '#34d399',
    'Maths': '#34d399',
    'Biology': '#fbbf24'
  };
  
  const html = `
    <div class="subject-heatmap">
      ${sortedSubjects.map(subj => {
        const percentage = (subj.minutes / maxMinutes * 100).toFixed(0);
        const color = subjectColors[subj.name] || '#94a3b8';
        
        return `
          <div class="heatmap-row">
            <div class="heatmap-label">
              <span class="subject-icon" style="background: ${color}20; color: ${color};">
                ${getSubjectEmoji(subj.name)}
              </span>
              <span class="subject-name">${subj.name}</span>
            </div>
            <div class="heatmap-bar-container">
              <div 
                class="heatmap-bar" 
                style="width: ${percentage}%; background: linear-gradient(90deg, ${color}88, ${color})"
              ></div>
            </div>
            <div class="heatmap-value">
              <span class="minutes">${subj.minutes}m</span>
              <span class="sessions">${subj.sessions} sessions</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  container.innerHTML = html;
}

// -------------------------------------------------------------
// STREAK CALCULATION
// -------------------------------------------------------------

export function calculateLongestStreak() {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;
  
  // Get unique dates with sessions
  const dates = [...new Set(sessions.map(s => s.date))].sort();
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return longestStreak;
}

// -------------------------------------------------------------
// DAILY BREAKDOWN TABLE
// -------------------------------------------------------------

export function renderDailyBreakdown(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const days = getLast7Days();
  const stats = getSessionStats(7);
  
  const html = `
    <table class="daily-breakdown-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Sessions</th>
          <th>Minutes</th>
          <th>Completion</th>
        </tr>
      </thead>
      <tbody>
        ${days.reverse().map(day => {
          const dayData = stats.byDay[day] || { sessions: 0, minutes: 0 };
          const taskData = getDayTaskData(day);
          const completion = taskData.total > 0 ? (taskData.done / taskData.total * 100).toFixed(0) : 0;
          
          return `
            <tr class="${dayData.sessions > 0 ? 'has-data' : 'no-data'}">
              <td class="date-cell">
                <span class="date-label">${formatDateLabel(day)}</span>
                <span class="day-name">${getDayName(day)}</span>
              </td>
              <td class="sessions-cell">${dayData.sessions}</td>
              <td class="minutes-cell">${dayData.minutes}m</td>
              <td class="completion-cell">
                <div class="completion-bar">
                  <div class="completion-fill" style="width: ${completion}%"></div>
                </div>
                <span class="completion-text">${completion}%</span>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

// -------------------------------------------------------------
// UTILITY FUNCTIONS
// -------------------------------------------------------------

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

function formatDayLabel(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getDayName(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
}

function getSubjectEmoji(subject) {
  const emojis = {
    'Physics': '⚡',
    'Chemistry': '⚗️',
    'Math': '∞',
    'Maths': '∞',
    'Biology': '🧬'
  };
  return emojis[subject] || '📚';
}

function getDayTaskData(dateStr) {
  // This would need to access task data for the specific date
  // For now, return placeholder
  return { total: 0, done: 0 };
}

// -------------------------------------------------------------
// SUMMARY STATS CARDS
// -------------------------------------------------------------

export function renderSummaryStats(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const analytics = getWeeklyAnalytics();
  const longestStreak = calculateLongestStreak();
  
  const html = `
    <div class="summary-stats-grid">
      <div class="stat-card highlight">
        <div class="stat-icon">📊</div>
        <div class="stat-value">${analytics.pomodoro.totalSessions}</div>
        <div class="stat-label">Total Sessions</div>
      </div>
      
      <div class="stat-card highlight">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value">${analytics.combined.totalProductiveMinutes}</div>
        <div class="stat-label">Total Minutes</div>
      </div>
      
      <div class="stat-card highlight">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${analytics.combined.completionRate}%</div>
        <div class="stat-label">Completion Rate</div>
      </div>
      
      <div class="stat-card highlight">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${longestStreak}</div>
        <div class="stat-label">Longest Streak</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">${analytics.tasks.done}</div>
        <div class="stat-label">Tasks Completed</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-value">${analytics.combined.avgSessionLength}m</div>
        <div class="stat-label">Avg Session</div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}
