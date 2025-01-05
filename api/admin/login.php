<?php
header('Content-Type: application/json');
session_start();

require_once '../../controllers/AdminController.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

if (empty($_POST['username']) || empty($_POST['password'])) {
    echo json_encode(["success" => false, "message" => "Username and password are required"]);
    exit;
}

$controller = new AdminController();
$result = $controller->handleLogin($_POST['username'], $_POST['password']);
echo json_encode($result);
?>