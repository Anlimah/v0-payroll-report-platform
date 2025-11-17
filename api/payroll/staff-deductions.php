<?php
// API for managing staff-level deductions with custom amounts
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../middleware/auth.php';
include_once '../config/error-logger.php';

try {
    $user = authenticate();
    requireAdmin($user);

    $database = new Database();
    $db = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    // GET - Fetch deductions for a staff
    if ($method === 'GET') {
        if (!isset($_GET['staff_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'staff_id is required']);
            exit();
        }

        $query = "SELECT 
                    d.id,
                    d.deduction_name,
                    d.type,
                    d.default_amount,
                    COALESCE(sd.custom_amount, d.default_amount) as custom_amount,
                    CASE WHEN sd.staff_id IS NOT NULL THEN 1 ELSE 0 END as is_assigned
                  FROM deductions d
                  LEFT JOIN staff_deductions sd ON d.id = sd.deduction_id AND sd.staff_id = :staff_id
                  WHERE d.is_archived = 0
                  ORDER BY d.deduction_name";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':staff_id', $_GET['staff_id']);
        $stmt->execute();
        
        $deductions = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $deductions]);
    }

    // POST - Add deduction to staff
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->staff_id) || !isset($data->deduction_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'staff_id and deduction_id are required']);
            exit();
        }

        $customAmount = isset($data->custom_amount) ? $data->custom_amount : null;
        
        $query = "INSERT INTO staff_deductions (staff_id, deduction_id, custom_amount)
                  VALUES (:staff_id, :deduction_id, :custom_amount)
                  ON DUPLICATE KEY UPDATE custom_amount = :custom_amount";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':staff_id', $data->staff_id);
        $stmt->bindParam(':deduction_id', $data->deduction_id);
        $stmt->bindParam(':custom_amount', $customAmount);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Deduction assigned to staff']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to assign deduction']);
        }
    }

    // DELETE - Remove deduction from staff
    else if ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->staff_id) || !isset($data->deduction_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'staff_id and deduction_id are required']);
            exit();
        }

        $query = "DELETE FROM staff_deductions WHERE staff_id = :staff_id AND deduction_id = :deduction_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':staff_id', $data->staff_id);
        $stmt->bindParam(':deduction_id', $data->deduction_id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Deduction removed from staff']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to remove deduction']);
        }
    }
} catch (Exception $e) {
    ErrorLogger::logError($e, ['endpoint' => 'payroll/staff-deductions', 'method' => $_SERVER['REQUEST_METHOD']]);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred']);
}
?>
