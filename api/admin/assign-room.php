<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

if (!isset($_POST['student_id']) || !isset($_POST['room_id'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

require_once '../../models/Room.php';

$room = new Room();
$result = $room->assignRoom($_POST['student_id'], $_POST['room_id']);

echo json_encode($result); 