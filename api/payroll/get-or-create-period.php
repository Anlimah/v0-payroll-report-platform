<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../middleware/auth.php';
include_once '../config/error-logger.php';

try {
    $user = authenticate();
    
    $database = new Database();
    $db = $database->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        $month = isset($_GET['month']) ? intval($_GET['month']) : null;
        $year = isset($_GET['year']) ? intval($_GET['year']) : null;

        if (!$month || !$year) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'month and year are required']);
            exit;
        }

        // Check if period exists
        $query = "SELECT * FROM payroll_periods WHERE month = :month AND year = :year LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':month', $month, PDO::PARAM_INT);
        $stmt->bindParam(':year', $year, PDO::PARAM_INT);
        $stmt->execute();
        $period = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($period) {
            // Period exists - return it
            error_log("[PAYROLL] Period exists: {$month}/{$year} - ID: {$period['id']}");
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $period,
                'message' => 'Period already exists'
            ]);
        } else {
            // Period doesn't exist - create it
            $query = "INSERT INTO payroll_periods (month, year) VALUES (:month, :year)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':month', $month, PDO::PARAM_INT);
            $stmt->bindParam(':year', $year, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                $period_id = $db->lastInsertId();
                
                // Fetch the created period
                $query = "SELECT * FROM payroll_periods WHERE id = :id LIMIT 1";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $period_id, PDO::PARAM_INT);
                $stmt->execute();
                $period = $stmt->fetch(PDO::FETCH_ASSOC);
                
                error_log("[PAYROLL] Period created: {$month}/{$year} - ID: {$period_id}");
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'data' => $period,
                    'message' => 'Period created successfully'
                ]);
            } else {
                throw new Exception("Failed to create payroll period");
            }
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log("[PAYROLL ERROR] getOrCreatePayrollPeriod: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
