# Quick Start Guide — JEE Focus Tracker Pro v9.3

## 🚀 Get Started in 5 Minutes

### Step 1: Open the App
Navigate to `index.html` in your browser or open the deployed URL.

### Step 2: Try the Mobile Features
**On Mobile Device:**
1. Open the app
2. Notice the perfect viewport height (no white space at bottom)
3. Tap on any input field
4. Keyboard appears and auto-scrolls the input into view
5. All buttons are easy to tap (44px minimum)

**On Desktop:**
1. Resize browser window
2. Layout adapts smoothly
3. All features work perfectly

### Step 3: Test Enhanced Pomodoro
1. Go to "⏱️ Pomodoro Timer" section
2. Set Work time to `1` minute (for quick testing)
3. Click "▶️ Start"
4. Timer counts down
5. While timer runs, **refresh the page**
6. Timer continues from where it left off! 🎉

### Step 4: Explore Analytics
1. Click the **📊** icon in the top-right header
2. You'll see the new Analytics page with 4 tabs:
   - **Weekly Overview**: 7-day bar graph
   - **Subject Analysis**: Subject heatmap
   - **Daily Breakdown**: Detailed table
   - **Study Planner**: Plan generator

### Step 5: Generate a Study Plan
1. On Analytics page, click "Study Planner" tab
2. Fill in the form:
   - Subject: `Physics`
   - Available Days: `3`
   - Hours/Day: `2`
   - Difficulty: `Medium`
   - Chapters: `Kinematics, NLM, Friction`
3. Click "✨ Generate Plan"
4. Preview appears with daily breakdown
5. Click "📥 Import Plan to Tasks"
6. Go back to main page
7. Your tasks are now scheduled! 🎯

### Step 6: Test Reflection Autosave
1. Go to "Daily Reflection" section
2. Start typing anything
3. Notice "Saving..." appears immediately
4. Stop typing for 1 second
5. See "Last saved: HH:MM" with green color
6. Refresh the page
7. Your reflection is still there! 💚

## 🎯 Key Features to Try

### 1. Mobile Optimizations
- **Perfect viewport**: No white space on mobile browsers
- **Keyboard handling**: Inputs scroll into view automatically
- **Safe areas**: Works great on notched iPhones
- **Touch targets**: All buttons easy to tap

### 2. Enhanced Pomodoro
- **Persistence**: Survives page refreshes
- **Session logging**: All sessions tracked
- **Auto-start**: Enable in settings
- **Notifications**: Get desktop alerts

### 3. Analytics Dashboard
- **7-day graph**: See your study patterns
- **Subject breakdown**: Time per subject
- **Streak tracking**: Longest study streak
- **Summary stats**: Quick overview

### 4. Study Planner
- **Smart planning**: Generates daily schedules
- **Time estimation**: Based on difficulty
- **Feasibility check**: Warns if too ambitious
- **One-click import**: Add to task list instantly

### 5. Design System
- **Professional**: Consistent spacing and typography
- **Accessible**: WCAG AA compliant
- **Responsive**: Works on all screen sizes
- **Themeable**: Light/dark mode ready

## 🔍 What to Look For

### On Mobile
✅ No white space at bottom (100vh fix working)  
✅ Keyboard doesn't hide inputs (auto-scroll working)  
✅ All buttons easy to tap (44px minimum)  
✅ Content doesn't hide behind notch (safe areas working)

### On Desktop
✅ Two-column layout on wide screens  
✅ Charts render correctly  
✅ Modals appear centered  
✅ All features accessible

### In Analytics
✅ Bar graph shows data  
✅ Subject heatmap displays  
✅ Streak calculation correct  
✅ Summary stats accurate

### In Planner
✅ Plan generates successfully  
✅ Tasks are reasonable  
✅ Import creates tasks  
✅ Tasks appear on main page

## 🐛 Troubleshooting

### "Timer doesn't persist on reload"
- Check browser localStorage is enabled
- Open DevTools → Application → Local Storage
- Look for `jee_pomo_state_v1`

