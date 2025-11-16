# JEE Focus Tracker Pro — Testing Checklist

## 📱 Mobile Testing

### Android Chrome
- [ ] **Viewport Height**
  - Open app, scroll to bottom
  - No white space at bottom
  - Content fills entire screen
  
- [ ] **Keyboard Overlay**
  - Focus on task title input
  - Keyboard appears
  - Input scrolls into view automatically
  - Can see what you're typing
  
- [ ] **Touch Targets**
  - All buttons are easy to tap
  - No accidental taps
  - Icons are clearly visible
  
- [ ] **Pomodoro Timer**
  - Start a 1-minute timer
  - Refresh page while running
  - Timer resumes correctly
  
- [ ] **Modal Behavior**
  - Open edit modal
  - Modal fills screen
  - Can scroll within modal if needed
  - Easy to close

### iPhone Safari
- [ ] **Safe Area**
  - On iPhone X or newer
  - No content hidden behind notch
  - No content hidden behind home indicator
  
- [ ] **100vh Bug**
  - Open app
  - No white space at bottom
  - Address bar doesn't affect layout
  
- [ ] **Keyboard Behavior**
  - Same as Android tests
  - Focus on input
  - Auto-scroll works
  
- [ ] **Touch Gestures**
  - No accidental zoom on double-tap
  - Swipe back gesture doesn't interfere
  
- [ ] **PWA Install**
  - Add to Home Screen
  - Open from home screen
  - Runs in full-screen mode
  - All features work offline

## 💻 Desktop Testing

### Chrome
- [ ] **Basic Functionality**
  - Add task
  - Edit task
  - Delete task
  - Mark as done
  
- [ ] **Pomodoro**
  - Start timer
  - Pause timer
  - Reset timer
  - Timer completes
  - Auto-start works
  
- [ ] **Analytics Page**
  - Navigate to analytics.html
  - All tabs load
  - Bar graph displays
  - Subject heatmap displays
  - Daily breakdown displays
  
- [ ] **Study Planner**
  - Fill in form
  - Generate plan
  - Plan preview displays
  - Import to tasks works
  - Tasks appear on main page

### Firefox
- [ ] **Compatibility**
  - All Chrome tests pass
  - No console errors
  - Charts render correctly
  - Modals work properly

### Safari (Desktop)
- [ ] **Compatibility**
  - All Chrome tests pass
  - ES6 modules load correctly
  - LocalStorage works
  - PWA manifest recognized

## 🔬 Logic Testing

### Session Logging
- [ ] **Basic Logging**
  - Start a focus session
  - Let it complete
  - Check localStorage → `jee_pomo_sessions_v1`
  - Session object exists with correct data
  
- [ ] **Session Data**
  - Session has ID
  - Session has start timestamp
  - Session has end timestamp
  - Session has subject (if set)
  - Session has type ('focus' or 'break')
  - Session has date in YYYY-MM-DD format
  
- [ ] **Multiple Sessions**
  - Complete 5 sessions
  - All 5 appear in localStorage
  - All 5 appear in analytics

### Analytics Accuracy
- [ ] **7-Day Graph**
  - Complete sessions on different days
  - Check graph shows correct bars
  - Bar heights match session minutes
  - Day labels are correct
  
- [ ] **Subject Heatmap**
  - Complete sessions for different subjects
  - Each subject appears
  - Minutes are accurate
  - Colors are distinct
  
- [ ] **Streak Calculation**
  - Complete sessions on consecutive days
  - Streak increments correctly
  - Skip a day, streak resets
  - Longest streak is accurate
  
- [ ] **Summary Stats**
  - Total sessions count is correct
  - Total minutes sum is correct
  - Completion rate calculates correctly
  - Average session length is accurate

### Study Planner Logic
- [ ] **Time Estimation**
  - Easy chapter: ~90 min
  - Medium chapter: ~120 min
  - Hard chapter: ~180 min
  - Keywords affect time (e.g., "Modern Physics" takes longer)
  
- [ ] **Feasibility Check**
  - 3 chapters, 1 day, 2 hours → Should warn
  - 3 chapters, 3 days, 3 hours → Should work
  - Shows accurate recommendation
  
