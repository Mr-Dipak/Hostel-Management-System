<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['student_id'])) {
    echo json_encode(["success" => false, "message" => "Student ID is required"]);
    exit;
}

require_once '../../models/Student.php';

$student = new Student();
$result = $student->approveStudent($data['student_id']);

echo json_encode($result); 