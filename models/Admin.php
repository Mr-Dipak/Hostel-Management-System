<?php
require_once 'BaseModel.php';

class Admin extends BaseModel {
    public function register($data) {
        try {
            // Check if username already exists
            $stmt = $this->conn->prepare("SELECT id FROM admins WHERE username = ?");
            $stmt->bind_param("s", $data['username']);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                throw new Exception("Username already exists");
            }

            // Check if email already exists
            $stmt = $this->conn->prepare("SELECT id FROM admins WHERE email = ?");
            $stmt->bind_param("s", $data['email']);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                throw new Exception("Email already exists");
            }

            // Insert new admin
            $stmt = $this->conn->prepare(
                "INSERT INTO admins (fullname, username, email, password) 
                VALUES (?, ?, ?, ?)"
            );

            $stmt->bind_param(
                "ssss",
                $data['fullname'],
                $data['username'],
                $data['email'],
                $data['password']
            );

            if (!$stmt->execute()) {
                throw new Exception("Registration failed: " . $stmt->error);
            }

            return ["success" => true, "message" => "Admin registration successful"];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function login($username, $password) {
        try {
            $stmt = $this->conn->prepare("SELECT id, password, fullname FROM admins WHERE username = ?");
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                throw new Exception("Invalid username or password");
            }

            $admin = $result->fetch_assoc();
            if ($password !== $admin['password']) {
                throw new Exception("Invalid username or password");
            }

            // Create session data
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_name'] = $admin['fullname'];
            $_SESSION['user_type'] = 'admin';

            return ["success" => true, "message" => "Login successful"];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
} 