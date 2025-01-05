<?php
session_start();
if (!isset($_SESSION['admin_id']) || $_SESSION['user_type'] !== 'admin') {
    header('Location: /views/admin/login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - BAMU HMS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../../css/admin-dashboard.css">
</head>
<body>
    <div class="wrapper">
        <!-- Sidebar -->
        <nav id="sidebar">
            <div class="sidebar-header">
                <h3>BAMU HMS</h3>
                <p>Admin Panel</p>
            </div>

            <ul class="list-unstyled components">
                <li class="active">
                    <a href="#" id="dashboardLink">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </a>
                </li>
                <li>
                    <a href="#studentsSubmenu" data-bs-toggle="collapse">
                        <i class="bi bi-people"></i> Students
                    </a>
                    <ul class="collapse list-unstyled" id="studentsSubmenu">
                        <li>
                            <a href="#" id="viewStudentsLink">View All Students</a>
                        </li>
                        <li>
                            <a href="#" id="pendingApprovalsLink">Pending Approvals</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#roomsSubmenu" data-bs-toggle="collapse">
                        <i class="bi bi-house-door"></i> Rooms
                    </a>
                    <ul class="collapse list-unstyled" id="roomsSubmenu">
                        <li>
                            <a href="#" id="viewRoomsLink">View All Rooms</a>
                        </li>
                        <li>
                            <a href="#" id="addRoomLink">Add New Room</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#" id="reportsLink">
                        <i class="bi bi-file-earmark-text"></i> Reports
                    </a>
                </li>
                <li>
                    <a href="#" id="settingsLink">
                        <i class="bi bi-gear"></i> Settings
                    </a>
                </li>
            </ul>
        </nav>

        <!-- Page Content -->
        <div id="content">
            <!-- Top Navigation -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container-fluid">
                    <button type="button" id="sidebarCollapse" class="btn btn-dark">
                        <i class="bi bi-list"></i>
                    </button>
                    <div class="ms-auto d-flex align-items-center">
                        <div class="dropdown">
                            <button class="btn btn-dark dropdown-toggle" type="button" id="adminDropdown" data-bs-toggle="dropdown">
                                <i class="bi bi-person-circle"></i>
                                <?php echo htmlspecialchars($_SESSION['admin_name']); ?>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#" id="profileLink">Profile</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <div class="container-fluid py-4">
                <!-- Dashboard Stats -->
                <div class="row g-4 mb-4">
                    <div class="col-xl-3 col-md-6">
                        <div class="card stat-card bg-primary text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title mb-0">Total Students</h6>
                                        <h2 class="mt-2 mb-0" id="totalStudents">0</h2>
                                    </div>
                                    <div class="stat-icon">
                                        <i class="bi bi-people-fill"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- More stat cards... -->
                </div>

                <!-- Main Content Area -->
                <div class="card">
                    <div class="card-body" id="mainContent">
                        <!-- Dynamic content will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../../js/admin-rooms.js"></script>
    <script src="../../js/admin-dashboard.js"></script>
</body>
</html> 