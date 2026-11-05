# TaskFlow – Smart To-Do Manager

> **Full Stack Web Development Internship – Task 2**  
> Developed with HTML5, Modern CSS3, Vanilla JavaScript (ES6+), and Browser LocalStorage.

---

## 📌 Project Overview

**TaskFlow** is a modern, responsive, SaaS-styled task management web application built from the ground up without external frontend frameworks or heavy dependencies. Designed with a soft lavender and purple aesthetic, TaskFlow offers users an intuitive, distraction-free interface to track daily productivity, organize tasks, monitor progress metrics, and persist task data seamlessly across browser sessions via HTML5 LocalStorage.

---

## 🎯 Project Objectives

- **Interactive Task Lifecycle**: Enable users to create, complete, undo, and delete tasks instantaneously.
- **Dynamic State Management**: Maintain an in-memory single source of truth array synchronized with browser `localStorage`.
- **Pure DOM Manipulation**: Manipulate DOM nodes safely using native JavaScript methods (`document.createElement`, `textContent`, `classList`) to prevent Cross-Site Scripting (XSS).
- **Advanced Filtering**: Categorize tasks dynamically into **All**, **Active**, and **Completed** views without altering or destroying underlying state data.
- **Responsive & Accessible UI/UX**: Provide smooth animations, dark/light theme switching, confirmation modals, toast alerts, and comfortable touch targets across desktop, tablet, and mobile screens.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure, accessible markup, forms, and SVGs |
| **CSS3** | Custom CSS variables, Flexbox & CSS Grid, responsive media queries, dark mode, keyframe animations |
| **Vanilla JavaScript (ES6+)** | Pure client-side logic, event delegation, state management, error handling |
| **Browser LocalStorage API** | Persistent, zero-backend data storage (`getItem`, `setItem`, `JSON.parse`, `JSON.stringify`) |

*Zero dependencies, zero frameworks (no React, Vue, Angular, jQuery, or external databases).*

---

## ✨ Features & Highlights

1. **Task CRUD Operations**:
   - **Add Tasks**: Add tasks using the primary "Add Task" button or by pressing the `Enter` key.
   - **Data Validation**: Rejects empty strings and whitespace-only submissions with a visual warning toast.
   - **Auto-Focus**: The input field automatically re-focuses after submission for rapid entry.
   - **Completion Toggle**: Complete and undo tasks with a smooth animated circular checkbox.
   - **Delete Task**: Removes individual tasks with a smooth slide-out and collapse transition.
   - **Clear Completed**: Batch removes all completed tasks with a custom confirmation dialog.

2. **Real-Time Statistics Dashboard**:
   - **Total Tasks**: Displays aggregate task count.
   - **Completed Tasks**: Tracks accomplished items.
   - **Pending Tasks**: Counts remaining action items.
   - **Remaining Task Badge**: Dynamically highlights how many tasks are left to complete today.

3. **Multi-State Filtering**:
   - Filter between **All**, **Active**, and **Completed** tabs with live badge counters.
   - Dynamic contextual empty states (e.g. displays *"All caught up!"* when no active tasks remain).

4. **LocalStorage Persistence & Error Resilience**:
   - Tasks persist across page refreshes, tab closures, and browser restarts.
   - Safe `try/catch` wrapper prevents crashes if corrupted or malformed JSON is encountered in `localStorage`.

5. **Premium UI/UX SaaS Aesthetics**:
   - Soft lavender, deep purple, and pure white palette with ambient background glows.
   - **Dark / Light Mode Toggle**: Instant theme switching saved in `localStorage` with fallback to system preferences.
   - **Dynamic Date Display**: Automatically displays the current day, month, date, and year.
   - **Toast Notifications**: Floating alerts for additions, completions, deletions, and warning states.

---

## 📂 Project Folder Structure

```text
taskflow/
│
├── index.html          # Semantic HTML5 layout and modal containers
├── style.css           # Modern SaaS stylesheet, theme variables, animations
├── app.js              # Pure JavaScript logic, state, and LocalStorage handlers
└── README.md           # Comprehensive project documentation & setup guide
```

---

## ⚙️ How LocalStorage Saves and Loads Tasks

The application uses the browser's native `window.localStorage` API to provide persistent data without requiring a database or server.

### 1. Data Structure
Tasks are modeled as lightweight JavaScript objects inside a global `tasks` array:
```javascript
{
  id: "1730798000000-x9a2b",  // Unique timestamp-randomized ID
  text: "Complete assignment", // Task description
  done: false                  // Completion boolean flag
}
```

### 2. Saving Tasks (`saveTasks`)
Whenever tasks are added, toggled, deleted, or cleared, the state is serialized into a JSON string:
```javascript
function saveTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks:", error);
  }
}
```

### 3. Loading Tasks (`loadTasks`)
When the webpage loads, `loadTasks()` reads the string and safely reconstructs the array:
```javascript
function loadTasks() {
  try {
    const rawData = localStorage.getItem("tasks");
    if (!rawData) {
      tasks = [];
      return;
    }
    const parsedData = JSON.parse(rawData);
    if (Array.isArray(parsedData)) {
      tasks = parsedData.filter(item => item && typeof item.text === "string");
    } else {
      tasks = [];
    }
  } catch (error) {
    console.error("Corrupted LocalStorage data detected. Initializing empty array.", error);
    tasks = [];
  }
}
```

---

## 🚀 How to Run Locally

### Option 1: Using VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Clone or open the project folder:
   ```bash
   code .
   ```
3. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Extensions Marketplace (`Ctrl+Shift+X` or `Cmd+Shift+X`).
4. Right-click on `index.html` in the file explorer.
5. Select **"Open with Live Server"** (or click **Go Live** in the bottom status bar).
6. The application will launch at `http://127.0.0.1:5500`.

### Option 2: Direct Browser Launch
Double-click `index.html` or drag and drop it directly into any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Brave).

### Option 3: Automated Test Runner
Open `test.html` in your browser or click **"Run Self-Test Suite →"** in the app footer. It automatically runs assertions against all 13 internship testing requirements and reports live PASS/FAIL status.

---

## 🧪 Testing Checklist & Verification Scenarios

| Scenario | Expected Result | Verified |
| :--- | :--- | :---: |
| **1. Add task via button** | Task appears at the top of the list, total and pending count increments, toast confirms addition. | ✅ |
| **2. Add task via Enter key** | Form submits seamlessly, task added, input clears and refocuses. | ✅ |
| **3. Empty/whitespace input** | Input is rejected, warning toast *"Please enter a task description!"* displays. | ✅ |
| **4. Complete task** | Checkbox activates with green checkmark, text is strikethrough, completed count increments. | ✅ |
| **5. Undo task** | Text returns to normal, pending count increments, toast confirms restoration. | ✅ |
| **6. Delete task** | Slide-out animation triggers, task removed from list and state, delete toast appears. | ✅ |
| **7. Filter switching** | **Active** shows only incomplete tasks; **Completed** shows only finished tasks; **All** shows everything. Underlying array unaffected. | ✅ |
| **8. Clear completed** | Confirmation modal prompts the user. Upon confirmation, all completed tasks are cleared. | ✅ |
| **9. Page refresh** | All tasks, statuses, theme preferences, and counters persist accurately. | ✅ |
| **10. DevTools verification** | Inspect `Application > Storage > Local Storage` to see updated `tasks` key in JSON format. | ✅ |
| **11. Dark mode toggle** | Switches between light and dark palettes; persists reload via `taskflow_theme`. | ✅ |
| **12. Responsive layouts** | UI scales cleanly across desktop, tablet, and mobile (320px – 1440px). | ✅ |
| **13. Corrupted storage test** | Manually writing invalid string `{corrupted:` in `localStorage.setItem('tasks', '...')` does not crash app; recovers gracefully. | ✅ |

---

## 📸 Screenshots

> *Add application screenshots here before final submission.*

| Desktop View (Light Mode) | Desktop View (Dark Mode) |
| :---: | :---: |
| ![Light Mode Screenshot](screenshot-light.png) | ![Dark Mode Screenshot](screenshot-dark.png) |

| Mobile View | Filter & Modal View |
| :---: | :---: |
| ![Mobile Screenshot](screenshot-mobile.png) | ![Modal Screenshot](screenshot-modal.png) |

---

## 🌐 GitHub Pages Deployment Guide

Follow these steps to deploy **TaskFlow** live on the web for free:

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete TaskFlow smart to-do manager"
   ```

2. **Push to GitHub**:
   - Create a new public repository on GitHub (e.g., `taskflow` or `interncircle-task-02`).
   - Link and push your local repository:
     ```bash
     git remote add origin https://github.com/<your-username>/<your-repo-name>.git
     git branch -M main
     git push -u origin main
     ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click on **Settings** (top navigation tab).
   - In the left sidebar, click on **Pages**.
   - Under **Build and deployment > Branch**:
     - Select branch: `main`
     - Select folder: `/ (root)`
     - Click **Save**.

4. **Access Your Live URL**:
   - Within 1–2 minutes, GitHub will publish your site at:
     ```text
     https://<your-username>.github.io/<your-repo-name>/
     ```

---

## 📋 Internship Requirements Checklist

- [x] Application titled **"TaskFlow – Smart To-Do Manager"**
- [x] HTML, CSS, and JavaScript cleanly separated into separate files
- [x] Uses strictly HTML5, CSS3, ES6+ JavaScript, and LocalStorage
- [x] No React, Angular, Vue, backend frameworks, databases, or external APIs
- [x] Premium SaaS dashboard aesthetic with soft lavender and purple palette
- [x] Responsive layout for mobile, tablet, and desktop screens
- [x] Light and dark theme toggle with local storage persistence
- [x] Dynamic date and motivational welcome header
- [x] 3 Real-time Statistics Cards (Total, Completed, Pending)
- [x] Add task via button click and Enter key
- [x] Prevent empty or whitespace-only tasks
- [x] Auto-clear and auto-focus input field
- [x] Toggle task completion (line-through styling, updated stats)
- [x] Undo completed tasks
- [x] Delete individual tasks with animation
- [x] 3 Filters: All, Active, Completed with live badge counts
- [x] Clear Completed tasks with confirmation modal
- [x] Contextual empty state illustrations/messages
- [x] Toast notification feedback system
- [x] Single source of truth array (`tasks`) with `id`, `text`, `done`
- [x] Modular named functions (`loadTasks`, `saveTasks`, `renderTasks`, `addTask`, `toggleTask`, `deleteTask`, `clearCompleted`, `updateStatistics`, `filterTasks`, `showToast`)
- [x] `try/catch` error resilience for corrupted LocalStorage
- [x] Safe DOM creation with `textContent` (Zero `innerHTML` for user content)
- [x] Event delegation on task list container

---

## 📄 License & Attribution

Developed for the **Full Stack Web Development Internship (Task 2)**.  
Open-source under the MIT License.

