# TaskFlow — Plan Better. Get More Done.

A modern, responsive, and professional To-Do and Task Management Web Application developed as part of the **SkillCraft Technology Web Development Internship (Task 04)**.

TaskFlow empowers users to organize daily goals, track deadlines with accurate local-time scheduling, categorize priorities, monitor real-time completion statistics, and persist task data seamlessly using browser storage.

---

## SkillCraft Technology Internship — Task 04

This project was built to satisfy all core competencies and deliverables outlined for **Task 04** of the SkillCraft Technology Web Development Internship track. 

This project demonstrates proficiency in:
- **DOM Manipulation**: Dynamic creation, rendering, and removal of accessible semantic HTML elements without virtual DOM abstractions.
- **Event Handling & Delegation**: Efficient handling of user interactions, modal events, bubbling delegation on lists, and global keyboard shortcuts (`N` for New Task, `Escape` to close modals).
- **Full CRUD Operations**: Robust Create, Read, Update, and Delete lifecycles with data integrity checks and user confirmations.
- **Form Validation**: Strict client-side verification, whitespace trimming, input error feedback, and accessible validation alerts.
- **Date & Time Handling**: Timezone-aware date and time parsing, local calendar comparisons, relative time formatting, and edge-case handling (e.g. tasks with dates but omitted times).
- **Array Operations & Filtering**: Multi-condition dataset filtering combining categories, views (Today, Upcoming, Completed, Overdue), and priority tags.
- **Sorting Algorithms**: Custom multi-criteria sorting routines covering earliest/latest due dates, priority tiers (High/Medium/Low), creation recency, and alphabetical ordering.
- **Browser Storage (localStorage)**: Safe, serialized data persistence, automatic initialization with demo tasks, and error handling for storage limits.
- **Responsive Web Design**: Mobile-first architecture with collapsible off-canvas navigation, adaptive touch targets, and flexible grids.
- **State Management**: Separation of pure application state from presentation logic to ensure predictable, bug-free UI updates.

---

## Features

### 1. Task Management (CRUD)
- **Add Tasks**: Specify Title (required), optional Description (with character count), Due Date, Due Time, Priority Level (Low, Medium, High), and Category.
- **Edit Tasks**: Update any task attribute without duplicate record creation or loss of unique identifiers and creation dates.
- **Mark Complete / Incomplete**: Single-click checkbox toggling with smooth strike-through animations and completion badges.
- **Delete Tasks**: Protected with a styled, accessible confirmation modal to prevent accidental loss of important tasks.

### 2. Category & List Organization
- **Default Categories**: `Personal`, `Work`, `Study`, `Other`.
- **Custom Categories**: Users can create custom categories on the fly with a dedicated color swatch palette.
- **Category Cleanup**: Deleting a custom category safely reassigns existing tasks to "Other" rather than discarding them.

### 3. Date, Time & Overdue Intelligence
- **Local Browser Timezone**: Uses the user's local system time for all calculations.
- **Omitted Due Time Rule**: When a due date is specified without a time, the application treats the task as due at the end of the day (`23:59:59`) before marking it overdue.
- **Completed Task Immunity**: Completed tasks are never classified as overdue, maintaining accurate historical records.
- **Relative Badges**: Visual indicators for `Overdue`, `Today`, `Tomorrow`, and formatted future dates (`Oct 15 • 2:30 PM`).

### 4. Search, Filters & Sorting
- **Real-Time Search**: Instant, case-insensitive search across both task titles and descriptions with an instant clear button.
- **Quick Views**:
  - **All Tasks**: Complete overview of active and completed tasks.
  - **Today**: Tasks scheduled for the current calendar day.
  - **Upcoming**: Scheduled deadlines beyond today.
  - **Completed**: Finished tasks with completion timestamps.
  - **Overdue**: Urgent pending tasks that missed their deadline.
- **Priority Filtering**: Filter by All, High, Medium, or Low priority.
- **Sorting Modes**:
  - Due Date (Earliest First)
  - Due Date (Latest First)
  - Priority (High to Low)
  - Priority (Low to High)
  - Date Created (Newest First)
  - Title (A to Z)

### 5. Interactive Dashboard & Metrics
- **Completion Rate Progress Bar**: Real-time percentage indicator with encouraging progress feedback.
- **Interactive Metric Cards**: Clickable statistic counters for Total, Pending, Completed, and Overdue tasks that switch directly to their corresponding view.

