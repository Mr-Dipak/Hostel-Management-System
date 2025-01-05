document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDashboardStats();
});

function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const action = e.currentTarget.getAttribute('data-action');
            switch(action) {
                case 'dashboard':
                    loadDashboardStats();
                    break;
                case 'students':
                    loadStudentsManagement();
                    break;
                case 'rooms':
                    loadRoomManagement();
                    break;
                case 'pending':
                    loadPendingApprovals();
                    break;
                case 'reports':
                    loadReports();
                    break;
            }
        });
    });
}

// Add the missing loadReports function
async function loadReports() {
    try {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Reports</h5>
                </div>
                <div class="card-body">
                    <p>Reports functionality coming soon...</p>
                </div>
            </div>
        `;
    } catch (error) {
        showError('Error loading reports');
    }
}

function setupSidebar() {
    // Sidebar toggle
    document.getElementById('sidebarCollapse').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
    });

    // Active link handling
    const sidebarLinks = document.querySelectorAll('#sidebar a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.hasAttribute('data-bs-toggle')) {
                sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
                this.parentElement.classList.add('active');
            }
        });
    });
}

function setupEventListeners() {
    // Dashboard links
    document.getElementById('dashboardLink').addEventListener('click', loadDashboardSummary);
    document.getElementById('viewStudentsLink').addEventListener('click', loadStudentsManagement);
    document.getElementById('pendingApprovalsLink').addEventListener('click', loadPendingApprovals);
    document.getElementById('viewRoomsLink').addEventListener('click', loadRoomManagement);
    document.getElementById('addRoomLink').addEventListener('click', showAddRoomModal);
    document.getElementById('reportsLink').addEventListener('click', loadReports);
    document.getElementById('settingsLink').addEventListener('click', loadSettings);
    
    // Profile and logout
    document.getElementById('profileLink').addEventListener('click', loadProfile);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

async function loadDashboardSummary() {
    try {
        const [summaryResponse, statsResponse] = await Promise.all([
            fetch('../../api/admin/dashboard-summary.php'),
            fetch('../../api/admin/room-statistics.php')
        ]);

        const summary = await summaryResponse.json();
        const stats = await statsResponse.json();

        if (summary.success && stats.success) {
            updateDashboardStats(summary, stats.statistics);
            loadRecentActivities(summary.recent_activities);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

function updateDashboardStats(summary, roomStats) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="row g-4 mb-4">
            <!-- Summary Cards -->
            <div class="col-xl-3 col-md-6">
                <div class="card stat-card bg-primary text-white">
                    <div class="card-body">
                        <h6>Total Students</h6>
                        <h2>${summary.total_students}</h2>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="card stat-card bg-success text-white">
                    <div class="card-body">
                        <h6>Available Rooms</h6>
                        <h2>${roomStats.available_rooms}</h2>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="card stat-card bg-warning text-dark">
                    <div class="card-body">
                        <h6>Occupancy Rate</h6>
                        <h2>${roomStats.occupancy_rate}%</h2>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="card stat-card bg-info text-white">
                    <div class="card-body">
                        <h6>Pending Approvals</h6>
                        <h2>${summary.pending_approvals}</h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Block-wise Statistics -->
        <div class="row mb-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Block-wise Occupancy</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Block</th>
                                        <th>Total Rooms</th>
                                        <th>Available</th>
                                        <th>Occupancy Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateBlockwiseStats(roomStats.block_wise_stats)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateBlockwiseStats(blockStats) {
    return blockStats.map(block => `
        <tr>
            <td>${block.block}</td>
            <td>${block.total}</td>
            <td>${block.available}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${block.occupancy_rate}%">
                        ${block.occupancy_rate}%
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadStudentsManagement() {
    try {
        const response = await fetch('/playground/HMS/api/admin/students-list.php');
        const data = await response.json();
        if (data.success) {
            document.getElementById('mainContent').innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Student Management</h5>
                        <div class="search-box">
                            <input type="text" class="form-control" placeholder="Search students..." id="studentSearch">
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>PRN</th>
                                        <th>Name</th>
                                        <th>Room</th>
                                        <th>Course</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateStudentRows(data.students)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            setupStudentSearch();
        }
    } catch (error) {
        showError('Error loading students list');
    }
}

function generateStudentRows(students) {
    return students.map(student => `
        <tr>
            <td>${student.prn_number}</td>
            <td>${student.name} ${student.last_name || ''}</td>
            <td>${student.room_number || 'Not Assigned'}</td>
            <td>${student.curr_edu}</td>
            <td><span class="badge bg-${student.status === 'active' ? 'success' : 'warning'}">${student.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewStudent(${student.id})">
                    <i class="bi bi-eye"></i>
                </button>
                ${!student.room_number ? `
                    <button class="btn btn-sm btn-success" onclick="showAssignRoomModal(${student.id})">
                        <i class="bi bi-house"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="removeStudent(${student.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/playground/HMS/api/logout.php');
        const data = await response.json();
        if (data.success) {
            window.location.href = '/playground/HMS/views/admin/login.php';
        }
    } catch (error) {
        showError('Error during logout');
    }
}

async function loadPendingApprovals() {
    try {
        const response = await fetch('../../api/admin/pending-approvals.php');
        const data = await response.json();
        
        if (data.success) {
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Pending Student Approvals</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>PRN</th>
                                        <th>Name</th>
                                        <th>Course</th>
                                        <th>Mobile</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generatePendingStudentRows(data.pending_students)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        showError('Error loading pending approvals');
    }
}

function generatePendingStudentRows(students) {
    return students.map(student => `
        <tr>
            <td>${student.prn_number}</td>
            <td>${student.name} ${student.last_name}</td>
            <td>${student.curr_edu}</td>
            <td>${student.mobile}</td>
            <td>${student.email}</td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveStudent(${student.id})">
                    <i class="bi bi-check-circle"></i> Approve
                </button>
                <button class="btn btn-sm btn-danger" onclick="showRejectModal(${student.id})">
                    <i class="bi bi-x-circle"></i> Reject
                </button>
                <button class="btn btn-sm btn-primary" onclick="showAssignRoomModal(${student.id})">
                    <i class="bi bi-house"></i> Assign Room
                </button>
            </td>
        </tr>
    `).join('');
}

async function approveStudent(studentId) {
    if (!confirm('Are you sure you want to approve this student?')) return;
    
    try {
        const response = await fetch('/playground/HMS/api/admin/approve-student.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ student_id: studentId })
        });

        const data = await response.json();
        if (data.success) {
            showSuccess('Student approved successfully');
            loadStudentsManagement(); // Reload the student list
        } else {
            showError(data.message || 'Failed to approve student');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while approving student');
    }
}

function showRejectModal(studentId) {
    const modal = `
        <div class="modal fade" id="rejectModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Reject Student</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="rejectForm">
                            <input type="hidden" name="student_id" value="${studentId}">
                            <div class="mb-3">
                                <label class="form-label">Reason for Rejection</label>
                                <textarea class="form-control" name="reason" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-danger">Reject</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    const modalElement = document.getElementById('rejectModal');
    const bsModal = new bootstrap.Modal(modalElement);
    bsModal.show();
    
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
    
    document.getElementById('rejectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await rejectStudent(new FormData(e.target));
        bsModal.hide();
    });
}

async function rejectStudent(formData) {
    try {
        const response = await fetch('../../api/admin/reject-student.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Student rejected successfully');
            loadPendingApprovals();
        } else {
            alert(data.message);
        }
    } catch (error) {
        showError('Error rejecting student');
    }
}

function showAssignRoomModal(studentId) {
    const modalHtml = `
        <div class="modal fade" id="assignRoomModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Assign Room</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="modalAlerts"></div>
                        <form id="assignRoomForm">
                            <input type="hidden" name="student_id" value="${studentId}">
                            <div class="mb-3">
                                <label for="room_id" class="form-label">Select Room</label>
                                <select class="form-select" id="room_id" name="room_id" required>
                                    <option value="">Loading rooms...</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitRoomAssignment()">Assign</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('assignRoomModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('assignRoomModal'));
    modal.show();
    loadAvailableRooms();
}

async function submitRoomAssignment() {
    const form = document.getElementById('assignRoomForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    try {
        const response = await fetch('/playground/HMS/api/admin/assign-room.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('assignRoomModal'));
            modal.hide();
            loadStudentsManagement(); // Reload the student list
            showSuccess('Room assigned successfully');
        } else {
            showModalError(data.message || 'Failed to assign room');
        }
    } catch (error) {
        console.error('Error:', error);
        showModalError('An error occurred while assigning the room');
    }
}

function showModalError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const modalAlerts = document.getElementById('modalAlerts');
    if (modalAlerts) {
        modalAlerts.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

async function loadAvailableRooms() {
    try {
        const response = await fetch('/playground/HMS/api/admin/get-available-rooms.php');
        const data = await response.json();

        const roomSelect = document.getElementById('room_id');
        if (!roomSelect) return;

        if (data.success && data.rooms && data.rooms.length > 0) {
            roomSelect.innerHTML = `
                <option value="">Select Room</option>
                ${data.rooms.map(room => `
                    <option value="${room.id}">
                        Room ${room.room_number} (${room.current_occupants}/${room.capacity} occupied)
                    </option>
                `).join('')}
            `;
        } else {
            roomSelect.innerHTML = '<option value="">No rooms available</option>';
            showModalError('No available rooms found');
        }
    } catch (error) {
        console.error('Error:', error);
        showModalError('Failed to load available rooms');
    }
}

async function loadRooms() {
    try {
        const response = await fetch('../../api/admin/rooms-list.php');
        const data = await response.json();

        if (data.success) {
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Rooms</h5>
                        <button class="btn btn-primary" onclick="showAddRoomModal()">Add Room</button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Room Number</th>
                                        <th>Capacity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateRoomRows(data.rooms)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        showError('Error loading rooms');
    }
}

function generateRoomRows(rooms) {
    return rooms.map(room => `
        <tr>
            <td>${room.room_number}</td>
            <td>${room.capacity}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showAssignRoomModal(${room.id})">
                    <i class="bi bi-house"></i> Assign
                </button>
            </td>
        </tr>
    `).join('');
}

function showAddRoomModal() {
    const modalHtml = `
        <div class="modal fade" id="addRoomModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Room</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addRoomForm">
                            <div class="mb-3">
                                <label for="room_number" class="form-label">Room Number</label>
                                <input type="text" class="form-control" id="room_number" name="room_number" 
                                    placeholder="Format: A-101" required>
                                <div class="form-text">Example: A-101, B-202, etc.</div>
                            </div>
                            <div class="mb-3">
                                <label for="block_name" class="form-label">Block Name</label>
                                <select class="form-select" id="block_name" name="block_name" required>
                                    <option value="">Select Block</option>
                                    <option value="A">Block A</option>
                                    <option value="B">Block B</option>
                                    <option value="C">Block C</option>
                                    <option value="D">Block D</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="floor_number" class="form-label">Floor Number</label>
                                <select class="form-select" id="floor_number" name="floor_number" required>
                                    <option value="">Select Floor</option>
                                    <option value="0">Ground Floor</option>
                                    <option value="1">First Floor</option>
                                    <option value="2">Second Floor</option>
                                    <option value="3">Third Floor</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="room_type" class="form-label">Room Type</label>
                                <select class="form-select" id="room_type" name="room_type" required>
                                    <option value="">Select Type</option>
                                    <option value="single">Single Room</option>
                                    <option value="double">Double Room</option>
                                    <option value="triple">Triple Room</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="capacity" class="form-label">Capacity</label>
                                <input type="number" class="form-control" id="capacity" name="capacity" 
                                    min="1" max="3" readonly required>
                                <div class="form-text">Capacity is set automatically based on room type</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="addRoom()">Add Room</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
    modal.show();

    // Add event listener for modal hidden event to remove it from DOM
    document.getElementById('addRoomModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });

    // Add event listener to update capacity based on room type
    document.getElementById('room_type').addEventListener('change', function() {
        const capacityInput = document.getElementById('capacity');
        switch(this.value) {
            case 'single':
                capacityInput.value = "1";
                break;
            case 'double':
                capacityInput.value = "2";
                break;
            case 'triple':
                capacityInput.value = "3";
                break;
            default:
                capacityInput.value = "";
        }
    });
}

async function addRoom() {
    const form = document.getElementById('addRoomForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    try {
        const response = await fetch('../../api/admin/add-room.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('addRoomModal')).hide();
            // Reload rooms list
            loadRooms();
            // Show success message
            alert('Room added successfully');
        } else {
            alert(data.message || 'Failed to add room');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the room');
    }
}

async function loadStudents() {
    try {
        const response = await fetch('../../api/admin/get-students.php');
        const data = await response.json();
        
        const mainContent = document.getElementById('mainContent');
        if (data.success) {
            mainContent.innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Student Management</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>PRN</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.students.map(student => `
                                        <tr>
                                            <td>${student.name}</td>
                                            <td>${student.prn_number}</td>
                                            <td>${student.email}</td>
                                            <td>${student.mobile}</td>
                                            <td>
                                                <span class="badge bg-${student.status === 'approved' ? 'success' : 'warning'}">
                                                    ${student.status}
                                                </span>
                                            </td>
                                            <td>
                                                ${student.status !== 'approved' ? 
                                                    `<button class="btn btn-sm btn-success" onclick="approveStudent(${student.id})">
                                                        Approve
                                                    </button>` : ''
                                                }
                                                <button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.id})">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } else {
            showError('Failed to load students');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while loading students');
    }
}

async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        const response = await fetch('../../api/admin/delete-student.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ student_id: studentId })
        });

        const data = await response.json();
        if (data.success) {
            showSuccess('Student deleted successfully');
            loadStudents(); // Reload the student list
        } else {
            showError(data.message || 'Failed to delete student');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while deleting student');
    }
}

