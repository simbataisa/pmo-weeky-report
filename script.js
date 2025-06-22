// Global variables
let projects = [];
let currentWeek = 1; // Will be set properly after getWeekNumber function is available
let currentYear = new Date().getFullYear();
let importedWeeksData = null; // Store imported JSON data

// Sample project data
let sampleProjects = [
    {
        id: 1,
        name: "Nền tảng cho thuê xe",
        manager: "Phạm Hoàng Hải",
        status: "warning",
        description: "Đã hoàn thiện thuê xe tự lái. Đang phát triển dịch vụ Chauffeur. BO yêu cầu năng cấp thêm.",
        nextWeekTasks: "Go-live giá lẻ Tết. Cấp nhật miền sạc. Go-live giá thuê xe sân bay.",
        risks: "Rủi ro trễ timeline (15/07) tích hợp vị điện tử. Chưa rõ yêu cầu lương vận hành Chauffeur.",
        priority: "medium",
        solutions: "Go-live nhưng sách giá thuê xe sân bay",
        startDate: "2025-01-01",
        endDate: "2025-07-15",
        progress: 65
    },
    {
        id: 2,
        name: "Nền tảng mua bán xe cũ",
        manager: "PO Nguyễn Đăng Thái",
        status: "warning",
        description: "Đã thông lượng Dealer đăng tin và nhận lead (cần sua lỗi). Đang setup nền tảng VHM cho Cara.",
        nextWeekTasks: "09/06: Xác định cấu phần & bước tiếp theo.",
        risks: "Rủi ro trễ deadline do phụ thuộc đánh giá ANBM và scope lớn.",
        priority: "medium",
        solutions: "09/06: Xác định cấu phần",
        startDate: "2025-02-01",
        endDate: "2025-09-30",
        progress: 40
    },
    {
        id: 3,
        name: "Hệ thống Dealer portal",
        manager: "PO Nguyễn Đăng Thái",
        status: "warning",
        description: "Đang thực hiện customize VHM Marketplace.",
        nextWeekTasks: "Tiếp tục customize VHM Marketplace.",
        risks: "Cần align lại timeline với Cara do có nhiều request mới.",
        priority: "medium",
        solutions: "20/06: Ra mắt bản MVP",
        startDate: "2025-03-01",
        endDate: "2025-06-20",
        progress: 75
    },
    {
        id: 4,
        name: "Hệ thống Quản lý kho xe",
        manager: "Phạm Hoàng Hải",
        status: "healthy",
        description: "Đã bàn giao Vận hành IT. Đang chạy song song đánh giá ANBM.",
        nextWeekTasks: "Đánh giá lại process ANBM.",
        risks: "Không có",
        priority: "low",
        solutions: "Đã bàn giao Vận hành IT",
        startDate: "2025-01-15",
        endDate: "2025-05-30",
        progress: 90
    },
    {
        id: 5,
        name: "Hệ thống Quản lý vận hành xe",
        manager: "PO Nguyễn Đăng Thái",
        status: "critical",
        description: "Đã chốt yêu cầu với Vận hành. Dự án đã kick off và chia phase.",
        nextWeekTasks: "Kick off dự án vào 09/06/2025.",
        risks: "Không có",
        priority: "high",
        solutions: "Phase 1: Bàn giao TB",
        startDate: "2025-06-09",
        endDate: "2025-12-31",
        progress: 10
    }
];

let currentEditingProject = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    renderProjects();
    drawStatusChart();
    updateCurrentWeek();
    renderGanttChart();

    // Add form submit handler
    document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);
});

// Generate months for 2025 with proper date calculations
const months = [
    { name: '01-2025', days: 31, startDate: new Date('2025-01-01') },
    { name: '02-2025', days: 28, startDate: new Date('2025-02-01') },
    { name: '03-2025', days: 31, startDate: new Date('2025-03-01') },
    { name: '04-2025', days: 30, startDate: new Date('2025-04-01') },
    { name: '05-2025', days: 31, startDate: new Date('2025-05-01') },
    { name: '06-2025', days: 30, startDate: new Date('2025-06-01') },
    { name: '07-2025', days: 31, startDate: new Date('2025-07-01') },
    { name: '08-2025', days: 31, startDate: new Date('2025-08-01') },
    { name: '09-2025', days: 30, startDate: new Date('2025-09-01') },
    { name: '10-2025', days: 31, startDate: new Date('2025-10-01') },
    { name: '11-2025', days: 30, startDate: new Date('2025-11-01') },
    { name: '12-2025', days: 31, startDate: new Date('2025-12-01') }
];

// Create month headers with proportional widths
const totalDays = months.reduce((sum, month) => sum + month.days, 0);

