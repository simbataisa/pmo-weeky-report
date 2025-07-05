# AGENTS.md - Weekly Report Project

## Build/Test Commands
This is a static HTML/CSS/JavaScript project with no build system or package.json.
- **Run locally**: Open `index.html` in a web browser
- **No tests**: No test framework configured
- **No linting**: No linting tools configured

## Code Style Guidelines

### File Structure
- `index.html` - Main HTML file with Vietnamese content
- `script.js` - Main JavaScript file with all functionality
- `styles.css` - All CSS styles in a single file

### JavaScript Style
- Use `let`/`const` instead of `var`
- Camelcase for variables: `currentWeek`, `importedWeeksData`
- Functions use camelCase: `updateStats()`, `renderProjects()`
- Global variables declared at top of file
- Event handlers use `addEventListener` pattern
- Use template literals for HTML generation

### HTML/CSS Style
- Vietnamese language content (`lang="vi"`)
- CSS uses kebab-case classes: `.stat-card`, `.gantt-container`
- Responsive design with mobile-first approach
- Uses Font Awesome icons and external CDN libraries
- Semantic HTML structure with proper accessibility

### Error Handling
- Use try-catch blocks for JSON parsing and localStorage operations
- Show user-friendly error messages via `showPopup()` function
- Graceful degradation for missing data