### 6. User Experience & Accessibility
- **Dark & Light Themes**: Sleek dark navy default theme with a high-contrast light theme toggle that persists across sessions.
- **Keyboard Shortcuts**: Press `N` to open the New Task modal; press `Escape` to dismiss any open modal or sidebar.
- **Accessible ARIA Attributes**: Semantic elements, `aria-modal`, `role="dialog"`, accessible labels, and clear focus-visible outlines.
- **Toast Notifications**: Non-intrusive action feedback for task additions, updates, deletions, and view resets.

---

## Technologies Used

- **HTML5**: Semantic document layout, form controls, and accessible dialogs.
- **CSS3**: Modern CSS Variables, Flexbox, CSS Grid, media queries, custom styled checkboxes, and dark/light color schemes.
- **Vanilla JavaScript (ES6+)**: Pure ECMAScript with arrow functions, array methods (`filter`, `sort`, `reduce`, `map`), Event Delegation, and the Web Storage API.

> **Note**: This application contains zero external runtime dependencies, CSS frameworks, or JavaScript libraries.

---

## Folder Structure

```
├── index.html          # Main HTML5 application structure & modal templates
├── style.css           # Comprehensive CSS3 stylesheet (variables, themes, responsive layout)
├── script.js           # Vanilla JavaScript application logic & state management
├── README.md           # Documentation and SkillCraft internship task report
├── metadata.json       # Application metadata
└── .gitignore          # Git ignore configuration
```

---

## How to Run the Application Locally

Because TaskFlow is built strictly with standard web technologies, no build steps, bundlers, or package installations are required.

### Method 1: Direct File Launch
1. Clone or download the repository files to your computer.
2. Double-click `index.html` or right-click and select **Open with > Chrome / Firefox / Safari / Edge**.

### Method 2: Local Static Server (Optional)
If you prefer running through a local development server:
```bash
# Python 3
python3 -m http.server 3000

# or Node.js npx
npx serve .
```
Navigate to `http://localhost:3000` in your web browser.

---

## Technical Explanations

### 1. Task CRUD Operations
TaskFlow decouples data manipulation from DOM rendering. All operations manipulate an in-memory `state.tasks` array before syncing to `localStorage` and calling `renderDashboard()`:
- `createTask(data)`: Generates a unique timestamped ID (`task_${Date.now()}_${random}`), prepends the object, and updates views.
- `updateTask(id, data)`: Finds the task index, merges updated fields, and preserves immutable metadata (`id`, `createdAt`, `completed`).
- `deleteTask(id)`: Removes the item by index and recalculates all dependent dashboard metrics.
- `toggleTaskCompletion(id)`: Inverts the boolean flag and logs update timestamps.

### 2. Task Filtering & Sorting
Filtering uses a chained evaluation pipeline:
```javascript
const filtered = tasks.filter(task => {
  // 1. View filtering (Today, Upcoming, Completed, Overdue, Category)
  // 2. Priority dropdown filtering
  // 3. Search query matching in title and description
  return matchesAllConditions;
});
```
Sorting routines gracefully handle tasks with missing due dates by sinking them to the end of date-based lists, preventing unexpected jumps.

### 3. Due Dates & Overdue Classification
Overdue checks execute against the user's local clock:
1. If `task.completed === true`, the task is never overdue.
2. If `task.dueDate` is omitted, the task is not overdue.
3. If `task.dueTime` is provided, comparison runs against `YYYY-MM-DD HH:MM:00`.
4. If `task.dueTime` is omitted, comparison runs against `YYYY-MM-DD 23:59:59.999`.

### 4. LocalStorage Architecture
Tasks and user preferences are serialized to JSON strings in browser storage:
- `taskflow_tasks_v1`: Array of task objects.
- `taskflow_categories_v1`: Array of category objects.
- `taskflow_theme`: Preferred theme (`dark` or `light`).

All storage accesses are wrapped in `try...catch` blocks to protect against environments where `localStorage` is disabled or quotas are exceeded.

---

## Future Improvements

- Recurring task schedules (daily, weekly, monthly).
- Export & import tasks as JSON or CSV files.
- Sub-tasks and nested checklist items.
- Drag-and-drop task reordering.
- Audio chimes or browser notification reminders for deadlines.

---

## Author & Acknowledgements

- **Developer**: Aswin
- **Program**: SkillCraft Technology Web Development Internship
- **Task**: Task 04 — To-Do Web Application