// Gantt Chart functions
function renderGanttChart() {
    const ganttHeader = document.getElementById('gantt-timeline-header');
    const ganttBody = document.getElementById('gantt-body');
    
    // Clear existing content
    ganttHeader.innerHTML = '';
    ganttBody.innerHTML = '';

    months.forEach(month => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'gantt-month';
        monthDiv.textContent = month.name;
        monthDiv.style.flex = `0 0 ${(month.days / totalDays) * 100}%`;
        ganttHeader.appendChild(monthDiv);
    });
    // Create project rows
    projects.forEach(project => {
        const row = createGanttRow(project, months, totalDays);
        ganttBody.appendChild(row);
    });

    const todayLine = document.createElement('div');
    todayLine.className = 'gantt-today-line';
    todayLine.id = 'gantt-today-line';
    ganttBody.appendChild(todayLine);
    
    // // Create and position today line after a delay to ensure layout is complete
    // setTimeout(() => {
    //         positionTodayLine(todayLine, months, totalDays);
    // }, 200);
}

function createGanttRow(project, months, totalDays) {
    const row = document.createElement('div');
    row.className = 'gantt-row';
    
    // Project info column
    const projectInfo = document.createElement('div');
    projectInfo.className = 'gantt-project-info';
    projectInfo.innerHTML = `
        <div class="gantt-project-name">${project.name}</div>
        <div class="gantt-project-manager">${project.manager}</div>
    `;
    
    // Timeline column
    const timeline = document.createElement('div');
    timeline.className = 'gantt-timeline';
    
    // Create month columns with proportional widths
    months.forEach(month => {
        const monthColumn = document.createElement('div');
        monthColumn.className = 'gantt-month-column';
        monthColumn.style.flex = `0 0 ${(month.days / totalDays) * 100}%`;
        timeline.appendChild(monthColumn);
    });
    
    // Create and position the gantt bar
    const ganttBar = createGanttBar(project, totalDays);
    timeline.appendChild(ganttBar);
    
    row.appendChild(projectInfo);
    row.appendChild(timeline);
    
    return row;
}

function createGanttBar(project, totalDays) {
    const bar = document.createElement('div');
    bar.className = `gantt-bar ${project.status}`;
    
    // Calculate position and width based on dates
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const yearStart = new Date('2025-01-01');
    
    const startDays = (startDate - yearStart) / (1000 * 60 * 60 * 24);
    const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    
    const leftPercent = (startDays / totalDays) * 100;
    const widthPercent = (durationDays / totalDays) * 100;
    
    bar.style.left = `${leftPercent}%`;
    bar.style.width = `${widthPercent}%`;
    
    // Add progress indicator
    const progress = document.createElement('div');
    progress.className = 'gantt-progress';
    progress.style.width = `${project.progress}%`;
    bar.appendChild(progress);
    
    // Add project name to bar
    const barText = document.createElement('span');
    barText.textContent = `${project.progress}%`;
    bar.appendChild(barText);
    
    // Add tooltip
    bar.title = `${project.name}\nBắt đầu: ${formatDate(startDate)}\nKết thúc: ${formatDate(endDate)}\nTiến độ: ${project.progress}%`;
    
    return bar;
}

function positionTodayLine(todayLine, months, totalDays) {
    // Set today as June 10, 2025
    const today = new Date('2025-06-10');
    
    // Find the target month and calculate position within it
    let cumulativeDays = 0;
    let targetMonth = null;
    let daysIntoMonth = 0;
    
    for (const month of months) {
        const monthEnd = new Date(month.startDate);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        
        if (today >= month.startDate && today < monthEnd) {
            targetMonth = month;
            daysIntoMonth = Math.floor((today - month.startDate) / (1000 * 60 * 60 * 24));
            break;
        }
        cumulativeDays += month.days;
    }
  
    if (targetMonth) {
        // Calculate position based on cumulative days + position within target month
        const totalPosition = cumulativeDays + daysIntoMonth;
        const positionPercent = (totalPosition / totalDays) * 100;
        
        // Position relative to the gantt-body (timeline area only)
        const ganttBody = document.querySelector('.gantt-body');
        if (ganttBody) {
            const bodyWidth = ganttBody.offsetWidth;
            // Calculate project column width based on flex ratio (3:12 total, so 3/12 = 1/4)
            const projectColumnWidth = bodyWidth * (3 / 12);
            const timelineWidth = bodyWidth * (9 / 12);
            const todayPosition = projectColumnWidth + (positionPercent / 100) * timelineWidth;
            todayLine.style.left = `${todayPosition}px`;
        }
    }
}

function formatDate(date) {
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Redraw chart if dashboard is selected
    if (tabName === 'dashboard') {
        setTimeout(() => drawStatusChart(), 100);
    }

    if (tabName === 'timeline') {
        // Create and position today line after a delay to ensure layout is complete
        setTimeout(() => {
            const todayLine = document.querySelector('.gantt-today-line');          
            positionTodayLine(todayLine, months, totalDays);
        }, 200);
    }
}

