function loadReports() {
    document.getElementById('mainContent').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Reports</h5>
            </div>
            <div class="card-body">
                <div class="row mb-4">
                    <div class="col-md-4">
                        <select class="form-select" id="reportType">
                            <option value="occupancy">Occupancy Report</option>
                            <option value="student_distribution">Student Distribution</option>
                            <option value="room_allocation">Room Allocation</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-primary" onclick="generateReport()">
                            Generate Report
                        </button>
                        <button class="btn btn-secondary" onclick="exportReport()">
                            Export
                        </button>
                    </div>
                </div>
                <div id="reportContent"></div>
            </div>
        </div>
    `;
}

async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    try {
        const response = await fetch(`/playground/HMS/api/admin/generate-report.php?type=${reportType}`);
        const data = await response.json();
        
        if (data.success) {
            displayReport(data);
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Error generating report');
    }
}

function displayReport(data) {
    const reportContent = document.getElementById('reportContent');
    
    switch (data.report_type) {
        case 'occupancy':
            displayOccupancyReport(data.data, reportContent);
            break;
        case 'student_distribution':
            displayStudentDistributionReport(data.data, reportContent);
            break;
        case 'room_allocation':
            displayRoomAllocationReport(data.data, reportContent);
            break;
    }
}

// Helper functions for displaying different report types
function displayOccupancyReport(data, container) {
    // Implementation for occupancy report visualization
}

function displayStudentDistributionReport(data, container) {
    // Implementation for student distribution report visualization
}

function displayRoomAllocationReport(data, container) {
    // Implementation for room allocation report visualization
} 