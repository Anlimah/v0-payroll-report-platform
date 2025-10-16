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

    // GET - List all payroll periods
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $query = "SELECT pp.*, u.full_name as created_by_name,
                      (SELECT COUNT(*) FROM payroll_entries WHERE payroll_period_id = pp.id) as entry_count
                      FROM payroll_periods pp
                      LEFT JOIN users u ON pp.created_by = u.id
                      WHERE pp.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $_GET['id']);
            $stmt->execute();
            
            $data = $stmt->fetch();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
        } else {
            $query = "SELECT pp.*, u.full_name as created_by_name,
                      (SELECT COUNT(*) FROM payroll_entries WHERE payroll_period_id = pp.id) as entry_count
                      FROM payroll_periods pp
                      LEFT JOIN users u ON pp.created_by = u.id
                      ORDER BY pp.year DESC, pp.month DESC";
            $stmt = $db->query($query);
            $periods = $stmt->fetchAll();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $periods
            ]);
        }
    }

    // POST - Create new payroll period
    else if ($method === 'POST') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->month) || !isset($data->year)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Month and year are required'
            ]);
            exit();
        }
        
        // Check if period already exists
        $checkQuery = "SELECT id FROM payroll_periods WHERE month = :month AND year = :year";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':month', $data->month);
        $checkStmt->bindParam(':year', $data->year);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Payroll period already exists for this month and year'
            ]);
            exit();
        }
        
        $query = "INSERT INTO payroll_periods (month, year, status, created_by) 
                  VALUES (:month, :year, 'draft', :created_by)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':month', $data->month);
        $stmt->bindParam(':year', $data->year);
        $stmt->bindParam(':created_by', $user->user_id);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'CREATE', 'payroll_periods', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $newId = $db->lastInsertId();
            $logStmt->bindParam(':record_id', $newId);
            $logStmt->execute();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Payroll period created successfully',
                'id' => $newId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create payroll period'
            ]);
        }
    }

    // PUT - Update payroll period status
    else if ($method === 'PUT') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id) || !isset($data->status)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Period ID and status are required'
            ]);
            exit();
        }
        
        $query = "UPDATE payroll_periods SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':status', $data->status);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'UPDATE', 'payroll_periods', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Payroll period updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update payroll period'
            ]);
        }
    }

    // DELETE - Delete payroll period
    else if ($method === 'DELETE') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Period ID is required'
            ]);
            exit();
        }
        
        $query = "DELETE FROM payroll_periods WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'DELETE', 'payroll_periods', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Payroll period deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete payroll period'
            ]);
        }
    }
} catch (PDOException $e) {
    ErrorLogger::logDatabaseError($e, $query ?? 'Unknown query', [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'payroll/periods'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred'
    ]);
} catch (Exception $e) {
    ErrorLogger::logError($e, [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'payroll/periods'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred'
    ]);
}
?>
