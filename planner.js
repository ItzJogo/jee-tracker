// -------------------------------------------------------------
// PLANNER.JS — Sprint / Study Plan Generator
// -------------------------------------------------------------
// Generates daily task breakdowns based on available time and chapters

// -------------------------------------------------------------
// PLAN GENERATION
// -------------------------------------------------------------

export function generateStudyPlan(config) {
  /*
   * config = {
   *   subject: 'Physics',
   *   chapters: ['Kinematics', 'NLM', 'WPE'],
   *   availableDays: 7,
   *   hoursPerDay: 3,
   *   difficulty: 'medium' // easy, medium, hard
   * }
   */
  
  const {
    subject,
    chapters,
    availableDays,
    hoursPerDay,
    difficulty = 'medium'
  } = config;
  
  // Calculate total available hours
  const totalHours = availableDays * hoursPerDay;
  const totalMinutes = totalHours * 60;
  
  // Estimate time per chapter based on difficulty
  const timeEstimates = chapters.map(chapter => ({
    chapter,
    estimatedMinutes: estimateChapterTime(chapter, difficulty)
  }));
  
  const totalEstimatedMinutes = timeEstimates.reduce((sum, ch) => sum + ch.estimatedMinutes, 0);
  
  // Check if feasible
  if (totalEstimatedMinutes > totalMinutes * 1.2) {
    return {
      feasible: false,
      reason: 'Not enough time for all chapters',
      recommendation: `You need approximately ${Math.ceil(totalEstimatedMinutes / 60)} hours, but only have ${totalHours} hours available.`
    };
  }
  
  // Generate daily schedule
  const dailyPlan = [];
  let remainingMinutes = totalMinutes;
  let chapterIndex = 0;
  
  for (let day = 1; day <= availableDays; day++) {
    const dayMinutes = hoursPerDay * 60;
    const dayTasks = [];
    let allocatedForDay = 0;
    
    while (allocatedForDay < dayMinutes && chapterIndex < chapters.length) {
      const chapter = timeEstimates[chapterIndex];
      const remainingChapterTime = chapter.estimatedMinutes - (chapter.allocated || 0);
      
      if (remainingChapterTime === 0) {
        chapterIndex++;
        continue;
      }
      
      // Allocate time for this chapter today
      const allocate = Math.min(
        remainingChapterTime,
        dayMinutes - allocatedForDay,
        120 // Max 2 hours per session
      );
      
      if (!chapter.allocated) chapter.allocated = 0;
      chapter.allocated += allocate;
      
      dayTasks.push({
        subject,
        chapter: chapter.chapter,
        duration: allocate,
        priority: getPriorityForDay(day, availableDays),
        type: getTaskType(chapter.allocated, chapter.estimatedMinutes)
      });
      
      allocatedForDay += allocate;
      
      // If chapter is complete, move to next
      if (chapter.allocated >= chapter.estimatedMinutes) {
        chapterIndex++;
      }
      
      // Break into smaller sessions if needed
      if (allocate >= 90 && allocatedForDay < dayMinutes) {
        // Add a break reminder
        dayTasks.push({
          subject: 'Break',
          chapter: 'Rest & Revision',
          duration: 15,
          priority: 'Medium',
          type: 'break'
        });
        allocatedForDay += 15;
      }
    }
    
    dailyPlan.push({
      day,
      date: getDateForDay(day),
      tasks: dayTasks,
      totalMinutes: allocatedForDay,
      summary: generateDaySummary(dayTasks)
    });
  }
  
  // Add revision days if time permits
  if (chapterIndex >= chapters.length && remainingMinutes > 120) {
    addRevisionDays(dailyPlan, chapters, subject);
  }
  
  return {
    feasible: true,
    plan: dailyPlan,
    totalChapters: chapters.length,
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    efficiency: Math.round((totalEstimatedMinutes / totalMinutes) * 100),
    recommendations: generateRecommendations(dailyPlan, config)
  };
}

// -------------------------------------------------------------
// TIME ESTIMATION
// -------------------------------------------------------------

