<?php
require_once __DIR__ . '/../models/Student.php';

class StudentController {
    private $studentModel;

    public function __construct() {
        $this->studentModel = new Student();
    }

    public function handleRegistration($data) {
        // Validate required fields
        $required_fields = [
            'name', 
            'last_name', 
            'prn_number', 
            'password', 
            'dob',
            'mobile', 
            'email', 
            'address', 
            'prev_edu', 
            'curr_edu'
        ];
        
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                return ["success" => false, "message" => "Please fill all required fields. Missing: $field"];
            }
        }

        // Validate date format
        if (!strtotime($data['dob'])) {
            return ["success" => false, "message" => "Invalid date format for Date of Birth"];
        }

        // Validate PRN format
        if (!preg_match("/^PRN\d{7}$/", $data['prn_number'])) {
            return ["success" => false, "message" => "Invalid PRN format"];
        }

        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email format"];
        }

        // Validate mobile number
        if (!preg_match("/^[0-9]{10}$/", $data['mobile'])) {
            return ["success" => false, "message" => "Invalid mobile number"];
        }

        return $this->studentModel->register($data);
    }
}