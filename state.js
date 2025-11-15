// -------------------------------------------------------------
// STATE.JS — Centralized State Management
// -------------------------------------------------------------
// All localStorage operations and state management happen here

const TASKS_KEY = "yash_local_tasks_v7";
const SYLLABUS_KEY = "yash_syllabus_v7";
const CALENDAR_KEY = "yash_calendar_v7";
const REFLECTION_KEY = "yash_reflection_v7";
const GOAL_KEY = "yash_daily_goal_v7";
const SYLLABUS_PROGRESS_KEY = "yash_syllabus_progress_v9"; // New key for enhanced syllabus tracking

// Get current date in YYYY-MM-DD format (local timezone fix)
function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Application state
let state = {
  tasks: [],
  currentEditTaskId: null,
  today: getTodayDate(),
  syllabusProgress: {} // New: stores per-chapter progress with status
};

// -------------------------------------------------------------
// TASK MANAGEMENT
// -------------------------------------------------------------

export function loadTasks() {
  try {
    const arr = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    // Filter for today's tasks
    state.tasks = arr.filter(t => t.date === state.today);
    return state.tasks;
  } catch(e) {
    console.error("Load tasks failed", e);
    state.tasks = [];
    return [];
  }
}

export function saveTasks() {
  try {
    // Keep older dates in storage as well
    const existing = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    // Remove today's entries then append current tasks
    const others = existing.filter(t => t.date !== state.today);
    const merged = others.concat(state.tasks);
    localStorage.setItem(TASKS_KEY, JSON.stringify(merged));
  } catch(e) {
    console.error("Save tasks failed", e);
  }
}

export function getTasks() {
  return state.tasks;
}

export function addTask(task) {
  // Ensure task has required fields
  const newTask = {
    ...task,
    date: state.today,
    createdAt: new Date().toISOString()
  };
  state.tasks.push(newTask);
  saveTasks();
  return newTask;
}

export function updateTask(id, updates) {
  const index = state.tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  state.tasks[index] = {
    ...state.tasks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveTasks();
  return state.tasks[index];
}

export function deleteTask(id) {
  const index = state.tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  const task = state.tasks[index];
  state.tasks.splice(index, 1);
  saveTasks();
  return task;
}

export function setEditTaskId(id) {
  state.currentEditTaskId = id;
}

export function getEditTaskId() {
  return state.currentEditTaskId;
}

export function getTaskById(id) {
  return state.tasks.find(t => t.id === id);
}

// -------------------------------------------------------------
// SYLLABUS PROGRESS MANAGEMENT
// -------------------------------------------------------------

export function loadSyllabusProgress() {
  try {
    state.syllabusProgress = JSON.parse(localStorage.getItem(SYLLABUS_PROGRESS_KEY) || "{}");
    return state.syllabusProgress;
  } catch(e) {
    console.error("Load syllabus progress failed", e);
    state.syllabusProgress = {};
    return {};
  }
}

export function saveSyllabusProgress() {
  try {
    localStorage.setItem(SYLLABUS_PROGRESS_KEY, JSON.stringify(state.syllabusProgress));
  } catch(e) {
    console.error("Save syllabus progress failed", e);
  }
}

export function getSyllabusProgress() {
  return state.syllabusProgress;
}

export function updateChapterProgress(subject, chapter, updates) {
  if (!subject || !chapter) return;
  
  if (!state.syllabusProgress[subject]) {
    state.syllabusProgress[subject] = {};
  }
  
  if (!state.syllabusProgress[subject][chapter]) {
    state.syllabusProgress[subject][chapter] = {
      totalMinutes: 0,
      completedMinutes: 0,
      progress: 0,
      status: 'pending' // pending, in-progress, done
    };
  }
  
  const chapterData = state.syllabusProgress[subject][chapter];
  Object.assign(chapterData, updates);
  
  // Recalculate progress percentage
  if (chapterData.totalMinutes > 0) {
    chapterData.progress = Math.min(100, (chapterData.completedMinutes / chapterData.totalMinutes) * 100);
  }
  
  // Auto-update status based on progress
  if (chapterData.progress === 0) {
    chapterData.status = 'pending';
  } else if (chapterData.progress >= 100) {
    chapterData.status = 'done';
  } else {
    chapterData.status = 'in-progress';
  }
  
  saveSyllabusProgress();
  return chapterData;
}

export function getChapterProgress(subject, chapter) {
  if (!state.syllabusProgress[subject]) return null;
  return state.syllabusProgress[subject][chapter] || null;
}

// -------------------------------------------------------------
// CALENDAR & DAILY SUMMARY
// -------------------------------------------------------------

export function updateDailySummary() {
  const done = state.tasks.filter(t => t.status === 'Done').length;
  const missed = state.tasks.filter(t => t.status === 'Missed').length;
  
  try {
    const cal = JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}");
    cal[state.today] = {
      date: state.today,
      done,
      missed,
      pomodoro: 0, // This will be updated from pomodoro.js
      active: done > 0,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(cal));
    return cal[state.today];
  } catch(e) {
    console.error("Update daily summary failed", e);
    return null;
  }
}