// Update statistics
function updateStats() {
    const stats = {
        total: projects.length,
        healthy: projects.filter(p => p.status === 'healthy').length,
        warning: projects.filter(p => p.status === 'warning').length,
        critical: projects.filter(p => p.status === 'critical').length
    };
    
    document.getElementById('total-projects').textContent = stats.total;
    document.getElementById('healthy-projects').textContent = stats.healthy;
    document.getElementById('warning-projects').textContent = stats.warning;
    document.getElementById('critical-projects').textContent = stats.critical;
}

// Render projects table
function renderProjects() {
    const tableBody = document.getElementById('projects-table-body');
    tableBody.innerHTML = '';
    
    projects.forEach(project => {
        const row = createProjectRow(project);
        tableBody.appendChild(row);
    });
}

// Alias for renderProjects to fix import data error
function renderProjectsTable() {
    renderProjects();
}

// Create project row element
function createProjectRow(project) {
    const row = document.createElement('tr');
    
    const statusText = {
        'healthy': 'Tốt',
        'warning': 'Cần chú ý',
        'critical': 'Cần hành động'
    };
    
    const priorityText = {
        'high': 'Cao',
        'medium': 'Trung bình',
        'low': 'Thấp'
    };
    
    row.innerHTML = `
        <td><strong>${project.name}</strong></td>
        <td>${project.manager}</td>
        <td><span class="status-badge ${project.status}">${statusText[project.status]}</span></td>
        <td>${project.description}</td>
        <td>${project.nextWeekTasks}</td>
        <td>${project.risks}</td>
        <td><span class="priority-badge ${project.priority}">${priorityText[project.priority]}</span></td>
        <td>
            <div class="table-actions">
                <button class="btn-edit" onclick="editProject(${project.id})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn-delete" onclick="deleteProject(${project.id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Draw status chart
function drawStatusChart() {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate percentages
    const total = projects.length;
    const healthy = projects.filter(p => p.status === 'healthy').length;
    const warning = projects.filter(p => p.status === 'warning').length;
    const critical = projects.filter(p => p.status === 'critical').length;
    
    const healthyAngle = (healthy / total) * 2 * Math.PI;
    const warningAngle = (warning / total) * 2 * Math.PI;
    const criticalAngle = (critical / total) * 2 * Math.PI;
    
    let currentAngle = -Math.PI / 2; // Start from top
    
    // Draw healthy section
    if (healthy > 0) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + healthyAngle);
        ctx.closePath();
        ctx.fillStyle = '#28a745';
        ctx.fill();
        currentAngle += healthyAngle;
    }
    
    // Draw warning section
    if (warning > 0) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + warningAngle);
        ctx.closePath();
        ctx.fillStyle = '#ffc107';
        ctx.fill();
        currentAngle += warningAngle;
    }
    
    // Draw critical section
    if (critical > 0) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + criticalAngle);
        ctx.closePath();
        ctx.fillStyle = '#dc3545';
        ctx.fill();
    }
    
    // Draw inner circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
}

// Modal functions
function addProject() {
    currentEditingProject = null;
    document.getElementById('modal-title').textContent = 'Thêm Dự Án Mới';
    document.getElementById('project-form').reset();
    // Set default values
    document.getElementById('project-priority').value = 'medium';
    document.getElementById('projectModal').style.display = 'block';
}

function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    currentEditingProject = project;
    document.getElementById('modal-title').textContent = 'Sửa Dự Án';
    
    // Fill form with project data
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-manager').value = project.manager || '';
    document.getElementById('project-status').value = project.status;
    document.getElementById('project-description').value = project.description;
    document.getElementById('project-next-tasks').value = project.nextWeekTasks || '';
    document.getElementById('project-risks').value = project.risks;
    document.getElementById('project-priority').value = project.priority || 'medium';
    document.getElementById('project-solutions').value = project.solutions;
    
    document.getElementById('projectModal').style.display = 'block';
}

function deleteProject(id) {
    showConfirmPopup('Bạn có chắc chắn muốn xóa dự án này?', function() {
        projects = projects.filter(p => p.id !== id);
        updateStats();
        renderProjects();
        drawStatusChart();
    });
}

function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
    currentEditingProject = null;
}

// Handle form submission
function handleProjectSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('project-name').value,
        manager: document.getElementById('project-manager').value,
        status: document.getElementById('project-status').value,
        description: document.getElementById('project-description').value,
        nextWeekTasks: document.getElementById('project-next-tasks').value,
        risks: document.getElementById('project-risks').value,
        priority: document.getElementById('project-priority').value,
        solutions: document.getElementById('project-solutions').value
    };
    
    if (currentEditingProject) {
        // Update existing project
        Object.assign(currentEditingProject, formData);
    } else {
        // Add new project
        const newProject = {
            id: Math.max(...projects.map(p => p.id)) + 1,
            ...formData
        };
        projects.push(newProject);
    }
    
    updateStats();
    renderProjects();
    drawStatusChart();
    closeModal();
}

// Update current week display
function updateCurrentWeek() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const weekNumber = getWeekNumber(now);
    
    document.getElementById('current-week').textContent = `Tuần ${weekNumber} - tháng ${month.toString().padStart(2, '0')}/${year}`;
}

// Get week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Export report function
function exportReport() {
    // Create a simple text report
    let report = `BÁO CÁO TUẦN - TIẾN ĐỘ DỰ ÁN\n`;
    report += `${document.getElementById('current-week').textContent}\n\n`;
    
    report += `TỔNG QUAN:\n`;
    report += `- Tổng số dự án: ${projects.length}\n`;
    report += `- Tốt (Healthy): ${projects.filter(p => p.status === 'healthy').length}\n`;
    report += `- Cần chú ý: ${projects.filter(p => p.status === 'warning').length}\n`;
    report += `- Cần hành động: ${projects.filter(p => p.status === 'critical').length}\n\n`;
    
    report += `CHI TIẾT CÁC DỰ ÁN:\n\n`;
    
    projects.forEach((project, index) => {
        const statusText = {
            'healthy': 'Tốt',
            'warning': 'Cần chú ý',
            'critical': 'Cần hành động'
        };
        
        report += `${index + 1}. ${project.name}\n`;
        report += `   Trạng thái: ${statusText[project.status]}\n`;
        report += `   Miêu tả: ${project.description}\n`;
        report += `   Rủi ro: ${project.risks}\n`;
        report += `   Cách giải quyết: ${project.solutions}\n\n`;
    });
    
    // Create and download file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-tuan-${getWeekNumber(new Date())}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showPopup('Báo cáo đã được xuất thành công!', 'success');
}

// Save settings function
function saveSettings() {
    const week = document.getElementById('report-week').value;
    const year = document.getElementById('report-year').value;
    
    document.getElementById('current-week').textContent = `Tuần ${week} - tháng 06/${year}`;
    
    // Load the project data for the selected week/year
    loadCurrentWeekData();
    
    // Update the copy dropdown to sync with the new current week
    // updatePreviousWeekOptions(); // Removed - selectbox no longer exists
    
    showPopup('Cài đặt đã được lưu!', 'success');
}

// Load project data for the currently selected week/year
function loadCurrentWeekData() {
    const week = document.getElementById('report-week').value;
    const year = document.getElementById('report-year').value;
    const weekKey = `weekly-report-${year}-week-${week}`;
    
    // Try to load data from localStorage
    const savedData = localStorage.getItem(weekKey);
    
    if (savedData) {
        try {
            const weekData = JSON.parse(savedData);
            projects = weekData.projects || [];
        } catch (error) {
            console.error('Error parsing saved week data:', error);
            projects = [];
        }
    } else {
        // No data found for this week, initialize empty projects
        projects = [];
    }
    
    // Update all displays
    renderProjectsTable();
    renderGanttChart();
    updateStats();
    drawStatusChart();
}

// Export current week data only
function exportCurrentWeek() {
    const currentWeek = document.getElementById('report-week').value;
    const currentYear = document.getElementById('report-year').value;
    
    const data = {
        projects: projects,
        settings: {
            week: currentWeek,
            year: currentYear,
            exportDate: new Date().toISOString()
        },
        version: '1.0'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-week-${currentWeek}-${currentYear}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showPopup(`Đã xuất dữ liệu tuần ${currentWeek}/${currentYear} thành công!`, 'success');
}

// Export all weeks data for backup
function exportAllWeeks() {
    const currentWeek = document.getElementById('report-week').value;
    const currentYear = document.getElementById('report-year').value;
    
    // Collect all weekly data from localStorage as an array
    const allWeeksArray = [];
    const processedWeeks = new Set();
    
    // Add current week data
    const currentWeekKey = `${currentYear}-${currentWeek}`;
    const currentWeekData = {
        week: currentWeek,
        year: currentYear,
        projects: JSON.parse(JSON.stringify(projects)),
        savedAt: new Date().toISOString()
    };
    allWeeksArray.push(currentWeekData);
    processedWeeks.add(currentWeekKey);
    
    // Collect all saved weeks from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('weekly-report-')) {
            try {
                const savedData = JSON.parse(localStorage.getItem(key));
                const weekKey = `${savedData.year}-${savedData.week}`;
                
                // Don't add duplicate current week data
                if (!processedWeeks.has(weekKey)) {
                    allWeeksArray.push(savedData);
                    processedWeeks.add(weekKey);
                }
            } catch (e) {
                console.warn(`Failed to parse saved data for key: ${key}`);
            }
        }
    }
    
    // Sort weeks by year and week number for better organization
    allWeeksArray.sort((a, b) => {
        if (a.year !== b.year) {
            return parseInt(a.year) - parseInt(b.year);
        }
        return parseInt(a.week) - parseInt(b.week);
    });
    
    const data = {
        weeks: allWeeksArray,
        currentWeek: {
            week: currentWeek,
            year: currentYear
        },
        exportDate: new Date().toISOString(),
        version: '2.1'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const weekCount = allWeeksArray.length;
    a.download = `weekly-report-backup-all-weeks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showPopup(`Đã xuất backup thành công! (${weekCount} tuần)`, 'success');
}

