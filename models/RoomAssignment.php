<?php
require_once 'BaseModel.php';

class RoomAssignment extends BaseModel {
    public function assignRoom($student_id, $room_id) {
        try {
            // Check if student is approved
            $stmt = $this->conn->prepare("SELECT status FROM students WHERE id = ?");
            $stmt->bind_param("i", $student_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $student = $result->fetch_assoc();
            
            if ($student['status'] !== 'approved') {
                throw new Exception("Student must be approved before room assignment");
            }

            // Check room capacity
            $stmt = $this->conn->prepare("
                SELECT r.capacity, COUNT(ra.id) as current_occupants 
                FROM rooms r 
                LEFT JOIN room_assignments ra ON r.id = ra.room_id 
                WHERE r.id = ? AND ra.status = 'active'
                GROUP BY r.id
            ");
            $stmt->bind_param("i", $room_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $room = $result->fetch_assoc();

            if ($room['current_occupants'] >= $room['capacity']) {
                throw new Exception("Room is at full capacity");
            }

            // Create room assignment
            $stmt = $this->conn->prepare("
                INSERT INTO room_assignments (student_id, room_id, status) 
                VALUES (?, ?, 'active')
            ");
            $stmt->bind_param("ii", $student_id, $room_id);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to assign room");
            }

            return ["success" => true, "message" => "Room assigned successfully"];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getRoomAssignments($room_id = null) {
        try {
            $query = "
                SELECT ra.*, s.name, s.last_name, s.prn_number, r.room_number 
                FROM room_assignments ra
                JOIN students s ON ra.student_id = s.id
                JOIN rooms r ON ra.room_id = r.id
                WHERE ra.status = 'active'
            ";
            
            if ($room_id) {
                $query .= " AND ra.room_id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->bind_param("i", $room_id);
            } else {
                $stmt = $this->conn->prepare($query);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            $assignments = [];
            while ($row = $result->fetch_assoc()) {
                $assignments[] = $row;
            }
            
            return ["success" => true, "assignments" => $assignments];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
} 