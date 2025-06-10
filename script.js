// Sample project data
let projects = [
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
            console.log("bodyWidth", bodyWidth);
            console.log("projectColumnWidth", projectColumnWidth);
            console.log("timelineWidth", timelineWidth);
            console.log("todayPosition", todayPosition);
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
    if (confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
        projects = projects.filter(p => p.id !== id);
        updateStats();
        renderProjects();
        drawStatusChart();
    }
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
    
    alert('Báo cáo đã được xuất thành công!');
}

// Save settings function
function saveSettings() {
    const week = document.getElementById('report-week').value;
    const year = document.getElementById('report-year').value;
    
    document.getElementById('current-week').textContent = `Tuần ${week} - tháng 06/${year}`;
    
    alert('Cài đặt đã được lưu!');
}

// Export data to JSON
function exportData() {
    const data = {
        projects: projects,
        settings: {
            week: document.getElementById('report-week').value,
            year: document.getElementById('report-year').value,
            exportDate: new Date().toISOString()
        },
        version: '1.0'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Dữ liệu đã được xuất thành công!');
}

// Import data from JSON
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
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
            
            // Import projects
            projects = data.projects;
            
            // Import settings if available
            if (data.settings) {
                if (data.settings.week) {
                    document.getElementById('report-week').value = data.settings.week;
                }
                if (data.settings.year) {
                    document.getElementById('report-year').value = data.settings.year;
                }
            }
            
            // Refresh the display
            renderProjectsTable();
            renderGanttChart();
            updateStats();
            
            alert(`Đã import thành công ${data.projects.length} dự án!`);
            
        } catch (error) {
            alert(`Lỗi khi import dữ liệu: ${error.message}`);
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
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

// Auto-refresh data every 5 minutes
setInterval(() => {
    updateCurrentWeek();
}, 300000);