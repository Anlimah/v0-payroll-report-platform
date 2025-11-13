<?php
// API endpoint to list employees by department for payroll processing
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../middleware/auth.php';
include_once '../config/error-logger.php';

try {
    $user = authenticate();
    requireAdmin($user);

    $database = new Database();
    $db = $database->getConnection();

    // GET - List employees by department
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $departmentId = isset($_GET['department_id']) ? $_GET['department_id'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $query = "SELECT s.id, s.staff_number, s.first_name, s.last_name, 
                  s.basic_salary, s.salary_currency, 
                  d.department_name, des.designation_name
                  FROM staffs s
                  LEFT JOIN departments d ON s.department_id = d.id
                  LEFT JOIN designations des ON s.designation_id = des.id
                  WHERE s.is_archived = 0";
        
        $countQuery = "SELECT COUNT(*) as total FROM staffs WHERE is_archived = 0";

        if ($departmentId) {
            $query .= " AND s.department_id = :department_id";
            $countQuery .= " AND department_id = :department_id";
        }

        $query .= " ORDER BY s.last_name, s.first_name LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);
        if ($departmentId) {
            $stmt->bindParam(':department_id', $departmentId);
        }
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $employees = $stmt->fetchAll();

        // Get total count
        $countStmt = $db->prepare($countQuery);
        if ($departmentId) {
            $countStmt->bindParam(':department_id', $departmentId);
        }
        $countStmt->execute();
        $total = $countStmt->fetch()['total'];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $employees,
            'pagination' => [
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset
            ]
        ]);
    }
} catch (Exception $e) {
    ErrorLogger::logError($e, ['endpoint' => 'payroll/list-by-department']);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred']);
}
?>
