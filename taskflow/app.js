/**
 * ============================================================================
 * TaskFlow – Smart To-Do Manager
 * File: app.js
 * Description: Core logic handling task state, DOM manipulation, 
 *              LocalStorage persistence, filtering, theme toggle, and UI toasts.
 * ============================================================================
 */

// Strict mode for cleaner code and early error prevention
'use strict';

/* ==========================================================================
   1. GLOBAL STATE & CONSTANTS
   ========================================================================== */

/**
 * Single source of truth for all tasks.
 * Structure of each item:
 * {
 *   id: string | number,
 *   text: string,
 *   done: boolean
 * }
 */
let tasks = [];

/**
 * Current filter view: 'all' | 'active' | 'completed'
 */
let currentFilter = 'all';

/**
 * LocalStorage keys
 */
const STORAGE_KEY_TASKS = 'tasks';
const STORAGE_KEY_THEME = 'taskflow_theme';

/* ==========================================================================
   2. DOM ELEMENT REFERENCES
   ========================================================================== */

// Header & Theme
const currentDateText = document.getElementById('currentDateText');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Stats Counters
const statTotalCount = document.getElementById('statTotalCount');
const statCompletedCount = document.getElementById('statCompletedCount');
const statPendingCount = document.getElementById('statPendingCount');
const remainingCountBadge = document.getElementById('remainingCountBadge');

// Filter Tab Counters
const filterCountAll = document.getElementById('filterCountAll');
const filterCountActive = document.getElementById('filterCountActive');
const filterCountCompleted = document.getElementById('filterCountCompleted');
const filterTabs = document.querySelectorAll('.filter-tab');

// Add Task Form & Inputs
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');

// Task List & Empty State
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const emptyTitle = document.getElementById('emptyTitle');
const emptySubtitle = document.getElementById('emptySubtitle');

// Action Buttons
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Confirmation Modal Elements
const confirmModal = document.getElementById('confirmModal');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

/* ==========================================================================
   3. LOCALSTORAGE PERSISTENCE
   ========================================================================== */

/**
 * Loads tasks from browser LocalStorage with error resilience.
 * Safely initializes an empty array if data is missing or corrupted.
 */
function loadTasks() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!rawData) {
      tasks = [];
      return;
    }

    const parsedData = JSON.parse(rawData);

    // Validate that the parsed output is indeed an array
    if (Array.isArray(parsedData)) {
      // Validate individual task objects to ensure structural integrity
      tasks = parsedData.filter(item => {
        return (
          item &&
          typeof item === 'object' &&
          item.id !== undefined &&
          typeof item.text === 'string' &&
          typeof item.done === 'boolean'
        );
      });
    } else {
      console.warn('LocalStorage data is not an array. Resetting tasks to empty array.');
      tasks = [];
    }
  } catch (error) {
    console.error('Failed to parse tasks from LocalStorage due to corruption:', error);
    // Safe fallback to prevent application crash
    tasks = [];
  }
}

/**
 * Saves current task state array into LocalStorage.
 */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to LocalStorage:', error);
    showToast('Storage quota exceeded or unavailable', 'danger');
  }
}

/* ==========================================================================
   4. TASK CRUD OPERATIONS
   ========================================================================== */

/**
 * Adds a new task to the state.
 * @param {string} text - The raw task description
 */
function addTask(text) {
  const trimmedText = text.trim();

  // Data Validation: Reject empty or whitespace-only tasks
  if (!trimmedText) {
    showToast('Please enter a task description!', 'warning');
    if (taskInput) taskInput.focus();
    return;
  }

  // Create new task object
  const newTask = {
    id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7),
    text: trimmedText,
    done: false
  };

  // Add to beginning of array so newest tasks appear first
  tasks.unshift(newTask);

  // Persist & Update UI
  saveTasks();
  updateStatistics();
  renderTasks();

  // Reset input field and retain focus
  taskForm.reset();
  taskInput.focus();

  showToast('Task added successfully!', 'success');
}

/**
 * Toggles a task's completion status.
 * @param {string} id - The unique identifier of the task
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.done = !task.done;

  saveTasks();
  updateStatistics();
  renderTasks();

  if (task.done) {
    showToast('Task marked as completed! 🎉', 'success');
  } else {
    showToast('Task moved back to active', 'info');
  }
}

/**
 * Deletes a single task by its id with a smooth slide-out animation.
 * @param {string} id - Unique identifier of the task
 */
