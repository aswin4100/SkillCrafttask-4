/**
 * TaskFlow — Modern To-Do & Task Management Application
 * SkillCraft Technology Web Development Internship — Task 04
 * 
 * Technology: Pure Vanilla JavaScript (ES6+)
 * Architecture: State-Driven DOM Manipulation & Reactive UI Sync
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Constants & Configuration
  // =========================================================================
  const STORAGE_KEYS = {
    TASKS: 'taskflow_tasks_v1',
    CATEGORIES: 'taskflow_categories_v1',
    THEME: 'taskflow_theme',
    INITIALIZED: 'taskflow_has_initialized'
  };

  const DEFAULT_CATEGORIES = [
    { id: 'work', name: 'Work', color: '#3b82f6' },
    { id: 'personal', name: 'Personal', color: '#10b981' },
    { id: 'study', name: 'Study', color: '#a855f7' },
    { id: 'other', name: 'Other', color: '#f59e0b' }
  ];

  const COLOR_PALETTE = [
    '#3b82f6', '#06b6d4', '#10b981', '#a855f7',
    '#ec4899', '#f59e0b', '#ef4444', '#6366f1'
  ];

  // =========================================================================
  // 2. Application State
  // =========================================================================
  const state = {
    tasks: [],
    categories: [],
    theme: 'dark',
    currentView: 'all',          // 'all' | 'today' | 'upcoming' | 'completed' | 'overdue' | 'cat:<id>'
    searchQuery: '',
    priorityFilter: 'all',       // 'all' | 'high' | 'medium' | 'low'
    sortBy: 'dueDateAsc',        // 'dueDateAsc' | 'dueDateDesc' | 'priorityDesc' | 'priorityAsc' | 'createdDesc' | 'alphabetical'
    editingTaskId: null,
    pendingAction: null,         // for confirm modal { action: Function, message: String, title: String }
    lastFocusedElement: null
  };

  // =========================================================================
  // 3. DOM Element References
  // =========================================================================
  const dom = {
    // App & Layout
    html: document.documentElement,
    appLayout: document.getElementById('appLayout'),
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),

    // Topbar & Headings
    pageTitle: document.getElementById('pageTitle'),
    activeFilterTag: document.getElementById('activeFilterTag'),
    currentDateDisplay: document.getElementById('currentDateDisplay'),
    topbarAddTaskBtn: document.getElementById('topbarAddTaskBtn'),
    sidebarAddTaskBtn: document.getElementById('sidebarAddTaskBtn'),

    // Navigation & Counts
    navAll: document.getElementById('navAll'),
    navToday: document.getElementById('navToday'),
    navUpcoming: document.getElementById('navUpcoming'),
    navCompleted: document.getElementById('navCompleted'),
    navOverdue: document.getElementById('navOverdue'),
    countAll: document.getElementById('countAll'),
    countToday: document.getElementById('countToday'),
    countUpcoming: document.getElementById('countUpcoming'),
    countCompleted: document.getElementById('countCompleted'),
    countOverdue: document.getElementById('countOverdue'),
    categoryNavList: document.getElementById('categoryNavList'),
    openAddCategoryBtn: document.getElementById('openAddCategoryBtn'),

    // Dashboard Statistics
    progressPercentage: document.getElementById('progressPercentage'),
    progressStatusCaption: document.getElementById('progressStatusCaption'),
    progressBarFill: document.getElementById('progressBarFill'),
    progressBarTrack: document.getElementById('progressBarTrack'),
    statTotal: document.getElementById('statTotal'),
    statPending: document.getElementById('statPending'),
    statCompleted: document.getElementById('statCompleted'),
    statOverdue: document.getElementById('statOverdue'),

    // Toolbar & Controls
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    priorityFilter: document.getElementById('priorityFilter'),
    sortSelect: document.getElementById('sortSelect'),
    filterFeedbackBar: document.getElementById('filterFeedbackBar'),
    filterFeedbackText: document.getElementById('filterFeedbackText'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Task List & Empty State
    taskList: document.getElementById('taskList'),
    displayedCountText: document.getElementById('displayedCountText'),
    emptyState: document.getElementById('emptyState'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptyDesc: document.getElementById('emptyDesc'),
    emptyCreateBtn: document.getElementById('emptyCreateBtn'),
    emptyLoadSampleBtn: document.getElementById('emptyLoadSampleBtn'),

    // Theme & Clear
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeModeText: document.getElementById('themeModeText'),
    clearAllBtn: document.getElementById('clearAllBtn'),

    // Task Modal
    taskModalBackdrop: document.getElementById('taskModalBackdrop'),
    taskModal: document.getElementById('taskModal'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    taskModalCloseBtn: document.getElementById('taskModalCloseBtn'),
    taskModalCancelBtn: document.getElementById('taskModalCancelBtn'),
    taskModalSubmitBtn: document.getElementById('taskModalSubmitBtn'),
    taskForm: document.getElementById('taskForm'),
    taskIdInput: document.getElementById('taskId'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    titleError: document.getElementById('titleError'),
    taskDescInput: document.getElementById('taskDescInput'),
    descCharCounter: document.getElementById('descCharCounter'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    taskDueTimeInput: document.getElementById('taskDueTimeInput'),
    taskCategorySelect: document.getElementById('taskCategorySelect'),
    modalAddCategoryBtn: document.getElementById('modalAddCategoryBtn'),

    // Category Modal
    categoryModalBackdrop: document.getElementById('categoryModalBackdrop'),
    categoryModal: document.getElementById('categoryModal'),
    categoryModalCloseBtn: document.getElementById('categoryModalCloseBtn'),
    categoryModalCancelBtn: document.getElementById('categoryModalCancelBtn'),
    categoryForm: document.getElementById('categoryForm'),
    categoryNameInput: document.getElementById('categoryNameInput'),
    categoryError: document.getElementById('categoryError'),
    colorPaletteOptions: document.getElementById('colorPaletteOptions'),

    // Confirm Modal
    confirmModalBackdrop: document.getElementById('confirmModalBackdrop'),
    confirmModal: document.getElementById('confirmModal'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalMessage: document.getElementById('confirmModalMessage'),
    confirmModalCancelBtn: document.getElementById('confirmModalCancelBtn'),
    confirmModalActionBtn: document.getElementById('confirmModalActionBtn'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  // Selected accent color for new category modal
  let selectedCategoryColor = COLOR_PALETTE[0];

  // =========================================================================
  // 4. Initialization & Lifecycle
  // =========================================================================
  function initializeApp() {
    loadTheme();
    loadCategories();
    loadTasks();
    renderCurrentDate();
    buildCategoryColorPicker();
    setupEventListeners();
    renderDashboard();
  }

  // =========================================================================
  // 5. Storage Handling with Error Protection
  // =========================================================================
  function loadTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        state.theme = savedTheme;
      } else {
        // Default to dark or match system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.theme = prefersDark ? 'dark' : 'dark';
      }
    } catch (e) {
      console.warn('localStorage not accessible for theme preference:', e);
      state.theme = 'dark';
    }
    applyTheme(state.theme);
  }

  function applyTheme(theme) {
    state.theme = theme;
    dom.html.setAttribute('data-theme', theme);
    if (dom.themeModeText) {
      dom.themeModeText.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  }

  function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme} theme`, 'info');
  }

  function loadCategories() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        state.categories = JSON.parse(stored);
      } else {
        state.categories = [...DEFAULT_CATEGORIES];
        saveCategories();
      }
    } catch (e) {
      console.warn('Could not load categories from localStorage:', e);
      state.categories = [...DEFAULT_CATEGORIES];
    }
  }

  function saveCategories() {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories));
    } catch (e) {
      showToast('Storage error: unable to save categories', 'danger');
    }
  }

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      const hasInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

      if (stored) {
        state.tasks = JSON.parse(stored);
      } else if (!hasInitialized) {
        // First-time launch: populate with realistic demo tasks
        state.tasks = createSampleTasks();
        saveTasks();
        try {
          localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        } catch (_) {}
      } else {
        state.tasks = [];
      }
    } catch (e) {
      console.error('Error loading tasks from localStorage:', e);
      showToast('Could not load stored tasks. Using empty list.', 'warning');
      state.tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage:', e);
      showToast('Storage full or unavailable. Changes may not persist.', 'danger');
    }
  }

  // Pre-load helpful demo tasks with relative dates
  function createSampleTasks() {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    // Overdue task (2 days ago)
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 2);

    // Today task
    const todayDate = new Date(today);

    // Tomorrow task
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    // Upcoming task (next week)
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 5);

    return [
      {
        id: 'task_demo_1',
        title: 'Submit SkillCraft Internship Task 04 Documentation',
        description: 'Complete the To-Do Web Application project, write comprehensive README, and prepare portfolio submission.',
        dueDate: formatYMD(todayDate),
        dueTime: '17:00',
        priority: 'high',
        category: 'work',
        completed: false,
        createdAt: Date.now() - 3600000 * 24,
        updatedAt: Date.now() - 3600000 * 24
      },
      {
        id: 'task_demo_2',
        title: 'Review JavaScript DOM Manipulation & Event Handling',
        description: 'Study state synchronization, event delegation patterns, and accessible keyboard navigation in vanilla JS.',
        dueDate: formatYMD(pastDate),
        dueTime: '12:00',
        priority: 'high',
        category: 'study',
        completed: false,
        createdAt: Date.now() - 3600000 * 48,
        updatedAt: Date.now() - 3600000 * 48
      },
      {
        id: 'task_demo_3',
        title: 'Setup GitHub Repository and Showcase Live Demo',
        description: 'Push source code with clean git commits and verify responsive layout on mobile, tablet, and desktop.',
        dueDate: formatYMD(tomorrowDate),
        dueTime: '14:30',
        priority: 'medium',
        category: 'work',
        completed: false,
        createdAt: Date.now() - 3600000 * 12,
        updatedAt: Date.now() - 3600000 * 12
      },
      {
        id: 'task_demo_4',
        title: 'Grocery shopping & Weekly meal planning',
        description: 'Buy fresh vegetables, fruits, almond milk, and pantry essentials for the upcoming week.',
        dueDate: formatYMD(futureDate),
        dueTime: '',
        priority: 'low',
        category: 'personal',
        completed: false,
        createdAt: Date.now() - 3600000 * 6,
        updatedAt: Date.now() - 3600000 * 6
      },
      {
        id: 'task_demo_5',
        title: 'Review CSS Grid & Modern Flexbox Techniques',
        description: 'Completed comprehensive review of responsive layout structures and variable color tokens.',
        dueDate: formatYMD(pastDate),
        dueTime: '10:00',
        priority: 'medium',
        category: 'study',
        completed: true,
        createdAt: Date.now() - 3600000 * 72,
        updatedAt: Date.now() - 3600000 * 36
      }
    ];
  }

  // =========================================================================
  // 6. Date, Time & Overdue Computations
  // =========================================================================
  function renderCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    if (dom.currentDateDisplay) {
      dom.currentDateDisplay.textContent = now.toLocaleDateString(undefined, options);
    }
  }

  /**
   * Checks whether a task is overdue.
   * Specification rules:
   * 1. Completed tasks are NEVER overdue.
   * 2. Tasks without a due date are NOT overdue.
   * 3. When due time is omitted, treat as due at end of calendar day (23:59:59).
   * 4. Compared strictly using local browser time.
   */
  function isTaskOverdue(task) {
    if (task.completed) return false;
    if (!task.dueDate) return false;

    const now = new Date();
    const dueDateTime = getTaskDueDateTime(task);
    return dueDateTime < now;
  }

  function isTaskDueToday(task) {
    if (!task.dueDate) return false;
    const today = new Date();
    const [y, m, d] = task.dueDate.split('-').map(Number);
    return (
      today.getFullYear() === y &&
      today.getMonth() + 1 === m &&
      today.getDate() === d
    );
  }

  function isTaskDueTomorrow(task) {
    if (!task.dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [y, m, d] = task.dueDate.split('-').map(Number);
    return (
      tomorrow.getFullYear() === y &&
      tomorrow.getMonth() + 1 === m &&
      tomorrow.getDate() === d
    );
  }

  function isTaskUpcoming(task) {
    if (task.completed) return false;
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [y, m, d] = task.dueDate.split('-').map(Number);
    const taskDate = new Date(y, m - 1, d);

    // Upcoming means strictly after today
    return taskDate > today;
  }

  function getTaskDueDateTime(task) {
    if (!task.dueDate) return null;
    const [year, month, day] = task.dueDate.split('-').map(Number);

    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes, 0);
    }
    // End of day (23:59:59.999)
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const displayM = String(m).padStart(2, '0');
    return `${displayH}:${displayM} ${period}`;
  }

  function formatTaskDateBadge(task) {
    if (!task.dueDate) {
      return { text: 'No due date', className: 'badge-date-normal', isOverdue: false };
    }

    const timeFormatted = task.dueTime ? ` • ${formatTime(task.dueTime)}` : '';
    const overdue = isTaskOverdue(task);

    if (overdue) {
      return {
        text: `Overdue${timeFormatted}`,
        className: 'badge-date-overdue',
        isOverdue: true
      };
    }

    if (isTaskDueToday(task)) {
      return {
        text: `Today${timeFormatted}`,
        className: 'badge-date-today',
        isOverdue: false
      };
    }

    if (isTaskDueTomorrow(task)) {
      return {
        text: `Tomorrow${timeFormatted}`,
        className: 'badge-date-tomorrow',
        isOverdue: false
      };
    }

    // Format readable date: e.g. Oct 15, 2026
    const [y, m, d] = task.dueDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const monthName = dateObj.toLocaleDateString(undefined, { month: 'short' });
    return {
      text: `${monthName} ${d}${timeFormatted}`,
      className: 'badge-date-normal',
      isOverdue: false
    };
  }

  // =========================================================================
  // 7. Filtering, Searching & Sorting
  // =========================================================================
  function filterTasks(tasks) {
    return tasks.filter((task) => {
      // 1. Primary View Filter
      if (state.currentView === 'today') {
        if (!isTaskDueToday(task)) return false;
      } else if (state.currentView === 'upcoming') {
        if (!isTaskUpcoming(task)) return false;
      } else if (state.currentView === 'completed') {
        if (!task.completed) return false;
      } else if (state.currentView === 'overdue') {
        if (!isTaskOverdue(task)) return false;
      } else if (state.currentView.startsWith('cat:')) {
        const catId = state.currentView.substring(4);
        if (task.category !== catId) return false;
      }

      // 2. Priority Filter
      if (state.priorityFilter !== 'all') {
        if (task.priority !== state.priorityFilter) return false;
      }

      // 3. Search Query (Title & Description, case-insensitive)
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase().trim();
        const matchTitle = (task.title || '').toLowerCase().includes(query);
        const matchDesc = (task.description || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }

  function sortTasks(tasks) {
    const priorityWeights = { high: 3, medium: 2, low: 1 };

    return [...tasks].sort((a, b) => {
      // Completed items go to bottom by default in pending-focused views, unless sorting specifically
      if (state.currentView !== 'completed' && a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (state.sortBy) {
        case 'dueDateAsc': {
          // Tasks without due date placed at the end
          if (!a.dueDate && !b.dueDate) return (b.createdAt || 0) - (a.createdAt || 0);
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          const timeA = getTaskDueDateTime(a).getTime();
          const timeB = getTaskDueDateTime(b).getTime();
          return timeA - timeB;
        }

        case 'dueDateDesc': {
          if (!a.dueDate && !b.dueDate) return (b.createdAt || 0) - (a.createdAt || 0);
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          const timeA = getTaskDueDateTime(a).getTime();
          const timeB = getTaskDueDateTime(b).getTime();
          return timeB - timeA;
        }

        case 'priorityDesc': {
          const diff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
          if (diff !== 0) return diff;
          return (b.createdAt || 0) - (a.createdAt || 0);
        }

        case 'priorityAsc': {
          const diff = (priorityWeights[a.priority] || 0) - (priorityWeights[b.priority] || 0);
          if (diff !== 0) return diff;
          return (b.createdAt || 0) - (a.createdAt || 0);
        }

        case 'createdDesc': {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }

        case 'alphabetical': {
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        }

        default:
          return 0;
      }
    });
  }

  // =========================================================================
  // 8. Statistics Calculation
  // =========================================================================
  function calculateStatistics() {
    const total = state.tasks.length;
    let completed = 0;
    let overdue = 0;
    let todayCount = 0;
    let upcomingCount = 0;

    state.tasks.forEach((task) => {
      if (task.completed) {
        completed++;
      } else {
        if (isTaskOverdue(task)) {
          overdue++;
        }
        if (isTaskDueToday(task)) {
          todayCount++;
        }
        if (isTaskUpcoming(task)) {
          upcomingCount++;
        }
      }
    });

    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      pending,
      completed,
      overdue,
      todayCount,
      upcomingCount,
      percentage
    };
  }

  // =========================================================================
  // 9. UI Rendering: Dashboard & Task List
  // =========================================================================
  function renderDashboard() {
    renderStatistics();
    renderNavigationBadges();
    renderCategoryNav();
    renderCategorySelectOptions();
    renderHeaderInfo();
    renderTaskList();
  }

  function renderStatistics() {
    const stats = calculateStatistics();

    if (dom.statTotal) dom.statTotal.textContent = stats.total;
    if (dom.statPending) dom.statPending.textContent = stats.pending;
    if (dom.statCompleted) dom.statCompleted.textContent = stats.completed;
    if (dom.statOverdue) dom.statOverdue.textContent = stats.overdue;

    // Progress bar
    if (dom.progressPercentage) dom.progressPercentage.textContent = `${stats.percentage}%`;
    if (dom.progressBarFill) dom.progressBarFill.style.width = `${stats.percentage}%`;
    if (dom.progressBarTrack) {
      dom.progressBarTrack.setAttribute('aria-valuenow', stats.percentage);
    }

    // Dynamic encouraging caption
    if (dom.progressStatusCaption) {
      if (stats.total === 0) {
        dom.progressStatusCaption.textContent = 'No tasks added yet';
      } else if (stats.completed === stats.total) {
        dom.progressStatusCaption.textContent = 'All tasks completed! Fantastic job! 🎉';
      } else if (stats.percentage >= 75) {
        dom.progressStatusCaption.textContent = `${stats.pending} task${stats.pending > 1 ? 's' : ''} left. Almost there!`;
      } else if (stats.percentage >= 50) {
        dom.progressStatusCaption.textContent = 'Over halfway done! Keep momentum going.';
      } else {
        dom.progressStatusCaption.textContent = `${stats.completed} of ${stats.total} completed`;
      }
    }
  }

  function renderNavigationBadges() {
    const stats = calculateStatistics();

    if (dom.countAll) dom.countAll.textContent = stats.total;
    if (dom.countToday) dom.countToday.textContent = stats.todayCount;
    if (dom.countUpcoming) dom.countUpcoming.textContent = stats.upcomingCount;
    if (dom.countCompleted) dom.countCompleted.textContent = stats.completed;
    if (dom.countOverdue) dom.countOverdue.textContent = stats.overdue;

    // Update active class on sidebar items
    const navItems = [
      { id: 'all', btn: dom.navAll },
      { id: 'today', btn: dom.navToday },
      { id: 'upcoming', btn: dom.navUpcoming },
      { id: 'completed', btn: dom.navCompleted },
      { id: 'overdue', btn: dom.navOverdue }
    ];

    navItems.forEach(({ id, btn }) => {
      if (btn) {
        if (state.currentView === id) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  function renderCategoryNav() {
    if (!dom.categoryNavList) return;
    dom.categoryNavList.innerHTML = '';

    state.categories.forEach((cat) => {
      const li = document.createElement('li');
      const count = state.tasks.filter((t) => t.category === cat.id && !t.completed).length;

      const isDefault = DEFAULT_CATEGORIES.some((d) => d.id === cat.id);
      const isActive = state.currentView === `cat:${cat.id}`;

      li.innerHTML = `
        <button class="nav-item ${isActive ? 'active' : ''}" data-view="cat:${escapeHtml(cat.id)}">
          <span class="category-dot" style="background-color: ${escapeHtml(cat.color)}"></span>
          <span class="nav-label">${escapeHtml(cat.name)}</span>
          <span class="nav-badge">${count}</span>
          ${
            !isDefault
              ? `<span class="delete-category-btn" data-cat-id="${escapeHtml(cat.id)}" title="Delete category" role="button" tabindex="0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>`
              : ''
          }
        </button>
      `;

      dom.categoryNavList.appendChild(li);
    });
  }

  function renderCategorySelectOptions() {
    if (!dom.taskCategorySelect) return;
    const currentVal = dom.taskCategorySelect.value;
    dom.taskCategorySelect.innerHTML = '';

    state.categories.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      dom.taskCategorySelect.appendChild(opt);
    });

    if (currentVal && state.categories.some((c) => c.id === currentVal)) {
      dom.taskCategorySelect.value = currentVal;
    } else if (state.categories.length > 0) {
      dom.taskCategorySelect.value = state.categories[0].id;
    }
  }

  function renderHeaderInfo() {
    let title = 'All Tasks';
    let filterTag = '';

    if (state.currentView === 'today') {
      title = "Today's Tasks";
    } else if (state.currentView === 'upcoming') {
      title = 'Upcoming Tasks';
    } else if (state.currentView === 'completed') {
      title = 'Completed Tasks';
    } else if (state.currentView === 'overdue') {
      title = 'Overdue Tasks';
    } else if (state.currentView.startsWith('cat:')) {
      const catId = state.currentView.substring(4);
      const cat = state.categories.find((c) => c.id === catId);
      title = cat ? cat.name : 'Category Tasks';
      filterTag = 'Category';
    }

    if (dom.pageTitle) dom.pageTitle.textContent = title;

    if (dom.activeFilterTag) {
      if (filterTag) {
        dom.activeFilterTag.textContent = filterTag;
        dom.activeFilterTag.style.display = 'inline-flex';
      } else {
        dom.activeFilterTag.style.display = 'none';
      }
    }

    // Active filters feedback banner
    const isFilteredBySearch = state.searchQuery.trim().length > 0;
    const isFilteredByPriority = state.priorityFilter !== 'all';

    if (dom.filterFeedbackBar) {
      if (isFilteredBySearch || isFilteredByPriority) {
        let msg = 'Filtering by: ';
        const parts = [];
        if (isFilteredBySearch) parts.push(`Search "${state.searchQuery}"`);
        if (isFilteredByPriority) parts.push(`Priority "${state.priorityFilter.toUpperCase()}"`);
        msg += parts.join(' • ');

        dom.filterFeedbackText.textContent = msg;
        dom.filterFeedbackBar.style.display = 'flex';
      } else {
        dom.filterFeedbackBar.style.display = 'none';
      }
    }
  }

  function renderTaskList() {
    if (!dom.taskList) return;

    const filtered = filterTasks(state.tasks);
    const sorted = sortTasks(filtered);

    // Update count title
    if (dom.displayedCountText) {
      const totalCount = state.tasks.length;
      if (sorted.length === totalCount) {
        dom.displayedCountText.textContent = `Showing all ${totalCount} task${totalCount === 1 ? '' : 's'}`;
      } else {
        dom.displayedCountText.textContent = `Showing ${sorted.length} of ${totalCount} task${totalCount === 1 ? '' : 's'}`;
      }
    }

    dom.taskList.innerHTML = '';

    if (sorted.length === 0) {
      dom.taskList.style.display = 'none';
      renderEmptyState();
      return;
    }

    dom.taskList.style.display = 'flex';
    if (dom.emptyState) dom.emptyState.style.display = 'none';

    sorted.forEach((task) => {
      const card = createTaskCardElement(task);
      dom.taskList.appendChild(card);
    });
  }

  function createTaskCardElement(task) {
    const li = document.createElement('li');
    li.className = `task-card ${task.completed ? 'task-completed' : ''}`;
    li.setAttribute('data-id', task.id);
    li.setAttribute('data-priority', task.priority);

    // Category styling
    const category = state.categories.find((c) => c.id === task.category) || {
      name: task.category || 'Other',
      color: '#94a3b8'
    };

    // Priority label
    const priorityLabels = { high: 'High', medium: 'Medium', low: 'Low' };
    const priorityLabel = priorityLabels[task.priority] || 'Normal';

    // Due Date Badge
    const dateBadge = formatTaskDateBadge(task);

    li.innerHTML = `
      <div class="task-checkbox-container">
        <button 
          type="button" 
          class="custom-checkbox" 
          data-action="toggle-complete" 
          aria-label="${task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}"
          title="${task.completed ? 'Mark incomplete' : 'Mark complete'}"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>

      <div class="task-card-body">
        <div class="task-title-line">
          <span class="task-title-text">${escapeHtml(task.title)}</span>
        </div>

        ${
          task.description
            ? `<div class="task-desc-text">${escapeHtml(task.description)}</div>`
            : ''
        }

        <div class="task-meta-row">
          <!-- Category Badge -->
          <span class="badge badge-category" title="Category: ${escapeHtml(category.name)}">
            <span class="category-dot" style="background-color: ${escapeHtml(category.color)}"></span>
            <span>${escapeHtml(category.name)}</span>
          </span>

          <!-- Priority Badge -->
          <span class="badge badge-priority-${escapeHtml(task.priority)}" title="Priority: ${priorityLabel}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>${priorityLabel}</span>
          </span>

          <!-- Due Date Badge -->
          <span class="badge ${dateBadge.className}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>${escapeHtml(dateBadge.text)}</span>
          </span>

          ${
            task.completed
              ? `<span class="badge badge-completed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Completed</span>
                </span>`
              : ''
          }
        </div>
      </div>

      <div class="task-actions">
        <button 
          type="button" 
          class="action-btn action-btn-edit" 
          data-action="edit-task" 
          aria-label="Edit task: ${escapeHtml(task.title)}"
          title="Edit task"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        <button 
          type="button" 
          class="action-btn action-btn-delete" 
          data-action="delete-task" 
          aria-label="Delete task: ${escapeHtml(task.title)}"
          title="Delete task"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    return li;
  }

  function renderEmptyState() {
    if (!dom.emptyState) return;

    dom.emptyState.style.display = 'flex';
    const isSearching = state.searchQuery.trim().length > 0;
    const isPriorityFiltered = state.priorityFilter !== 'all';

    if (isSearching) {
      dom.emptyTitle.textContent = 'No matching tasks found';
      dom.emptyDesc.textContent = `No tasks match your search for "${state.searchQuery}". Try adjusting your keywords or clearing the search.`;
      dom.emptyCreateBtn.style.display = 'none';
      dom.emptyLoadSampleBtn.style.display = 'none';
    } else if (isPriorityFiltered) {
      dom.emptyTitle.textContent = `No ${state.priorityFilter} priority tasks`;
      dom.emptyDesc.textContent = `You do not have any tasks with ${state.priorityFilter} priority right now.`;
      dom.emptyCreateBtn.style.display = 'inline-flex';
      dom.emptyLoadSampleBtn.style.display = 'none';
    } else if (state.currentView === 'today') {
      dom.emptyTitle.textContent = 'No tasks due today';
      dom.emptyDesc.textContent = 'You have no pending tasks scheduled for today. Enjoy your day or add a new task!';
      dom.emptyCreateBtn.style.display = 'inline-flex';
      dom.emptyLoadSampleBtn.style.display = 'none';
    } else if (state.currentView === 'upcoming') {
      dom.emptyTitle.textContent = 'No upcoming tasks';
      dom.emptyDesc.textContent = 'There are no future tasks scheduled. Plan ahead by adding upcoming deadlines.';
      dom.emptyCreateBtn.style.display = 'inline-flex';
      dom.emptyLoadSampleBtn.style.display = 'none';
    } else if (state.currentView === 'completed') {
      dom.emptyTitle.textContent = 'No completed tasks yet';
      dom.emptyDesc.textContent = 'When you finish tasks and mark them done, they will show up here.';
      dom.emptyCreateBtn.style.display = 'none';
      dom.emptyLoadSampleBtn.style.display = 'none';
    } else if (state.currentView === 'overdue') {
      dom.emptyTitle.textContent = 'No overdue tasks 🎉';
      dom.emptyDesc.textContent = "You're all caught up! None of your tasks have missed their deadlines.";
      dom.emptyCreateBtn.style.display = 'none';
      dom.emptyLoadSampleBtn.style.display = 'none';
    } else if (state.tasks.length === 0) {
      dom.emptyTitle.textContent = 'Welcome to TaskFlow!';
      dom.emptyDesc.textContent = 'Your task board is completely empty. Create your first task to start organizing your day, or load demo tasks to explore features.';
      dom.emptyCreateBtn.style.display = 'inline-flex';
      dom.emptyLoadSampleBtn.style.display = 'inline-flex';
    } else {
      dom.emptyTitle.textContent = 'No tasks in this category';
      dom.emptyDesc.textContent = 'Create a new task and assign it to this category to see it listed here.';
      dom.emptyCreateBtn.style.display = 'inline-flex';
      dom.emptyLoadSampleBtn.style.display = 'none';
    }
  }

  // =========================================================================
  // 10. Task CRUD Operations
  // =========================================================================
  function createTask(taskData) {
    const id = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newTask = {
      id,
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      dueDate: taskData.dueDate || '',
      dueTime: taskData.dueTime || '',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'work',
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    state.tasks.push(newTask);
    saveTasks();
    renderDashboard();
    showToast('Task created successfully!', 'success');
  }

  function updateTask(id, taskData) {
    const taskIndex = state.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      showToast('Error: Task not found', 'danger');
      return;
    }

    const currentTask = state.tasks[taskIndex];

    state.tasks[taskIndex] = {
      ...currentTask,
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      dueDate: taskData.dueDate || '',
      dueTime: taskData.dueTime || '',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'work',
      updatedAt: Date.now()
    };

    saveTasks();
    renderDashboard();
    showToast('Task updated successfully!', 'success');
  }

  function deleteTask(id) {
    const taskIndex = state.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return;

    state.tasks.splice(taskIndex, 1);
    saveTasks();
    renderDashboard();
    showToast('Task deleted', 'info');
  }

  function toggleTaskCompletion(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.updatedAt = Date.now();

    saveTasks();
    renderDashboard();

    if (task.completed) {
      showToast('Task marked as completed! 🎯', 'success');
    } else {
      showToast('Task marked as pending', 'info');
    }
  }

  function clearAllTasks() {
    state.tasks = [];
    saveTasks();
    renderDashboard();
    showToast('All tasks cleared', 'info');
  }

  // =========================================================================
  // 11. Modal Dialog Handlers
  // =========================================================================
  function openTaskModal(taskIdToEdit = null) {
    state.lastFocusedElement = document.activeElement;
    state.editingTaskId = taskIdToEdit;

    // Reset errors & validation
    if (dom.titleError) dom.titleError.style.display = 'none';
    if (dom.taskTitleInput) dom.taskTitleInput.classList.remove('input-error');

    if (taskIdToEdit) {
      // Edit mode
      const task = state.tasks.find((t) => t.id === taskIdToEdit);
      if (!task) return;

      if (dom.taskModalTitle) dom.taskModalTitle.textContent = 'Edit Task';
      if (dom.taskModalSubmitBtn) dom.taskModalSubmitBtn.textContent = 'Update Task';
      if (dom.taskIdInput) dom.taskIdInput.value = task.id;
      if (dom.taskTitleInput) dom.taskTitleInput.value = task.title;
      if (dom.taskDescInput) dom.taskDescInput.value = task.description || '';
      if (dom.taskDueDateInput) dom.taskDueDateInput.value = task.dueDate || '';
      if (dom.taskDueTimeInput) dom.taskDueTimeInput.value = task.dueTime || '';
      if (dom.taskCategorySelect) dom.taskCategorySelect.value = task.category || 'work';

      // Select priority radio
      const priorityRadio = dom.taskForm.querySelector(`input[name="taskPriority"][value="${task.priority}"]`);
      if (priorityRadio) priorityRadio.checked = true;

      updateDescCounter();
    } else {
      // Create mode
      if (dom.taskModalTitle) dom.taskModalTitle.textContent = 'Create New Task';
      if (dom.taskModalSubmitBtn) dom.taskModalSubmitBtn.textContent = 'Save Task';
      if (dom.taskForm) dom.taskForm.reset();
      if (dom.taskIdInput) dom.taskIdInput.value = '';

      // Default category matching current category view if applicable
      if (state.currentView.startsWith('cat:')) {
        const catId = state.currentView.substring(4);
        if (dom.taskCategorySelect) dom.taskCategorySelect.value = catId;
      } else if (state.categories.length > 0) {
        if (dom.taskCategorySelect) dom.taskCategorySelect.value = state.categories[0].id;
      }

      // Default priority to medium
      const medRadio = dom.taskForm.querySelector('input[name="taskPriority"][value="medium"]');
      if (medRadio) medRadio.checked = true;

      updateDescCounter();
    }

    // Show modal
    dom.taskModalBackdrop.classList.add('is-open');
    dom.taskModalBackdrop.setAttribute('aria-hidden', 'false');

    // Focus first input
    setTimeout(() => {
      if (dom.taskTitleInput) dom.taskTitleInput.focus();
    }, 50);
  }

  function closeTaskModal() {
    dom.taskModalBackdrop.classList.remove('is-open');
    dom.taskModalBackdrop.setAttribute('aria-hidden', 'true');
    state.editingTaskId = null;

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus();
    }
  }

  function handleTaskFormSubmit(e) {
    e.preventDefault();

    const title = (dom.taskTitleInput ? dom.taskTitleInput.value : '').trim();
    if (!title) {
      if (dom.titleError) dom.titleError.style.display = 'block';
      if (dom.taskTitleInput) {
        dom.taskTitleInput.classList.add('input-error');
        dom.taskTitleInput.focus();
      }
      return;
    }

    const priorityInput = dom.taskForm.querySelector('input[name="taskPriority"]:checked');
    const priority = priorityInput ? priorityInput.value : 'medium';

    const taskData = {
      title,
      description: dom.taskDescInput ? dom.taskDescInput.value : '',
      dueDate: dom.taskDueDateInput ? dom.taskDueDateInput.value : '',
      dueTime: dom.taskDueTimeInput ? dom.taskDueTimeInput.value : '',
      priority,
      category: dom.taskCategorySelect ? dom.taskCategorySelect.value : 'work'
    };

    if (state.editingTaskId) {
      updateTask(state.editingTaskId, taskData);
    } else {
      createTask(taskData);
    }

    closeTaskModal();
  }

  function updateDescCounter() {
    if (!dom.descCharCounter || !dom.taskDescInput) return;
    const len = dom.taskDescInput.value.length;
    dom.descCharCounter.textContent = `${len} / 500`;
  }

  // =========================================================================
  // 12. Custom Category Creation & Management
  // =========================================================================
  function buildCategoryColorPicker() {
    if (!dom.colorPaletteOptions) return;
    dom.colorPaletteOptions.innerHTML = '';

    COLOR_PALETTE.forEach((color, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `color-option ${idx === 0 ? 'selected' : ''}`;
      btn.style.backgroundColor = color;
      btn.setAttribute('aria-label', `Color ${color}`);
      btn.setAttribute('data-color', color);

      btn.addEventListener('click', () => {
        dom.colorPaletteOptions.querySelectorAll('.color-option').forEach((el) => el.classList.remove('selected'));
        btn.classList.add('selected');
        selectedCategoryColor = color;
      });

      dom.colorPaletteOptions.appendChild(btn);
    });
  }

  function openCategoryModal() {
    state.lastFocusedElement = document.activeElement;
    if (dom.categoryNameInput) {
      dom.categoryNameInput.value = '';
      dom.categoryNameInput.classList.remove('input-error');
    }
    if (dom.categoryError) dom.categoryError.style.display = 'none';

    selectedCategoryColor = COLOR_PALETTE[0];
    if (dom.colorPaletteOptions) {
      const swatches = dom.colorPaletteOptions.querySelectorAll('.color-option');
      swatches.forEach((s, idx) => {
        if (idx === 0) s.classList.add('selected');
        else s.classList.remove('selected');
      });
    }

    dom.categoryModalBackdrop.classList.add('is-open');
    dom.categoryModalBackdrop.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      if (dom.categoryNameInput) dom.categoryNameInput.focus();
    }, 50);
  }

  function closeCategoryModal() {
    dom.categoryModalBackdrop.classList.remove('is-open');
    dom.categoryModalBackdrop.setAttribute('aria-hidden', 'true');

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus();
    }
  }

  function handleCategoryFormSubmit(e) {
    e.preventDefault();
    const name = (dom.categoryNameInput ? dom.categoryNameInput.value : '').trim();

    if (!name) {
      if (dom.categoryError) dom.categoryError.style.display = 'block';
      if (dom.categoryNameInput) dom.categoryNameInput.classList.add('input-error');
      return;
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);

    // Prevent duplicate exact names
    if (state.categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      if (dom.categoryError) {
        dom.categoryError.textContent = 'A category with this name already exists.';
        dom.categoryError.style.display = 'block';
      }
      return;
    }

    state.categories.push({
      id,
      name,
      color: selectedCategoryColor
    });

    saveCategories();
    renderCategoryNav();
    renderCategorySelectOptions();

    // Select the new category in task modal if open
    if (dom.taskCategorySelect) dom.taskCategorySelect.value = id;

    closeCategoryModal();
    showToast(`Category "${name}" added!`, 'success');
  }

  function deleteCategory(catId) {
    const cat = state.categories.find((c) => c.id === catId);
    if (!cat) return;

    openConfirmModal({
      title: 'Delete Category',
      message: `Are you sure you want to delete the category "${cat.name}"? Tasks in this category will be reassigned to "Other".`,
      confirmText: 'Delete Category',
      action: () => {
        // Reassign affected tasks to 'other'
        state.tasks.forEach((t) => {
          if (t.category === catId) {
            t.category = 'other';
          }
        });
        saveTasks();

        // Remove category
        state.categories = state.categories.filter((c) => c.id !== catId);
        saveCategories();

        if (state.currentView === `cat:${catId}`) {
          state.currentView = 'all';
        }

        renderDashboard();
        showToast(`Category "${cat.name}" deleted`, 'info');
      }
    });
  }

  // =========================================================================
  // 13. Accessible Confirmation Modal
  // =========================================================================
  function openConfirmModal({ title, message, confirmText = 'Delete', action }) {
    state.lastFocusedElement = document.activeElement;
    state.pendingAction = action;

    if (dom.confirmModalTitle) dom.confirmModalTitle.textContent = title;
    if (dom.confirmModalMessage) dom.confirmModalMessage.textContent = message;
    if (dom.confirmModalActionBtn) dom.confirmModalActionBtn.textContent = confirmText;

    dom.confirmModalBackdrop.classList.add('is-open');
    dom.confirmModalBackdrop.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      if (dom.confirmModalCancelBtn) dom.confirmModalCancelBtn.focus();
    }, 50);
  }

  function closeConfirmModal() {
    dom.confirmModalBackdrop.classList.remove('is-open');
    dom.confirmModalBackdrop.setAttribute('aria-hidden', 'true');
    state.pendingAction = null;

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus();
    }
  }

  // =========================================================================
  // 14. Toast Notifications System
  // =========================================================================
  function showToast(message, type = 'info') {
    if (!dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    const icons = {
      success: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `,
      danger: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `,
      warning: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `,
      info: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `
    };

    toast.innerHTML = `
      <div class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Dismiss message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-hiding');
      toast.addEventListener('animationend', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      });
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 3500);

    dom.toastContainer.appendChild(toast);
  }

  // =========================================================================
  // 15. Event Listeners Setup
  // =========================================================================
  function setupEventListeners() {
    // 1. Mobile Sidebar Toggle
    if (dom.mobileMenuBtn) {
      dom.mobileMenuBtn.addEventListener('click', () => {
        dom.sidebar.classList.add('mobile-open');
        dom.sidebarBackdrop.classList.add('active');
      });
    }

    const closeMobileSidebar = () => {
      dom.sidebar.classList.remove('mobile-open');
      dom.sidebarBackdrop.classList.remove('active');
    };

    if (dom.sidebarCloseBtn) dom.sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
    if (dom.sidebarBackdrop) dom.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    // 2. Navigation View Changes
    const navItems = [
      { btn: dom.navAll, view: 'all' },
      { btn: dom.navToday, view: 'today' },
      { btn: dom.navUpcoming, view: 'upcoming' },
      { btn: dom.navCompleted, view: 'completed' },
      { btn: dom.navOverdue, view: 'overdue' }
    ];

    navItems.forEach(({ btn, view }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          state.currentView = view;
          renderDashboard();
          closeMobileSidebar();
        });
      }
    });

    // Metric cards click trigger matching view
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach((card) => {
      card.addEventListener('click', () => {
        const view = card.getAttribute('data-filter-trigger');
        if (view) {
          state.currentView = view;
          renderDashboard();
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const view = card.getAttribute('data-filter-trigger');
          if (view) {
            state.currentView = view;
            renderDashboard();
          }
        }
      });
    });

    // Category Navigation Click (Event Delegation)
    if (dom.categoryNavList) {
      dom.categoryNavList.addEventListener('click', (e) => {
        // Check if delete button was clicked
        const deleteBtn = e.target.closest('.delete-category-btn');
        if (deleteBtn) {
          e.stopPropagation();
          const catId = deleteBtn.getAttribute('data-cat-id');
          if (catId) deleteCategory(catId);
          return;
        }

        const navBtn = e.target.closest('.nav-item');
        if (navBtn) {
          const view = navBtn.getAttribute('data-view');
          if (view) {
            state.currentView = view;
            renderDashboard();
            closeMobileSidebar();
          }
        }
      });
    }

    // 3. New Task Modal Triggers
    if (dom.topbarAddTaskBtn) dom.topbarAddTaskBtn.addEventListener('click', () => openTaskModal());
    if (dom.sidebarAddTaskBtn) {
      dom.sidebarAddTaskBtn.addEventListener('click', () => {
        openTaskModal();
        closeMobileSidebar();
      });
    }
    if (dom.emptyCreateBtn) dom.emptyCreateBtn.addEventListener('click', () => openTaskModal());

    // Load sample tasks from empty state
    if (dom.emptyLoadSampleBtn) {
      dom.emptyLoadSampleBtn.addEventListener('click', () => {
        state.tasks = createSampleTasks();
        saveTasks();
        renderDashboard();
        showToast('Demo tasks loaded successfully!', 'success');
      });
    }

    // Task Modal Controls
    if (dom.taskModalCloseBtn) dom.taskModalCloseBtn.addEventListener('click', closeTaskModal);
    if (dom.taskModalCancelBtn) dom.taskModalCancelBtn.addEventListener('click', closeTaskModal);
    if (dom.taskForm) dom.taskForm.addEventListener('submit', handleTaskFormSubmit);

    // Title input input event (clear error state on type)
    if (dom.taskTitleInput) {
      dom.taskTitleInput.addEventListener('input', () => {
        if (dom.taskTitleInput.value.trim()) {
          dom.titleError.style.display = 'none';
          dom.taskTitleInput.classList.remove('input-error');
        }
      });
    }

    // Description char counter
    if (dom.taskDescInput) {
      dom.taskDescInput.addEventListener('input', updateDescCounter);
    }

    // Backdrop click to close modals safely
    dom.taskModalBackdrop.addEventListener('click', (e) => {
      if (e.target === dom.taskModalBackdrop) closeTaskModal();
    });

    dom.categoryModalBackdrop.addEventListener('click', (e) => {
      if (e.target === dom.categoryModalBackdrop) closeCategoryModal();
    });

    dom.confirmModalBackdrop.addEventListener('click', (e) => {
      if (e.target === dom.confirmModalBackdrop) closeConfirmModal();
    });

    // 4. Custom Category Modal Triggers
    if (dom.openAddCategoryBtn) dom.openAddCategoryBtn.addEventListener('click', openCategoryModal);
    if (dom.modalAddCategoryBtn) dom.modalAddCategoryBtn.addEventListener('click', openCategoryModal);
    if (dom.categoryModalCloseBtn) dom.categoryModalCloseBtn.addEventListener('click', closeCategoryModal);
    if (dom.categoryModalCancelBtn) dom.categoryModalCancelBtn.addEventListener('click', closeCategoryModal);
    if (dom.categoryForm) dom.categoryForm.addEventListener('submit', handleCategoryFormSubmit);

    if (dom.categoryNameInput) {
      dom.categoryNameInput.addEventListener('input', () => {
        if (dom.categoryNameInput.value.trim()) {
          dom.categoryError.style.display = 'none';
          dom.categoryNameInput.classList.remove('input-error');
        }
      });
    }

    // 5. Confirm Modal Controls
    if (dom.confirmModalCancelBtn) dom.confirmModalCancelBtn.addEventListener('click', closeConfirmModal);
    if (dom.confirmModalActionBtn) {
      dom.confirmModalActionBtn.addEventListener('click', () => {
        if (typeof state.pendingAction === 'function') {
          state.pendingAction();
        }
        closeConfirmModal();
      });
    }

    // 6. Reset / Clear All Action
    if (dom.clearAllBtn) {
      dom.clearAllBtn.addEventListener('click', () => {
        if (state.tasks.length === 0) {
          showToast('No tasks to clear', 'info');
          return;
        }

        openConfirmModal({
          title: 'Reset All Tasks',
          message: 'Are you sure you want to permanently delete ALL tasks? This action cannot be undone.',
          confirmText: 'Clear Everything',
          action: clearAllTasks
        });
      });
    }

    // 7. Search Input & Clear
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (dom.searchClearBtn) {
          dom.searchClearBtn.style.display = state.searchQuery ? 'flex' : 'none';
        }
        renderDashboard();
      });
    }

    if (dom.searchClearBtn) {
      dom.searchClearBtn.addEventListener('click', () => {
        state.searchQuery = '';
        if (dom.searchInput) {
          dom.searchInput.value = '';
          dom.searchInput.focus();
        }
        dom.searchClearBtn.style.display = 'none';
        renderDashboard();
      });
    }

    // 8. Priority Filter & Sort Selector
    if (dom.priorityFilter) {
      dom.priorityFilter.addEventListener('change', (e) => {
        state.priorityFilter = e.target.value;
        renderDashboard();
      });
    }

    if (dom.sortSelect) {
      dom.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderDashboard();
      });
    }

    // 9. Reset Filters Button
    if (dom.resetFiltersBtn) {
      dom.resetFiltersBtn.addEventListener('click', () => {
        state.searchQuery = '';
        state.priorityFilter = 'all';
        if (dom.searchInput) dom.searchInput.value = '';
        if (dom.searchClearBtn) dom.searchClearBtn.style.display = 'none';
        if (dom.priorityFilter) dom.priorityFilter.value = 'all';
        renderDashboard();
      });
    }

    // 10. Task List Item Actions (Event Delegation)
    if (dom.taskList) {
      dom.taskList.addEventListener('click', (e) => {
        const card = e.target.closest('.task-card');
        if (!card) return;
        const taskId = card.getAttribute('data-id');
        if (!taskId) return;

        // A. Toggle Checkbox
        if (e.target.closest('[data-action="toggle-complete"]')) {
          toggleTaskCompletion(taskId);
          return;
        }

        // B. Edit Task
        if (e.target.closest('[data-action="edit-task"]')) {
          openTaskModal(taskId);
          return;
        }

        // C. Delete Task
        if (e.target.closest('[data-action="delete-task"]')) {
          const task = state.tasks.find((t) => t.id === taskId);
          const taskTitle = task ? task.title : 'this task';

          openConfirmModal({
            title: 'Delete Task',
            message: `Are you sure you want to permanently delete "${taskTitle}"?`,
            confirmText: 'Delete Task',
            action: () => deleteTask(taskId)
          });
          return;
        }
      });
    }

    // 11. Theme Switcher
    if (dom.themeToggleBtn) {
      dom.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // 12. Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape key closes open modals
      if (e.key === 'Escape') {
        if (dom.confirmModalBackdrop.classList.contains('is-open')) {
          closeConfirmModal();
        } else if (dom.categoryModalBackdrop.classList.contains('is-open')) {
          closeCategoryModal();
        } else if (dom.taskModalBackdrop.classList.contains('is-open')) {
          closeTaskModal();
        } else if (dom.sidebar.classList.contains('mobile-open')) {
          closeMobileSidebar();
        }
        return;
      }

      // 'N' shortcut to create new task when not typing in form inputs
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) &&
        !dom.taskModalBackdrop.classList.contains('is-open') &&
        !dom.categoryModalBackdrop.classList.contains('is-open') &&
        !dom.confirmModalBackdrop.classList.contains('is-open')
      ) {
        e.preventDefault();
        openTaskModal();
      }
    });
  }

  // =========================================================================
  // 16. Utility Functions
  // =========================================================================
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // 17. Run Application on DOM Ready
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