// Legacy function for backward compatibility
function exportData() {
    exportAllWeeks();
}

// Import data from JSON
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Store imported data globally
            importedWeeksData = data;
            
            // Check if this is the new multi-week format (version 2.0+)
            if ((data.version === '2.0' || data.version === '2.1') && data.weeks) {
                console.log("Import multi weeks...");
                importMultiWeekData(data);
            } else if (data.projects && Array.isArray(data.projects)) {
                // Handle legacy single-week format (version 1.0)
                console.log("Import multi weeks...");
                importSingleWeekData(data);
            } else {
                throw new Error('Định dạng file không hợp lệ: không nhận diện được cấu trúc dữ liệu');
            }
            
        } catch (error) {
            showPopup(`Lỗi khi import dữ liệu: ${error.message}`, 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Import multi-week data (version 2.0+)
function importMultiWeekData(data) {
    let importedWeeks = 0;
    let clearedWeeks = 0;
    
    // Validate weeks data - support both array (v2.1+) and object (v2.0) formats
    if (!data.weeks) {
        throw new Error('Định dạng file không hợp lệ: thiếu dữ liệu weeks');
    }
    
    // Clear all existing weekly data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('weekly-report-')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        clearedWeeks++;
    });
    
    // Clear current projects array
    projects = [];
    
    // Convert weeks data to array format if it's an object (backward compatibility)
    let weeksArray;
    if (Array.isArray(data.weeks)) {
        // New array format (v2.1+)
        weeksArray = data.weeks;
    } else {
        // Old object format (v2.0) - convert to array
        weeksArray = Object.values(data.weeks);
    }
    
    // Process each week
    for (const weekData of weeksArray) {
        try {
            // Validate week data structure
            if (!weekData.projects || !Array.isArray(weekData.projects)) {
                console.warn(`Bỏ qua tuần ${weekData.year}-week-${weekData.week}: thiếu dữ liệu projects`);
                continue;
            }
            
            // Validate each project has required fields
            const requiredFields = ['id', 'name', 'manager', 'status'];
            let validWeek = true;
            for (const project of weekData.projects) {
                for (const field of requiredFields) {
                    if (!project.hasOwnProperty(field)) {
                        console.warn(`Bỏ qua tuần ${weekData.year}-week-${weekData.week}: dự án thiếu trường ${field}`);
                        validWeek = false;
                        break;
                    }
                }
                if (!validWeek) break;
            }
            
            if (!validWeek) continue;
            
            // Store week data in localStorage
            const storageKey = `weekly-report-${weekData.year}-week-${weekData.week}`;
            localStorage.setItem(storageKey, JSON.stringify(weekData));
            importedWeeks++;
            
        } catch (error) {
            console.warn(`Lỗi khi import tuần ${weekData.year}-week-${weekData.week}: ${error.message}`);
        }
    }
    
    // Refresh the display and dropdowns
    populateYearDropdown();
    populateWeekDropdown();
    
    // Set current week if specified (after populating dropdowns)
    if (data.currentWeek) {
        document.getElementById('report-week').value = data.currentWeek.week;
        document.getElementById('report-year').value = data.currentWeek.year;
    }
    console.log(data.currentWeek);
    
    // Load current week data after setting dropdowns
    loadCurrentWeekData();
    
    // Update current-week span to reflect selected week
    const selectedWeek = document.getElementById('report-week').value;
    const selectedYear = document.getElementById('report-year').value;
    document.getElementById('current-week').textContent = `Tuần ${selectedWeek} - tháng 06/${selectedYear}`;
    // updatePreviousWeekOptions(); // Removed - selectbox no longer exists
    
    const message = `Đã import thành công ${importedWeeks} tuần!`;
    const clearMessage = clearedWeeks > 0 ? `\n(Đã xóa ${clearedWeeks} tuần cũ và thay thế hoàn toàn)` : '';
    showPopup(message + clearMessage, 'success');
}

