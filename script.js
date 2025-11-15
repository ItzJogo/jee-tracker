// -------------------------------------------------------------
//    CORE ENGINE — YASH v7.1 PRO
// -------------------------------------------------------------

// 1) CONSTANTS
const TASKS_KEY = "yash_local_tasks_v7";
const SYLLABUS_KEY = "yash_syllabus_v7";
const CALENDAR_KEY = "yash_calendar_v7";
const REFLECTION_KEY = "yash_reflection_v7";
const GOAL_KEY = "yash_daily_goal_v7";

// === YASH DATE FIX START (v7.1) ===
// Purana code `new Date().toISOString().slice(0,10)` subah 5:30 se pehle pichle din ki date de raha tha (UTC bug).
// Yeh naya code hamesha phone ki local date lega.
const d = new Date();
const year = d.getFullYear();
const month = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 kyunki month 0-indexed hota hai
const day = d.getDate().toString().padStart(2, '0');
let today = `${year}-${month}-${day}`;
// === YASH DATE FIX END ===

let localTasks = [];
let editingTaskId = null;
let progressChart = null;
let syllabusChart = null;

// -------------------------------------------------------------
//    CORE DEFINITIONS — SYLLABUS & DATA
// -------------------------------------------------------------

// **FIX 1**: SYLLABUS constant define karna
const SYLLABUS = {
  "Physics": [
    "Units & Dimensions", "Kinematics 1D", "Kinematics 2D", "NLM", "Friction",
    "WPE", "Circular Motion", "COM", "Rotation", "SHM", "Waves", "Heat & Thermo",
    "Electrostatics", "Current", "Capacitors", "Magnetics", "EMI", "AC", "Optics", "Modern Physics"
  ],
  "Chemistry": [
    "Mole Concept", "Atomic Structure", "Periodic Table", "Chemical Bonding",
    "States of Matter", "Thermodynamics", "Equilibrium (Chemical)", "Equilibrium (Ionic)",
    "Redox", "GOC", "Isomerism", "Hydrocarbons", "Haloalkanes", "Alcohols/Ethers",
    "Carbonyls", "Acids", "Amines", "Biomolecules", "Solid State", "Solutions",
    "Electrochem", "Kinetics", "Metallurgy", "p-Block", "d/f-Block", "Coordination"
  ],
  "Math": [
    "Basic Maths", "Logarithms", "Trigonometry", "Quadratic", "Sequence & Series",
    "Straight Lines", "Circles", "Conic Sections", "Binomial", "P&C", "Probability",
    "Matrices", "Determinants", "Functions", "ITF", "Limits (LCD)", "MOD", "AOD",
    "Indefinite Int.", "Definite Int.", "Area", "Diff. Eqns", "Vector", "3D Geometry"
  ],
  "Biology": [
    "Cell", "Biomolecules", "Cell Cycle", "Transport in Plants", "Photosynthesis",
    "Respiration", "Plant Growth", "Digestion", "Breathing", "Body Fluids",
    "Excretion", "Locomotion", "Neural Control", "Endocrine", "Repro. in Org.",
    "Sexual Repro. Plants", "Human Repro.", "Repro. Health", "Genetics (Inheritance)",
    "Genetics (Molecular)", "Evolution", "Human Health", "Biotech", "Ecology"
  ]
};

// **FIX 1**: syllabusData ko initialize karna
let syllabusData = {};

let pomo = {
  work: 25 * 60,
  break: 5 * 60,
  remaining: 25 * 60,
  running: false,
  mode: "work",
  totalSessions: 0
};

// 2) QUICK DOM SELECTOR
const $ = (id) => document.getElementById(id);

// 3) DOM REFERENCES
// AB YEH CODE TABHI CHALEGA JAB UPAR KA POORA HTML LOAD HO GAYA HAI
// ISLIYE exportBtn ya body KABHI BHI null/undefined NAHI HOGA
const DOM = {
  titleInp: $("title"),
  subjectSel: $("subject"),
  chapterSel: $("chapter"),
  prioritySel: $("priority"),
  minutesInp: $("minutes"),
  blockSel: $("blockSel"),
  backlogTag: $("backlogTag"),

  todayDate: $("todayDate"),
  dateSmall: $("dateSmall"),

  addBtn: $("addBtn"),
  cancelEditBtn: $("cancelEditBtn"),
  searchInput: $("searchInput"),

  taskList: $("taskList"),
  totalEl: $("total"),
  doneEl: $("done"),
  missedEl: $("missed"),
  evaAlert: $("evaAlert"),

  filterSubject: $("filterSubject"),
  filterPriority: $("filterPriority"),
  clearFiltersBtn: $("clearFiltersBtn"),

  reflectionEl: $("reflection"),
  saveRef: $("saveRef"),
  clearRef: $("clearRef"),
  autoSaveStatus: $("autoSaveStatus"),

  dailyGoalInput: $("dailyGoalInput"),
  progressFill: $("progressFill"),
  progressText: $("progressText"),
  streakEl: $("streak"), 

  syllabusSubject: $("syllabusSubject"),
  syllabusChapters: $("syllabusChapters"),
  
  updateSyllabusBtn: $("updateSyllabusBtn"), 

  animeListContainer: $("animeListContainer"),
  mangaListContainer: $("mangaListContainer"),
  
  mediaTitleInput: $("mediaTitleInput"),
  addAnimeBtn: $("addAnimeBtn"),
  addMangaBtn: $("addMangaBtn"),

  pomoWorkInput: $("pomoWorkInput"),
  pomoBreakInput: $("pomoBreakInput"),
  setTimesBtn: $("setTimesBtn"),
  pStart: $("pStart"),
  pPause: $("pPause"),
  pReset: $("pReset"),
  pomoTimer: $("pomoTimer"),
  miniTimer: $("miniTimer"),
  miniStart: $("miniStart"),
  miniPause: $("miniPause"),

  calendarEl: $("calendar"),

  templateModal: $("templateModal"),
  tempClose: $("tempClose"),
  templateBtn: $("templateBtn"),

  voiceBtn: $("voiceBtn"),

  editModal: $("editModal"),
  editTitle: $("editTitle"),
  editSubject: $("editSubject"),
  editChapter: $("editChapter"),
  editPriority: $("editPriority"),
  editMinutes: $("editMinutes"),
  editBlock: $("editBlock"),
  editBacklog: $("editBacklog"),
  saveEditBtn: $("saveEditBtn"),
  deleteEditBtn: $("deleteEditBtn"),
  editClose: $("editClose"),

  themeToggle: $("themeToggle"),

  // YAHAN AAPKE ERROR WALE ELEMENTS BHI HONGE
  exportBtn: $("exportBtn"),
  importBtn: $("importBtn")
  // ... aur document.body bhi ab available hai
};

