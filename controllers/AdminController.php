<?php
require_once __DIR__ . '/../models/Admin.php';

class AdminController {
    private $adminModel;

    public function __construct() {
        $this->adminModel = new Admin();
    }

    public function handleRegistration($data) {
        // Validate required fields
        $required_fields = ['fullname', 'username', 'email', 'password'];
        
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                return ["success" => false, "message" => "Please fill all required fields"];
            }
        }

        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email format"];
        }

        // Validate username format
        if (!preg_match("/^[a-zA-Z0-9_]{4,20}$/", $data['username'])) {
            return ["success" => false, "message" => "Username must be 4-20 characters and can only contain letters, numbers, and underscores"];
        }

        return $this->adminModel->register($data);
    }

    public function handleLogin($username, $password) {
        if (empty($username) || empty($password)) {
            return ["success" => false, "message" => "Please provide username and password"];
        }
        return $this->adminModel->login($username, $password);
    }
} 