// Import single-week data (legacy version 1.0)
function importSingleWeekData(data) {
    // Validate data structure
    if (!data.projects || !Array.isArray(data.projects)) {
        throw new Error('Định dạng file không hợp lệ: thiếu mảng projects');
    }
    
    // Validate each project has required fields
    const requiredFields = ['id', 'name', 'manager', 'status'];
    for (const project of data.projects) {
        for (const field of requiredFields) {
            if (!project.hasOwnProperty(field)) {
                throw new Error(`Dự án thiếu trường bắt buộc: ${field}`);
            }
        }
    }
    
    // Clear all existing weekly data from localStorage
    let clearedWeeks = 0;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('weekly-report-')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        clearedWeeks++;
    });
    
    // Import projects (replace all existing data)
    projects = data.projects;
    
    // Import settings if available (legacy format)
    if (data.settings) {
        if (data.settings.week) {
            document.getElementById('report-week').value = data.settings.week;
        }
        if (data.settings.year) {
            document.getElementById('report-year').value = data.settings.year;
        }
        
        // Save this week's data to localStorage for consistency
        const weekData = {
            week: data.settings.week,
            year: data.settings.year,
            projects: JSON.parse(JSON.stringify(projects)),
            savedAt: new Date().toISOString()
        };
        
        const storageKey = `weekly-report-${data.settings.year}-week-${data.settings.week}`;
        localStorage.setItem(storageKey, JSON.stringify(weekData));
    }
    
    // Handle currentWeek format (newer format)
    if (data.currentWeek) {
        document.getElementById('report-week').value = data.currentWeek.week;
        document.getElementById('report-year').value = data.currentWeek.year;
        
        // Save this week's data to localStorage for consistency
        const weekData = {
            week: parseInt(data.currentWeek.week),
            year: parseInt(data.currentWeek.year),
            projects: JSON.parse(JSON.stringify(projects)),
            savedAt: new Date().toISOString()
        };
        
        const storageKey = `weekly-report-${data.currentWeek.year}-week-${data.currentWeek.week}`;
        localStorage.setItem(storageKey, JSON.stringify(weekData));
    }
    
    // Refresh the display and dropdowns
    populateYearDropdown();
    populateWeekDropdown();
    
    // Load current week data after setting dropdowns
    loadCurrentWeekData();
    
    updateCurrentWeek();
    // updatePreviousWeekOptions(); // Removed - selectbox no longer exists
    
    const message = `Đã import thành công ${data.projects.length} dự án!`;
    const clearMessage = clearedWeeks > 0 ? `\n(Đã xóa ${clearedWeeks} tuần cũ và thay thế hoàn toàn)` : '';
    showPopup(message + clearMessage, 'success');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to close modal
    if (event.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl+N to add new project
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        addProject();
    }
});

