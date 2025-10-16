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

    // GET - List all designations
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $query = "SELECT * FROM designations WHERE id = :id";
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
                $query = "SELECT * FROM designations ORDER BY designation_name";
            } else {
                $query = "SELECT * FROM designations WHERE is_archived = 0 ORDER BY designation_name";
            }
            
            $stmt = $db->query($query);
            $designations = $stmt->fetchAll();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $designations
            ]);
        }
    }

    // POST - Create new designation
    else if ($method === 'POST') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->designation_code) || !isset($data->designation_name)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Designation code and name are required'
            ]);
            exit();
        }
        
        $query = "INSERT INTO designations (designation_code, designation_name, description) 
                  VALUES (:code, :name, :description)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':code', $data->designation_code);
        $stmt->bindParam(':name', $data->designation_name);
        $stmt->bindParam(':description', $data->description);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'CREATE', 'designations', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $newId = $db->lastInsertId();
            $logStmt->bindParam(':record_id', $newId);
            $logStmt->execute();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Designation created successfully',
                'id' => $newId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create designation'
            ]);
        }
    }

    // PUT - Update designation
    else if ($method === 'PUT') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Designation ID is required'
            ]);
            exit();
        }
        
        if (isset($data->is_archived)) {
            $query = "UPDATE designations SET is_archived = :is_archived WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':is_archived', $data->is_archived);
            $action = $data->is_archived ? 'ARCHIVE' : 'RESTORE';
        } else {
            $query = "UPDATE designations SET 
                      designation_code = :code,
                      designation_name = :name,
                      description = :description
                      WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':code', $data->designation_code);
            $stmt->bindParam(':name', $data->designation_name);
            $stmt->bindParam(':description', $data->description);
            $action = 'UPDATE';
        }
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, :action, 'designations', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':action', $action);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Designation updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update designation'
            ]);
        }
    }

    // DELETE - Delete designation
    else if ($method === 'DELETE') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Designation ID is required'
            ]);
            exit();
        }
        
        $query = "DELETE FROM designations WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'DELETE', 'designations', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Designation deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete designation'
            ]);
        }
    }
} catch (PDOException $e) {
    ErrorLogger::logDatabaseError($e, $query ?? 'Unknown query', [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'designations'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred'
    ]);
} catch (Exception $e) {
    ErrorLogger::logError($e, [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'designations'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred'
    ]);
}
?>