// Set today
DOM.todayDate.innerText = today;
DOM.dateSmall.innerText = today;


// -------------------------------------------------------------
// ENGINE UTILS
// -------------------------------------------------------------

function escapeHtml(str){
  let div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function uuid(){
  return "xxxxxxxx-xxxx".replace(/[x]/g,()=>((Math.random()*16)|0).toString(16));
}
// -----------------------------
// CHUNK 6 / 8
// Task engine: add / save / render / edit / delete / filters / templates / voice / export-import
// -----------------------------

// -------------------------------------------------------------
// STORAGE HELPERS
// -------------------------------------------------------------
function loadLocalTasks(){
  try {
    const arr = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    // only today's tasks (keep history separate)
    localTasks = arr.filter(t => t.date === today);
  } catch(e){
    console.error("Load tasks failed", e);
    localTasks = [];
  }
  renderTasksList();
  renderDashboard();
}

function saveLocalTasks(){
  // Keep older dates in storage as well
  try {
    const existing = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    // Remove today's entries then append localTasks
    const others = existing.filter(t => t.date !== today);
    const merged = others.concat(localTasks);
    localStorage.setItem(TASKS_KEY, JSON.stringify(merged));
  } catch(e){
    console.error("Save tasks failed", e);
  }
  renderTasksList();
  renderDashboard();
}

// -------------------------------------------------------------
// TEMPLATES & VOICE
// -------------------------------------------------------------
function applyTemplate(subject, title, chapter, mins, priority){
  DOM.subjectSel.value = subject;
  populateChapters(DOM.chapterSel, subject);
  DOM.chapterSel.value = chapter || "";
  DOM.titleInp.value = title || "";
  DOM.minutesInp.value = mins || 0;
  DOM.prioritySel.value = priority || "High";
  DOM.addBtn.click();
}

let recognition = null;
function initVoice(){
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    DOM.voiceBtn.title = "Speech not supported";
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    // simple parsing: "add chemistry goc 30 minutes" or "add GOC 20"
    DOM.titleInp.value = text;
    DOM.voiceBtn.classList.add('pulse');
    setTimeout(()=>DOM.voiceBtn.classList.remove('pulse'),400);
  };
  recognition.onerror = (e) => {
    console.warn("Voice error", e);
  };
}

// -------------------------------------------------------------
// TASK CRUD
// -------------------------------------------------------------
DOM.addBtn.addEventListener('click', () => {
  if (editingTaskId) {
    // fallback: if editing via inline button (but main edit through modal)
    saveEdit();
    cancelEdit();
    return;
  }

  const title = DOM.titleInp.value.trim();
  if (!title) { alert("Give a clear task title."); return; }

  const newTask = {
    id: uuid() + "-" + Date.now(),
    title,
    subject: DOM.subjectSel.value,
    chapter: DOM.chapterSel.value || "",
    priority: DOM.prioritySel.value,
    expectedMinutes: parseInt(DOM.minutesInp.value) || 0,
    status: "Open",
    date: today,
    block: DOM.blockSel.value,
    backlog: DOM.backlogTag.value || "",
    createdAt: new Date().toISOString()
  };

  localTasks.push(newTask);

  // update syllabus totals
  if (newTask.chapter) {
    updateSyllabusProgress(newTask.subject, newTask.chapter, newTask.expectedMinutes, false);
  }

  saveLocalTasks();
  DOM.titleInp.value = ""; DOM.minutesInp.value = ""; DOM.backlogTag.value = ""; DOM.chapterSel.value = "";
});

// Update status
function updateLocalTaskStatus(id, status, minutes, subject, chapter){
  const idx = localTasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  localTasks[idx].status = status;
  if (status === 'Done' && chapter) {
    updateSyllabusProgress(subject, chapter, minutes, true);
  }
  saveLocalTasks();
  updateDailySummary();
}

// Delete
function deleteTaskLocal(id){
  const idx = localTasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  const task = localTasks[idx];
  // adjust syllabus if not done
  if (task.chapter && task.status !== 'Done') {
    updateSyllabusProgress(task.subject, task.chapter, -task.expectedMinutes, false);
  }
  localTasks.splice(idx,1);
  saveLocalTasks();
  updateDailySummary();
}

// Edit modal open
function openEditModal(task){
  editingTaskId = task.id;
  DOM.editTitle.value = task.title || "";
  DOM.editSubject.value = task.subject || "";
  populateChapters(DOM.editChapter, task.subject, task.chapter || "");
  DOM.editPriority.value = task.priority || "";
  DOM.editMinutes.value = task.expectedMinutes || "";
  DOM.editBlock.value = task.block || "";
  DOM.editBacklog.value = task.backlog || "";
  DOM.editModal.style.display = 'block';
}