- [ ] **Task Distribution**
  - Tasks spread across days
  - No day over max hours
  - Revision added if time permits
  - Breaks inserted for long sessions
  
- [ ] **Import Functionality**
  - Import plan
  - Tasks created with correct dates
  - Tasks have correct subjects
  - Tasks have correct chapters
  - Tasks have correct durations
  - Tasks visible on main page

### Reflection Autosave
- [ ] **Debounce Behavior**
  - Type in reflection box
  - "Saving..." appears immediately
  - After 1 second of no typing, "Last saved: HH:MM" appears
  - Status turns green briefly
  
- [ ] **Data Persistence**
  - Type reflection
  - Wait for save
  - Refresh page
  - Reflection text is restored
  - Last saved time is shown
  
- [ ] **Clear Functionality**
  - Type reflection
  - Click "Clear"
  - Text is removed
  - Status shows "—"

### Task Manager
- [ ] **Add Task**
  - Fill in all fields
  - Click "Add Task"
  - Task appears in list
  - Correct subject grouping
  - Correct priority color
  
- [ ] **Edit Task**
  - Click "Edit" on any task
  - Modal opens with task data
  - Change values
  - Click "Save Changes"
  - Task updates in list
  
- [ ] **Delete Task**
  - Click "Edit" on any task
  - Click "Delete Task"
  - Confirm deletion
  - Task removed from list
  
- [ ] **Filters**
  - Add tasks for multiple subjects
  - Use subject filter
  - Only filtered subjects show
  - Use priority filter
  - Only filtered priorities show
  - Use search
  - Only matching tasks show
  - Click "Clear"
  - All tasks show again
  
- [ ] **Status Changes**
  - Mark task as "Done"
  - Task gets strikethrough
  - Checkmark appears
  - "Done" count increments
  - Mark task as "Missed"
  - Task gets different styling
  - "Missed" count increments

### Data Export/Import
- [ ] **Export**
  - Click export button
  - JSON file downloads
  - File contains tasks
  - File contains sessions
  - File contains reflections
  - File contains all data
  
- [ ] **Import**
  - Create backup first
  - Click import button
  - Select JSON file
  - Confirm import
  - Data merges (doesn't overwrite)
  - Duplicate IDs are skipped
  
- [ ] **Analytics Export**
  - Go to analytics.html
  - Click export button
  - Analytics JSON downloads
  - Contains weekly stats
  - Contains session data

## 🎨 Visual Testing

### Design System
- [ ] **Typography**
  - All text is readable
  - Font sizes are consistent
  - Line heights are comfortable
  - Hierarchy is clear
  
- [ ] **Spacing**
  - Consistent gaps between elements
  - Comfortable padding
  - No cramped areas
  - No excessive whitespace
  
- [ ] **Colors**
  - High contrast text
  - Color-blind friendly
  - Consistent accent colors
  - Status colors are clear
  
- [ ] **Shadows**
  - Cards have subtle shadows
  - Hover states are visible
  - Depth is clear

### Responsive Design
- [ ] **320px width** (Small phones)
  - Content is readable
  - No horizontal scroll
  - Buttons are tappable
  
- [ ] **768px width** (Tablets)
  - Layout adapts
  - Uses available space
  - Touch targets good size
  
- [ ] **1024px+ width** (Desktop)
  - Two-column layout works
  - Charts use full width
  - No wasted space

### Animations
- [ ] **Smooth Transitions**
  - Buttons have hover effects
  - Cards have subtle animations
  - Modals fade in
  - No janky animations
  
- [ ] **Loading States**
  - "Saving..." shows when typing
  - Status updates smoothly
  - No sudden jumps

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] **Tab Order**
  - Press Tab repeatedly
  - Focus moves logically
  - All interactive elements reachable
  - No focus traps
  
- [ ] **Shortcuts**
  - Ctrl+Enter adds task
  - / focuses search
  - Alt+R starts pomodoro
  - Esc closes modals
  
- [ ] **Focus Indicators**
  - Focused elements have outline
  - Outline is visible
  - Outline doesn't obscure content

### Screen Reader
- [ ] **ARIA Labels**
  - All buttons have labels
  - Form inputs have labels
  - Icons have alt text
  
