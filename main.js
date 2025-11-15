// -------------------------------------------------------------
// MAIN.JS — Application Entry Point
// -------------------------------------------------------------
// This is the main initialization file that wires all modules together

import { 
  loadTasks, 
  loadSyllabusProgress,
  getReflection,
  getDailyGoal,
  getTheme
} from './state.js';

import { 
  initUI, 
  renderTasks, 
  renderDashboard, 
  renderSyllabusProgress,
  renderSyllabusChart,
  renderCalendar, 
  renderMediaLists,
  getDOM
} from './ui.js';

import { 
  initPomodoro,
  makeDraggable
} from './pomodoro.js';

import { 
  initEvents 
} from './events.js';

// -------------------------------------------------------------
// APPLICATION BOOTSTRAP
// -------------------------------------------------------------

function bootstrap() {
  // 1. Initialize UI and get DOM references
  const DOM = initUI();
  
  // 2. Load all data from localStorage
  loadTasks();
  loadSyllabusProgress();
  
  // 3. Load reflection for today
  const reflection = getReflection();
  if (reflection) {
    DOM.reflectionEl.value = reflection.text || '';
    DOM.autoSaveStatus.innerText = 'Last saved: ' + new Date(reflection.ts).toLocaleTimeString();
  }
  
  // 4. Load daily goal
  const dailyGoal = getDailyGoal();
  DOM.dailyGoalInput.value = dailyGoal;
  
  // 5. Initialize Pomodoro
  initPomodoro(DOM.pomoTimer, DOM.miniTimer, DOM.pomoWorkInput, DOM.pomoBreakInput);
  
  // 6. Make Pomodoro widget draggable (FIXED: fully implemented)
  makeDraggable(DOM.miniPomo);
  
  // 7. Initialize all event listeners
  initEvents();
  
  // 8. Render all UI components
  renderTasks();
  renderDashboard();
  renderSyllabusProgress();
  renderSyllabusChart();
  renderCalendar();
  renderMediaLists();
  
  // 9. Load theme preference
  const theme = getTheme();
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  }
  
  // 10. Auto-save on page unload
  window.addEventListener('beforeunload', () => {
    // State management automatically saves, but this is a safety net
    console.log('Application closing...');
  });
  
  console.log('✅ JEE Focus Tracker v9.0 initialized successfully');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