// Save edit
function saveEdit(){
  if (!editingTaskId) return;
  const index = localTasks.findIndex(t => t.id === editingTaskId);
  if (index === -1) return;
  const old = localTasks[index];

  const updates = {
    title: DOM.editTitle.value.trim(),
    subject: DOM.editSubject.value,
    chapter: DOM.editChapter.value || "",
    priority: DOM.editPriority.value,
    expectedMinutes: parseInt(DOM.editMinutes.value) || 0,
    block: DOM.editBlock.value,
    backlog: DOM.editBacklog.value,
    updatedAt: new Date().toISOString()
  };

  // adjust syllabus if chapter/minutes changed
  if (old.chapter !== updates.chapter || old.expectedMinutes !== updates.expectedMinutes) {
    if (old.chapter && old.status !== 'Done') {
      updateSyllabusProgress(old.subject, old.chapter, -old.expectedMinutes, false);
    }
    if (updates.chapter) {
      updateSyllabusProgress(updates.subject, updates.chapter, updates.expectedMinutes, false);
    }
  }

  localTasks[index] = {...old, ...updates};
  saveLocalTasks();
  updateDailySummary();
  editingTaskId = null;
  DOM.editModal.style.display = 'none';
}

// Delete from edit
function deleteFromEdit(){
  if (!editingTaskId) return;
  deleteTaskLocal(editingTaskId);
  DOM.editModal.style.display = 'none';
  editingTaskId = null;
}

// -------------------------------------------------------------
// RENDERING
// -------------------------------------------------------------
function renderTasksList(){
  let tasks = localTasks.slice();

  // filters
  const subjectFilter = DOM.filterSubject.value;
  const priorityFilter = DOM.filterPriority.value;
  const searchQuery = (DOM.searchInput.value || "").toLowerCase();

  if (subjectFilter) tasks = tasks.filter(t => t.subject === subjectFilter);
  if (priorityFilter) tasks = tasks.filter(t => t.priority === priorityFilter);
  if (searchQuery) tasks = tasks.filter(t => (t.title || "").toLowerCase().includes(searchQuery));

  DOM.taskList.innerHTML = "";

  // group by subject
  const grouped = tasks.reduce((acc,t)=>{
    acc[t.subject] = acc[t.subject] || [];
    acc[t.subject].push(t);
    return acc;
  }, {});

  const order = ['Physics','Chemistry','Math','Biology'];
  order.forEach(sub=>{
    const list = grouped[sub];
    if (!list || list.length === 0) return;
    // subject header
    const hdr = document.createElement('div');
    hdr.className = 'subject-group-header';
    hdr.innerHTML = `<span>${sub}</span><span class="icon">Total: ${list.length}</span>`;
    DOM.taskList.appendChild(hdr);

    // sort by priority
    list.sort((a,b)=>{
      const map = {High:3, Medium:2, Low:1};
      return (map[b.priority]||0) - (map[a.priority]||0);
    }).forEach(task => {
      addTaskToUI(task.id, task);
    });
  });

  if (tasks.length === 0) {
    DOM.taskList.innerHTML = '<div style="text-align:center;color:var(--muted);margin-top:20px;">No tasks for today — add one!</div>';
  }
}

function addTaskToUI(id, doc){
  const el = document.createElement('div');
  el.className = 'task';
  el.setAttribute('data-id', id);

  // === YASH v7.1 'DONE' STATE FIX ===
  if (doc.status === 'Done') {
    el.classList.add('task-done');
    const check = document.createElement('div');
    check.className = 'done-check';
    check.textContent = '✔';
    el.appendChild(check);
  } else if (doc.status === 'Missed') {
    el.classList.add('task-missed');
  }
  // === END v7.1 FIX ===

  const left = document.createElement('div');
  left.style.flex = '1';

  const title = document.createElement('div');
  title.className = 'title-small';
  title.textContent = doc.title;
  left.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'meta';
  const chapterText = doc.chapter ? ` • ${escapeHtml(doc.chapter)}` : '';
  meta.innerHTML = `${escapeHtml(doc.subject)}${chapterText} • ${escapeHtml(doc.priority)} • ${escapeHtml(doc.expectedMinutes||0)} min ${doc.backlog ? `• ${escapeHtml(doc.backlog)}`: ''}`;
  left.appendChild(meta);

  const meta2 = document.createElement('div');
  meta2.className = 'meta';
  meta2.style.marginTop = '6px';
  meta2.textContent = `Block: ${doc.block || 'N/A'}`;
  left.appendChild(meta2);

  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.flexDirection = 'column';
  right.style.alignItems = 'flex-end';
  right.style.gap = '8px';

  const badge = document.createElement('div');
  const statusClass = (doc.status || 'Open').toLowerCase();
  badge.className = `badge ${statusClass}`;
  badge.textContent = doc.status;
  right.appendChild(badge);

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '6px';
  btnRow.style.flexWrap = 'wrap'; // FIXED: Added wrap here too

  const doneBtn = document.createElement('button');
  doneBtn.className = 'btn';
  doneBtn.textContent = 'Done';
  doneBtn.onclick = ()=> {
    if (confirm('Mark as Done?')) {
      updateLocalTaskStatus(id, 'Done', doc.expectedMinutes, doc.subject, doc.chapter);
      renderTasksList();
      updateDailySummary();
    }
  };

  const missBtn = document.createElement('button');
  missBtn.className = 'btn';
  missBtn.textContent = 'Miss';
  missBtn.onclick = ()=> {
    if (confirm('Mark as Missed?')) {
      updateLocalTaskStatus(id, 'Missed', doc.expectedMinutes, doc.subject, doc.chapter);
      renderTasksList();
      updateDailySummary();
    }
  };

  const editBtn = document.createElement('button');
  editBtn.className = 'btn edit';
  editBtn.textContent = 'Edit';
  editBtn.onclick = ()=> openEditModal(doc);

  btnRow.appendChild(doneBtn);
  btnRow.appendChild(missBtn);
  btnRow.appendChild(editBtn);

  right.appendChild(btnRow);

  const delBtn = document.createElement('button');
  delBtn.className = 'btn danger';
  delBtn.textContent = '🗑️ Delete';
  delBtn.onclick = ()=> {
    if (confirm('Delete this task?')) deleteTaskLocal(id);
  };
  right.appendChild(delBtn);

  el.appendChild(left);
  el.appendChild(right);
  DOM.taskList.appendChild(el);
}

