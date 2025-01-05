<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['student_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

require_once '../../models/RoomAssignment.php';

$assignment = new RoomAssignment();
$result = $assignment->getStudentRoomDetails($_SESSION['student_id']);
echo json_encode($result); 