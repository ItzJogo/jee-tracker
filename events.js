// -------------------------------------------------------------
// EVENTS.JS — All Event Handlers
// -------------------------------------------------------------

import {
  addTask,
  updateTask,
  deleteTask,
  setEditTaskId,
  getEditTaskId,
  getTaskById,
  updateChapterProgress,
  updateDailySummary,
  saveReflection,
  getReflection,
  saveDailyGoal,
  exportAllData,
  importAllData,
  saveTheme,
  getTheme,
  saveMediaList,
  loadMediaList,
  getTodayString
} from './state.js?v=9.0.1';

import {
  renderTasks,
  renderDashboard,
  renderSyllabusProgress,
  renderSyllabusChart,
  renderCalendar,
  renderMediaLists,
  openEditModal,
  closeEditModal,
  closeTemplateModal,
  populateChapters,
  clearTaskForm,
  getTaskFormData,
  getEditFormData,
  showToast,
  getDOM
} from './ui.js?v=9.0.1';

import {
  startPomoTimer,
  pausePomoTimer,
  resetPomoTimer,
  setPomoTimes,
  setAutoStart
} from './pomodoro.js?v=9.0.1';

import { createDebouncedAutosave } from './mobile-utils.js?v=9.3.0';

let DOM = {};

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------