### "Analytics showing no data"
- Complete at least one pomodoro session first
- Let the session finish completely
- Refresh analytics page

### "Study planner says not feasible"
- Reduce number of chapters
- Increase available days or hours
- Lower difficulty level

### "Reflection not autosaving"
- Type something and wait 1 second
- Check "Last saved: HH:MM" appears
- Look for green color flash

### "Mobile viewport still wrong"
- Clear browser cache
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Close and reopen browser

## 📱 Mobile Testing

### iPhone Safari
1. Open Settings → Safari → Advanced → Web Inspector (enable)
2. Connect to Mac with Safari
3. Test viewport height, keyboard, safe areas

### Android Chrome
1. Open chrome://inspect on desktop Chrome
2. Connect Android device via USB
3. Test all mobile features

## 🎨 Customization

### Change Colors
Edit `styles.css` line 10-30 (`:root` section):
```css
--color-primary: #38bdf8;  /* Your color here */
```

### Change Spacing
Edit `styles.css` line 40-50:
```css
--space-md: 1rem;  /* Your spacing here */
```

### Change Typography
Edit `styles.css` line 60-70:
```css
--font-base: 1rem;  /* Your font size here */
```

## 📊 Data Structure

### View Your Data
1. Open DevTools (F12)
2. Go to Application tab
3. Expand Local Storage
4. Click on your domain
5. See all stored data:
   - `jee_pomo_state_v1` — Current timer state
   - `jee_pomo_sessions_v1` — Session history
   - `yash_local_tasks_v7` — All tasks
   - `yash_reflection_v7` — Daily reflections
   - `yash_calendar_v7` — Calendar data

### Export Data
1. Click 💾 icon in header
2. JSON file downloads
3. Contains all your data
4. Safe to backup

### Import Data
1. Click 📥 icon in header
2. Select JSON file
3. Data merges (no overwrite)
4. Duplicates are skipped

## 🎓 Best Practices

### For Daily Use
1. Set realistic daily goal (240 mins default)
2. Use pomodoro for focused sessions
3. Check analytics weekly
4. Plan next week on Sunday
5. Reflect daily

### For Study Planning
1. Generate plan at start of week
2. Import to tasks
3. Adjust as needed
4. Track completion
5. Review in analytics

### For Mobile
1. Install as PWA for best experience
2. Enable notifications
3. Keep app open in background
4. Use auto-start pomodoro

## 🏆 Pro Tips

1. **Keyboard Shortcuts**
   - `Ctrl+Enter` or `Cmd+Enter`: Add task
   - `/`: Focus search
   - `Alt+R`: Start pomodoro

2. **Pomodoro Settings**
   - Check "Auto-start next session" for flow state
   - Use 25/5 for standard work
   - Use 50/10 for deep work

3. **Study Planning**
   - Use "Medium" difficulty as baseline
   - Add 30% buffer for complex topics
   - Plan revision at end of cycle

4. **Analytics**
   - Check weekly, not daily (avoid obsession)
   - Use subject heatmap to balance subjects
   - Aim for consistent daily activity, not perfection

## 📞 Need Help?

1. **Documentation**
   - [UPGRADE-GUIDE.md](./UPGRADE-GUIDE.md) — Full implementation guide
   - [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md) — Testing procedures
   - [EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md) — What was built

2. **Issues**
   - Check console for errors (F12 → Console)
   - Verify localStorage is enabled
   - Try in incognito mode (clean state)

3. **Support**
   - GitHub Issues for bugs
   - PR comments for questions

## ✅ Success Checklist

After 5 minutes, you should have:
- [x] Opened the app
- [x] Tested mobile viewport (if on mobile)
- [x] Started and reloaded a pomodoro
- [x] Visited analytics page
- [x] Generated a study plan
- [x] Imported plan to tasks
- [x] Tested reflection autosave

**If all 7 items work, you're ready to use the app!** 🎉

---

**Version**: 9.3  
**Last Updated**: 2024-01-15  
**Time to Complete**: 5 minutes
