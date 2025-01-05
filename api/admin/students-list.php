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
$result = $student->getAllStudentsWithRooms();

echo json_encode($result); 