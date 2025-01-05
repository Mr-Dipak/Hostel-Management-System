<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

require_once '../../models/Room.php';

$room = new Room();
$result = $room->getRoomDetails($_GET['room_id']);
echo json_encode($result); 