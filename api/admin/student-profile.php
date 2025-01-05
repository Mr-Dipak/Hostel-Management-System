<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

require_once '../../models/Student.php';

$student = new Student();
$student_id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$student_id) {
    echo json_encode(["success" => false, "message" => "Student ID is required"]);
    exit;
}

$result = $student->getStudentProfile($student_id);
echo json_encode($result); 