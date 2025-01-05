<?php
require_once 'BaseModel.php';

class Report extends BaseModel {
    public function generateReport($type) {
        try {
            switch ($type) {
                case 'occupancy':
                    return $this->generateOccupancyReport();
                case 'student_distribution':
                    return $this->generateStudentDistributionReport();
                case 'room_allocation':
                    return $this->generateRoomAllocationReport();
                default:
                    throw new Exception("Invalid report type");
            }
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    private function generateOccupancyReport() {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    r.floor_number,
                    COUNT(r.id) as total_rooms,
                    SUM(r.capacity) as total_capacity,
                    COUNT(ra.id) as total_occupants,
                    (COUNT(ra.id) / SUM(r.capacity)) * 100 as occupancy_rate
                FROM rooms r
                LEFT JOIN room_assignments ra ON r.id = ra.room_id
                GROUP BY r.floor_number
                ORDER BY r.floor_number
            ");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $report_data = [];
            while ($row = $result->fetch_assoc()) {
                $report_data[] = $row;
            }
            
            return [
                "success" => true,
                "report_type" => "occupancy",
                "data" => $report_data
            ];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    private function generateStudentDistributionReport() {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    curr_edu as course,
                    COUNT(*) as total_students,
                    SUM(CASE WHEN ra.id IS NOT NULL THEN 1 ELSE 0 END) as assigned_rooms,
                    SUM(CASE WHEN ra.id IS NULL THEN 1 ELSE 0 END) as waiting_list
                FROM students s
                LEFT JOIN room_assignments ra ON s.id = ra.student_id
                GROUP BY curr_edu
                ORDER BY curr_edu
            ");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $report_data = [];
            while ($row = $result->fetch_assoc()) {
                $report_data[] = $row;
            }
            
            return [
                "success" => true,
                "report_type" => "student_distribution",
                "data" => $report_data
            ];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    private function generateRoomAllocationReport() {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    r.room_number,
                    r.capacity,
                    COUNT(ra.id) as current_occupants,
                    GROUP_CONCAT(CONCAT(s.name, ' ', s.last_name)) as student_names,
                    r.floor_number
                FROM rooms r
                LEFT JOIN room_assignments ra ON r.id = ra.room_id
                LEFT JOIN students s ON ra.student_id = s.id
                GROUP BY r.id
                ORDER BY r.floor_number, r.room_number
            ");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $report_data = [];
            while ($row = $result->fetch_assoc()) {
                $report_data[] = $row;
            }
            
            return [
                "success" => true,
                "report_type" => "room_allocation",
                "data" => $report_data
            ];
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function exportReport($type, $format = 'csv') {
        // Implementation for exporting reports in different formats
        // This can be extended based on requirements
    }
} 