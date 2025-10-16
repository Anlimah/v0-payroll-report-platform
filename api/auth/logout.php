<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../middleware/auth.php';
include_once '../config/error-logger.php';

try {
    $user = authenticate();

    $database = new Database();
    $db = $database->getConnection();

    // Log the logout
    $logQuery = "INSERT INTO audit_logs (user_id, action, ip_address) 
                 VALUES (:user_id, 'LOGOUT', :ip)";
    $logStmt = $db->prepare($logQuery);
    $logStmt->bindParam(':user_id', $user->user_id);
    $logStmt->bindParam(':ip', $_SERVER['REMOTE_ADDR']);
    $logStmt->execute();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
} catch (PDOException $e) {
    ErrorLogger::logDatabaseError($e, $logQuery ?? 'Logout query', [
        'endpoint' => 'auth/logout',
        'user_id' => $user->user_id ?? 'unknown'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during logout'
    ]);
} catch (Exception $e) {
    ErrorLogger::logError($e, [
        'endpoint' => 'auth/logout'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred'
    ]);
}
?>
