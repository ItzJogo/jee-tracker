# JEE Focus Tracker v9.0 — Production-Ready Edition

A comprehensive, modular study tracker application for JEE preparation with advanced features including Pomodoro timer, syllabus progress tracking, and task management.

## 🚀 Version 9.0 Features

### Major Architectural Improvements
- **Modular ES6 Architecture**: Refactored from monolithic `script.js` into 6 focused modules
- **Separation of Concerns**: Clear boundaries between state, UI, events, and business logic
- **Maintainable Codebase**: Each module has a single responsibility

### Enhanced Functionality
- ✅ **Fully Draggable Pomodoro Widget**: Mouse and touch support with viewport constraints
- ✅ **Merge-Based Import**: Imports now merge with existing data instead of overwriting
- ✅ **Toast Notifications**: Beautiful, non-intrusive notifications replace alert() dialogs
- ✅ **Enhanced Syllabus Tracking**: Per-chapter progress with status indicators (✅ done, 🔄 in-progress, ⭕ pending)
- ✅ **Optimized Chart Rendering**: Charts update instead of destroy/recreate for better performance
- ✅ **Empty State UI**: Engaging empty state when no tasks exist
- ✅ **Auto-Start Pomodoro**: Option to automatically start next work/break session
- ✅ **Improved Accessibility**: ARIA labels, keyboard navigation, focus states

## 📁 Project Structure

```
jee-tracker/
├── index.html          # Main HTML with semantic structure
├── style.css           # Complete styling with animations
├── main.js            # Application entry point
├── state.js           # State management & localStorage
├── ui.js              # DOM manipulation & rendering
├── events.js          # Event handlers
├── pomodoro.js        # Pomodoro timer with drag functionality
└── syllabus.js        # Syllabus data structure
```

## 🛠️ Module Breakdown

### main.js
- Application initialization
- Module wiring and bootstrap
- Theme loading

### state.js
- Centralized state management
- All localStorage operations
- Data persistence logic
- Import/export with merge functionality

### ui.js
- DOM element caching
- Rendering functions for all components
- Toast notification system
- Chart management (optimized updates)
- Modal controls

### events.js
- All event handlers
- CRUD operations coordination
- Keyboard shortcuts
- Form submissions

### pomodoro.js
- Timer logic
- Draggable widget implementation
- Auto-start functionality
- Time formatting

### syllabus.js
- Enhanced syllabus data structure
- Chapter-level progress tracking
- Helper functions

## 🎯 Key Improvements

### Bug Fixes
1. **Draggable Pomodoro**: Fully implemented with smooth dragging on mouse and touch
2. **Import Logic**: Now merges tasks by checking duplicate IDs
3. **Chart Performance**: Uses `chart.update()` instead of destroying and recreating
4. **Edit Modal**: Subject change now properly repopulates chapter dropdown
5. **Error Handling**: User-friendly toast messages for all errors

### Accessibility
- Comprehensive ARIA attributes on all interactive elements
- Keyboard shortcuts (Ctrl+Enter to add task, / to search, Alt+R for Pomodoro)
- Focus states with visible outlines
- Screen reader support with live regions

### UX Enhancements
- Animated toast notifications (success, error, info types)
- Empty state with icon and helpful message
- Improved button hover and active states
- Visual feedback for task completion (checkmark, strikethrough)
- Progress bar with percentage display

## 🚦 Getting Started

1. Clone the repository
2. Open `index.html` in a modern browser
3. Start tracking your JEE preparation!

No build process required - it's pure ES6 modules.

### ☁️ Cloud Sync (Optional)

The app now supports optional cloud synchronization to backup your progress to a remote server.

**Setup:**
1. The app defaults to `http://localhost:5000/api` for the backend API
2. To use a different API endpoint, set `window.API_BASE_URL` before loading the app:
   ```html
   <script>
     window.API_BASE_URL = 'https://your-api.example.com/api';
   </script>
   ```
3. For deployment with environment variable injection (e.g., Netlify), configure your build to inject:
   ```javascript
   window.API_BASE_URL = '{{ API_BASE_URL }}';
   ```

**Usage:**
1. Click the ☁️ (Cloud) button in the header
2. Register or login with your account
3. Your local syllabus progress will be synced to the cloud
4. Data remains in localStorage - cloud sync is additive only

**Note:** Cloud sync only uploads syllabus progress data. Local tasks and reflections remain local-only.

### 📱 Installing as a PWA (Progressive Web App)

This app can be installed on your phone or desktop for a native app experience!

**Installation:**
- On **Android/Chrome**: Tap the "Install app" button or menu → "Add to Home screen"
- On **iOS/Safari**: Tap the Share button → "Add to Home Screen"
- On **Desktop**: Look for the install icon in the address bar

**⚠️ PWA Cache Issue Fix:**
If your installed PWA still shows the browser URL bar instead of full-screen mode, see **[PWA-CACHE-FIX-INSTRUCTIONS.md](PWA-CACHE-FIX-INSTRUCTIONS.md)** for step-by-step instructions to fix the caching issue.

## 🔧 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires ES6 module support

## 📊 Features

- **Task Management**: Add, edit, delete, and track study tasks
- **Syllabus Progress**: Track chapter-wise completion across all subjects
- **Pomodoro Timer**: Customizable work/break intervals with auto-start
- **Dashboard**: Visual progress with charts and statistics
- **Daily Goals**: Set and track daily study time targets
- **Streak Tracking**: Maintain motivation with streak counter
- **Reflection Log**: Daily journal for study reflections
- **Media Tracking**: Track anime and manga (for balanced life!)
- **Import/Export**: Backup and restore all your data
- **Theme Toggle**: Light and dark modes

## 🎨 Design Philosophy

- **Glass Morphism**: Modern, translucent card design
- **Neon Accents**: Cyberpunk-inspired color scheme
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: WCAG 2.1 compliant with ARIA support

## 🔐 Privacy

All data is stored locally in your browser using localStorage. By default, no data is sent to any server.

If you enable cloud sync (optional), only your syllabus progress data will be sent to the configured backend API. Tasks, reflections, and other personal data remain local-only.

## 📝 License

MIT License - Feel free to use and modify!