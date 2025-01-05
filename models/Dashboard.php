<?php
require_once 'BaseModel.php';

class Dashboard extends BaseModel {
    public function getSummary() {
        try {
            // Get total students
            $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM students");
            $stmt->execute();
            $total_students = $stmt->get_result()->fetch_assoc()['total'];

            // Get total rooms
            $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM rooms");
            $stmt->execute();
            $total_rooms = $stmt->get_result()->fetch_assoc()['total'];

            // Get available rooms
            $stmt = $this->conn->prepare("
                SELECT COUNT(*) as total 
                FROM rooms r 
                WHERE (
                    SELECT COUNT(*) 
                    FROM room_assignments 
                    WHERE room_id = r.id
                ) < r.capacity
            ");
            $stmt->execute();
            $available_rooms = $stmt->get_result()->fetch_assoc()['total'];

            // Calculate occupancy rate
            $occupancy_rate = $total_rooms > 0 
                ? round((($total_rooms - $available_rooms) / $total_rooms) * 100) 
                : 0;

            // Get recent activities
            $stmt = $this->conn->prepare("
                SELECT 
                    'room_assignment' as type,
                    s.name,
                    s.last_name,
                    r.room_number,
                    ra.assigned_date as date
                FROM room_assignments ra
                JOIN students s ON ra.student_id = s.id
                JOIN rooms r ON ra.room_id = r.id
                ORDER BY ra.assigned_date DESC
                LIMIT 5
            ");
            $stmt->execute();
            $recent_activities = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

            // Get pending actions
            $stmt = $this->conn->prepare("
                SELECT COUNT(*) as total 
                FROM students 
                WHERE status = 'pending'
            ");
            $stmt->execute();
            $pending_approvals = $stmt->get_result()->fetch_assoc()['total'];

            return [
                "success" => true,
                "total_students" => $total_students,
                "total_rooms" => $total_rooms,
                "available_rooms" => $available_rooms,
                "occupancy_rate" => $occupancy_rate,
                "recent_activities" => $recent_activities,
                "pending_approvals" => $pending_approvals
            ];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getRoomStatistics() {
        try {
            $stats = [
                'total_rooms' => 0,
                'occupied_rooms' => 0,
                'available_rooms' => 0,
                'maintenance_rooms' => 0,
                'occupancy_rate' => 0,
                'block_wise_stats' => []
            ];
            
            // Get total rooms and their status
            $stmt = $this->conn->prepare("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN availability_status = 'available' THEN 1 ELSE 0 END) as available,
                    SUM(CASE WHEN availability_status = 'full' THEN 1 ELSE 0 END) as occupied,
                    block_name,
                    COUNT(*) as block_total,
                    SUM(CASE WHEN availability_status = 'available' THEN 1 ELSE 0 END) as block_available
                FROM rooms
                GROUP BY block_name WITH ROLLUP
            ");
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            while ($row = $result->fetch_assoc()) {
                if ($row['block_name'] === null) {
                    $stats['total_rooms'] = $row['total'];
                    $stats['available_rooms'] = $row['available'];
                    $stats['occupied_rooms'] = $row['occupied'];
                    $stats['occupancy_rate'] = round(($row['occupied'] / $row['total']) * 100, 2);
                } else {
                    $stats['block_wise_stats'][] = [
                        'block' => $row['block_name'],
                        'total' => $row['block_total'],
                        'available' => $row['block_available'],
                        'occupancy_rate' => round(
                            (($row['block_total'] - $row['block_available']) / $row['block_total']) * 100, 
                            2
                        )
                    ];
                }
            }
            
            return ["success" => true, "statistics" => $stats];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
} 