function estimateChapterTime(chapterName, difficulty) {
  // Base time estimates (in minutes)
  const baseTime = {
    easy: 90,
    medium: 120,
    hard: 180
  };
  
  // Adjust based on chapter keywords
  let multiplier = 1;
  
  const keywords = {
    'modern': 1.3,
    'quantum': 1.4,
    'thermo': 1.2,
    'calculus': 1.3,
    'organic': 1.3,
    'coordination': 1.2,
    '3d': 1.2,
    'vector': 1.2
  };
  
  Object.keys(keywords).forEach(keyword => {
    if (chapterName.toLowerCase().includes(keyword)) {
      multiplier = Math.max(multiplier, keywords[keyword]);
    }
  });
  
  return Math.round(baseTime[difficulty] * multiplier);
}

// -------------------------------------------------------------
// TASK CATEGORIZATION
// -------------------------------------------------------------

function getTaskType(allocated, total) {
  const progress = allocated / total;
  
  if (progress === 0) return 'introduction';
  if (progress < 0.5) return 'theory';
  if (progress < 0.8) return 'problems';
  return 'revision';
}

function getPriorityForDay(day, totalDays) {
  if (day <= 2) return 'High';
  if (day <= totalDays - 2) return 'Medium';
  return 'High'; // Last days are high priority
}

// -------------------------------------------------------------
// SUMMARY GENERATION
// -------------------------------------------------------------

function generateDaySummary(tasks) {
  const mainTasks = tasks.filter(t => t.type !== 'break');
  const chapters = [...new Set(mainTasks.map(t => t.chapter))];
  
  return {
    totalTasks: mainTasks.length,
    chapters,
    focusArea: chapters[0], // Primary chapter
    hasBreak: tasks.some(t => t.type === 'break')
  };
}

function generateRecommendations(plan, config) {
  const recommendations = [];
  
  // Check for overloaded days
  plan.forEach(day => {
    if (day.totalMinutes > config.hoursPerDay * 60 * 1.1) {
      recommendations.push({
        type: 'warning',
        day: day.day,
        message: `Day ${day.day} is overloaded (${Math.round(day.totalMinutes / 60)}h). Consider extending the plan.`
      });
    }
  });
  
  // Check for gaps
  plan.forEach(day => {
    if (day.totalMinutes < config.hoursPerDay * 60 * 0.7) {
      recommendations.push({
        type: 'info',
        day: day.day,
        message: `Day ${day.day} has extra time. Consider adding practice problems or revision.`
      });
    }
  });
  
  // General recommendations
  if (config.hoursPerDay > 4) {
    recommendations.push({
      type: 'tip',
      message: 'Remember to take regular breaks (Pomodoro technique recommended).'
    });
  }
  
  if (plan.length <= 3) {
    recommendations.push({
      type: 'warning',
      message: 'Short study sprint. Focus on key concepts and skip minor topics if needed.'
    });
  }
  
  return recommendations;
}

// -------------------------------------------------------------
// REVISION OPTIMIZATION
// -------------------------------------------------------------

function addRevisionDays(plan, chapters, subject) {
  // Add weighted revision based on difficulty
  const revisionDay = {
    day: plan.length + 1,
    date: getDateForDay(plan.length + 1),
    tasks: chapters.map((ch, i) => ({
      subject,
      chapter: ch,
      duration: 30,
      priority: 'High',
      type: 'revision',
      focus: i < 3 ? 'Important concepts' : 'Quick review'
    })),
    totalMinutes: chapters.length * 30,
    summary: {
      totalTasks: chapters.length,
      chapters,
      focusArea: 'Comprehensive Revision',
      hasBreak: true
    }
  };
  
  plan.push(revisionDay);
}

// -------------------------------------------------------------
// DATE UTILITIES
// -------------------------------------------------------------

function getDateForDay(dayNumber) {
  const date = new Date();
  date.setDate(date.getDate() + (dayNumber - 1));
  return date.toISOString().split('T')[0];
}

// -------------------------------------------------------------
// TASK IMPORT
// -------------------------------------------------------------

