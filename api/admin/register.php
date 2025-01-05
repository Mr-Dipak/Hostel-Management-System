<?php
header('Content-Type: application/json');
session_start();

require_once '../../controllers/AdminController.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$controller = new AdminController();
$result = $controller->handleRegistration($_POST);
echo json_encode($result); 