// Add these functions for button handling
function viewStudent(studentId) {
    try {
        const modal = new bootstrap.Modal(document.getElementById('viewStudentModal') || createViewStudentModal());
        loadStudentDetails(studentId);
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to view student details');
    }
}

function createViewStudentModal() {
    const modalHtml = `
        <div class="modal fade" id="viewStudentModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Student Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="studentDetailsContent">
                        Loading...
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('viewStudentModal');
}

async function loadStudentDetails(studentId) {
    try {
        const response = await fetch(`/playground/HMS/api/admin/student-details.php?id=${studentId}`);
        const data = await response.json();
        if (data.success) {
            document.getElementById('studentDetailsContent').innerHTML = `
                <div class="student-info">
                    <p><strong>Name:</strong> ${data.student.name} ${data.student.last_name || ''}</p>
                    <p><strong>PRN:</strong> ${data.student.prn_number}</p>
                    <p><strong>Email:</strong> ${data.student.email}</p>
                    <p><strong>Mobile:</strong> ${data.student.mobile}</p>
                    <p><strong>Course:</strong> ${data.student.curr_edu}</p>
                    <p><strong>Status:</strong> <span class="badge bg-${getStatusBadgeColor(data.student.status)}">${data.student.status}</span></p>
                    ${data.student.room_number ? `<p><strong>Room:</strong> ${data.student.room_number}</p>` : ''}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('studentDetailsContent').innerHTML = 'Failed to load student details';
    }
}

async function removeStudent(studentId) {
    if (!confirm('Are you sure you want to remove this student?')) return;
    
    try {
        const response = await fetch('/playground/HMS/api/admin/delete-student.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ student_id: studentId })
        });

        const data = await response.json();
        if (data.success) {
            showSuccess('Student removed successfully');
            loadStudentsManagement();
        } else {
            showError(data.message || 'Failed to remove student');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while removing student');
    }
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
    setTimeout(() => alertDiv.remove(), 3000);
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
    setTimeout(() => alertDiv.remove(), 3000);
}

// Add other necessary functions for pending approvals, room management, etc. 