export function getCalendarData() {
  try {
    return JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}");
  } catch(e) {
    console.error("Get calendar data failed", e);
    return {};
  }
}

export function updatePomodoroCount(count) {
  try {
    const cal = JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}");
    if (!cal[state.today]) {
      cal[state.today] = { date: state.today, done: 0, missed: 0, pomodoro: 0, active: false };
    }
    cal[state.today].pomodoro = count;
    cal[state.today].active = cal[state.today].done > 0 || count > 0;
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(cal));
  } catch(e) {
    console.error("Update pomodoro count failed", e);
  }
}

// -------------------------------------------------------------
// REFLECTION MANAGEMENT
// -------------------------------------------------------------

export function saveReflection(text) {
  try {
    const r = JSON.parse(localStorage.getItem(REFLECTION_KEY) || "{}");
    if (text && text.trim()) {
      r[state.today] = { text: text.trim(), ts: new Date().toISOString() };
    } else {
      delete r[state.today];
    }
    localStorage.setItem(REFLECTION_KEY, JSON.stringify(r));
    return r[state.today];
  } catch(e) {
    console.error("Save reflection failed", e);
    return null;
  }
}

export function getReflection() {
  try {
    const r = JSON.parse(localStorage.getItem(REFLECTION_KEY) || "{}");
    return r[state.today] || null;
  } catch(e) {
    console.error("Get reflection failed", e);
    return null;
  }
}

// -------------------------------------------------------------
// GOAL MANAGEMENT
// -------------------------------------------------------------

export function saveDailyGoal(minutes) {
  try {
    localStorage.setItem(GOAL_KEY, minutes.toString());
  } catch(e) {
    console.error("Save daily goal failed", e);
  }
}

export function getDailyGoal() {
  try {
    return parseInt(localStorage.getItem(GOAL_KEY) || "240");
  } catch(e) {
    console.error("Get daily goal failed", e);
    return 240;
  }
}

// -------------------------------------------------------------
// MEDIA LIST MANAGEMENT
// -------------------------------------------------------------

export function loadMediaList(type) {
  try {
    return JSON.parse(localStorage.getItem(`yash_${type}_list`) || "[]");
  } catch(e) {
    console.error(`Load ${type} list failed`, e);
    return [];
  }
}

export function saveMediaList(type, list) {
  try {
    localStorage.setItem(`yash_${type}_list`, JSON.stringify(list));
  } catch(e) {
    console.error(`Save ${type} list failed`, e);
  }
}

// -------------------------------------------------------------
// IMPORT/EXPORT
// -------------------------------------------------------------

