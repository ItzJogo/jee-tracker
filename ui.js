// -------------------------------------------------------------
// UI.JS — All DOM Manipulation & Rendering Logic
// -------------------------------------------------------------

import { SYLLABUS, getChapterList } from './syllabus.js?v=9.0.1';
import { 
  getTasks, 
  getTaskById, 
  getSyllabusProgress, 
  getCalendarData, 
  getDailyGoal, 
  calculateStreak,
  getTodayString,
  loadMediaList
} from './state.js?v=9.0.1';

// DOM element references
let DOM = {};
let progressChart = null;
let syllabusChart = null;

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------

export function initUI() {
  // Cache all DOM elements
  DOM = {
    titleInp: document.getElementById("title"),
    subjectSel: document.getElementById("subject"),
    chapterSel: document.getElementById("chapter"),
    prioritySel: document.getElementById("priority"),
    minutesInp: document.getElementById("minutes"),
    blockSel: document.getElementById("blockSel"),
    backlogTag: document.getElementById("backlogTag"),
    
    todayDate: document.getElementById("todayDate"),
    dateSmall: document.getElementById("dateSmall"),
    
    addBtn: document.getElementById("addBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    searchInput: document.getElementById("searchInput"),
    
    taskList: document.getElementById("taskList"),
    totalEl: document.getElementById("total"),
    doneEl: document.getElementById("done"),
    missedEl: document.getElementById("missed"),
    evaAlert: document.getElementById("evaAlert"),
    
    filterSubject: document.getElementById("filterSubject"),
    filterPriority: document.getElementById("filterPriority"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    
    reflectionEl: document.getElementById("reflection"),
    saveRef: document.getElementById("saveRef"),
    clearRef: document.getElementById("clearRef"),
    autoSaveStatus: document.getElementById("autoSaveStatus"),
    
    dailyGoalInput: document.getElementById("dailyGoalInput"),
    progressFill: document.getElementById("progressFill"),
    progressText: document.getElementById("progressText"),
    streakEl: document.getElementById("streak"),
    
    syllabusSubject: document.getElementById("syllabusSubject"),
    syllabusChapters: document.getElementById("syllabusChapters"),
    updateSyllabusBtn: document.getElementById("updateSyllabusBtn"),
    
    animeListContainer: document.getElementById("animeListContainer"),
    mangaListContainer: document.getElementById("mangaListContainer"),
    mediaTitleInput: document.getElementById("mediaTitleInput"),
    addAnimeBtn: document.getElementById("addAnimeBtn"),
    addMangaBtn: document.getElementById("addMangaBtn"),
    
    pomoWorkInput: document.getElementById("pomoWorkInput"),
    pomoBreakInput: document.getElementById("pomoBreakInput"),
    setTimesBtn: document.getElementById("setTimesBtn"),
    pStart: document.getElementById("pStart"),
    pPause: document.getElementById("pPause"),
    pReset: document.getElementById("pReset"),
    pomoTimer: document.getElementById("pomoTimer"),
    miniTimer: document.getElementById("miniTimer"),
    miniStart: document.getElementById("miniStart"),
    miniPause: document.getElementById("miniPause"),
    miniPomo: document.getElementById("miniPomo"),
    
    calendarEl: document.getElementById("calendar"),
    
    templateModal: document.getElementById("templateModal"),
    tempClose: document.getElementById("tempClose"),
    templateBtn: document.getElementById("templateBtn"),
    
    voiceBtn: document.getElementById("voiceBtn"),
    
    editModal: document.getElementById("editModal"),
    editTitle: document.getElementById("editTitle"),
    editSubject: document.getElementById("editSubject"),
    editChapter: document.getElementById("editChapter"),
    editPriority: document.getElementById("editPriority"),
    editMinutes: document.getElementById("editMinutes"),
    editBlock: document.getElementById("editBlock"),
    editBacklog: document.getElementById("editBacklog"),
    saveEditBtn: document.getElementById("saveEditBtn"),
    deleteEditBtn: document.getElementById("deleteEditBtn"),
    editClose: document.getElementById("editClose"),
    
    themeToggle: document.getElementById("themeToggle"),
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    
    progressChart: document.getElementById("progressChart"),
    syllabusChart: document.getElementById("syllabusChart")
  };
  
  // Set today's date
  const today = getTodayString();
  DOM.todayDate.innerText = today;
  DOM.dateSmall.innerText = today;
  
  // Initialize filter dropdowns
  initFilterDropdowns();
  
  // Apply ARIA attributes
  applyAriaAttributes();
  
  return DOM;
}

export function getDOM() {
  return DOM;
}

// -------------------------------------------------------------
// TOAST NOTIFICATIONS (replaces alert())
// -------------------------------------------------------------

export function showToast(message, type = 'info') {
  let toast = document.getElementById('app-toast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  // Set type class
  toast.className = 'toast show toast-' + type;
  toast.innerText = message;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// Make it globally available
if (typeof window !== 'undefined') {
  window.showToast = showToast;
}

// -------------------------------------------------------------
// TASK RENDERING
// -------------------------------------------------------------

export function renderTasks() {
  // Update the date pill at the beginning
  const datePillEl = document.getElementById('current-tasks-date');
  if (datePillEl) {
    datePillEl.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  
  let tasks = getTasks().slice();
  
  // Apply filters
  const subjectFilter = DOM.filterSubject.value;
  const priorityFilter = DOM.filterPriority.value;
  const searchQuery = (DOM.searchInput.value || "").toLowerCase();
  
  if (subjectFilter) tasks = tasks.filter(t => t.subject === subjectFilter);
  if (priorityFilter) tasks = tasks.filter(t => t.priority === priorityFilter);
  if (searchQuery) tasks = tasks.filter(t => (t.title || "").toLowerCase().includes(searchQuery));
  
  DOM.taskList.innerHTML = "";
  
  // Empty state
  if (tasks.length === 0) {
    DOM.taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <div class="empty-title">No tasks yet</div>
        <div class="empty-text">Add your first task to get started!</div>
      </div>
    `;
    return;
  }
  
  // Sort by priority
  tasks.sort((a, b) => {
    const map = { High: 3, Medium: 2, Low: 1 };
    return (map[b.priority] || 0) - (map[a.priority] || 0);
  });
  
  // Render each task as a grid row
  tasks.forEach(task => {
    renderTaskItem(task);
  });
}

function renderTaskItem(t) {
  const el = document.createElement('div');
  el.className = `task-grid-row status-${t.status || 'open'}`;
  el.dataset.id = t.id;
  
  // Helper function for escaping HTML (using the existing escapeHtml function below)
  const escapeHTML = (str) => {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };
  
  el.innerHTML = `
    <div class="grid-cell cell-task">
      <div class="task-title-main">${escapeHTML(t.title)}</div>
      <div class="task-meta-subtle">${t.chapter ? `${escapeHTML(t.chapter)} •` : ''} ${t.expectedMinutes || 0} min • ${t.block}</div>
    </div>
  
    <div class="grid-cell cell-priority">
      <span class="pill pill-priority-${t.priority.toLowerCase()}">${escapeHTML(t.priority)}</span>
    </div>
  
    <div class="grid-cell cell-subject">
      <span class="pill pill-subject-${t.subject.toLowerCase()}">${escapeHTML(t.subject)}</span>
    </div>
  
    <div class="grid-cell cell-status">
      <span class="pill pill-status-${(t.status || 'open').toLowerCase()}">${(t.status || 'open').toUpperCase()}</span>
    </div>
  
    <div class="grid-cell cell-actions">
      <button class="btn small done" data-action="done" title="Done">✔</button>
      <button class="btn small missed" data-action="missed" title="Missed">✖</button>
      <button class="btn small edit" data-action="edit" title="Edit">✏️</button>
      <button class="btn small danger" data-action="delete" title="Delete">🗑️</button>
    </div>
  `;
  
  // Add event handlers for buttons
  el.querySelector('[data-action="done"]').onclick = () => {
    window.handleTaskDone && window.handleTaskDone(t.id);
  };
  el.querySelector('[data-action="missed"]').onclick = () => {
    window.handleTaskMissed && window.handleTaskMissed(t.id);
  };
  el.querySelector('[data-action="edit"]').onclick = () => {
    window.handleTaskEdit && window.handleTaskEdit(t.id);
  };
  el.querySelector('[data-action="delete"]').onclick = () => {
    window.handleTaskDelete && window.handleTaskDelete(t.id);
  };
  
  DOM.taskList.appendChild(el);
}

// -------------------------------------------------------------
// DASHBOARD RENDERING
// -------------------------------------------------------------

export function renderDashboard() {
  const tasks = getTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Done').length;
  const missed = tasks.filter(t => t.status === 'Missed').length;
  const completedMins = tasks.filter(t => t.status === 'Done').reduce((s, t) => s + (t.expectedMinutes || 0), 0);
  const dailyGoal = getDailyGoal();
  
  DOM.totalEl.innerText = total;
  DOM.doneEl.innerText = done;
  DOM.missedEl.innerText = missed;
  
  const percent = Math.min(100, Math.round((completedMins / dailyGoal) * 100));
  DOM.progressFill.style.width = percent + '%';
  DOM.progressFill.setAttribute('aria-valuenow', percent);
  DOM.progressText.innerText = `${completedMins} / ${dailyGoal} mins`;
  
  // Update streak
  const streak = calculateStreak();
  DOM.streakEl.innerText = `${streak} days`;
  
  // Render charts
  renderSubjectChart(tasks);
  
  // Microcopy alerts
  if (missed >= 3) {
    DOM.evaAlert.innerText = "LCL Pressure Critical. Re-engage.";
  } else if (done >= 5) {
    DOM.evaAlert.innerText = "Third Impact Averted. Sync rising.";
  } else {
    DOM.evaAlert.innerText = "";
  }
}

// -------------------------------------------------------------
// CHART RENDERING (FIXED: using update() instead of destroy)
// -------------------------------------------------------------

export function renderSubjectChart(tasks) {
  const subs = ['Chemistry', 'Physics', 'Math', 'Biology'];
  const doneCounts = subs.map(s => tasks.filter(t => t.subject === s && t.status === 'Done').length);
  
  const ctx = DOM.progressChart.getContext('2d');
  
  // FIXED: Update existing chart instead of destroying
  if (progressChart) {
    progressChart.data.datasets[0].data = doneCounts;
    progressChart.update();
  } else {
    progressChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: subs,
        datasets: [{
          label: 'Done',
          data: doneCounts,
          backgroundColor: ['#f87171', '#38bdf8', '#34d399', '#fbbf24']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }
}

export function renderSyllabusChart() {
  const subjects = ['Physics', 'Chemistry', 'Math', 'Biology'];
  const syllabusProgress = getSyllabusProgress();
  
  const progresses = subjects.map(sub => {
    if (!syllabusProgress[sub]) return 0;
    const chapters = getChapterList(sub);
    if (!chapters.length) return 0;
    
    const total = chapters.reduce((acc, ch) => {
      const d = syllabusProgress[sub][ch] || { progress: 0 };
      return acc + (d.progress || 0);
    }, 0);
    return Math.round(total / chapters.length);
  });
  
  const ctx = DOM.syllabusChart.getContext('2d');
  
  // FIXED: Update existing chart instead of destroying
  if (syllabusChart) {
    syllabusChart.data.datasets[0].data = progresses;
    syllabusChart.update();
  } else {
    syllabusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: subjects,
        datasets: [{
          data: progresses,
          backgroundColor: ['#38bdf8', '#f87171', '#34d399', '#fbbf24']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}

// -------------------------------------------------------------
// SYLLABUS PROGRESS RENDERING
// -------------------------------------------------------------

export function renderSyllabusProgress() {
  const subject = DOM.syllabusSubject.value || 'Physics';
  const container = DOM.syllabusChapters;
  container.innerHTML = '';
  
  const syllabusProgress = getSyllabusProgress();
  
  if (!syllabusProgress[subject] || Object.keys(syllabusProgress[subject]).length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;">No progress yet — add tasks with chapters!</div>';
    return;
  }
  
  const chapters = getChapterList(subject);
  
  chapters.forEach(chapter => {
    const data = syllabusProgress[subject][chapter] || {
      completedMinutes: 0,
      totalMinutes: 0,
      progress: 0,
      status: 'pending'
    };
    
    const wrapper = document.createElement('div');
    wrapper.className = 'chapter-progress';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '12px';
    wrapper.style.marginBottom = '8px';
    
    // Status icon
    const statusIcon = document.createElement('div');
    statusIcon.style.width = '24px';
    statusIcon.style.textAlign = 'center';
    statusIcon.style.fontSize = '16px';
    
    if (data.status === 'done') {
      statusIcon.textContent = '✅';
    } else if (data.status === 'in-progress') {
      statusIcon.textContent = '🔄';
    } else {
      statusIcon.textContent = '⭕';
    }
    
    const title = document.createElement('div');
    title.style.width = '30%';
    title.style.fontSize = '0.9rem';
    title.textContent = chapter;
    
    const barWrap = document.createElement('div');
    barWrap.className = 'chapter-bar';
    barWrap.style.flex = '1';
    
    const fill = document.createElement('div');
    fill.className = 'chapter-fill';
    fill.style.width = (data.progress || 0) + '%';
    barWrap.appendChild(fill);
    
    const percent = document.createElement('div');
    percent.style.width = '50px';
    percent.style.fontSize = '0.85rem';
    percent.style.color = 'var(--muted)';
    percent.textContent = Math.round(data.progress || 0) + '%';
    
    wrapper.appendChild(statusIcon);
    wrapper.appendChild(title);
    wrapper.appendChild(barWrap);
    wrapper.appendChild(percent);
    container.appendChild(wrapper);
  });
}

// -------------------------------------------------------------
// CALENDAR RENDERING
// -------------------------------------------------------------

export function renderCalendar() {
  const container = DOM.calendarEl;
  container.innerHTML = '';
  const cal = getCalendarData();
  const today = getTodayString();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    
    const el = document.createElement('div');
    el.className = 'day';
    el.innerText = key.slice(5);
    
    const data = cal[key];
    if (data) {
      const score = (data.done || 0) + (data.pomodoro || 0) - (data.missed || 0);
      if (score > 0) {
        el.style.background = 'linear-gradient(180deg, rgba(52,211,153,0.3), rgba(52,211,153,0.05))';
      } else if (score < 0) {
        el.style.background = 'linear-gradient(180deg, rgba(248,113,113,0.3), rgba(248,113,113,0.05))';
      }
    }
    
    if (key === today) {
      el.style.borderColor = 'var(--accent)';
      el.style.boxShadow = 'var(--glow)';
    }
    
    container.appendChild(el);
  }
}

// -------------------------------------------------------------
// MEDIA LIST RENDERING
// -------------------------------------------------------------

export function renderMediaLists() {
  const anime = loadMediaList('anime');
  const manga = loadMediaList('manga');
  
  DOM.animeListContainer.innerHTML = anime.length > 0
    ? anime.map((it, idx) => `<div class="list-item">${escapeHtml(it)} <button class="list-btn" onclick="window.deleteMediaItem('anime',${idx})">❌</button></div>`).join('')
    : `<div class="meta" style="text-align:center;padding:8px 0;color:var(--muted)">No anime logged</div>`;
  
  DOM.mangaListContainer.innerHTML = manga.length > 0
    ? manga.map((it, idx) => `<div class="list-item">${escapeHtml(it)} <button class="list-btn" onclick="window.deleteMediaItem('manga',${idx})">❌</button></div>`).join('')
    : `<div class="meta" style="text-align:center;padding:8px 0;color:var(--muted)">No manga logged</div>`;
}

// -------------------------------------------------------------
// MODAL MANAGEMENT
// -------------------------------------------------------------

export function openEditModal(task) {
  DOM.editTitle.value = task.title || "";
  DOM.editSubject.value = task.subject || "";
  populateChapters(DOM.editChapter, task.subject, task.chapter || "");
  DOM.editPriority.value = task.priority || "";
  DOM.editMinutes.value = task.expectedMinutes || "";
  DOM.editBlock.value = task.block || "";
  DOM.editBacklog.value = task.backlog || "";
  DOM.editModal.style.display = 'block';
}

export function closeEditModal() {
  DOM.editModal.style.display = 'none';
}

export function openTemplateModal() {
  DOM.templateModal.style.display = 'block';
}

export function closeTemplateModal() {
  DOM.templateModal.style.display = 'none';
}

// -------------------------------------------------------------
// CHAPTER POPULATION
// -------------------------------------------------------------

export function populateChapters(selectEl, subject, selected = '') {
  selectEl.innerHTML = '<option value="">Select Chapter</option>';
  if (!subject) return;
  
  const chapters = getChapterList(subject);
  chapters.forEach(ch => {
    const o = document.createElement('option');
    o.value = ch;
    o.textContent = ch;
    if (ch === selected) o.selected = true;
    selectEl.appendChild(o);
  });
}

// -------------------------------------------------------------
// FILTER DROPDOWNS INITIALIZATION
// -------------------------------------------------------------

function initFilterDropdowns() {
  const subjects = ['Chemistry', 'Physics', 'Math', 'Biology'];
  const priorities = ['High', 'Medium', 'Low'];
  
  subjects.forEach(s => {
    DOM.filterSubject.innerHTML += `<option value="${s}">${s}</option>`;
    DOM.editSubject.innerHTML += `<option value="${s}">${s}</option>`;
  });
  
  priorities.forEach(p => {
    DOM.filterPriority.innerHTML += `<option value="${p}">${p}</option>`;
    DOM.editPriority.innerHTML += `<option value="${p}">${p}</option>`;
  });
  
  // Populate initial chapters
  populateChapters(DOM.chapterSel, 'Chemistry');
  populateChapters(DOM.editChapter, 'Chemistry');
}

// -------------------------------------------------------------
// CLEAR FORM INPUTS
// -------------------------------------------------------------

export function clearTaskForm() {
  DOM.titleInp.value = "";
  DOM.minutesInp.value = "";
  DOM.backlogTag.value = "";
  DOM.chapterSel.value = "";
}

export function getTaskFormData() {
  return {
    title: DOM.titleInp.value.trim(),
    subject: DOM.subjectSel.value,
    chapter: DOM.chapterSel.value || "",
    priority: DOM.prioritySel.value,
    expectedMinutes: parseInt(DOM.minutesInp.value) || 0,
    block: DOM.blockSel.value,
    backlog: DOM.backlogTag.value || ""
  };
}

export function getEditFormData() {
  return {
    title: DOM.editTitle.value.trim(),
    subject: DOM.editSubject.value,
    chapter: DOM.editChapter.value || "",
    priority: DOM.editPriority.value,
    expectedMinutes: parseInt(DOM.editMinutes.value) || 0,
    block: DOM.editBlock.value,
    backlog: DOM.editBacklog.value || ""
  };
}

// -------------------------------------------------------------
// ACCESSIBILITY (ARIA)
// -------------------------------------------------------------

function applyAriaAttributes() {
  DOM.taskList.setAttribute('role', 'list');
  DOM.taskList.setAttribute('aria-label', 'Tasks list for today');
  DOM.addBtn.setAttribute('aria-label', 'Add new task');
  DOM.searchInput.setAttribute('aria-label', 'Search tasks');
  DOM.progressFill.setAttribute('role', 'progressbar');
  DOM.progressFill.setAttribute('aria-valuemin', '0');
  DOM.progressFill.setAttribute('aria-valuemax', '100');
  DOM.progressFill.setAttribute('aria-valuenow', '0');
  
  DOM.templateModal.setAttribute('role', 'dialog');
  DOM.templateModal.setAttribute('aria-modal', 'true');
  DOM.templateModal.setAttribute('aria-labelledby', 'template-modal-title');
  
  DOM.editModal.setAttribute('role', 'dialog');
  DOM.editModal.setAttribute('aria-modal', 'true');
  DOM.editModal.setAttribute('aria-labelledby', 'edit-modal-title');
  
  // Ensure all buttons are keyboard accessible
  const focusables = document.querySelectorAll('button, [href], input, select, textarea');
  focusables.forEach(el => {
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
  });
}

// -------------------------------------------------------------
// UTILITY
// -------------------------------------------------------------

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Export for template usage
export function applyTemplate(subject, title, chapter, mins, priority) {
  DOM.subjectSel.value = subject;
  populateChapters(DOM.chapterSel, subject);
  DOM.chapterSel.value = chapter || "";
  DOM.titleInp.value = title || "";
  DOM.minutesInp.value = mins || 0;
  DOM.prioritySel.value = priority || "High";
}

// Make globally available for inline onclick handlers
if (typeof window !== 'undefined') {
  window.applyTemplate = applyTemplate;
}