// Weekly Report Management Functions
function createNewWeeklyReport() {
    const currentWeek = parseInt(document.getElementById('report-week').value);
    const currentYear = parseInt(document.getElementById('report-year').value);
    const copyDataCheckbox = document.getElementById('copy-data-checkbox');
    const shouldCopyData = copyDataCheckbox && copyDataCheckbox.checked;
    
    // Calculate next week
    let nextWeek = currentWeek + 1;
    let nextYear = currentYear;
    
    // Handle year transition (assuming 52 weeks per year)
    if (nextWeek > 52) {
        nextWeek = 1;
        nextYear = currentYear + 1;
    }
    
    // Confirm with user
    const copyMessage = shouldCopyData ? '\nDữ liệu tuần hiện tại sẽ được copy sang tuần mới.' : '\nDữ liệu tuần mới sẽ được reset.';
    const confirmMessage = `Tạo báo cáo mới cho Tuần ${nextWeek} - ${nextYear}?\nDữ liệu hiện tại sẽ được lưu trữ.${copyMessage}`;
    
    showConfirmPopup(confirmMessage, function() {
        // Save current data with timestamp
        const currentData = {
            week: currentWeek,
            year: currentYear,
            projects: JSON.parse(JSON.stringify(projects)), // Deep copy
            savedAt: new Date().toISOString()
        };
        
        // Store in localStorage for backup
        const storageKey = `weekly-report-${currentYear}-week-${currentWeek}`;
        localStorage.setItem(storageKey, JSON.stringify(currentData));
        console.log(localStorage);        // Handle projects data based on checkbox
        if (shouldCopyData) {
            // Keep all current data for the new week
            projects = JSON.parse(JSON.stringify(projects)); // Deep copy to avoid reference issues
        } else {
            // Reset projects for new week (keep structure but reset progress-related fields)
            projects = projects.map(project => ({
                ...project,
                description: '',
                nextWeekTasks: '',
                risks: '',
                solutions: '',
                // Keep other fields like name, manager, status, etc.
            }));
        }
        
        // Update importedWeeksData to include the new week
        if (!importedWeeksData) {
            importedWeeksData = { weeks: [] };
        }
        
        // Add new week data to importedWeeksData
        const newWeekData = {
            week: nextWeek,
            year: nextYear,
            projects: shouldCopyData ? JSON.parse(JSON.stringify(projects)) : []
        };
        
        // Convert to array format if needed
        if (!Array.isArray(importedWeeksData.weeks)) {
            importedWeeksData.weeks = Object.values(importedWeeksData.weeks);
        }
        
        // Add new week if it doesn't exist
        const existingWeekIndex = importedWeeksData.weeks.findIndex(w => w.week === nextWeek && w.year === nextYear);
        if (existingWeekIndex === -1) {
            importedWeeksData.weeks.push(newWeekData);
        } else {
            importedWeeksData.weeks[existingWeekIndex] = newWeekData;
        }
        
        // Save the new week data to localStorage
        const newWeekStorageKey = `weekly-report-${nextYear}-week-${nextWeek}`;
        const newWeekStorageData = {
            week: nextWeek,
            year: nextYear,
            projects: projects,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(newWeekStorageKey, JSON.stringify(newWeekStorageData));
        
        // Repopulate dropdowns to include the new week first
        populateWeekDropdown();
        populateYearDropdown();
        
        // Update week settings after dropdowns are populated
        document.getElementById('report-week').value = nextWeek;
        document.getElementById('report-year').value = nextYear;
        document.getElementById('current-week').textContent = `Tuần ${nextWeek} - tháng 06/${nextYear}`;
        
        // Load current week data after updating selections
        loadCurrentWeekData();
        
        // Reset checkbox after creating new week
        if (copyDataCheckbox) {
            copyDataCheckbox.checked = false;
        }
        
        const successMessage = shouldCopyData 
            ? `Đã tạo báo cáo mới cho Tuần ${nextWeek} - ${nextYear}!\nDữ liệu tuần trước đã được lưu trữ và copy sang tuần mới.`
            : `Đã tạo báo cáo mới cho Tuần ${nextWeek} - ${nextYear}!\nDữ liệu tuần trước đã được lưu trữ và tuần mới đã được reset.`;
        showPopup(successMessage, 'success');
    });
}

// Copy data from previous week (function removed - selectbox no longer available)
// This function has been disabled as the week selection dropdown was removed
function copyPreviousWeekData() {
    showPopup('Chức năng copy dữ liệu tuần trước đã bị vô hiệu hóa.', 'info');
}

// updatePreviousWeekOptions function removed - selectbox no longer exists

// Function to check if JSON data contains specific week data
function checkForSpecificWeekData() {
    // Check if there's a specific week in the settings or data
    const reportWeekElement = document.getElementById('report-week');
    const reportYearElement = document.getElementById('report-year');
    
    // Look for saved settings that indicate a specific week
    const savedSettings = localStorage.getItem('weeklyReportSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.week && settings.year) {
                return {
                    hasData: true,
                    week: parseInt(settings.week),
                    year: parseInt(settings.year)
                };
            }
        } catch (e) {
            // Ignore parsing errors
        }
    }
    
    // Check if there's only one week of data in localStorage
    const weekDataKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('weekly-report-')) {
            weekDataKeys.push(key);
        }
    }
    
    if (weekDataKeys.length === 1) {
        // Extract week and year from the single data key
        const match = weekDataKeys[0].match(/weekly-report-(\d+)-week-(\d+)/);
        if (match) {
            return {
                hasData: true,
                week: parseInt(match[2]),
                year: parseInt(match[1])
            };
        }
    }
    
    return { hasData: false };
}

