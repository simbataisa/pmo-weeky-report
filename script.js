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
    renderRiskMap();

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
    
    // Update Risk Map when projects change
    renderRiskMap();
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
    // Show loading message
    showPopup('Đang tạo báo cáo PDF...', 'info');

    // Create a container for the PDF content
    const pdfContainer = document.createElement('div');
    // pdfContainer.style.padding = '20px';
    pdfContainer.style.background = 'white';
    pdfContainer.style.width = '100%'; // Set a fixed width for consistent scaling
    pdfContainer.style.opacity = '1'; // Ensure content is fully visible

    // Generate content from helper functions
    const dashboardHTML = createDashboardPDFContent();
    const projectsHTML = createProjectsPDFContent();
    const timelineHTML = createTimelinePDFContent();

    // Combine all content
    pdfContainer.innerHTML = '' + dashboardHTML + projectsHTML + timelineHTML;
    // pdfContainer.innerHTML = dashboardHTML + timelineHTML;

    // Append to body to be discoverable by html2pdf
    document.body.appendChild(pdfContainer);

    // PDF options
    const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `bao-cao-tuan-${getWeekNumber(new Date())}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: {
            unit: 'in',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generate PDF
    html2pdf().set(options).from(pdfContainer).save().then(() => {
        showPopup('Báo cáo PDF đã được xuất thành công!', 'success');
    }).catch((error) => {
        console.error('Error generating PDF:', error);
        showPopup('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.', 'error');
    }).finally(() => {
        // Clean up the container from the body
        document.body.removeChild(pdfContainer);
    });}

// Export Excel report function
function exportExcel() {
    // Show loading message
    showPopup('Đang tạo báo cáo Excel...', 'info');

    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create Dashboard worksheet
        const dashboardData = createDashboardExcelData();
        const dashboardWS = XLSX.utils.aoa_to_sheet(dashboardData);
        XLSX.utils.book_append_sheet(wb, dashboardWS, 'Dashboard');
        
        // Create Projects worksheet
        const projectsData = createProjectsExcelData();
        const projectsWS = XLSX.utils.aoa_to_sheet(projectsData);
        XLSX.utils.book_append_sheet(wb, projectsWS, 'Chi Tiết Dự Án');
        
        // Create Timeline worksheet
        const timelineData = createTimelineExcelData();
        const timelineWS = XLSX.utils.aoa_to_sheet(timelineData);
        XLSX.utils.book_append_sheet(wb, timelineWS, 'Timeline');
        
        // Create Risk Map worksheet
        const riskData = createRiskMapExcelData();
        const riskWS = XLSX.utils.aoa_to_sheet(riskData);
        XLSX.utils.book_append_sheet(wb, riskWS, 'Risk Map');
        
        // Generate filename
        const filename = `bao-cao-tuan-${getWeekNumber(new Date())}.xlsx`;
        
        // Save file
        XLSX.writeFile(wb, filename);
        
        showPopup('Báo cáo Excel đã được xuất thành công!', 'success');
    } catch (error) {
        console.error('Error generating Excel:', error);
        showPopup('Có lỗi xảy ra khi tạo Excel. Vui lòng thử lại.', 'error');
    }
}

// Helper function to create Dashboard Excel data
function createDashboardExcelData() {
    const data = [];
    
    // Header
    data.push(['BÁO CÁO TUẦN - DASHBOARD TỔNG QUAN']);
    data.push([]);
    
    // Project statistics
    const totalProjects = projects.length;
    const healthyProjects = projects.filter(p => p.status === 'healthy').length;
    const warningProjects = projects.filter(p => p.status === 'warning').length;
    const criticalProjects = projects.filter(p => p.status === 'critical').length;
    
    data.push(['TỔNG QUAN DỰ ÁN']);
    data.push(['Tổng số dự án:', totalProjects]);
    data.push(['Dự án tốt (Healthy):', healthyProjects]);
    data.push(['Dự án cần chú ý (Warning):', warningProjects]);
    data.push(['Dự án cần hành động (Critical):', criticalProjects]);
    data.push([]);
    
    // Key issues
    data.push(['CÁC VẤN ĐỀ CHÍNH']);
    projects.forEach(project => {
        if (project.risks && project.risks.trim() !== '' && project.risks.toLowerCase() !== 'không có') {
            data.push([`Rủi ro - ${project.name}:`, project.risks]);
        }
        if (project.status === 'critical' || project.status === 'warning') {
            data.push([`Dự án cần chú ý - ${project.name}:`, `Trạng thái: ${project.status}`]);
        }
    });
    
    return data;
}

// Helper function to create Projects Excel data
function createProjectsExcelData() {
    const data = [];
    
    // Header
    data.push(['CHI TIẾT CÁC DỰ ÁN']);
    data.push([]);
    
    // Table headers
    data.push([
        'Tên Dự Án',
        'Quản Lý',
        'Trạng Thái',
        'Ưu Tiên',
        'Tiến Độ (%)',
        'Mô Tả',
        'Nhiệm Vụ Tuần Tới',
        'Rủi Ro',
        'Giải Pháp',
        'Ngày Bắt Đầu',
        'Ngày Kết Thúc'
    ]);
    
    // Project data
    projects.forEach(project => {
        data.push([
            project.name,
            project.manager,
            project.status,
            project.priority,
            project.progress,
            project.description,
            project.nextWeekTasks,
            project.risks,
            project.solutions,
            project.startDate,
            project.endDate
        ]);
    });
    
    return data;
}

// Helper function to create Timeline Excel data
function createTimelineExcelData() {
    const data = [];
    
    // Header
    data.push(['TIMELINE DỰ ÁN']);
    data.push([]);
    
    // Table headers
    data.push([
        'Tên Dự Án',
        'Quản Lý',
        'Ngày Bắt Đầu',
        'Ngày Kết Thúc',
        'Tiến Độ (%)',
        'Trạng Thái',
        'Thời Gian Còn Lại (ngày)'
    ]);
    
    // Timeline data
    projects.forEach(project => {
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        const today = new Date();
        const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        data.push([
            project.name,
            project.manager,
            project.startDate,
            project.endDate,
            project.progress,
            project.status,
            daysRemaining
        ]);
    });
    
    return data;
}

// Helper function to create Risk Map Excel data
function createRiskMapExcelData() {
    const data = [];
    
    // Header
    data.push(['RISK MAP - MA TRẬN RỦI RO']);
    data.push([]);
    
    // Risk Matrix
    data.push(['MA TRẬN RỦI RO THEO TRẠNG THÁI & ƯU TIÊN']);
    data.push(['Ưu Tiên \\ Trạng Thái', 'Tốt (Healthy)', 'Cần Chú Ý (Warning)', 'Cần Hành Động (Critical)']);
    
    const priorities = ['high', 'medium', 'low'];
    const statuses = ['healthy', 'warning', 'critical'];
    
    priorities.forEach(priority => {
        const row = [priority.toUpperCase()];
        statuses.forEach(status => {
            const count = projects.filter(p => p.priority === priority && p.status === status).length;
            row.push(count);
        });
        data.push(row);
    });
    
    data.push([]);
    data.push([]);
    
    // Risk Details
    data.push(['CHI TIẾT RỦI RO THEO DỰ ÁN']);
    data.push([
        'Tên Dự Án',
        'Quản Lý',
        'Trạng Thái',
        'Ưu Tiên',
        'Rủi Ro Chính',
        'Giải Pháp'
    ]);
    
    projects.forEach(project => {
        data.push([
            project.name,
            project.manager,
            project.status,
            project.priority,
            project.risks || 'Không có',
            project.solutions || 'Không có'
        ]);
    });
    
    return data;
}

// Helper function to create Dashboard PDF content
function createDashboardPDFContent() {
    // Use global projects variable
    
    // Create dashboard section
    let content = `
        <div style="margin-bottom: 30px;">
            <h2 style="color: #007bff; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">Dashboard Tổng Quan</h2>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #555; margin-bottom: 15px;">Tổng Quan Dự Án</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                    <div style="flex: 1; min-width: 150px; background: #f8f9fa; border-radius: 5px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="font-weight: bold; color: #007bff; margin-bottom: 5px;">Tổng số dự án</div>
                        <div style="font-size: 24px; font-weight: bold;">${projects.length}</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: #f8f9fa; border-radius: 5px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="font-weight: bold; color: #28a745; margin-bottom: 5px;">Tốt (Healthy)</div>
                        <div style="font-size: 24px; font-weight: bold;">${projects.filter(p => p.status === 'healthy').length}</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: #f8f9fa; border-radius: 5px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="font-weight: bold; color: #ffc107; margin-bottom: 5px;">Cần chú ý</div>
                        <div style="font-size: 24px; font-weight: bold;">${projects.filter(p => p.status === 'warning').length}</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: #f8f9fa; border-radius: 5px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="font-weight: bold; color: #dc3545; margin-bottom: 5px;">Cần hành động</div>
                        <div style="font-size: 24px; font-weight: bold;">${projects.filter(p => p.status === 'critical').length}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #555; margin-bottom: 15px;">Ma Trận Rủi Ro theo Trạng Thái & Ưu Tiên</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Ưu Tiên \\ Trạng Thái</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd; background-color: #d4edda; color: #155724; font-weight: bold;">Tốt (Healthy)</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd; background-color: #fff3cd; color: #856404; font-weight: bold;">Cần Chú Ý (Warning)</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd; background-color: #f8d7da; color: #721c24; font-weight: bold;">Cần Hành Động (Critical)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${createRiskMatrixRows()}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div>
                <h3 style="color: #555; margin-bottom: 15px;">Chi Tiết Rủi Ro theo Dự Án</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Dự Án</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Trạng Thái</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Ưu Tiên</th>
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Rủi Ro Chính</th>
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Giải Pháp</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${createRiskDetailRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    return content;
}