export function initEvents() {
  DOM = getDOM();
  
  // Task form events
  DOM.addBtn.addEventListener('click', handleAddTask);
  DOM.searchInput.addEventListener('input', renderTasks);
  
  // Filter events
  DOM.filterSubject.addEventListener('change', renderTasks);
  DOM.filterPriority.addEventListener('change', renderTasks);
  DOM.clearFiltersBtn.addEventListener('click', handleClearFilters);
  
  // Subject change events (populate chapters)
  DOM.subjectSel.addEventListener('change', () => {
    populateChapters(DOM.chapterSel, DOM.subjectSel.value);
  });
  
  // FIXED: Edit subject change event (was missing)
  DOM.editSubject.addEventListener('change', () => {
    populateChapters(DOM.editChapter, DOM.editSubject.value);
  });
  
  // Reflection events
  DOM.saveRef.addEventListener('click', handleSaveReflection);
  DOM.clearRef.addEventListener('click', handleClearReflection);
  DOM.reflectionEl.addEventListener('input', handleAutoSaveReflection);
  
  // Daily goal
  DOM.dailyGoalInput.addEventListener('change', handleDailyGoalChange);
  
  // Syllabus events
  DOM.syllabusSubject.addEventListener('change', renderSyllabusProgress);
  DOM.updateSyllabusBtn.addEventListener('click', handleUpdateSyllabus);
  
  // Media list events
  DOM.addAnimeBtn.addEventListener('click', () => handleAddMedia('anime'));
  DOM.addMangaBtn.addEventListener('click', () => handleAddMedia('manga'));
  
  // Pomodoro events
  DOM.setTimesBtn.addEventListener('click', handleSetPomoTimes);
  DOM.pStart.addEventListener('click', handlePomoStart);
  DOM.pPause.addEventListener('click', handlePomoPause);
  DOM.pReset.addEventListener('click', handlePomoReset);
  DOM.miniStart.addEventListener('click', handlePomoStart);
  DOM.miniPause.addEventListener('click', handlePomoPause);
  
  // Auto-start checkbox
  const autoStartCheckbox = document.getElementById('autoStartPomo');
  if (autoStartCheckbox) {
    autoStartCheckbox.addEventListener('change', (e) => {
      setAutoStart(e.target.checked);
      showToast(`Auto-start ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
    });
  }
  
  // Modal events
  DOM.templateBtn.addEventListener('click', () => DOM.templateModal.style.display = 'block');
  DOM.tempClose.addEventListener('click', closeTemplateModal);
  DOM.editClose.addEventListener('click', () => {
    closeEditModal();
    setEditTaskId(null);
  });
  DOM.saveEditBtn.addEventListener('click', handleSaveEdit);
  DOM.deleteEditBtn.addEventListener('click', handleDeleteFromEdit);
  
  // Modal close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === DOM.templateModal) closeTemplateModal();
    if (e.target === DOM.editModal) {
      closeEditModal();
      setEditTaskId(null);
    }
  });
  
  // Export/Import events
  DOM.exportBtn.addEventListener('click', handleExport);
  DOM.importBtn.addEventListener('click', handleImport);
  
  // Theme toggle
  DOM.themeToggle.addEventListener('click', handleThemeToggle);
  
  // Voice button
  DOM.voiceBtn.addEventListener('click', handleVoiceInput);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Make handlers available globally for inline onclick
  window.handleTaskDone = handleTaskDone;
  window.handleTaskMissed = handleTaskMissed;
  window.handleTaskEdit = handleTaskEdit;
  window.handleTaskDelete = handleTaskDelete;
  window.deleteMediaItem = handleDeleteMedia;
}

// -------------------------------------------------------------
// TASK CRUD HANDLERS
// -------------------------------------------------------------

function handleAddTask() {
  const formData = getTaskFormData();
  
  if (!formData.title) {
    showToast('Please enter a task title', 'error');
    return;
  }
  
  // Generate unique ID
  const id = generateId();
  
  const newTask = {
    id,
    ...formData,
    status: 'Open'
  };
  
  addTask(newTask);
  
  // Update syllabus if chapter selected
  if (newTask.chapter) {
    updateChapterProgress(newTask.subject, newTask.chapter, {
      totalMinutes: (newTask.expectedMinutes || 0)
    });
  }
  
  clearTaskForm();
  renderTasks();
  renderDashboard();
  renderSyllabusProgress();
  renderSyllabusChart();
  
  showToast('Task added successfully! 📝', 'success');
}

export function handleTaskDone(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;
  
  updateTask(taskId, { status: 'Done' });
  
  // Update chapter progress
  if (task.chapter) {
    const current = updateChapterProgress(task.subject, task.chapter, {});
    updateChapterProgress(task.subject, task.chapter, {
      completedMinutes: (current.completedMinutes || 0) + (task.expectedMinutes || 0)
    });
  }
  
  updateDailySummary();
  renderTasks();
  renderDashboard();
  renderSyllabusProgress();
  renderSyllabusChart();
  
  showToast('Task completed! Great work! 🎉', 'success');
}

export function handleTaskMissed(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;
  
  updateTask(taskId, { status: 'Missed' });
  updateDailySummary();
  renderTasks();
  renderDashboard();
  
  showToast('Task marked as missed', 'info');
}

export function handleTaskEdit(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;
  
  setEditTaskId(taskId);
  openEditModal(task);
}

function handleSaveEdit() {
  const taskId = getEditTaskId();
  if (!taskId) return;
  
  const task = getTaskById(taskId);
  if (!task) return;
  
  const formData = getEditFormData();
  
  if (!formData.title) {
    showToast('Please enter a task title', 'error');
    return;
  }
  
  // Adjust syllabus if chapter/minutes changed
  if (task.chapter !== formData.chapter || task.expectedMinutes !== formData.expectedMinutes) {
    if (task.chapter && task.status !== 'Done') {
      const current = updateChapterProgress(task.subject, task.chapter, {});
      updateChapterProgress(task.subject, task.chapter, {
        totalMinutes: (current.totalMinutes || 0) - (task.expectedMinutes || 0)
      });
    }
    
    if (formData.chapter) {
      const current = updateChapterProgress(formData.subject, formData.chapter, {});
      updateChapterProgress(formData.subject, formData.chapter, {
        totalMinutes: (current.totalMinutes || 0) + (formData.expectedMinutes || 0)
      });
    }
  }
  
  updateTask(taskId, formData);
  updateDailySummary();
  closeEditModal();
  setEditTaskId(null);
  
  renderTasks();
  renderDashboard();
  renderSyllabusProgress();
  renderSyllabusChart();
  
  showToast('Task updated successfully! ✏️', 'success');
}

export function handleTaskDelete(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  const task = getTaskById(taskId);
  if (!task) return;
  
  // Adjust syllabus if not done
  if (task.chapter && task.status !== 'Done') {
    const current = updateChapterProgress(task.subject, task.chapter, {});
    updateChapterProgress(task.subject, task.chapter, {
      totalMinutes: (current.totalMinutes || 0) - (task.expectedMinutes || 0)
    });
  }
  
  deleteTask(taskId);
  updateDailySummary();
  
  renderTasks();
  renderDashboard();
  renderSyllabusProgress();
  renderSyllabusChart();
  
  showToast('Task deleted', 'info');
}

function handleDeleteFromEdit() {
  const taskId = getEditTaskId();
  if (!taskId) return;
  
  closeEditModal();
  setEditTaskId(null);
  handleTaskDelete(taskId);
}

// -------------------------------------------------------------
// FILTER HANDLERS
// -------------------------------------------------------------

function handleClearFilters() {
  DOM.filterSubject.value = '';
  DOM.filterPriority.value = '';
  DOM.searchInput.value = '';
  renderTasks();
}

// -------------------------------------------------------------
// REFLECTION HANDLERS
// -------------------------------------------------------------

function handleSaveReflection() {
  const text = DOM.reflectionEl.value.trim();
  const result = saveReflection(text);
  
  if (result) {
    DOM.autoSaveStatus.innerText = "Last saved: " + new Date().toLocaleTimeString();
    showToast('Reflection saved! 📔', 'success');
  } else {
    DOM.autoSaveStatus.innerText = "Last saved: —";
    showToast('Reflection cleared', 'info');
  }
}

function handleClearReflection() {
  DOM.reflectionEl.value = '';
  saveReflection('');
  DOM.autoSaveStatus.innerText = "Last saved: —";
}

// Debounced autosave for reflection (1 second delay)
const debouncedReflectionSave = createDebouncedAutosave(() => {
  const text = DOM.reflectionEl.value;
  saveReflection(text);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  DOM.autoSaveStatus.innerText = `Last saved: ${timeStr}`;
  DOM.autoSaveStatus.style.color = 'var(--color-success)';
  
  // Fade back to normal color after 2 seconds
  setTimeout(() => {
    DOM.autoSaveStatus.style.color = 'var(--color-text-muted)';
  }, 2000);
}, 1000);

function handleAutoSaveReflection() {
  // Show "saving..." immediately for feedback
  DOM.autoSaveStatus.innerText = 'Saving...';
  DOM.autoSaveStatus.style.color = 'var(--color-text-secondary)';
  
  // Debounced save
  debouncedReflectionSave();
}

// -------------------------------------------------------------
// DAILY GOAL HANDLER
// -------------------------------------------------------------

function handleDailyGoalChange() {
  const goal = parseInt(DOM.dailyGoalInput.value) || 240;
  saveDailyGoal(goal);
  renderDashboard();
}

// -------------------------------------------------------------
// SYLLABUS HANDLERS
// -------------------------------------------------------------

function handleUpdateSyllabus() {
  renderSyllabusProgress();
  renderSyllabusChart();
  showToast('Syllabus updated! 📚', 'success');
}

// -------------------------------------------------------------
// MEDIA LIST HANDLERS
// -------------------------------------------------------------

function handleAddMedia(type) {
  const title = DOM.mediaTitleInput.value.trim();
  if (!title) {
    showToast('Please enter a title', 'error');
    return;
  }
  
  const list = loadMediaList(type);
  list.push(title);
  saveMediaList(type, list);
  DOM.mediaTitleInput.value = '';
  renderMediaLists();
  
  const emoji = type === 'anime' ? '📺' : '📖';
  showToast(`${emoji} ${type.charAt(0).toUpperCase() + type.slice(1)} added!`, 'success');
}

function handleDeleteMedia(type, idx) {
  const list = loadMediaList(type);
  list.splice(idx, 1);
  saveMediaList(type, list);
  renderMediaLists();
}

// -------------------------------------------------------------
// POMODORO HANDLERS
// -------------------------------------------------------------

function handleSetPomoTimes() {
  const work = parseInt(DOM.pomoWorkInput.value) || 25;
  const breakTime = parseInt(DOM.pomoBreakInput.value) || 5;
  setPomoTimes(work, breakTime);
  showToast(`Pomodoro set: ${work}m work, ${breakTime}m break`, 'success');
}

function handlePomoStart() {
  startPomoTimer();
  showToast('Pomodoro started! ⏱️', 'info');
}

function handlePomoPause() {
  pausePomoTimer();
  showToast('Pomodoro paused', 'info');
}

function handlePomoReset() {
  resetPomoTimer();
  showToast('Pomodoro reset', 'info');
}

// -------------------------------------------------------------
// EXPORT/IMPORT HANDLERS
// -------------------------------------------------------------

function handleExport() {
  const data = exportAllData();
  if (!data) {
    showToast('Export failed', 'error');
    return;
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jee-backup-' + getTodayString() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Data exported successfully! 💾', 'success');
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        
        // FIXED: Import now merges data
        const success = importAllData(parsed);
        
        if (success) {
          showToast('Data imported successfully! Reloading...', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showToast('Import failed', 'error');
        }
      } catch(err) {
        console.error('Import error:', err);
        // FIXED: User-friendly error message
        showToast('Invalid JSON file. Please check the file format.', 'error');
      }
    };
    
    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// -------------------------------------------------------------
// THEME HANDLER
// -------------------------------------------------------------

function handleThemeToggle() {
  const cls = document.documentElement.classList;
  if (cls.contains('light')) {
    cls.remove('light');
    saveTheme('dark');
  } else {
    cls.add('light');
    saveTheme('light');
  }
}

// -------------------------------------------------------------
// VOICE INPUT HANDLER
// -------------------------------------------------------------

let recognition = null;

function handleVoiceInput() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    showToast('Speech recognition not supported in this browser', 'error');
    return;
  }
  
  if (!recognition) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      DOM.titleInp.value = text;
      showToast('Voice input received! 🎤', 'success');
    };
    
    recognition.onerror = (e) => {
      console.warn('Voice error', e);
      showToast('Voice input failed', 'error');
    };
  }
  
  recognition.start();
}

// -------------------------------------------------------------
// KEYBOARD SHORTCUTS
// -------------------------------------------------------------

function handleKeyboardShortcuts(e) {
  // Ctrl+Enter => add task
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    DOM.addBtn.click();
  }
  
  // Slash => focus search
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    DOM.searchInput.focus();
  }
  
  // Alt+R => start pomodoro
  if (e.altKey && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault();
    handlePomoStart();
  }
  
  // Escape => close modals
  if (e.key === 'Escape') {
    closeEditModal();
    closeTemplateModal();
    setEditTaskId(null);
  }
}

// -------------------------------------------------------------
// UTILITY
// -------------------------------------------------------------

function generateId() {
  return "xxxxxxxx-xxxx".replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16)) + "-" + Date.now();
}
