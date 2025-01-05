<?php
header('Content-Type: application/json');
session_start();

require_once '../../controllers/StudentController.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$controller = new StudentController();
$result = $controller->handleRegistration($_POST);
echo json_encode($result); 