// Helper function to create issues list for dashboard
function createIssuesList() {
    let issuesHtml = '';
    
    // Extract key issues from project data
    projects.forEach(project => {
        // Add risks as issues if they exist and are not "Không có"
        if (project.risks && project.risks.trim() !== '' && project.risks.toLowerCase() !== 'không có') {
            const statusColor = project.status === 'healthy' ? '#28a745' : 
                               project.status === 'warning' ? '#ffc107' : '#dc3545';
            
            issuesHtml += `
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
                    <h4 style="margin: 0 0 10px 0; color: ${statusColor};">🚨 Rủi ro: ${project.name}</h4>
                    <p style="margin: 0; color: #666;">${project.risks}</p>
                </div>
            `;
        }
        
        // Add critical/warning projects as issues needing attention
        if (project.status === 'critical' || project.status === 'warning') {
            const statusColor = project.status === 'warning' ? '#ffc107' : '#dc3545';
            const statusText = project.status === 'warning' ? 'Cần chú ý' : 'Cần hành động ngay';
            
            issuesHtml += `
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
                    <h4 style="margin: 0 0 10px 0; color: ${statusColor};">⚠️ ${statusText}: ${project.name}</h4>
                    <p style="margin: 0; color: #666;"><strong>Mô tả:</strong> ${project.description}</p>
                    ${project.solutions ? `<p style="margin: 5px 0 0 0; color: #666;"><strong>Giải pháp:</strong> ${project.solutions}</p>` : ''}
                </div>
            `;
        }
    });
    
    if (issuesHtml === '') {
        return '<p style="color: #28a745; font-weight: bold;">✅ Tất cả dự án đang tiến triển tốt, không có vấn đề nổi bật.</p>';
    }
    
    return issuesHtml;
}