// Function to calculate week range from project data
function getWeekRangeFromProjects() {
    let minWeek = 52;
    let maxWeek = 1;
    
    projects.forEach(project => {
        if (project.startDate && project.endDate) {
            const startWeek = getWeekNumber(new Date(project.startDate));
            const endWeek = getWeekNumber(new Date(project.endDate));
            
            minWeek = Math.min(minWeek, startWeek);
            maxWeek = Math.max(maxWeek, endWeek);
        }
    });
    
    return { minWeek, maxWeek };
}

// Auto-refresh data every 5 minutes
setInterval(() => {
    updateCurrentWeek();
}, 300000);

// Function to populate year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('report-year');
    const currentYear = new Date().getFullYear();
    
    // Clear existing options
    yearSelect.innerHTML = '';
    
    // Collect years from imported data
    const availableYears = new Set();
    
    // Check if we have imported data
    if (importedWeeksData && importedWeeksData.weeks) {
        // Convert weeks data to array format if it's an object (backward compatibility)
        let weeksArray;
        if (Array.isArray(importedWeeksData.weeks)) {
            // New array format (v2.1+)
            weeksArray = importedWeeksData.weeks;
        } else {
            // Old object format (v2.0) - convert to array
            weeksArray = Object.values(importedWeeksData.weeks);
        }
        
        // Extract years from imported weeks data
        weeksArray.forEach(weekData => {
            if (weekData.year) {
                availableYears.add(parseInt(weekData.year));
            }
        });
    }
    
    // If no imported data exists, add current year as fallback
    if (availableYears.size === 0) {
        availableYears.add(currentYear);
    }
    
    // Sort years in descending order and create options
    const sortedYears = Array.from(availableYears).sort((a, b) => b - a);
    
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
    
    // Set the most recent year as default, or current year if available
    if (availableYears.has(currentYear)) {
        yearSelect.value = currentYear;
    } else {
        yearSelect.value = sortedYears[0];
    }
}

