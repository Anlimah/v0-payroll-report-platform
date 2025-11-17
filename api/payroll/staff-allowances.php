<?php
// API for managing staff-level allowances with custom amounts
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

    // GET - Fetch allowances for a staff
    if ($method === 'GET') {
        if (!isset($_GET['staff_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'staff_id is required']);
            exit();
        }

        $staffId = $_GET['staff_id'];
        $onLeave = isset($_GET['on_leave']) ? $_GET['on_leave'] : null;

        // Get staff info to check leave status if not provided
        if ($onLeave === null) {
            $staffQuery = "SELECT on_bonded_or_study_leave FROM staffs WHERE id = :id";
            $staffStmt = $db->prepare($staffQuery);
            $staffStmt->bindParam(':id', $staffId);
            $staffStmt->execute();
            $staff = $staffStmt->fetch();
            $onLeave = $staff['on_bonded_or_study_leave'] ?? 0;
        }

        $query = "SELECT 
                    a.id,
                    a.allowance_name,
                    a.type,
                    a.default_amount,
                    a.allowed_on_leave,
                    COALESCE(sa.custom_amount, a.default_amount) as custom_amount,
                    CASE WHEN sa.staff_id IS NOT NULL THEN 1 ELSE 0 END as is_assigned,
                    CASE WHEN :on_leave = 1 AND a.allowed_on_leave = 0 THEN 1 ELSE 0 END as is_disabled_on_leave
                  FROM allowances a
                  LEFT JOIN staff_allowances sa ON a.id = sa.allowance_id AND sa.staff_id = :staff_id
                  WHERE a.is_archived = 0
                  ORDER BY a.allowance_name";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':staff_id', $staffId, PDO::PARAM_INT);
        $stmt->bindParam(':on_leave', $onLeave, PDO::PARAM_INT);
        $stmt->execute();
        
        $allowances = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $allowances,
            'on_leave' => $onLeave
        ]);
    }

    // POST - Add allowance to staff
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->staff_id) || !isset($data->allowance_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'staff_id and allowance_id are required']);
            exit();
        }

        $customAmount = isset($data->custom_amount) ? $data->custom_amount : null;
        
        $query = "INSERT INTO staff_allowances (staff_id, allowance_id, custom_amount)
                  VALUES (:staff_id, :allowance_id, :custom_amount)
                  ON DUPLICATE KEY UPDATE custom_amount = :custom_amount";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':staff_id', $data->staff_id);
        $stmt->bindParam(':allowance_id', $data->allowance_id);
        $stmt->bindParam(':custom_amount', $customAmount);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Allowance assigned to staff']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to assign allowance']);
        }
    }

    // DELETE - Remove allowance from staff
    else if ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->staff_id) || !isset($data->allowance_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'staff_id and allowance_id are required']);
            exit();
        }

        $query = "DELETE FROM staff_allowances WHERE staff_id = :staff_id AND allowance_id = :allowance_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':staff_id', $data->staff_id);
        $stmt->bindParam(':allowance_id', $data->allowance_id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Allowance removed from staff']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to remove allowance']);
        }
    }
} catch (Exception $e) {
    ErrorLogger::logError($e, ['endpoint' => 'payroll/staff-allowances', 'method' => $_SERVER['REQUEST_METHOD']]);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred']);
}
?>
