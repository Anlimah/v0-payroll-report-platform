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

    // GET - List all departments
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $query = "SELECT * FROM departments WHERE id = :id";
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
                $query = "SELECT * FROM departments ORDER BY department_name";
            } else {
                $query = "SELECT * FROM departments WHERE is_archived = 0 ORDER BY department_name";
            }
            
            $stmt = $db->query($query);
            $departments = $stmt->fetchAll();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $departments
            ]);
        }
    }

    // POST - Create new department
    else if ($method === 'POST') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->department_code) || !isset($data->department_name)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Department code and name are required'
            ]);
            exit();
        }
        
        $query = "INSERT INTO departments (department_code, department_name, description) 
                  VALUES (:code, :name, :description)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':code', $data->department_code);
        $stmt->bindParam(':name', $data->department_name);
        $stmt->bindParam(':description', $data->description);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'CREATE', 'departments', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $newId = $db->lastInsertId();
            $logStmt->bindParam(':record_id', $newId);
            $logStmt->execute();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Department created successfully',
                'id' => $newId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create department'
            ]);
        }
    }

    // PUT - Update department
    else if ($method === 'PUT') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Department ID is required'
            ]);
            exit();
        }
        
        if (isset($data->is_archived)) {
            $query = "UPDATE departments SET is_archived = :is_archived WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':is_archived', $data->is_archived);
            $action = $data->is_archived ? 'ARCHIVE' : 'RESTORE';
        } else {
            $query = "UPDATE departments SET 
                      department_code = :code,
                      department_name = :name,
                      description = :description
                      WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':code', $data->department_code);
            $stmt->bindParam(':name', $data->department_name);
            $stmt->bindParam(':description', $data->description);
            $action = 'UPDATE';
        }
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, :action, 'departments', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':action', $action);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Department updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update department'
            ]);
        }
    }

    // DELETE - Delete department
    else if ($method === 'DELETE') {
        requireAdmin($user);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Department ID is required'
            ]);
            exit();
        }
        
        $query = "DELETE FROM departments WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'DELETE', 'departments', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Department deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete department'
            ]);
        }
    }
} catch (PDOException $e) {
    ErrorLogger::logDatabaseError($e, $query ?? 'Unknown query', [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'departments'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred'
    ]);
} catch (Exception $e) {
    ErrorLogger::logError($e, [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'departments'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred'
    ]);
}
?>