// Function to populate week dropdown
function populateWeekDropdown() {
    const weekSelect = document.getElementById('report-week');
    
    // Clear existing options
    weekSelect.innerHTML = '';
    
    // Check if we have imported data
    if (importedWeeksData && importedWeeksData.weeks) {
        // Convert weeks data to array format if it's an object (backward compatibility)
        let weeksArray;
        if (Array.isArray(importedWeeksData.weeks)) {
            // New array format (v2.1+)
            weeksArray = importedWeeksData.weeks;
        } else {
            // Old object format (v2.0) - convert to array
            weeksArray = Object.values(importedWeeksData.weeks);
        }
        
        // Extract available weeks from imported data
        const availableWeeks = new Set();
        weeksArray.forEach(weekData => {
            if (weekData.week) {
                availableWeeks.add(parseInt(weekData.week));
            }
        });
        
        // Sort weeks and create options
        const sortedWeeks = Array.from(availableWeeks).sort((a, b) => a - b);
        
        sortedWeeks.forEach(week => {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = `Tuần ${week}`;
            weekSelect.appendChild(option);
        });
        
        // Set first available week as default
        if (sortedWeeks.length > 0) {
            weekSelect.value = sortedWeeks[0];
        }
    }
    // If no imported data exists, leave dropdown empty
}

// Function to get week number from date
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Custom Popup Functions
function showPopup(message, type = 'info', title = '') {
    const overlay = document.getElementById('popup-overlay');

    const modal = overlay.querySelector('.popup-modal');
    const titleElement = modal.querySelector('.popup-title');
    const messageElement = modal.querySelector('.popup-message');
    const iconElement = modal.querySelector('.popup-icon');
    const okBtn = modal.querySelector('.popup-btn-primary');
    const cancelBtn = modal.querySelector('.popup-btn-secondary');
    const yesBtn = modal.querySelector('.popup-btn-danger');
    
    // Reset button visibility
    okBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'none';
    yesBtn.style.display = 'none';
    
    // Set title based on type if not provided
    if (!title) {
        switch(type) {
            case 'success':
                title = 'Thành công';
                break;
            case 'error':
                title = 'Lỗi';
                break;
            case 'info':
            default:
                title = 'Thông báo';
                break;
        }
    }
    
    // Set icon based on type
    switch(type) {
        case 'success':
            iconElement.className = 'popup-icon fas fa-check-circle';
            break;
        case 'error':
            iconElement.className = 'popup-icon fas fa-exclamation-circle';
            break;
        case 'info':
        default:
            iconElement.className = 'popup-icon fas fa-info-circle';
            break;
    }
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Remove existing type classes
    modal.classList.remove('popup-success', 'popup-error', 'popup-info');
    
    // Add appropriate type class
    modal.classList.add(`popup-${type}`);
    
    // Show the popup
    overlay.classList.add('show');
    
    // Auto-close after 3 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            closePopup();
        }, 3000);
    }
}

function showConfirmPopup(message, onConfirm, title = 'Xác nhận') {
    const overlay = document.getElementById('popup-overlay');
    const modal = overlay.querySelector('.popup-modal');
    const titleElement = modal.querySelector('.popup-title');
    const messageElement = modal.querySelector('.popup-message');
    const iconElement = modal.querySelector('.popup-icon');
    const okBtn = modal.querySelector('.popup-btn-primary');
    const cancelBtn = modal.querySelector('.popup-btn-secondary');
    const yesBtn = modal.querySelector('.popup-btn-danger');
    
    // Set up confirmation dialog
    okBtn.style.display = 'none';
    cancelBtn.style.display = 'inline-block';
    yesBtn.style.display = 'inline-block';
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    iconElement.className = 'popup-icon fas fa-question-circle';
    
    // Remove existing type classes and add warning style
    modal.classList.remove('popup-success', 'popup-error', 'popup-info');
    modal.classList.add('popup-info');
    
    // Set up button handlers
    yesBtn.onclick = function() {
        closePopup();
        if (onConfirm) onConfirm();
    };
    
    cancelBtn.onclick = function() {
        closePopup();
    };
    
    // Show the popup
    overlay.classList.add('show');
}

function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    overlay.classList.remove('show');
}

// Close popup when clicking outside the modal
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('popup-overlay');
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closePopup();
        }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });
});

// Initialize dropdowns and previous week options on page load
document.addEventListener('DOMContentLoaded', function() {
    // Populate dropdowns first
    populateYearDropdown();
    populateWeekDropdown();
    
    // Update current week display
    const week = document.getElementById('report-week').value;
    const year = document.getElementById('report-year').value;
    document.getElementById('current-week').textContent = `Tuần ${week} - tháng 06/${year}`;
    
    // Load the current week's data
    loadCurrentWeekData();
    
    // Then update previous week options
    // updatePreviousWeekOptions(); // Removed - selectbox no longer exists
    
    // Add event listeners to sync dropdowns when report week/year changes
    const reportWeekSelect = document.getElementById('report-week');
    const reportYearSelect = document.getElementById('report-year');
    
    if (reportWeekSelect) {
        reportWeekSelect.addEventListener('change', loadCurrentWeekData);
    }
    
    if (reportYearSelect) {
        reportYearSelect.addEventListener('change', loadCurrentWeekData);
    }
});