function deleteTask(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return;

  const taskElement = document.querySelector(`[data-task-id="${id}"]`);

  if (taskElement) {
    // Add slide-out CSS animation class
    taskElement.classList.add('deleting');

    // Wait for the CSS animation to complete before removing from state and DOM
    setTimeout(() => {
      tasks.splice(taskIndex, 1);
      saveTasks();
      updateStatistics();
      renderTasks();
      showToast('Task deleted', 'danger');
    }, 280);
  } else {
    // Fallback immediate deletion
    tasks.splice(taskIndex, 1);
    saveTasks();
    updateStatistics();
    renderTasks();
    showToast('Task deleted', 'danger');
  }
}

/**
 * Removes all completed tasks from state.
 */
function clearCompleted() {
  const completedCount = tasks.filter(t => t.done).length;

  if (completedCount === 0) {
    showToast('No completed tasks to clear', 'info');
    return;
  }

  // Filter out completed tasks, keeping only incomplete ones
  tasks = tasks.filter(t => !t.done);

  saveTasks();
  updateStatistics();
  renderTasks();

  showToast(`Cleared ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}!`, 'info');
}

/* ==========================================================================
   5. FILTERING LOGIC
   ========================================================================== */

/**
 * Returns filtered subset of tasks based on currentFilter without mutating the state.
 * @returns {Array} Filtered tasks array
 */
function filterTasks() {
  switch (currentFilter) {
    case 'active':
      return tasks.filter(t => !t.done);
    case 'completed':
      return tasks.filter(t => t.done);
    case 'all':
    default:
      return tasks;
  }
}

/**
 * Handles filter tab click events.
 * @param {string} filter - 'all' | 'active' | 'completed'
 */
function setFilter(filter) {
  currentFilter = filter;

  // Update active state visual on tabs
  filterTabs.forEach(tab => {
    if (tab.dataset.filter === filter) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  renderTasks();
}

/* ==========================================================================
   6. UI RENDERING & DOM MANIPULATION
   ========================================================================== */

/**
 * Updates dynamic counts in statistics cards, badges, and filter tabs.
 */
function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pending = total - completed;

  // Update Stat Cards
  if (statTotalCount) statTotalCount.textContent = total;
  if (statCompletedCount) statCompletedCount.textContent = completed;
  if (statPendingCount) statPendingCount.textContent = pending;

  // Update Remaining Task Counter Badge
  if (remainingCountBadge) {
    remainingCountBadge.textContent = `${pending} ${pending === 1 ? 'task' : 'tasks'} left`;
  }

  // Update Filter Counters
  if (filterCountAll) filterCountAll.textContent = total;
  if (filterCountActive) filterCountActive.textContent = pending;
  if (filterCountCompleted) filterCountCompleted.textContent = completed;

  // Enable/disable Clear Completed button
  if (clearCompletedBtn) {
    clearCompletedBtn.disabled = completed === 0;
  }
}

/**
 * Renders the task items into the DOM.
 * Utilizes document.createElement and textContent to guarantee XSS prevention.
 */
function renderTasks() {
  // Clear existing items in task list
  taskList.innerHTML = '';

  const visibleTasks = filterTasks();

  // Show / Hide Empty State
  if (visibleTasks.length === 0) {
    emptyState.style.display = 'flex';
    taskList.style.display = 'none';

    // Contextual Empty State message based on active filter
    if (tasks.length === 0) {
      emptyTitle.textContent = 'No tasks yet';
      emptySubtitle.textContent = 'Add your first task above to start organizing your day!';
    } else if (currentFilter === 'active') {
      emptyTitle.textContent = 'All caught up!';
      emptySubtitle.textContent = 'You have completed all active tasks. Great job!';
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks';
      emptySubtitle.textContent = 'Mark tasks as done to see them listed here.';
    }
    return;
  }

  emptyState.style.display = 'none';
  taskList.style.display = 'flex';

  // Construct DOM elements for each task
  visibleTasks.forEach(task => {
    // <li> wrapper
    const li = document.createElement('li');
    li.className = `task-item ${task.done ? 'completed' : ''}`;
    li.setAttribute('data-task-id', task.id);

    // Completion Toggle Button (Checkbox)
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'task-checkbox-btn';
    toggleBtn.setAttribute('data-action', 'toggle');
    toggleBtn.setAttribute('aria-label', task.done ? 'Mark task as active' : 'Mark task as complete');
    
    // Checkmark SVG icon
    toggleBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    // Task Description (CRITICAL: textContent is used to strictly avoid XSS)
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
    deleteBtn.setAttribute('title', 'Delete task');

    // Trash SVG icon
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;

    // Assemble task item
    li.appendChild(toggleBtn);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    // Append to list container
    taskList.appendChild(li);
  });
}

/* ==========================================================================
   7. TOAST NOTIFICATION SYSTEM
   ========================================================================== */

/**
 * Displays a non-intrusive floating toast notification.
 * @param {string} message - Notification text
 * @param {'success'|'info'|'warning'|'danger'} type - Status category
 */
function showToast(message, type = 'info') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Select SVG icon matching toast type
  let iconSvg = '';
  switch (type) {
    case 'success':
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`;
      break;
    case 'danger':
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`;
      break;
    case 'warning':
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`;
      break;
    case 'info':
    default:
      iconSvg = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>`;
      break;
  }

  const iconWrapper = document.createElement('span');
  iconWrapper.className = 'toast-icon';
  iconWrapper.innerHTML = iconSvg;

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  toast.appendChild(iconWrapper);
  toast.appendChild(textSpan);

  toastContainer.appendChild(toast);

  // Auto-dismiss toast after 2.8 seconds
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2800);
}