// Helper function to create Projects PDF content
function createProjectsPDFContent() {
    // Use global projects variable
    
    // Create projects section
    let content = `
        <div style="margin-bottom: 30px;">
            <h2 style="color: #007bff; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">Chi Tiết Dự Án</h2>
            
            <div style="overflow-x: auto;">
                <table style="width: 98%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Tên Dự Án</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Quản Lý</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Tình Trạng</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Cấp Nhật & Chi Chú</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Vấn Đề/Rủi Ro</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${createProjectsTableRows(projects)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return content;
}

// Helper function to create project table rows
function createProjectsTableRows(projects) {
    if (projects.length === 0) {
        return `<tr><td colspan="5" style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">Không có dự án nào.</td></tr>`;
    }
    
    const statusColors = {
        'healthy': '#28a745',
        'warning': '#ffc107',
        'critical': '#dc3545'
    };
    
    const statusText = {
        'healthy': 'Tốt',
        'warning': 'Cần chú ý',
        'critical': 'Cần hành động'
    };
    
    let rowsHtml = '';
    projects.forEach(project => {
        rowsHtml += `
            <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${project.name}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${project.manager || 'N/A'}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">
                    <span style="color: ${statusColors[project.status]}; font-weight: bold;">${statusText[project.status]}</span>
                </td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${project.description || 'N/A'}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${project.risks || 'Không có'}</td>
            </tr>
        `;
    });
    
    return rowsHtml;
}

