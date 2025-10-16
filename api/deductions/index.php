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

    // GET - List all deductions
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $query = "SELECT * FROM deductions WHERE id = :id";
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
            $includeArchived = isset($_GET['include_archived']) ? $_GET['include_archived'] : false;
            
            if ($includeArchived) {
                $query = "SELECT * FROM deductions ORDER BY deduction_name";
            } else {
                $query = "SELECT * FROM deductions WHERE is_archived = 0 ORDER BY deduction_name";
            }
            
            $stmt = $db->query($query);
            $deductions = $stmt->fetchAll();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $deductions
            ]);
        }
    }

    // POST - Create new deduction
    else if ($method === 'POST') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->deduction_code) || !isset($data->deduction_name)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Deduction code and name are required'
            ]);
            exit();
        }
        
        $query = "INSERT INTO deductions (deduction_code, deduction_name, description, is_percentage, default_amount) 
                  VALUES (:code, :name, :description, :is_percentage, :default_amount)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':code', $data->deduction_code);
        $stmt->bindParam(':name', $data->deduction_name);
        $stmt->bindParam(':description', $data->description);
        $stmt->bindParam(':is_percentage', $data->is_percentage);
        $stmt->bindParam(':default_amount', $data->default_amount);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'CREATE', 'deductions', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $newId = $db->lastInsertId();
            $logStmt->bindParam(':record_id', $newId);
            $logStmt->execute();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Deduction created successfully',
                'id' => $newId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create deduction'
            ]);
        }
    }

    // PUT - Update deduction
    else if ($method === 'PUT') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Deduction ID is required'
            ]);
            exit();
        }
        
        if (isset($data->is_archived)) {
            $query = "UPDATE deductions SET is_archived = :is_archived WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':is_archived', $data->is_archived);
            $action = $data->is_archived ? 'ARCHIVE' : 'RESTORE';
        } else {
            $query = "UPDATE deductions SET 
                      deduction_code = :code,
                      deduction_name = :name,
                      description = :description,
                      is_percentage = :is_percentage,
                      default_amount = :default_amount
                      WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':code', $data->deduction_code);
            $stmt->bindParam(':name', $data->deduction_name);
            $stmt->bindParam(':description', $data->description);
            $stmt->bindParam(':is_percentage', $data->is_percentage);
            $stmt->bindParam(':default_amount', $data->default_amount);
            $action = 'UPDATE';
        }
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, :action, 'deductions', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':action', $action);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Deduction updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update deduction'
            ]);
        }
    }

    // DELETE - Delete deduction
    else if ($method === 'DELETE') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Deduction ID is required'
            ]);
            exit();
        }
        
        $query = "DELETE FROM deductions WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'DELETE', 'deductions', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Deduction deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete deduction'
            ]);
        }
    }
} catch (PDOException $e) {
    ErrorLogger::logDatabaseError($e, $query ?? 'Unknown query', [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'deductions'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred'
    ]);
} catch (Exception $e) {
    ErrorLogger::logError($e, [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'deductions'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred'
    ]);
}
?>