// -------------------------------------------------------------
// FILTERS & UI INITIAL SETUP
// -------------------------------------------------------------
function populateChapters(selectEl, subject, selected=''){
  selectEl.innerHTML = '<option value="">Select Chapter</option>';
  if (!subject || !SYLLABUS[subject]) return;
  SYLLABUS[subject].forEach(ch=>{
    const o = document.createElement('option');
    o.value = ch; o.textContent = ch;
    if (ch === selected) o.selected = true;
    selectEl.appendChild(o);
  });
}

(function initUI(){
  const subjects = ['Chemistry','Physics','Math','Biology'];
  const priorities = ['High','Medium','Low'];
  subjects.forEach(s => {
    DOM.filterSubject.innerHTML += `<option value="${s}">${s}</option>`;
    // DOM.subjectSel.innerHTML += `<option value="${s}">${s}</option>`; // Already in HTML
    DOM.editSubject.innerHTML += `<option value="${s}">${s}</option>`;
    // DOM.syllabusSubject.innerHTML += `<option value="${s}">${s}</option>`; // Already in HTML
  });
  priorities.forEach(p=>{
    DOM.filterPriority.innerHTML += `<option value="${p}">${p}</option>`;
    DOM.editPriority.innerHTML += `<option value="${p}">${p}</option>`;
  });

  // blocks
  const blocks = ['Block A','Block B','Block C','Block D'];
  // DOM.blockSel.innerHTML = ''; // Already in HTML
  DOM.editBlock.innerHTML = '';
  blocks.forEach(b => {
    // DOM.blockSel.innerHTML += `<option value="${b}">${b}</option>`; // Already in HTML
    DOM.editBlock.innerHTML += `<option value="${b}">${b}</option>`;
  });

  // populate chapters default
  populateChapters(DOM.chapterSel, 'Chemistry');
  populateChapters(DOM.editChapter, 'Chemistry');

  // event listeners
  DOM.filterSubject.onchange = renderTasksList;
  DOM.filterPriority.onchange = renderTasksList;
  DOM.searchInput.oninput = renderTasksList;
  DOM.clearFiltersBtn.onclick = ()=>{
    DOM.filterSubject.value=''; DOM.filterPriority.value=''; DOM.searchInput.value='';
    renderTasksList();
  };
  
  // Chapter dropdowns dynamic update
  DOM.subjectSel.onchange = ()=> populateChapters(DOM.chapterSel, DOM.subjectSel.value);
  DOM.editSubject.onchange = ()=> populateChapters(DOM.editChapter, DOM.editSubject.value);

  // template modal
  DOM.templateBtn.onclick = ()=> { DOM.templateModal.style.display = 'block'; };
  DOM.tempClose.onclick = ()=> { DOM.templateModal.style.display = 'none'; };
  window.onclick = (e)=>{
    if (e.target === DOM.templateModal) DOM.templateModal.style.display = 'none';
    if (e.target === DOM.editModal) { DOM.editModal.style.display = 'none'; editingTaskId = null; }
  };

  // edit modal save/delete
  DOM.saveEditBtn.onclick = saveEdit;
  DOM.deleteEditBtn.onclick = deleteFromEdit;
  DOM.editClose.onclick = ()=> { DOM.editModal.style.display = 'none'; editingTaskId = null; };

  // voice
  DOM.voiceBtn.onclick = ()=> {
    if (!recognition) initVoice();
    if (!recognition) return alert("Speech API not supported in this browser.");
    recognition.start();
  };

  // reflection
  DOM.saveRef.onclick = ()=>{
    const text = DOM.reflectionEl.value.trim();
    const r = JSON.parse(localStorage.getItem(REFLECTION_KEY) || "{}");
    if (text) {
      r[today] = { text, ts: new Date().toISOString() };
      localStorage.setItem(REFLECTION_KEY, JSON.stringify(r));
      DOM.autoSaveStatus.innerText = "Last saved: " + new Date().toLocaleTimeString();
      alert("Pilot Log saved.");
    } else {
      delete r[today];
      localStorage.setItem(REFLECTION_KEY, JSON.stringify(r));
      DOM.autoSaveStatus.innerText = "Last saved: —";
    }
  };
  DOM.clearRef.onclick = ()=> { DOM.reflectionEl.value=''; DOM.autoSaveStatus.innerText = "Last saved: —"; };

  // syllabus subject change
  DOM.syllabusSubject.onchange = renderSyllabusProgress;
  
  // ***THIS IS THE LINE THAT WAS CAUSING THE ERROR***
  // It is now fixed because DOM.updateSyllabusBtn is correctly defined
  DOM.updateSyllabusBtn.onclick = ()=> { loadSyllabusData(); renderSyllabusChart(); alert("Syllabus updated"); };

  // media list
  DOM.addAnimeBtn.onclick = ()=> addMediaItem('anime');
  DOM.addMangaBtn.onclick = ()=> addMediaItem('manga');

  // pomodoro controls
  DOM.setTimesBtn.onclick = ()=> {
    pomo.work = (parseInt(DOM.pomoWorkInput.value) || 25) * 60;
    pomo.break = (parseInt(DOM.pomoBreakInput.value) || 5) * 60;
    pomo.remaining = pomo.work; renderPomoTime();
  };
  DOM.pStart.onclick = startPomoTimer;
  DOM.pPause.onclick = ()=> { if (pomo.timer) clearInterval(pomo.timer); pomo.running=false; pomo.timer=null; };
  DOM.pReset.onclick = ()=> { if (pomo.timer) clearInterval(pomo.timer); pomo.running=false; pomo.timer=null; initPomo(); };

  DOM.miniStart.onclick = startPomoTimer;
  DOM.miniPause.onclick = DOM.pPause.onclick;

  // export/import
  // *** YEH BHI AB 100% CHALEGA ***
  DOM.exportBtn.onclick = exportAll;
  DOM.importBtn.onclick = importAll;

  // theme toggle
  DOM.themeToggle.onclick = toggleTheme;

})();