// Helper function to create Timeline PDF content
function createTimelinePDFContent() {
    // Get current date for reference
    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    // Create timeline section
    let content = `
        <div style="margin-bottom: 30px;">
            <h2 style="color: #007bff; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">Timeline Dự Án</h2>
            
            <div style="margin-bottom: 15px;">
                <p style="color: #666; margin: 0;"><strong>Ngày hiện tại:</strong> ${currentDate}</p>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 98%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; border: 1px solid #ddd;">Tên Dự Án</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; border: 1px solid #ddd;">Ngày Bắt Đầu</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; border: 1px solid #ddd;">Ngày Kết Thúc</th>
                            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; border: 1px solid #ddd;">Tiến Độ (%)</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; border: 1px solid #ddd;">Trạng Thái</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; border: 1px solid #ddd;">Quản Lý</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${createTimelineTableRows()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return content;
}

// Helper function to create timeline table rows
function createTimelineTableRows() {
    // Use global projects variable
    if (projects.length === 0) {
        return '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #666;">Không có dự án nào trong timeline.</td></tr>';
    }
    
    let rowsHtml = '';
    projects.forEach(project => {
        // Format dates
        const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'Chưa xác định';
        const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định';
        
        // Get status color and text
        const statusColor = project.status === 'healthy' ? '#28a745' : 
                           project.status === 'warning' ? '#ffc107' : '#dc3545';
        const statusText = project.status === 'healthy' ? 'Tốt' : 
                          project.status === 'warning' ? 'Cần chú ý' : 'Cần hành động';
        
        // Progress bar styling
        const progress = project.progress || 0;
        const progressColor = progress >= 80 ? '#28a745' : 
                             progress >= 50 ? '#ffc107' : '#dc3545';
        
        rowsHtml += `
            <tr>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                    <strong>${project.name}</strong>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                    ${startDate}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                    ${endDate}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; vertical-align: top;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <div style="width: 60px; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${progress}%; height: 100%; background: ${progressColor}; transition: width 0.3s;"></div>
                        </div>
                        <span style="font-weight: bold; color: ${progressColor};">${progress}%</span>
                    </div>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                    <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                    ${project.manager || 'Chưa phân công'}
                </td>
            </tr>
        `;
    });
    
    return rowsHtml;
}

// Helper function to create Risk Map PDF content
function createRiskMapPDFContent() {
    // Create risk map section
    let content = `
        <div style="margin-bottom: 30px; page-break-before: always;">
            <h2 style="color: #007bff; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">Risk Map - Bản Đồ Rủi Ro</h2>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #666; margin-bottom: 15px;">Bản đồ rủi ro phân loại các dự án theo mức độ rủi ro và ưu tiên để hỗ trợ việc ra quyết định quản lý.</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #555; margin-bottom: 15px;">Ma Trận Rủi Ro theo Trạng Thái & Ưu Tiên</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Ưu Tiên \\ Trạng Thái</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd; background-color: #d4edda; color: #155724; font-weight: bold;">Tốt (Healthy)</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd; background-color: #fff3cd; color: #856404; font-weight: bold;">Cần Chú Ý (Warning)</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd; background-color: #f8d7da; color: #721c24; font-weight: bold;">Cần Hành Động (Critical)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${createRiskMatrixRows()}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #555; margin-bottom: 15px;">Chi Tiết Rủi Ro theo Dự Án</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Dự Án</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Trạng Thái</th>
                                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Ưu Tiên</th>
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Rủi Ro Chính</th>
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Giải Pháp</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${createRiskDetailRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    return content;
}

// Helper function to create risk matrix rows
function createRiskMatrixRows() {
    const priorities = ['high', 'medium', 'low'];
    const priorityLabels = { 'high': 'Cao', 'medium': 'Trung Bình', 'low': 'Thấp' };
    const statuses = ['healthy', 'warning', 'critical'];
    
    let rowsHtml = '';
    
    priorities.forEach(priority => {
        const priorityColor = priority === 'high' ? '#dc3545' : 
                             priority === 'medium' ? '#ffc107' : '#28a745';
        
        rowsHtml += `
            <tr>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; background-color: #f8f9fa; color: ${priorityColor};">
                    ${priorityLabels[priority]}
                </td>
        `;
        
        statuses.forEach(status => {
            const projectsInCell = projects.filter(p => 
                (p.priority || 'medium') === priority && p.status === status
            );
            
            const cellBgColor = status === 'healthy' ? '#d4edda' : 
                               status === 'warning' ? '#fff3cd' : '#f8d7da';
            
            rowsHtml += `
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top; background-color: ${cellBgColor};">
                    ${projectsInCell.length > 0 ? 
                        projectsInCell.map(p => `<div style="margin-bottom: 5px; font-size: 12px;">• ${p.name}</div>`).join('') : 
                        '<div style="text-align: center; color: #666; font-style: italic;">Không có dự án</div>'
                    }
                </td>
            `;
        });
        
        rowsHtml += '</tr>';
    });
    
    return rowsHtml;
}

// Helper function to create risk detail rows
function createRiskDetailRows() {
    if (projects.length === 0) {
        return '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">Không có dự án nào để hiển thị.</td></tr>';
    }
    
    let rowsHtml = '';
    
    projects.forEach(project => {
        // Get status color and text
        const statusColor = project.status === 'healthy' ? '#28a745' : 
                           project.status === 'warning' ? '#ffc107' : '#dc3545';
        const statusText = project.status === 'healthy' ? 'Tốt' : 
                          project.status === 'warning' ? 'Cần chú ý' : 'Cần hành động';
        
        // Get priority color and text
        const priority = project.priority || 'medium';
        const priorityColor = priority === 'high' ? '#dc3545' : 
                             priority === 'medium' ? '#ffc107' : '#28a745';
        const priorityText = priority === 'high' ? 'Cao' : 
                            priority === 'medium' ? 'Trung Bình' : 'Thấp';
        
        // Clean up risks and solutions text
        const risks = project.risks && project.risks !== 'Không có' ? project.risks : 'Không có';
        const solutions = project.solutions || 'Chưa có giải pháp cụ thể';
        
        rowsHtml += `
            <tr>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                    <strong>${project.name}</strong>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">${project.manager || 'Chưa phân công'}</div>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; vertical-align: top;">
                    <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; vertical-align: top;">
                    <span style="color: ${priorityColor}; font-weight: bold;">${priorityText}</span>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top; font-size: 13px;">
                    ${risks}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top; font-size: 13px;">
                    ${solutions}
                </td>
            </tr>
        `;
    });
    
    return rowsHtml;
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
    const weekElement = document.getElementById('report-week');
    const yearElement = document.getElementById('report-year');
    
    // Check if dropdowns have valid values
    if (!weekElement.value || !yearElement.value) {
        // If no valid week/year selected, keep the default projects data
        // Update all displays
        renderProjectsTable();
        renderGanttChart();
        updateStats();
        drawStatusChart();
        renderRiskMap();
        return;
    }
    
    const week = weekElement.value;
    const year = yearElement.value;
    const weekKey = `weekly-report-${year}-week-${week}`;
    
    // Try to load data from localStorage first
    const savedData = localStorage.getItem(weekKey);
    
    if (savedData) {
        try {
            const weekData = JSON.parse(savedData);
            projects = weekData.projects || [];
        } catch (error) {
            console.error('Error parsing saved week data:', error);
            projects = [];
        }
    } else if (importedWeeksData && importedWeeksData.weeks) {
        // Try to find data in imported weeks data
        let weeksArray;
        if (Array.isArray(importedWeeksData.weeks)) {
            weeksArray = importedWeeksData.weeks;
        } else {
            weeksArray = Object.values(importedWeeksData.weeks);
        }
        
        const weekData = weeksArray.find(w => 
            w.week.toString() === week.toString() && 
            w.year.toString() === year.toString()
        );
        
        if (weekData && weekData.projects) {
            projects = weekData.projects;
        } else {
            projects = [];
        }
    } else {
        // No data found for this week, initialize empty projects
        projects = [];
    }
    
    console.log(`Loaded ${projects.length} projects for week ${week}/${year}`);
    console.log('Projects data:', projects);
    
    // Update all displays
    renderProjectsTable();
    renderGanttChart();
    updateStats();
    drawStatusChart();
    renderRiskMap();
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
    } else {
        // If no imported data exists, create default weeks (1-52)
        const currentWeek = getWeekNumber(new Date());
        
        for (let week = 1; week <= 52; week++) {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = `Tuần ${week}`;
            weekSelect.appendChild(option);
        }
        
        // Set current week as default
        weekSelect.value = currentWeek;
    }
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

// Risk Map rendering functions
function renderRiskMap() {
    renderRiskMatrix();
    renderRiskDetails();
}

function renderRiskMatrix() {
    const riskMatrixBody = document.getElementById('risk-matrix-body');
    if (!riskMatrixBody) return;
    
    const priorities = ['high', 'medium', 'low'];
    const statuses = ['healthy', 'warning', 'critical']; // Order matches HTML header columns
    const priorityLabels = {
        'high': 'Cao',
        'medium': 'Trung Bình', 
        'low': 'Thấp'
    };
    
    let html = '';
    
    priorities.forEach(priority => {
        html += `<tr>`;
        html += `<td class="priority-${priority}">${priorityLabels[priority]}</td>`;
        
        statuses.forEach(status => {
            const count = projects.filter(p => p.priority === priority && p.status === status).length;
            const cellClass = count === 0 ? 'risk-count zero' : 'risk-count';
            const statusClass = `status-${status}`;
            html += `<td class="${cellClass} ${statusClass}">${count}</td>`;
        });
        
        html += `</tr>`;
        console.log(html);
    });

    console.log('Risk Matrix HTML:', html);
    console.log('Projects data for matrix:', projects.map(p => ({name: p.name, priority: p.priority, status: p.status})));
    
    riskMatrixBody.innerHTML = html;
}

function renderRiskDetails() {
    const riskDetailsBody = document.getElementById('risk-details-body');
    if (!riskDetailsBody) return;
    
    const statusLabels = {
        'healthy': 'Tốt',
        'warning': 'Cần Chú Ý',
        'critical': 'Cần Hành Động'
    };
    
    const priorityLabels = {
        'high': 'Cao',
        'medium': 'Trung Bình',
        'low': 'Thấp'
    };
    
    let html = '';
    
    if (projects.length === 0) {
        html = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #666;">Không có dự án nào.</td></tr>';
    } else {
        projects.forEach(project => {
            html += `
                <tr>
                    <td><strong>${project.name}</strong></td>
                    <td><span class="status-badge ${project.status}">${statusLabels[project.status]}</span></td>
                    <td><span class="priority-badge ${project.priority}">${priorityLabels[project.priority]}</span></td>
                    <td>${project.risks || 'Không có'}</td>
                    <td>${project.solutions || 'Không có'}</td>
                </tr>
            `;
        });
    }
    
    riskDetailsBody.innerHTML = html;
}