- [ ] **Headings**
  - Proper heading hierarchy (h1, h2, h3)
  - Landmarks are labeled
  - Sections are clear
  
- [ ] **Live Regions**
  - Pomodoro timer announces changes
  - Task count updates announce
  - Error messages announce

### Color Contrast
- [ ] **Text Contrast**
  - All text meets WCAG AA
  - Primary text: 7:1 or higher
  - Secondary text: 4.5:1 or higher
  
- [ ] **Interactive Elements**
  - Buttons have clear contrast
  - Links are distinguishable
  - Focus indicators are visible

## 🔋 Performance Testing

### Load Time
- [ ] **Initial Load**
  - Page loads in under 2 seconds
  - No long JavaScript execution
  - No layout shifts
  
- [ ] **Navigation**
  - Switch to analytics.html
  - Loads quickly
  - No delay in rendering
  
- [ ] **Heavy Data**
  - Add 100 tasks
  - Add 100 sessions
  - Performance is acceptable
  - No lag when scrolling

### Memory Usage
- [ ] **Baseline**
  - Open DevTools → Memory
  - Take heap snapshot
  - ~5-10MB is normal
  
- [ ] **After Use**
  - Use app for 30 minutes
  - Take another snapshot
  - Memory doesn't grow excessively
  - No memory leaks

### Battery Impact
- [ ] **Idle**
  - Leave app open for 1 hour
  - Battery drain is minimal
  
- [ ] **Active Timer**
  - Run pomodoro for 1 hour
  - Battery drain is acceptable (~1%)
  
- [ ] **Background**
  - App in background for 1 hour
  - No significant battery drain

## 🐛 Edge Cases

### Boundary Conditions
- [ ] **Empty States**
  - No tasks: Shows empty message
  - No sessions: Analytics shows "No data"
  - No plan: Planner shows form only
  
- [ ] **Maximum Data**
  - 1000 tasks: Still works
  - 1000 sessions: Analytics still fast
  - Very long task title: Truncates gracefully
  
- [ ] **Invalid Input**
  - Empty task title: Shows error
  - Negative minutes: Prevented
  - Invalid plan parameters: Shows warning

### Network Conditions
- [ ] **Offline**
  - App works completely offline
  - All features available
  - Data persists locally
  
- [ ] **Slow Connection**
  - Chart.js CDN loads eventually
  - Rest of app works immediately
  - Graceful degradation if CDN fails

### Browser Features
- [ ] **LocalStorage Disabled**
  - Shows error message
  - Explains requirement
  - Suggests fix
  
- [ ] **JavaScript Disabled**
  - Shows fallback message
  - Explains requirement
  
- [ ] **Private/Incognito Mode**
  - App works
  - Data persists in session
  - Warning about session-only storage

## 📊 Test Results Template

```
Date: [YYYY-MM-DD]
Tester: [Name]
Environment: [Device/Browser]

Mobile Testing: [Pass/Fail]
Desktop Testing: [Pass/Fail]
Logic Testing: [Pass/Fail]
Visual Testing: [Pass/Fail]
Accessibility: [Pass/Fail]
Performance: [Pass/Fail]
Edge Cases: [Pass/Fail]

Issues Found:
1. [Description]
2. [Description]

Recommendations:
1. [Description]
2. [Description]
```

## 🎯 Priority Levels

- **P0** (Critical): Must fix before deploy
  - Crashes
  - Data loss
  - Security issues
  
- **P1** (High): Should fix soon
  - Major functionality broken
  - Poor UX on common flows
  
- **P2** (Medium): Fix when possible
  - Minor bugs
  - Edge cases
  
- **P3** (Low): Nice to have
  - Visual polish
  - Rare edge cases

## ✅ Sign-Off

Before deploying to production:
- [ ] All P0 issues resolved
- [ ] All P1 issues resolved or documented
- [ ] Mobile testing complete
- [ ] Desktop testing complete
- [ ] Logic testing complete
- [ ] Performance acceptable
- [ ] Accessibility meets WCAG AA

**Tested By**: _______________  
**Date**: _______________  
**Approved By**: _______________  
**Date**: _______________

---

**Version**: 9.3  
**Last Updated**: 2024-01-15
