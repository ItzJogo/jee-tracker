// -------------------------------------------------------------
// POMODORO.JS — Pomodoro Timer Logic with Draggable Widget
// -------------------------------------------------------------

import { updatePomodoroCount } from './state.js?v=9.0.1';

// Pomodoro state
let pomoState = {
  work: 25 * 60,
  break: 5 * 60,
  remaining: 25 * 60,
  running: false,
  mode: 'work', // 'work' or 'break'
  totalSessions: 0,
  timer: null,
  autoStart: false // New: auto-start next session
};

let pomoTimerEl = null;
let miniTimerEl = null;

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------

export function initPomodoro(pomoTimerElement, miniTimerElement, workInput, breakInput) {
  pomoTimerEl = pomoTimerElement;
  miniTimerEl = miniTimerElement;
  
  pomoState.work = (parseInt(workInput.value) || 25) * 60;
  pomoState.break = (parseInt(breakInput.value) || 5) * 60;
  pomoState.remaining = pomoState.work;
  
  renderPomoTime();
}

// -------------------------------------------------------------
// TIME FORMATTING & RENDERING
// -------------------------------------------------------------

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function renderPomoTime() {
  if (pomoTimerEl) pomoTimerEl.innerText = formatTime(pomoState.remaining);
  if (miniTimerEl) miniTimerEl.innerText = formatTime(pomoState.remaining);
}

// -------------------------------------------------------------
// TIMER CONTROLS
// -------------------------------------------------------------

export function startPomoTimer() {
  if (pomoState.running) return;
  if (pomoState.timer) clearInterval(pomoState.timer);
  
  pomoState.running = true;
  pomoState.timer = setInterval(() => {
    pomoState.remaining--;
    renderPomoTime();
    
    if (pomoState.remaining <= 0) {
      clearInterval(pomoState.timer);
      pomoState.running = false;
      pomoState.timer = null;
      
      if (pomoState.mode === 'work') {
        pomoState.totalSessions++;
        updatePomodoroCount(pomoState.totalSessions);
        pomoState.mode = 'break';
        pomoState.remaining = pomoState.break;
        
        // Show notification
        if (window.showToast) {
          window.showToast('Work session complete! Take a break. 🎉', 'success');
        }
        
        // Auto-start break if enabled
        if (pomoState.autoStart) {
          setTimeout(() => startPomoTimer(), 2000);
        }
      } else {
        pomoState.mode = 'work';
        pomoState.remaining = pomoState.work;
        
        if (window.showToast) {
          window.showToast('Break over! Time to focus. 💪', 'info');
        }
        
        // Auto-start work if enabled
        if (pomoState.autoStart) {
          setTimeout(() => startPomoTimer(), 2000);
        }
      }
      
      renderPomoTime();
    }
  }, 1000);
}

export function pausePomoTimer() {
  if (pomoState.timer) clearInterval(pomoState.timer);
  pomoState.running = false;
  pomoState.timer = null;
}

export function resetPomoTimer() {
  if (pomoState.timer) clearInterval(pomoState.timer);
  pomoState.running = false;
  pomoState.timer = null;
  pomoState.remaining = pomoState.work;
  pomoState.mode = 'work';
  renderPomoTime();
}

export function setPomoTimes(workMinutes, breakMinutes) {
  pomoState.work = workMinutes * 60;
  pomoState.break = breakMinutes * 60;
  pomoState.remaining = pomoState.work;
  pomoState.mode = 'work';
  renderPomoTime();
}

export function setAutoStart(enabled) {
  pomoState.autoStart = enabled;
}

export function getPomoState() {
  return pomoState;
}

// -------------------------------------------------------------
// DRAGGABLE IMPLEMENTATION (FIXED & COMPLETE)
// -------------------------------------------------------------
// This implements full drag functionality for both mouse and touch devices

export function makeDraggable(element) {
  if (!element) return;
  
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  
  // Get computed position
  function getCurrentPosition() {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top
    };
  }
  
  // Mouse events
  element.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  
  // Touch events
  element.addEventListener('touchstart', dragStart, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', dragEnd);
  
  function dragStart(e) {
    // Get initial position
    const pos = getCurrentPosition();
    
    if (e.type === 'touchstart') {
      initialX = e.touches[0].clientX - pos.x;
      initialY = e.touches[0].clientY - pos.y;
    } else {
      initialX = e.clientX - pos.x;
      initialY = e.clientY - pos.y;
    }
    
    // Only start drag if clicking on the element itself (not buttons)
    if (e.target === element || e.target.parentElement === element) {
      isDragging = true;
      element.style.cursor = 'grabbing';
      
      // Prevent text selection during drag
      e.preventDefault();
    }
  }
  
  function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    
    if (e.type === 'touchmove') {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }
    
    xOffset = currentX;
    yOffset = currentY;
    
    // Constrain to viewport
    const rect = element.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    
    xOffset = Math.max(0, Math.min(xOffset, maxX));
    yOffset = Math.max(0, Math.min(yOffset, maxY));
    
    // Use transform for better performance
    element.style.position = 'fixed';
    element.style.left = xOffset + 'px';
    element.style.top = yOffset + 'px';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }
  
  function dragEnd(e) {
    if (isDragging) {
      isDragging = false;
      element.style.cursor = 'grab';
    }
  }
  
  // Set initial cursor
  element.style.cursor = 'grab';
  element.style.userSelect = 'none';
  element.style.WebkitUserSelect = 'none';
  element.style.MozUserSelect = 'none';
}