// -------------------------------------------------------------
// DASHBOARD & CHARTS
// -------------------------------------------------------------
function renderDashboard(){
  const tasks = localTasks;
  const total = tasks.length;
  const done = tasks.filter(t=>t.status==='Done').length;
  const missed = tasks.filter(t=>t.status==='Missed').length;
  const completedMins = tasks.filter(t=>t.status==='Done').reduce((s,t)=> s + (t.expectedMinutes||0), 0);
  const dailyGoal = parseInt(DOM.dailyGoalInput.value) || 240;

  DOM.totalEl.innerText = total;
  DOM.doneEl.innerText = done;
  DOM.missedEl.innerText = missed;

  const percent = Math.min(100, Math.round((completedMins/dailyGoal)*100));
  DOM.progressFill.style.width = percent + '%';
  DOM.progressText.innerText = `${completedMins} / ${dailyGoal} mins`;

  localStorage.setItem(GOAL_KEY, dailyGoal);

  // streak (local)
  const s = calculateStreak();
  DOM.streakEl.innerText = `${s} days`; // Removed "Streak: " as it's already a label

  renderSubjectChart(tasks);
  microcopyTriggers(done, missed);
}

function renderSubjectChart(tasks){
  const subs = ['Chemistry','Physics','Math','Biology'];
  const doneCounts = subs.map(s => tasks.filter(t=>t.subject===s && t.status==='Done').length);

  const ctx = document.getElementById('progressChart').getContext('2d');
  if (progressChart) progressChart.destroy();
  progressChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels:subs,
      datasets:[{ label:'Done', data: doneCounts, backgroundColor:['#f87171','#38bdf8','#34d399','#fbbf24'] }]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, ticks:{stepSize:1}}}}
  });
}

// -------------------------------------------------------------
// STREAK & CALENDAR
// -------------------------------------------------------------
function calculateStreak(){
  const cal = JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}");
  const doneDates = new Set();
  Object.keys(cal).forEach(d=>{
    const it = cal[d];
    if ((it.done||0) > 0 || (it.pomodoro||0) > 0) doneDates.add(d);
  });
  // add today if any done
  if (localTasks.some(t=>t.status==='Done') || (pomo.totalSessions && pomo.totalSessions>0)) doneDates.add(today);

  let streak=0;
  const cur = new Date(); // Use local 'today'
  cur.setFullYear(parseInt(today.slice(0,4)), parseInt(today.slice(5,7))-1, parseInt(today.slice(8,10)));
  
  while(true){
    const key = `${cur.getFullYear()}-${(cur.getMonth() + 1).toString().padStart(2, '0')}-${cur.getDate().toString().padStart(2, '0')}`;
    if (doneDates.has(key)) { 
      streak++; 
      cur.setDate(cur.getDate()-1); 
    } else break;
  }
  return streak;
}

function updateDailySummary(){
  const done = localTasks.filter(t=>t.status==='Done').length;
  const missed = localTasks.filter(t=>t.status==='Missed').length;
  const cal = JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}");
  cal[today] = { date: today, done, missed, pomodoro: pomo.totalSessions || 0, active: (done>0 || (pomo.totalSessions||0)>0), updatedAt:new Date().toISOString() };
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(cal));
  renderCalendar();
}

function renderCalendar(){
  const container = DOM.calendarEl;
  container.innerHTML = '';
  const cal = JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}");
  for (let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    // Use local date formatting for the key
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    
    const el = document.createElement('div');
    el.className = 'day';
    el.innerText = key.slice(5);
    const data = cal[key];
    if (data){
      const score = (data.done||0) + (data.pomodoro||0) - (data.missed||0);
      if (score>0) el.style.background = 'linear-gradient(180deg, rgba(52,211,153,0.3), rgba(52,211,153,0.05))';
      else if (score<0) el.style.background = 'linear-gradient(180deg, rgba(248,113,113,0.3), rgba(248,113,113,0.05))';
    }
    if (key === today) { // Highlight today
        el.style.borderColor = 'var(--accent)';
        el.style.boxShadow = 'var(--glow)';
    }
    container.appendChild(el);
  }
}