export function importPlanToTasks(plan, addTaskFunction) {
  /*
   * Converts generated plan to actual task objects
   * addTaskFunction should be the state.addTask function
   */
  
  if (!plan.feasible) {
    return {
      success: false,
      message: plan.reason
    };
  }
  
  const createdTasks = [];
  
  plan.plan.forEach(day => {
    day.tasks.forEach(task => {
      if (task.type === 'break') return; // Skip break tasks
      
      const taskObj = {
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${task.type.charAt(0).toUpperCase() + task.type.slice(1)}: ${task.chapter}`,
        subject: task.subject,
        chapter: task.chapter,
        priority: task.priority,
        expectedMinutes: task.duration,
        status: 'Open',
        date: day.date,
        block: getBlockForTime(day.tasks.indexOf(task)),
        backlog: `Sprint Day ${day.day}`,
        source: 'planner'
      };
      
      createdTasks.push(addTaskFunction(taskObj));
    });
  });
  
  return {
    success: true,
    tasksCreated: createdTasks.length,
    tasks: createdTasks
  };
}

function getBlockForTime(taskIndex) {
  const blocks = ['Block A', 'Block B', 'Block C', 'Block D'];
  return blocks[taskIndex % blocks.length];
}

// -------------------------------------------------------------
// PRESET PLANS
// -------------------------------------------------------------

export const PRESET_PLANS = {
  'jee-final-week': {
    name: 'JEE Final Week Marathon',
    description: '7-day intensive revision covering all high-yield topics',
    days: 7,
    hoursPerDay: 8,
    subjects: ['Physics', 'Chemistry', 'Math'],
    chapters: {
      'Physics': ['Modern Physics', 'Electrostatics', 'Mechanics Revision'],
      'Chemistry': ['Organic Reactions', 'Inorganic', 'Physical Chemistry'],
      'Math': ['Calculus', 'Coordinate Geometry', 'Algebra']
    }
  },
  
  'chapter-focused': {
    name: 'Chapter Deep Dive',
    description: '3-day intensive study of a single difficult chapter',
    days: 3,
    hoursPerDay: 4,
    pattern: ['Theory', 'Solved Examples', 'Practice Problems']
  },
  
  'weak-topics': {
    name: 'Weak Topics Strengthening',
    description: '5-day focused improvement on weak areas',
    days: 5,
    hoursPerDay: 3,
    approach: 'Problem-solving heavy'
  }
};

// -------------------------------------------------------------
// PLAN VISUALIZATION
// -------------------------------------------------------------

export function renderPlanPreview(plan, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !plan.feasible) return;
  
  const html = `
    <div class="plan-preview">
      <div class="plan-header">
        <h3>📅 Study Plan Overview</h3>
        <div class="plan-stats">
          <span class="stat">${plan.plan.length} days</span>
          <span class="stat">${plan.totalHours}h total</span>
          <span class="stat">${plan.efficiency}% efficiency</span>
        </div>
      </div>
      
      <div class="plan-timeline">
        ${plan.plan.map(day => `
          <div class="plan-day">
            <div class="day-header">
              <span class="day-number">Day ${day.day}</span>
              <span class="day-date">${formatPlanDate(day.date)}</span>
              <span class="day-duration">${Math.round(day.totalMinutes / 60)}h ${day.totalMinutes % 60}m</span>
            </div>
            
            <div class="day-tasks">
              ${day.tasks.filter(t => t.type !== 'break').map(task => `
                <div class="plan-task ${task.type}">
                  <span class="task-icon">${getTaskIcon(task.type)}</span>
                  <div class="task-info">
                    <span class="task-title">${task.chapter}</span>
                    <span class="task-meta">${task.duration}min • ${task.priority}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      
      ${plan.recommendations.length > 0 ? `
        <div class="plan-recommendations">
          <h4>💡 Recommendations</h4>
          ${plan.recommendations.map(rec => `
            <div class="recommendation ${rec.type}">
              ${rec.message}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  container.innerHTML = html;
}

function formatPlanDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTaskIcon(type) {
  const icons = {
    'introduction': '📖',
    'theory': '📚',
    'problems': '✍️',
    'revision': '🔄',
    'break': '☕'
  };
  return icons[type] || '📝';
}
