<?php
require_once 'BaseModel.php';

class Student extends BaseModel {
    public function register($data) {
        try {
            if (!$this->conn) {
                throw new Exception("Database connection failed");
            }

            // Check if PRN already exists
            $stmt = $this->conn->prepare("SELECT id FROM students WHERE prn_number = ?");
            if (!$stmt) {
                throw new Exception("Database error: " . $this->conn->error);
            }
            
            $stmt->bind_param("s", $data['prn_number']);
            if (!$stmt->execute()) {
                throw new Exception("Database error: " . $stmt->error);
            }
            
            if ($stmt->get_result()->num_rows > 0) {
                throw new Exception("PRN number already registered");
            }

            // Prepare insert statement
            $stmt = $this->conn->prepare(
                "INSERT INTO students (
                    name, 
                    middle_name, 
                    last_name, 
                    prn_number, 
                    password, 
                    dob,
                    mobile, 
                    email, 
                    address, 
                    prev_edu, 
                    curr_edu
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            
            if (!$stmt) {
                throw new Exception("Database error: " . $this->conn->error);
            }

            $stmt->bind_param(
                "sssssssssss",
                $data['name'],
                $data['middle_name'],
                $data['last_name'],
                $data['prn_number'],
                $data['password'],
                $data['dob'],
                $data['mobile'],
                $data['email'],
                $data['address'],
                $data['prev_edu'],
                $data['curr_edu']
            );

            if (!$stmt->execute()) {
                throw new Exception("Registration failed: " . $stmt->error);
            }

            return ["success" => true, "message" => "Registration successful"];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function login($prn_number, $password) {
        try {
            $stmt = $this->conn->prepare("SELECT id, name, password FROM students WHERE prn_number = ?");
            $stmt->bind_param("s", $prn_number);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                return ["success" => false, "message" => "Invalid PRN number or password"];
            }

            $student = $result->fetch_assoc();
            
            // Direct password comparison (no hashing)
            if ($password === $student['password']) {
                return [
                    "success" => true, 
                    "message" => "Login successful",
                    "student" => [
                        "id" => $student['id'],
                        "name" => $student['name']
                    ]
                ];
            } else {
                return ["success" => false, "message" => "Invalid PRN number or password"];
            }
        } catch (Exception $e) {
            return ["success" => false, "message" => "Login failed: " . $e->getMessage()];
        }
    }

    public function getAllStudents() {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    s.*,
                    r.room_number
                FROM students s
                LEFT JOIN room_assignments ra ON s.id = ra.student_id
                LEFT JOIN rooms r ON ra.room_id = r.id
                ORDER BY s.created_at DESC
            ");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $students = [];
            while ($row = $result->fetch_assoc()) {
                $students[] = $row;
            }
            
            return ["success" => true, "students" => $students];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getPendingApprovals() {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    s.*,
                    r.room_number
                FROM students s
                LEFT JOIN room_assignments ra ON s.id = ra.student_id
                LEFT JOIN rooms r ON ra.room_id = r.id
                WHERE s.status = 'pending'
                ORDER BY s.created_at DESC
            ");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $students = [];
            while ($row = $result->fetch_assoc()) {
                $students[] = $row;
            }
            
            return ["success" => true, "pending_students" => $students];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function approveStudent($student_id) {
        try {
            $this->conn->begin_transaction();

            // First check if student exists and is not already approved
            $stmt = $this->conn->prepare("SELECT status FROM students WHERE id = ?");
            $stmt->bind_param("i", $student_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                throw new Exception("Student not found");
            }
            
            $student = $result->fetch_assoc();
            if ($student['status'] === 'active') {
                throw new Exception("Student is already approved");
            }

            // Update student status
            $stmt = $this->conn->prepare("UPDATE students SET status = 'active' WHERE id = ?");
            $stmt->bind_param("i", $student_id);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to approve student");
            }

            $this->conn->commit();
            return ["success" => true, "message" => "Student approved successfully"];
        } catch (Exception $e) {
            $this->conn->rollback();
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getAvailableStudents() {
        try {
            $sql = "SELECT s.id, s.name, s.last_name, s.prn_number 
                    FROM students s 
                    LEFT JOIN room_assignments ra ON s.id = ra.student_id 
                    WHERE ra.id IS NULL 
                    AND s.status = 'active' 
                    ORDER BY s.name";
                    
            $result = $this->conn->query($sql);
            
            if (!$result) {
                throw new Exception("Database error: " . $this->conn->error);
            }

            $students = [];
            while ($row = $result->fetch_assoc()) {
                $students[] = $row;
            }

            return ["success" => true, "students" => $students];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getAllStudentsWithRooms() {
        try {
            $sql = "SELECT s.*, r.room_number 
                    FROM students s 
                    LEFT JOIN room_assignments ra ON s.id = ra.student_id 
                    LEFT JOIN rooms r ON ra.room_id = r.id 
                    ORDER BY s.name";
                    
            $result = $this->conn->query($sql);
            
            if (!$result) {
                throw new Exception("Database error: " . $this->conn->error);
            }

            $students = [];
            while ($row = $result->fetch_assoc()) {
                $students[] = $row;
            }

            return ["success" => true, "students" => $students];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getStudentDetails($id) {
        try {
            $sql = "SELECT s.*, r.room_number 
                    FROM students s 
                    LEFT JOIN room_assignments ra ON s.id = ra.student_id 
                    LEFT JOIN rooms r ON ra.room_id = r.id 
                    WHERE s.id = ?";
                    
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                throw new Exception("Student not found");
            }

            $student = $result->fetch_assoc();
            return ["success" => true, "student" => $student];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
}