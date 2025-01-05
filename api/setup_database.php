<?php
header('Content-Type: application/json');
require_once '../setup/database_setup.php';

$action = $_GET['action'] ?? 'setup';
$valid_actions = ['setup', 'update'];

if (!in_array($action, $valid_actions)) {
    echo json_encode(["success" => false, "message" => "Invalid action"]);
    exit;
}

$setup = new DatabaseSetup();

switch ($action) {
    case 'setup':
        $result = $setup->setupDatabase();
        break;
    case 'update':
        $result = $setup->updateDatabase();
        break;
}

echo json_encode($result);
?>