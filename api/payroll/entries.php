<?php
header('Content-Type: application/json');

include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../middleware/auth.php';
include_once '../config/error-logger.php';

try {
    // 🔐 Authenticate user
    $user = authenticate();
    requireAdmin($user);

    $database = new Database();
    $db = $database->getConnection();

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    // 📥 Inputs
    $departmentId = $_GET['department_id'] ?? null;
    $month  = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('n');
    $year   = isset($_GET['year'])  ? (int)$_GET['year']  : (int)date('Y');
    $limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    /**
     * 1️⃣ Get or create payroll period
     */
    $stmt = $db->prepare("
        SELECT id 
        FROM payroll_periods 
        WHERE month = :month AND year = :year
        LIMIT 1
    ");
    $stmt->execute([
        ':month' => $month,
        ':year'  => $year
    ]);
    $period = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($period) {
        $payrollPeriodId = (int)$period['id'];
    } else {
        $stmt = $db->prepare("
            INSERT INTO payroll_periods (month, year, status, created_by)
            VALUES (:month, :year, 'draft', :created_by)
        ");
        $stmt->execute([
            ':month' => $month,
            ':year'  => $year,
            ':created_by' => $user->user_id
        ]);
        $payrollPeriodId = (int)$db->lastInsertId();
    }

    /**
     * 2️⃣ Fetch staff + payroll entry (if exists)
     */
$sql = "
    SELECT 
    s.id,
    s.staff_number,
    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
    s.basic_salary,
    s.salary_currency,
    s.on_bonded_or_study_leave,
    d.department_name,
    des.designation_name,

    pe.id AS payroll_entry_id,
    COALESCE(pe.gross_salary, s.basic_salary) AS gross_salary,
    COALESCE(pe.total_allowances, 0) AS total_allowances,
    COALESCE(pe.total_deductions, 0) AS total_deductions,
    COALESCE(pe.net_salary, s.basic_salary) AS net_salary

FROM staffs s
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN designations des ON s.designation_id = des.id
LEFT JOIN payroll_entries pe
    ON pe.staff_id = s.id
    AND pe.payroll_period_id = :payroll_period_id

WHERE s.is_archived = 0
AND (
    YEAR(s.hire_date) < :year
    OR (YEAR(s.hire_date) = :year AND MONTH(s.hire_date) <= :month)
)

";

if ($departmentId) {
    $sql .= " AND s.department_id = :department_id ";
}

$sql .= "
    ORDER BY s.last_name, s.first_name
    LIMIT :limit OFFSET :offset
";

$stmt = $db->prepare($sql);
$stmt->bindValue(':payroll_period_id', $payrollPeriodId, PDO::PARAM_INT);
$stmt->bindValue(':year', $year, PDO::PARAM_INT);
$stmt->bindValue(':month', $month, PDO::PARAM_INT);

if ($departmentId) {
    $stmt->bindValue(':department_id', $departmentId, PDO::PARAM_INT);
}

$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();


    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /**
     * 3️⃣ Total count (for pagination)
     */
    $countSql = "SELECT COUNT(*) FROM staffs WHERE is_archived = 0";
    if ($departmentId) {
        $countSql .= " AND department_id = :department_id";
    }

    $countStmt = $db->prepare($countSql);
    if ($departmentId) {
        $countStmt->bindValue(':department_id', $departmentId, PDO::PARAM_INT);
    }
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();

    /**
     * 4️⃣ Mark processed staff
     */
    foreach ($employees as &$emp) {
    $basic = (float)$emp['basic_salary'];

    $emp['total_allowances'] = $emp['total_allowances'] !== null
        ? (float)$emp['total_allowances']
        : 0.00;

    $emp['total_deductions'] = $emp['total_deductions'] !== null
        ? (float)$emp['total_deductions']
        : 0.00;

    $emp['net_salary'] = $emp['net_salary'] !== null
        ? (float)$emp['net_salary']
        : ($basic + $emp['total_allowances'] - $emp['total_deductions']);

    $emp['processed'] = !empty($emp['payroll_entry_id']);
}

    /**
     * 5️⃣ Response
     */
    echo json_encode([
        'success' => true,
        'payroll_period_id' => $payrollPeriodId,
        'data' => $employees,
        'pagination' => [
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]
    ]);

} catch (Throwable $e) {
    ErrorLogger::logError($e, ['endpoint' => 'payroll/list-by-department']);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