/* ==========================================================================
   8. THEME TOGGLE (LIGHT / DARK)
   ========================================================================== */

/**
 * Initializes and switches light / dark color schemes.
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Priority: Saved user preference > System preference > Default (light)
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  if (newTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    showToast('Dark theme activated 🌙', 'info');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(STORAGE_KEY_THEME, 'light');
    showToast('Light theme activated ☀️', 'info');
  }
}

/* ==========================================================================
   9. DYNAMIC DATE & GREETING
   ========================================================================== */

/**
 * Formats and injects the current date into the header.
 */
function renderCurrentDate() {
  if (!currentDateText) return;

  const now = new Date();
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };

  currentDateText.textContent = now.toLocaleDateString('en-US', options);
}

/* ==========================================================================
   10. CONFIRMATION MODAL LOGIC
   ========================================================================== */

function openConfirmModal() {
  if (confirmModal) {
    confirmModal.classList.add('active');
    confirmModal.setAttribute('aria-hidden', 'false');
  }
}

function closeConfirmModal() {
  if (confirmModal) {
    confirmModal.classList.remove('active');
    confirmModal.setAttribute('aria-hidden', 'true');
  }
}

/* ==========================================================================
   11. EVENT LISTENERS SETUP
   ========================================================================== */

function setupEventListeners() {
  // 1. Task form submission (Add button or Enter key)
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(taskInput.value);
    });
  }

  // 2. Event delegation on Task List (Handles complete & delete clicks efficiently)
  if (taskList) {
    taskList.addEventListener('click', (e) => {
      const toggleTarget = e.target.closest('[data-action="toggle"]');
      const deleteTarget = e.target.closest('[data-action="delete"]');
      const taskItem = e.target.closest('.task-item');

      if (!taskItem) return;
      const taskId = taskItem.getAttribute('data-task-id');

      if (toggleTarget) {
        toggleTask(taskId);
      } else if (deleteTarget) {
        deleteTask(taskId);
      }
    });
  }

  // 3. Filter tab click events
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selectedFilter = tab.dataset.filter;
      if (selectedFilter) {
        setFilter(selectedFilter);
      }
    });
  });

  // 4. Clear completed tasks button
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      const completedCount = tasks.filter(t => t.done).length;
      if (completedCount > 0) {
        openConfirmModal();
      }
    });
  }

  // 5. Confirmation modal actions
  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', closeConfirmModal);
  }

  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', () => {
      closeConfirmModal();
      clearCompleted();
    });
  }

  // Close modal when clicking outside modal box
  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        closeConfirmModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && confirmModal && confirmModal.classList.contains('active')) {
      closeConfirmModal();
    }
  });

  // 6. Theme toggle button
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}

/* ==========================================================================
   12. APPLICATION INITIALIZATION
   ========================================================================== */

/**
 * Boots the application on DOM ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCurrentDate();
  loadTasks();
  updateStatistics();
  renderTasks();
  setupEventListeners();

  // Focus input field on initial load for optimal UX
  if (taskInput) {
    taskInput.focus();
  }
});

