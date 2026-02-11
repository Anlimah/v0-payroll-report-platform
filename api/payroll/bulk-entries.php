<?php
header('Content-Type: application/json');

include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../middleware/auth.php';
include_once '../config/error-logger.php';

try {
    // Authenticate user
    $user = authenticate();
    requireAdmin($user);

    $database = new Database();
    $db = $database->getConnection();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    // Get request body
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['payroll_period_id']) || !isset($input['entries'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    $payrollPeriodId = (int)$input['payroll_period_id'];
    $entries = $input['entries'];

    if (!is_array($entries) || count($entries) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Entries array is empty']);
        exit;
    }

    $results = [];
    $successCount = 0;
    $failureCount = 0;

    // Begin transaction
    $db->beginTransaction();

    foreach ($entries as $entry) {
        try {
            // Validate required fields
            if (!isset($entry['staff_id']) || !isset($entry['basic_salary'])) {
                $results[] = [
                    'staff_id' => $entry['staff_id'] ?? 'unknown',
                    'success' => false,
                    'error' => 'Missing required fields'
                ];
                $failureCount++;
                continue;
            }

            $staffId = (int)$entry['staff_id'];
            $basicSalary = (float)$entry['basic_salary'];

            // Validate basic salary
            if ($basicSalary < 0) {
                $results[] = [
                    'staff_id' => $staffId,
                    'success' => false,
                    'error' => 'Invalid basic salary value'
                ];
                $failureCount++;
                continue;
            }

            // Verify staff exists
            $staffCheck = $db->prepare("SELECT id FROM staffs WHERE id = :id");
            $staffCheck->execute([':id' => $staffId]);
            if (!$staffCheck->fetch()) {
                $results[] = [
                    'staff_id' => $staffId,
                    'success' => false,
                    'error' => 'Staff member not found'
                ];
                $failureCount++;
                continue;
            }

            // Process allowances and deductions
            $allowances = isset($entry['allowances']) ? (array)$entry['allowances'] : [];
            $deductions = isset($entry['deductions']) ? (array)$entry['deductions'] : [];

            $totalAllowances = 0;
            $totalDeductions = 0;

            // Calculate totals
            foreach ($allowances as $allowance) {
                if (isset($allowance['is_percentage']) && $allowance['is_percentage']) {
                    $totalAllowances += ($basicSalary * ($allowance['percentage_value'] ?? 0)) / 100;
                } else {
                    $totalAllowances += (float)($allowance['amount'] ?? 0);
                }
            }

            foreach ($deductions as $deduction) {
                if (isset($deduction['is_percentage']) && $deduction['is_percentage']) {
                    $totalDeductions += ($basicSalary * ($deduction['percentage_value'] ?? 0)) / 100;
                } else {
                    $totalDeductions += (float)($deduction['amount'] ?? 0);
                }
            }

            $grossSalary = $basicSalary + $totalAllowances;
            $netSalary = $grossSalary - $totalDeductions;

            // Check if entry already exists
            $existingCheck = $db->prepare("
                SELECT id FROM payroll_entries 
                WHERE payroll_period_id = :period_id AND staff_id = :staff_id
            ");
            $existingCheck->execute([
                ':period_id' => $payrollPeriodId,
                ':staff_id' => $staffId
            ]);
            $existing = $existingCheck->fetch();

            if ($existing) {
                // Update existing entry
                $updateStmt = $db->prepare("
                    UPDATE payroll_entries 
                    SET basic_salary = :basic_salary,
                        total_allowances = :total_allowances,
                        total_deductions = :total_deductions,
                        gross_salary = :gross_salary,
                        net_salary = :net_salary,
                        updated_by = :updated_by,
                        updated_at = NOW()
                    WHERE id = :id
                ");
                $updateStmt->execute([
                    ':basic_salary' => $basicSalary,
                    ':total_allowances' => $totalAllowances,
                    ':total_deductions' => $totalDeductions,
                    ':gross_salary' => $grossSalary,
                    ':net_salary' => $netSalary,
                    ':updated_by' => $user->user_id,
                    ':id' => $existing['id']
                ]);
                $entryId = $existing['id'];
            } else {
                // Create new entry
                $insertStmt = $db->prepare("
                    INSERT INTO payroll_entries (
                        payroll_period_id, staff_id, basic_salary,
                        total_allowances, total_deductions,
                        gross_salary, net_salary, created_by
                    ) VALUES (
                        :payroll_period_id, :staff_id, :basic_salary,
                        :total_allowances, :total_deductions,
                        :gross_salary, :net_salary, :created_by
                    )
                ");
                $insertStmt->execute([
                    ':payroll_period_id' => $payrollPeriodId,
                    ':staff_id' => $staffId,
                    ':basic_salary' => $basicSalary,
                    ':total_allowances' => $totalAllowances,
                    ':total_deductions' => $totalDeductions,
                    ':gross_salary' => $grossSalary,
                    ':net_salary' => $netSalary,
                    ':created_by' => $user->user_id
                ]);
                $entryId = (int)$db->lastInsertId();
            }

            $results[] = [
                'staff_id' => $staffId,
                'success' => true,
                'entry_id' => $entryId,
                'gross_salary' => $grossSalary,
                'net_salary' => $netSalary
            ];
            $successCount++;

        } catch (Exception $e) {
            ErrorLogger::logError($e, ['bulk_entry_staff_id' => $entry['staff_id'] ?? 'unknown']);
            $results[] = [
                'staff_id' => $entry['staff_id'] ?? 'unknown',
                'success' => false,
                'error' => 'Database error occurred'
            ];
            $failureCount++;
        }
    }

    // Commit transaction
    $db->commit();

    echo json_encode([
        'success' => $successCount > 0,
        'message' => "Processed " . count($entries) . " entries: " . $successCount . " successful, " . $failureCount . " failed",
        'data' => [
            'successCount' => $successCount,
            'failureCount' => $failureCount,
            'totalCount' => count($entries),
            'results' => $results
        ]
    ]);

} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    ErrorLogger::logError($e, ['endpoint' => 'payroll/bulk-entries']);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
?>
