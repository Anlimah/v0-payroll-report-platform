<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../utils/token.php';   // ✅ ADD THIS
include_once '../config/error-logger.php';


try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->username) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Username and password are required'
        ]);
        exit();
    }

    $query = "SELECT id, username, password, full_name, email, role, position, is_active 
              FROM users 
              WHERE username = :username AND is_active = 1";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $data->username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch();
        
        if (password_verify($data->password, $user['password'])) {
            unset($user['password']);
            
            $token = generateToken($user);
            
            // Log the login
            $logQuery = "INSERT INTO audit_logs (user_id, action, ip_address) 
                         VALUES (:user_id, 'LOGIN', :ip)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user['id']);
            $logStmt->bindParam(':ip', $_SERVER['REMOTE_ADDR']);
            $logStmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid credentials'
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid credentials'
        ]);
    }
} catch (PDOException $e) {
    ErrorLogger::logAuthError($e, $data->username ?? 'unknown');
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during login'
    ]);
} catch (Exception $e) {
    ErrorLogger::logAuthError($e, $data->username ?? 'unknown');
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred'
    ]);
}
?>
