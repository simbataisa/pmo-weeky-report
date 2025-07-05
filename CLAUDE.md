# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a static HTML/CSS/JavaScript project with no build system:
- **Run locally**: Open `index.html` in a web browser  
- **No package.json**: Dependencies loaded via CDN (Font Awesome, Quill.js, html2pdf.js, SheetJS)
- **No tests configured**: No test framework in place
- **No linting configured**: No linting tools available

## Architecture Overview

### Single-Page Application Structure
- **Monolithic design**: Single HTML file (349 lines), single JS file (2,314 lines), single CSS file (1,710 lines)
- **Tab-based navigation**: Dashboard, Projects, Timeline, Settings
- **Client-side only**: No backend, uses localStorage for persistence
- **Vietnamese language**: UI text is in Vietnamese (`lang="vi"`)

### Core Functionality
- **Project Management**: CRUD operations for projects with status tracking (healthy/warning/critical)
- **Rich Text Editing**: Quill.js integration for project descriptions, tasks, risks, solutions
- **Data Visualization**: Dashboard statistics, Gantt charts, risk matrix
- **Export Features**: PDF reports and Excel exports with multiple worksheets
- **Data Management**: JSON import/export, weekly report versioning

### Data Model
Projects stored as objects with: id, name, manager, status, description (HTML), tasks (HTML), risks (HTML), priority, solutions (HTML), startDate, endDate, progress

### Key Functions (script.js)
- **Rendering**: `renderProjects()`, `renderGanttChart()`, `drawStatusChart()`
- **Data Operations**: `exportData()`, `importData()`, `saveSettings()`
- **UI Management**: `showTab()`, `addProject()`, `editProject()`
- **Export Features**: `exportReport()`, `exportExcel()`

## Code Style Conventions

### JavaScript
- Use `let`/`const` instead of `var`
- camelCase for variables and functions: `currentWeek`, `updateStats()`
- Global variables declared at file top
- Template literals for HTML generation
- Try-catch blocks for JSON/localStorage operations
- User-friendly errors via `showPopup()` function

### HTML/CSS
- Vietnamese content with proper `lang="vi"` attribute
- CSS uses kebab-case: `.stat-card`, `.gantt-container`
- Responsive mobile-first design
- Font Awesome icons from CDN
- Semantic HTML with accessibility considerations

## Key Implementation Details

### Quill.js Integration
Rich text editors are initialized for project fields requiring HTML content. HTML tags are stripped during Excel exports using regex patterns.

### Gantt Chart Logic
Custom timeline visualization with proportional month calculations. Uses `calculateMonthFromWeek()` function for date positioning.

### Export Functionality
- **PDF**: html2pdf.js generates reports with project data, charts, and risk matrix
- **Excel**: SheetJS creates multi-worksheet files with HTML content cleaned for compatibility

### Data Persistence
localStorage stores: projects array, current week selection, settings. Weekly data versioned by week number with JSON backup/restore capability.