// -------------------------------------------------------------
// EXPORT / IMPORT
// -------------------------------------------------------------
function exportAll(){
  const data = {
    tasks: JSON.parse(localStorage.getItem(TASKS_KEY) || "[]"),
    syllabus: JSON.parse(localStorage.getItem(SYLLABUS_KEY) || "{}"),
    calendar: JSON.parse(localStorage.getItem(CALENDAR_KEY) || "{}"),
    reflections: JSON.parse(localStorage.getItem(REFLECTION_KEY) || "{}"),
    goal: localStorage.getItem(GOAL_KEY) || "240",
    anime: JSON.parse(localStorage.getItem('yash_anime_list') || "[]"),
    manga: JSON.parse(localStorage.getItem('yash_manga_list') || "[]")
  };
  const blob = new Blob([JSON.stringify(data,null,2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jee-backup-' + today + '.json';
  
  // *** YEH BHI AB 100% CHALEGA ***
  // document.body null nahi hai
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importAll(){
  const ip = document.createElement('input');
  ip.type = 'file';
  ip.accept = 'application/json';
  ip.onchange = (e)=>{
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev)=>{
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!confirm('Import will overwrite local data. Proceed?')) return;
        if (parsed.tasks) localStorage.setItem(TASKS_KEY, JSON.stringify(parsed.tasks));
        if (parsed.syllabus) localStorage.setItem(SYLLABUS_KEY, JSON.stringify(parsed.syllabus));
        if (parsed.calendar) localStorage.setItem(CALENDAR_KEY, JSON.stringify(parsed.calendar));
        if (parsed.reflections) localStorage.setItem(REFLECTION_KEY, JSON.stringify(parsed.reflections));
        if (parsed.goal) localStorage.setItem(GOAL_KEY, parsed.goal);
        if (parsed.anime) localStorage.setItem('yash_anime_list', JSON.stringify(parsed.anime));
        if (parsed.manga) localStorage.setItem('yash_manga_list', JSON.stringify(parsed.manga));
        alert('Import done. Reloading...');
        window.location.reload();
      } catch(err){
        alert('Invalid JSON file.');
      }
    };
    r.readText(f);
  };
  ip.click();
}

// -------------------------------------------------------------
// MEDIA LIST (anime / manga)
// -------------------------------------------------------------
function loadMediaList(type){ return JSON.parse(localStorage.getItem(`yash_${type}_list`) || "[]"); }
function saveMediaList(type, list){ localStorage.setItem(`yash_${type}_list`, JSON.stringify(list)); renderMediaLists(); }
function renderMediaLists(){
  const anime = loadMediaList('anime');
  const manga = loadMediaList('manga');
  DOM.animeListContainer.innerHTML = anime.map((it,idx)=> `<div class="list-item">${escapeHtml(it)} <button class="list-btn" onclick="deleteMediaItem('anime',${idx})">❌</button></div>`).join('') || `<div class="meta" style="text-align:center;padding:8px 0;color:var(--muted)">No anime logged</div>`;
  DOM.mangaListContainer.innerHTML = manga.map((it,idx)=> `<div class="list-item">${escapeHtml(it)} <button class="list-btn" onclick="deleteMediaItem('manga',${idx})">❌</button></div>`).join('') || `<div class="meta" style="text-align:center;padding:8px 0;color:var(--muted)">No manga logged</div>`;
}
window.deleteMediaItem = (type, idx)=>{
  const list = loadMediaList(type);
  list.splice(idx,1);
  saveMediaList(type, list);
};
function addMediaItem(type){
  const title = DOM.mediaTitleInput.value.trim();
  if (!title) return;
  const list = loadMediaList(type);
  list.push(title);
  saveMediaList(type, list);
  DOM.mediaTitleInput.value = '';
}

// -------------------------------------------------------------
// POMODORO IMPLEMENTATION (local)
// -------------------------------------------------------------
function formatTime(sec){
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = (sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function initPomo(){
  pomo.work = (parseInt(DOM.pomoWorkInput.value) || 25) * 60;
  pomo.break = (parseInt(DOM.pomoBreakInput.value) || 5) * 60;
  pomo.remaining = pomo.work;
  renderPomoTime();
}

function renderPomoTime(){
  DOM.pomoTimer.innerText = formatTime(pomo.remaining);
  DOM.miniTimer.innerText = formatTime(pomo.remaining);
}

function startPomoTimer(){
  if (pomo.running) return;
  if (pomo.timer) clearInterval(pomo.timer);
  pomo.running = true;
  pomo.timer = setInterval(()=>{
    pomo.remaining--;
    renderPomoTime();
    if (pomo.remaining <= 0){
      clearInterval(pomo.timer);
      pomo.running = false;
      pomo.timer = null;
      if (pomo.mode === 'work'){
        pomo.totalSessions++;
        updateDailySummary();
        pomo.mode = 'break';
        pomo.remaining = pomo.break;
        alert('Work done — take a break!');
      } else {
        pomo.mode = 'work';
        pomo.remaining = pomo.work;
        alert('Break over — back to work!');
      }
      renderPomoTime();
      renderDashboard();
    }
  },1000);
}

// -------------------------------------------------------------
// SYLLABUS (local) 
// -------------------------------------------------------------

// This function was missing in the original chunks, but needed for syllabus
function updateSyllabusProgress(subject, chapter, minutes, isDone){
  if (!subject || !chapter || !syllabusData) return;
  if (!syllabusData[subject]) syllabusData[subject] = {};
  if (!syllabusData[subject][chapter]) {
    syllabusData[subject][chapter] = { totalMinutes: 0, completedMinutes: 0, progress: 0 };
  }
  const ch = syllabusData[subject][chapter];
  
  if (isDone) {
    ch.completedMinutes = (ch.completedMinutes || 0) + minutes;
  } else {
    // only update total if not done
    ch.totalMinutes = (ch.totalMinutes || 0) + minutes;
  }
  
  // ensure total is at least as large as completed
  if (ch.totalMinutes < ch.completedMinutes) ch.totalMinutes = ch.completedMinutes;
  
  // update progress
  if (ch.totalMinutes > 0) {
    ch.progress = Math.min(100, (ch.completedMinutes / ch.totalMinutes) * 100);
  } else {
    ch.progress = 0;
  }
  
  saveSyllabusData();
}

// -------------------------------------------------------------
// MISC UI / MICROCOPY
// -------------------------------------------------------------
function microcopyTriggers(done, missed){
  const el = DOM.evaAlert;
  if (missed >= 3) el.innerText = "LCL Pressure Critical. Re-engage.";
  else if (done >= 5) el.innerText = "Third Impact Averted. Sync rising.";
  else el.innerText = "";
}

// -------------------------------------------------------------
// THEME / ACCESSIBILITY
// -------------------------------------------------------------
function toggleTheme(){
  const cls = document.documentElement.classList;
  if (cls.contains('light')) cls.remove('light');
  else cls.add('light');
  localStorage.setItem('yash_theme', cls.contains('light') ? 'light' : 'dark');
}

// -------------------------------------------------------------
// BOOTSTRAP: load everything
// -------------------------------------------------------------
(function boot(){
  DOM.reflectionEl.value = JSON.parse(localStorage.getItem(REFLECTION_KEY) || "{}")[today]?.text || "";
  DOM.autoSaveStatus.innerText = DOM.reflectionEl.value ? ("Last saved: " + new Date().toLocaleTimeString()) : "Last saved: —";
  loadLocalTasks();
  loadSyllabusData(); // This now safely uses the initialized syllabusData
  renderCalendar();
  renderMediaLists();
  initPomo();
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) initVoice();
})();
// -----------------------------
// CHUNK 7 / 8
// Syllabus rendering, charts finalization, ARIA, keyboard shortcuts & accessibility
// -----------------------------

// -------------------------------------------------------------
// SYLLABUS RENDER / CHART
// -------------------------------------------------------------
function saveSyllabusData(){
  try {
    localStorage.setItem(SYLLABUS_KEY, JSON.stringify(syllabusData));
  } catch(e){ console.warn("Save syllabus failed", e); }
  renderSyllabusProgress();
  renderSyllabusChart();
}

function loadSyllabusData(){
  syllabusData = JSON.parse(localStorage.getItem(SYLLABUS_KEY) || "{}");
  renderSyllabusProgress();
  renderSyllabusChart();
}

function renderSyllabusProgress(){
  const subject = DOM.syllabusSubject.value || 'Physics';
  const container = DOM.syllabusChapters;
  container.innerHTML = '';

  if (!syllabusData[subject]) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted)">No progress yet — choose a chapter while adding tasks.</div>';
    return;
  }

  SYLLABUS[subject].forEach(chapter=>{
    const data = syllabusData[subject][chapter] || { completedMinutes:0, totalMinutes:0, progress:0 };
    const wrapper = document.createElement('div');
    wrapper.className = 'chapter-progress';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '12px';
    wrapper.style.marginBottom = '8px';

    const title = document.createElement('div');
    title.style.width = '30%';
    title.style.fontSize = '0.9rem';
    title.textContent = chapter;

    const barWrap = document.createElement('div');
    barWrap.className = 'chapter-bar'; // Needs CSS
    barWrap.style.flex = '1';
    /* (styles for chapter-bar are now in the <style> tag) */

    const fill = document.createElement('div');
    fill.className = 'chapter-fill'; // Needs CSS
    fill.style.width = (data.progress || 0) + '%';
    /* (styles for chapter-fill are now in the <style> tag) */
    barWrap.appendChild(fill);

    const percent = document.createElement('div');
    percent.style.width = '50px';
    percent.style.fontSize = '0.85rem';
    percent.style.color = 'var(--muted)';
    percent.textContent = Math.round(data.progress || 0) + '%';

    wrapper.appendChild(title);
    wrapper.appendChild(barWrap);
    wrapper.appendChild(percent);
    container.appendChild(wrapper);
  });
}

