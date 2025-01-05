<?php
require_once 'BaseModel.php';

class Room extends BaseModel {
    public function addRoom($data) {
        try {
            // Validate required fields
            $required_fields = ['room_number', 'floor_number', 'block_name', 'room_type', 'capacity'];
            foreach ($required_fields as $field) {
                if (empty($data[$field])) {
                    throw new Exception("Please fill all required fields. Missing: $field");
                }
            }

            // Validate room number format (e.g., A-101)
            if (!preg_match("/^[A-Z]-\d{3}$/", $data['room_number'])) {
                throw new Exception("Invalid room number format. Use format: A-101");
            }

            // Validate floor number
            if (!is_numeric($data['floor_number']) || $data['floor_number'] < 0 || $data['floor_number'] > 3) {
                throw new Exception("Invalid floor number");
            }

            // Validate room type
            $valid_room_types = ['single', 'double', 'triple'];
            if (!in_array($data['room_type'], $valid_room_types)) {
                throw new Exception("Invalid room type");
            }

            // Validate capacity based on room type
            $expected_capacity = [
                'single' => 1,
                'double' => 2,
                'triple' => 3
            ];
            if ($data['capacity'] != $expected_capacity[$data['room_type']]) {
                throw new Exception("Capacity must match room type");
            }

            $stmt = $this->conn->prepare("
                INSERT INTO rooms (
                    room_number, 
                    floor_number, 
                    block_name, 
                    room_type, 
                    capacity, 
                    availability_status
                ) VALUES (?, ?, ?, ?, ?, 'available')
            ");

            $stmt->bind_param(
                "sissi", 
                $data['room_number'],
                $data['floor_number'],
                $data['block_name'],
                $data['room_type'],
                $data['capacity']
            );

            if (!$stmt->execute()) {
                throw new Exception("Failed to add room: " . $stmt->error);
            }

            return ["success" => true, "message" => "Room added successfully"];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function assignRoom($student_id, $room_id) {
        try {
            $this->conn->begin_transaction();

            // Check if room exists and has capacity
            $stmt = $this->conn->prepare("
                SELECT r.*, 
                       (SELECT COUNT(*) FROM room_assignments WHERE room_id = r.id) as current_occupants 
                FROM rooms r 
                WHERE r.id = ?
            ");
            $stmt->bind_param("i", $room_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                throw new Exception("Room not found");
            }
            
            $room = $result->fetch_assoc();
            if ($room['current_occupants'] >= $room['capacity']) {
                throw new Exception("Room is already full");
            }

            // Check if student already has a room
            $stmt = $this->conn->prepare("SELECT * FROM room_assignments WHERE student_id = ?");
            $stmt->bind_param("i", $student_id);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                throw new Exception("Student already has a room assigned");
            }

            // Assign room
            $stmt = $this->conn->prepare("INSERT INTO room_assignments (student_id, room_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $student_id, $room_id);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to assign room");
            }

            $this->conn->commit();
            return ["success" => true, "message" => "Room assigned successfully"];
        } catch (Exception $e) {
            $this->conn->rollback();
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getAllRooms() {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM rooms");
            $stmt->execute();
            $result = $stmt->get_result();

            $rooms = [];
            while ($row = $result->fetch_assoc()) {
                $rooms[] = $row;
            }

            return ["success" => true, "rooms" => $rooms];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getRoomAvailability() {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    r.*,
                    COUNT(ra.id) as current_occupants,
                    r.capacity - COUNT(ra.id) as available_beds
                FROM rooms r
                LEFT JOIN room_assignments ra ON r.id = ra.room_id AND ra.status = 'active'
                GROUP BY r.id
                ORDER BY r.block_name, r.floor_number, r.room_number
            ");
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to fetch room availability: " . $this->conn->error);
            }
            
            $result = $stmt->get_result();
            $rooms = [];
            while ($row = $result->fetch_assoc()) {
                $rooms[] = $row;
            }
            
            return ["success" => true, "rooms" => $rooms];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getRoomDetails($room_id) {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    r.*,
                    COUNT(ra.id) as current_occupants,
                    GROUP_CONCAT(
                        CONCAT(s.name, ' ', s.last_name, '|', s.prn_number, '|', s.mobile) 
                        SEPARATOR ';'
                    ) as occupants_details
                FROM rooms r
                LEFT JOIN room_assignments ra ON r.id = ra.room_id AND ra.status = 'active'
                LEFT JOIN students s ON ra.student_id = s.id
                WHERE r.id = ?
                GROUP BY r.id
            ");
            
            $stmt->bind_param("i", $room_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                throw new Exception("Room not found");
            }
            
            $room = $result->fetch_assoc();
            
            // Format occupants details
            if ($room['occupants_details']) {
                $occupants = [];
                foreach (explode(';', $room['occupants_details']) as $occupant) {
                    list($name, $prn, $mobile) = explode('|', $occupant);
                    $occupants[] = [
                        'name' => $name,
                        'prn' => $prn,
                        'mobile' => $mobile
                    ];
                }
                $room['occupants'] = $occupants;
            }
            
            unset($room['occupants_details']);
            
            return ["success" => true, "room" => $room];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function updateRoomStatus($room_id, $status) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE rooms 
                SET availability_status = ? 
                WHERE id = ?
            ");
            
            $stmt->bind_param("si", $status, $room_id);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to update room status");
            }
            
            return ["success" => true, "message" => "Room status updated successfully"];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getAvailableRooms() {
        try {
            $sql = "SELECT r.*, 
                           (SELECT COUNT(*) FROM room_assignments WHERE room_id = r.id) as current_occupants 
                    FROM rooms r 
                    WHERE (SELECT COUNT(*) FROM room_assignments WHERE room_id = r.id) < r.capacity 
                    ORDER BY r.room_number";
                    
            $result = $this->conn->query($sql);
            
            if (!$result) {
                throw new Exception("Database error: " . $this->conn->error);
            }

            $rooms = [];
            while ($row = $result->fetch_assoc()) {
                $rooms[] = $row;
            }

            return ["success" => true, "rooms" => $rooms];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
} 