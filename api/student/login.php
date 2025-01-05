<?php
header('Content-Type: application/json');
session_start();

require_once '../../models/Student.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$prn_number = $_POST['prn_number'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($prn_number) || empty($password)) {
    echo json_encode(["success" => false, "message" => "PRN number and password are required"]);
    exit;
}

$student = new Student();
$result = $student->login($prn_number, $password);

if ($result['success']) {
    $_SESSION['student_id'] = $result['student']['id'];
    $_SESSION['student_name'] = $result['student']['name'];
    $_SESSION['user_type'] = 'student';
}

echo json_encode($result);