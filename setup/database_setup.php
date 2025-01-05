<?php
require_once '../config/database.php';

class DatabaseSetup {
    private $conn;

    public function __construct() {
        $this->conn = DatabaseConfig::getInstance()->getConnection();
    }

    public function setupDatabase() {
        try {
            // Create database if not exists
            $sql = "CREATE DATABASE IF NOT EXISTS hostel_management";
            if (!$this->conn->query($sql)) {
                throw new Exception("Error creating database: " . $this->conn->error);
            }

            // Select the database
            $this->conn->select_db('hostel_management');

            // Create students table
            $sql = "CREATE TABLE IF NOT EXISTS students (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL,
                middle_name VARCHAR(50),
                last_name VARCHAR(50) NOT NULL,
                prn_number VARCHAR(20) UNIQUE NOT NULL,
                password VARCHAR(50) NOT NULL,
                dob DATE NOT NULL,
                mobile VARCHAR(15) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                address TEXT NOT NULL,
                prev_edu VARCHAR(100) NOT NULL,
                curr_edu VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            if (!$this->conn->query($sql)) {
                throw new Exception("Error creating students table: " . $this->conn->error);
            }

            // Create admins table
            $sql = "CREATE TABLE IF NOT EXISTS admins (
                id INT PRIMARY KEY AUTO_INCREMENT,
                fullname VARCHAR(100) NOT NULL,
                username VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            if (!$this->conn->query($sql)) {
                throw new Exception("Error creating admins table: " . $this->conn->error);
            }

            // Create rooms table
            $sql = "CREATE TABLE IF NOT EXISTS rooms (
                id INT PRIMARY KEY AUTO_INCREMENT,
                room_number VARCHAR(10) UNIQUE NOT NULL,
                floor_number INT NOT NULL,
                block_name VARCHAR(10) NOT NULL,
                room_type ENUM('single', 'double', 'triple') NOT NULL,
                capacity INT NOT NULL,
                availability_status ENUM('available', 'full') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            if (!$this->conn->query($sql)) {
                throw new Exception("Error creating rooms table: " . $this->conn->error);
            }

            // Create room_assignments table
            $sql = "CREATE TABLE IF NOT EXISTS room_assignments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_id INT NOT NULL,
                room_id INT NOT NULL,
                assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            )";
            if (!$this->conn->query($sql)) {
                throw new Exception("Error creating room_assignments table: " . $this->conn->error);
            }

            return ["success" => true, "message" => "Database and tables created successfully"];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function updateDatabase() {
        try {
            $this->conn->select_db('hostel_management');

            // Add any new columns or modifications here
            $alterQueries = [
                "ALTER TABLE students ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active'",
                "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor_number INT AFTER room_number",
                "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS block_name VARCHAR(10) AFTER floor_number",
                "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type ENUM('single', 'double', 'triple') AFTER block_name",
                "ALTER TABLE students ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'",
                "ALTER TABLE students ADD COLUMN IF NOT EXISTS rejection_reason TEXT",
                "ALTER TABLE room_assignments ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "ALTER TABLE room_assignments ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active'"
            ];

            foreach ($alterQueries as $query) {
                if (!$this->conn->query($query)) {
                    throw new Exception("Error updating database: " . $this->conn->error);
                }
            }

            return ["success" => true, "message" => "Database updated successfully"];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
} 