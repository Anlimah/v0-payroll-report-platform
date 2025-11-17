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

    // GET - List all currency rates or get active rate
    if ($method === 'GET') {
        if (isset($_GET['active']) && $_GET['active'] === 'true') {
            // Get the current active rate
            $query = "SELECT * FROM currency_rates WHERE is_active = TRUE LIMIT 1";
            $stmt = $db->query($query);
            $activeRate = $stmt->fetch();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $activeRate
            ]);
        } else {
            // List all rates
            $query = "SELECT * FROM currency_rates ORDER BY effective_date DESC";
            $stmt = $db->query($query);
            $rates = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $rates
            ]);
        }
    }

    // POST - Create new currency rate
    else if ($method === 'POST') {
        requireAdmin($user);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->rate) || !isset($data->effective_date)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Exchange rate and effective date are required'
            ]);
            exit();
        }

        // If new rate is being set as active, deactivate all existing active rates
        if (isset($data->is_active) && $data->is_active) {
            $deactivateQuery = "UPDATE currency_rates SET is_active = FALSE WHERE is_active = TRUE";
            $deactivateStmt = $db->query($deactivateQuery);
        }

        $query = "INSERT INTO currency_rates (currency_from, currency_to, rate, effective_date, created_by, is_active) 
                  VALUES (:currency_from, :currency_to, :rate, :effective_date, :created_by, :is_active)";
        $stmt = $db->prepare($query);

        $currency_from = 'USD';
        $currency_to = 'GHS';
        $is_active = isset($data->is_active) ? $data->is_active : FALSE;

        $stmt->bindParam(':currency_from', $currency_from);
        $stmt->bindParam(':currency_to', $currency_to);
        $stmt->bindParam(':rate', $data->rate);
        $stmt->bindParam(':effective_date', $data->effective_date);
        $stmt->bindParam(':created_by', $user->user_id);
        $stmt->bindParam(':is_active', $is_active);

        if ($stmt->execute()) {
            $newId = $db->lastInsertId();

            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'CREATE', 'currency_rates', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $newId);
            $logStmt->execute();

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Currency rate created successfully',
                'id' => $newId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create currency rate'
            ]);
        }
    }

    // PUT - Update currency rate (activate/deactivate)
    else if ($method === 'PUT') {
        requireAdmin($user);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Currency rate ID is required'
            ]);
            exit();
        }

        // If setting this rate as active, deactivate all others
        if (isset($data->is_active) && $data->is_active) {
            $deactivateQuery = "UPDATE currency_rates SET is_active = FALSE WHERE is_active = TRUE AND id != :id";
            $deactivateStmt = $db->prepare($deactivateQuery);
            $deactivateStmt->bindParam(':id', $data->id);
            $deactivateStmt->execute();
        }

        $query = "UPDATE currency_rates SET is_active = :is_active WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':is_active', $data->is_active);

        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'UPDATE', 'currency_rates', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Currency rate updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update currency rate'
            ]);
        }
    }

} catch (PDOException $e) {
    ErrorLogger::logDatabaseError($e, $query ?? 'Unknown query', [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'currency-rates/manage'
    ]);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred'
    ]);
} catch (Exception $e) {
    ErrorLogger::logError($e, [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'currency-rates/manage'
    ]);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred'
    ]);
}
?>
