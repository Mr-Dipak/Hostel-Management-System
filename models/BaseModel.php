<?php
require_once __DIR__ . '/../config/database.php';

class BaseModel {
    protected $conn;

    public function __construct() {
        $this->conn = DatabaseConfig::getInstance()->getConnection();
        $this->conn->select_db('hostel_management');
    }
} 