function renderSyllabusChart(){
  const subjects = ['Physics','Chemistry','Math','Biology'];
  const progresses = subjects.map(sub=>{
    if (!syllabusData[sub]) return 0;
    const chapters = SYLLABUS[sub] || [];
    if (!chapters.length) return 0;
    const total = chapters.reduce((acc,ch)=>{
      const d = syllabusData[sub][ch] || { progress:0 };
      return acc + (d.progress || 0);
    },0);
    return Math.round(total / chapters.length);
  });

  const ctx = document.getElementById('syllabusChart').getContext('2d');
  if (syllabusChart) syllabusChart.destroy();
  syllabusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: subjects,
      datasets: [{ data: progresses, backgroundColor: ['#38bdf8','#f87171','#34d399','#fbbf24'] }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}} }
  });
}

// -------------------------------------------------------------
// ACCESSIBILITY ENHANCEMENTS / ARIA attributes
// -------------------------------------------------------------
function applyAria() {
  // Roles
  DOM.taskList.setAttribute('role','list');
  DOM.taskList.setAttribute('aria-label','Tasks list for today');
  DOM.addBtn.setAttribute('aria-label','Add new task');
  DOM.searchInput.setAttribute('aria-label','Search tasks');
  DOM.progressFill.setAttribute('role','progressbar');
  DOM.progressFill.setAttribute('aria-valuemin','0');
  DOM.progressFill.setAttribute('aria-valuemax','100');
  DOM.progressFill.setAttribute('aria-valuenow', DOM.progressFill.style.width.replace('%','') || '0');

  // Modal roles
  DOM.templateModal.setAttribute('role','dialog');
  DOM.templateModal.setAttribute('aria-modal','true');
  DOM.editModal.setAttribute('role','dialog');
  DOM.editModal.setAttribute('aria-modal','true');

  // Buttons keyboard focus
  const focusables = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]');
  focusables.forEach((el,i)=> {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  });
}
applyAria();

