<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

require_once '../../models/Report.php';

$report = new Report();
$report_type = $_GET['type'] ?? 'occupancy';
$result = $report->generateReport($report_type);
echo json_encode($result); 