export function exportAllData() {
  try {
    return {
      tasks: JSON.parse(localStorage.getItem(TASKS_KEY) || "[]"),
      syllabus: JSON.parse(localStorage.getItem(SYLLABUS_KEY) || "{}"),
      syllabusProgress: JSON.parse(localStorage.getItem(SYLLABUS_PROGRESS_KEY) || "{}"),
      calendar: JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}"),
      reflections: JSON.parse(localStorage.getItem(REFLECTION_KEY) || "{}"),
      goal: localStorage.getItem(GOAL_KEY) || "240",
      anime: JSON.parse(localStorage.getItem('yash_anime_list') || "[]"),
      manga: JSON.parse(localStorage.getItem('yash_manga_list') || "[]")
    };
  } catch(e) {
    console.error("Export failed", e);
    return null;
  }
}

// FIXED: Import now merges instead of overwriting
export function importAllData(data) {
  try {
    // Merge tasks instead of overwriting
    if (data.tasks) {
      const existing = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
      const existingIds = new Set(existing.map(t => t.id));
      
      // Only add tasks that don't already exist
      const newTasks = data.tasks.filter(t => !existingIds.has(t.id));
      const merged = existing.concat(newTasks);
      
      localStorage.setItem(TASKS_KEY, JSON.stringify(merged));
    }
    
    // Other data can be merged or overwritten as appropriate
    if (data.syllabus) localStorage.setItem(SYLLABUS_KEY, JSON.stringify(data.syllabus));
    if (data.syllabusProgress) localStorage.setItem(SYLLABUS_PROGRESS_KEY, JSON.stringify(data.syllabusProgress));
    if (data.calendar) {
      // Merge calendar data
      const existingCal = JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}");
      const mergedCal = { ...existingCal, ...data.calendar };
      localStorage.setItem(CALENDAR_KEY, JSON.stringify(mergedCal));
    }
    if (data.reflections) {
      // Merge reflections
      const existingRef = JSON.parse(localStorage.getItem(REFLECTION_KEY) || "{}");
      const mergedRef = { ...existingRef, ...data.reflections };
      localStorage.setItem(REFLECTION_KEY, JSON.stringify(mergedRef));
    }
    if (data.goal) localStorage.setItem(GOAL_KEY, data.goal);
    if (data.anime) {
      // Merge anime list
      const existingAnime = JSON.parse(localStorage.getItem('yash_anime_list') || "[]");
      const mergedAnime = [...new Set([...existingAnime, ...data.anime])];
      localStorage.setItem('yash_anime_list', JSON.stringify(mergedAnime));
    }
    if (data.manga) {
      // Merge manga list
      const existingManga = JSON.parse(localStorage.getItem('yash_manga_list') || "[]");
      const mergedManga = [...new Set([...existingManga, ...data.manga])];
      localStorage.setItem('yash_manga_list', JSON.stringify(mergedManga));
    }
    
    return true;
  } catch(e) {
    console.error("Import failed", e);
    return false;
  }
}

// -------------------------------------------------------------
// STREAK CALCULATION
// -------------------------------------------------------------

export function calculateStreak() {
  const cal = getCalendarData();
  const doneDates = new Set();
  
  Object.keys(cal).forEach(d => {
    const it = cal[d];
    if ((it.done || 0) > 0 || (it.pomodoro || 0) > 0) {
      doneDates.add(d);
    }
  });
  
  // Add today if any done
  if (state.tasks.some(t => t.status === 'Done')) {
    doneDates.add(state.today);
  }
  
  let streak = 0;
  const cur = new Date();
  const parts = state.today.split('-');
  cur.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  
  while(true) {
    const key = `${cur.getFullYear()}-${(cur.getMonth() + 1).toString().padStart(2, '0')}-${cur.getDate().toString().padStart(2, '0')}`;
    if (doneDates.has(key)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// -------------------------------------------------------------
// THEME MANAGEMENT
// -------------------------------------------------------------

export function saveTheme(theme) {
  localStorage.setItem('yash_theme', theme);
}

export function getTheme() {
  return localStorage.getItem('yash_theme') || 'dark';
}

// -------------------------------------------------------------
// UTILITY
// -------------------------------------------------------------

export function getTodayString() {
  return state.today;
}