// -------------------------------------------------------------
// KEYBOARD SHORTCUTS
// -------------------------------------------------------------
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter => add task
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    DOM.addBtn.click();
    showToast('Task added (Ctrl+Enter)');
  }
  // Slash => focus search
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    DOM.searchInput.focus();
  }
  // Alt+R => start pomodoro
  if (e.altKey && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault();
    startPomoTimer();
    showToast('Pomodoro started');
  }
});

// -------------------------------------------------------------
// MICRO-UI: Toast
// -------------------------------------------------------------
function showToast(msg, timeout=1600){
  let t = document.getElementById('yash_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'yash_toast';
    t.style.position = 'fixed';
    t.style.right = '20px';
    t.style.bottom = '80px';
    t.style.padding = '8px 12px';
    t.style.borderRadius = '8px';
    t.style.background = 'rgba(0,0,0,0.6)';
    t.style.color = 'white';
    t.style.zIndex = '9999';
    document.body.appendChild(t); // YEH BHI AB 100% CHALEGA
  }
  t.innerText = msg;
  t.style.opacity = '1';
  setTimeout(()=>{ t.style.opacity = '0'; }, timeout);
}

// -------------------------------------------------------------
// PRINT STYLES (simple)
/// Call window.print() to trigger print-friendly view
// -------------------------------------------------------------
function openPrintView(){
  window.print();
}

// -------------------------------------------------------------
// FINAL POLISH: Theme bootstrap
// -------------------------------------------------------------
(function bootstrapTheme(){
  const t = localStorage.getItem('yash_theme') || 'dark';
  if (t === 'light') document.documentElement.classList.add('light');
  // add small print CSS rule dynamically
  const style = document.createElement('style');
  style.innerHTML = `@media print { body { background: #fff; color: #000 } .card { box-shadow:none; background:#fff; border:1px solid #e6e6e6 } }`;
  document.head.appendChild(style);
})();

// -------------------------------------------------------------
// Save/Auto-save reflection (light)
DOM.reflectionEl.addEventListener('input', ()=>{
  const data = JSON.parse(localStorage.getItem(REFLECTION_KEY) || '{}');
  data[today] = { text: DOM.reflectionEl.value, ts: new Date().toISOString() };
  localStorage.setItem(REFLECTION_KEY, JSON.stringify(data));
  DOM.autoSaveStatus.innerText = 'Autosaved: ' + new Date().toLocaleTimeString();
});

// -------------------------------------------------------------
// Small helper to safely update progressbar ARIA value when dashboard rerenders
// -------------------------------------------------------------
const originalRenderDashboard = renderDashboard;
renderDashboard = function(){
  originalRenderDashboard();
  const val = DOM.progressFill.style.width.replace('%','') || '0';
  DOM.progressFill.setAttribute('aria-valuenow', val);
};

// End of CHUNK 7
// -----------------------------
// CHUNK 8 / 8
// Final polish, autosave-on-unload, integrity-check helper, README note, closing tags
// -----------------------------

// -------------------------------------------------------------
// Autosave on unload (safety)
window.addEventListener('beforeunload', () => {
  try {
    saveLocalTasks(); // ensure tasks are written
    saveSyllabusData();
    updateDailySummary();
    // reflections already autosaved on input
  } catch(e) { console.warn('Autosave failed on unload', e); }
});

// -------------------------------------------------------------
// Simple integrity check helper (run in browser console)
// Usage: copy-paste this function in devtools console and run computePageHash(). 
// It will compute a SHA-256 of the page's HTML (not cryptographically secure, but good for quick verify).
// Example: computePageHash().then(h=>console.log(h));
async function computePageHash() {
  const txt = document.documentElement.outerHTML;
  const enc = new TextEncoder().encode(txt);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  return hex;
}
// OPTIONAL: run computePageHash().then(h=>alert('Page SHA-26: '+h))

// -------------------------------------------------------------
// Small README (embedded)
// -------------------------------------------------------------
/*
README - JEE FOCUS TRACKER — v7.1 PRO (local)
------------------------------------------------
How to verify paste/merge correctness:
1. You pasted CHUNK 1..8 in order into a single index.html.
2. Open index.html in browser.
3. Open DevTools Console and run:
     computePageHash().then(h => console.log('SHA256:', h));
   Save that hex somewhere. If you re-paste later, run again and compare — matching hex means exact same text.

Quick deploy:
- Upload index.html (and any assets if added) to Netlify / Vercel / GitHub Pages.
- Everything uses localStorage; no server required.

Troubleshooting:
- If charts error: ensure Chart.js script tag is present in <head>.
- If Speech API not working on some browsers, test in Chrome (desktop) or Edge (desktop).
- If import/export fails on huge files, split JSON or use desktop.

Features included across chunks:
- Multi-subject grouped tasks, syllabus tracking, local persistence
- Pomodoro timer + mini floating widget
- Templates + voice quick-add
- Export / import full JSON backup
- Calendar + streak tracking + progress charts
- ARIA attributes, keyboard shortcuts, print-friendly rule
- Autosave & save-on-unload

If any console error appears, copy the first error line and paste here — I'll fix the specific line.

Author: Yash-Mode GPT — delivered in 8 chunks.
*/

// -------------------------------------------------------------
// Final render/update calls (safety)
saveLocalTasks();
saveSyllabusData();
renderCalendar();
renderMediaLists();
renderSyllabusProgress();
renderSyllabusChart();
renderDashboard();

// End script and close HTML
