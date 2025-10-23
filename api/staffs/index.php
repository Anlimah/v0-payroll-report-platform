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

    // GET - List all staffs or get by staff number
    if ($method === 'GET') {
        if (isset($_GET['staff_number'])) {
            $query = "SELECT s.*, d.department_name, des.designation_name 
                      FROM staffs s
                      LEFT JOIN departments d ON s.department_id = d.id
                      LEFT JOIN designations des ON s.designation_id = des.id
                      WHERE s.staff_number = :staff_number";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':staff_number', $_GET['staff_number']);
            $stmt->execute();

            $data = $stmt->fetch();

            if ($data) {
                $allowancesQuery = "SELECT a.* FROM allowances a
                                   INNER JOIN staff_allowances sa ON a.id = sa.allowance_id
                                   WHERE sa.staff_id = :staff_id AND a.is_archived = 0";
                $allowancesStmt = $db->prepare($allowancesQuery);
                $allowancesStmt->bindParam(':staff_id', $data['id']);
                $allowancesStmt->execute();
                $data['allowances'] = $allowancesStmt->fetchAll();

                $deductionsQuery = "SELECT d.* FROM deductions d
                                   INNER JOIN staff_deductions sd ON d.id = sd.deduction_id
                                   WHERE sd.staff_id = :staff_id AND d.is_archived = 0";
                $deductionsStmt = $db->prepare($deductionsQuery);
                $deductionsStmt->bindParam(':staff_id', $data['id']);
                $deductionsStmt->execute();
                $data['deductions'] = $deductionsStmt->fetchAll();
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
        } else if (isset($_GET['id'])) {
            $query = "SELECT s.*, d.department_name, des.designation_name 
                      FROM staffs s
                      LEFT JOIN departments d ON s.department_id = d.id
                      LEFT JOIN designations des ON s.designation_id = des.id
                      WHERE s.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $_GET['id']);
            $stmt->execute();

            $data = $stmt->fetch();

            if ($data) {
                $allowancesQuery = "SELECT a.* FROM allowances a
                                   INNER JOIN staff_allowances sa ON a.id = sa.allowance_id
                                   WHERE sa.staff_id = :staff_id AND a.is_archived = 0";
                $allowancesStmt = $db->prepare($allowancesQuery);
                $allowancesStmt->bindParam(':staff_id', $data['id']);
                $allowancesStmt->execute();
                $data['allowances'] = $allowancesStmt->fetchAll();

                $deductionsQuery = "SELECT d.* FROM deductions d
                                   INNER JOIN staff_deductions sd ON d.id = sd.deduction_id
                                   WHERE sd.staff_id = :staff_id AND d.is_archived = 0";
                $deductionsStmt = $db->prepare($deductionsQuery);
                $deductionsStmt->bindParam(':staff_id', $data['id']);
                $deductionsStmt->execute();
                $data['deductions'] = $deductionsStmt->fetchAll();
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
        } else {
            $includeArchived = isset($_GET['include_archived']) ? $_GET['include_archived'] : false;

            if ($includeArchived) {
                $query = "SELECT s.*, d.department_name, des.designation_name 
                          FROM staffs s
                          LEFT JOIN departments d ON s.department_id = d.id
                          LEFT JOIN designations des ON s.designation_id = des.id
                          ORDER BY s.last_name, s.first_name";
            } else {
                $query = "SELECT s.*, d.department_name, des.designation_name 
                          FROM staffs s
                          LEFT JOIN departments d ON s.department_id = d.id
                          LEFT JOIN designations des ON s.designation_id = des.id
                          WHERE s.is_archived = 0
                          ORDER BY s.last_name, s.first_name";
            }

            $stmt = $db->query($query);
            $staffs = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $staffs
            ]);
        }
    }

    // POST - Create new staff
    else if ($method === 'POST') {
        requireAdmin($user);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->staff_number) || !isset($data->first_name) || !isset($data->last_name)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Staff number, first name, and last name are required'
            ]);
            exit();
        }

        $query = "INSERT INTO staffs (`staff_number`, `first_name`, `last_name`, `other_names`, `ssnit`, `ghana_card`, 
                  `department_id`, `designation_id`, `status` , `bank_name`, `account_number`, `basic_salary`, `hire_date`) 
                  VALUES (:staff_number, :first_name, :last_name, :other_names, :ssnit, :ghanacard, 
                  :department_id, :designation_id, :status, :bank_name, :account_number, :basic_salary, :hire_date)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':staff_number', $data->staff_number);
        $stmt->bindParam(':first_name', $data->first_name);
        $stmt->bindParam(':last_name', $data->last_name);
        $stmt->bindParam(':other_names', $data->other_names);
        $stmt->bindParam(':ssnit', $data->ssnit);
        $stmt->bindParam(':ghanacard', $data->ghanacard);
        $stmt->bindParam(':department_id', $data->department_id);
        $stmt->bindParam(':designation_id', $data->designation_id);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':bank_name', $data->bank_name);
        $stmt->bindParam(':account_number', $data->account_number);
        $stmt->bindParam(':basic_salary', $data->basic_salary);
        $stmt->bindParam(':hire_date', $data->hire_date);

        if ($stmt->execute()) {
            $staffId = $db->lastInsertId();

            if (isset($data->allowances) && is_array($data->allowances)) {
                $allowanceQuery = "INSERT INTO staff_allowances (staff_id, allowance_id) VALUES (:staff_id, :allowance_id)";
                $allowanceStmt = $db->prepare($allowanceQuery);
                foreach ($data->allowances as $allowanceId) {
                    $allowanceStmt->bindParam(':staff_id', $staffId);
                    $allowanceStmt->bindParam(':allowance_id', $allowanceId);
                    $allowanceStmt->execute();
                }
            }

            if (isset($data->deductions) && is_array($data->deductions)) {
                $deductionQuery = "INSERT INTO staff_deductions (staff_id, deduction_id) VALUES (:staff_id, :deduction_id)";
                $deductionStmt = $db->prepare($deductionQuery);
                foreach ($data->deductions as $deductionId) {
                    $deductionStmt->bindParam(':staff_id', $staffId);
                    $deductionStmt->bindParam(':deduction_id', $deductionId);
                    $deductionStmt->execute();
                }
            }

            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'CREATE', 'staffs', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $staffId);
            $logStmt->execute();

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Staff created successfully',
                'id' => $staffId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create staff'
            ]);
        }
    }

    // PUT - Update staff
    else if ($method === 'PUT') {
        requireAdmin($user);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Staff ID is required'
            ]);
            exit();
        }

        if (isset($data->is_archived)) {
            $query = "UPDATE staffs SET is_archived = :is_archived WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':is_archived', $data->is_archived);
            $action = $data->is_archived ? 'ARCHIVE' : 'RESTORE';
        } else {
            $query = "UPDATE `staffs` SET 
                      `staff_number` = :staff_number,
                      `first_name` = :first_name,
                      `last_name` = :last_name,
                      `other_names` = :other_names,
                      `ssnit` = :ssnit,
                      `ghana_card` = :ghanacard,
                      `department_id` = :department_id,
                      `designation_id` = :designation_id,
                      `status` = :status,
                      `bank_name` = :bank_name,
                      `account_number` = :account_number,
                      `basic_salary` = :basic_salary,
                      `hire_date` = :hire_date
                      WHERE id = :id";

            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':staff_number', $data->staff_number);
            $stmt->bindParam(':first_name', $data->first_name);
            $stmt->bindParam(':last_name', $data->last_name);
            $stmt->bindParam(':other_names', $data->other_names);
            $stmt->bindParam(':ssnit', $data->ssnit);
            $stmt->bindParam(':ghanacard', $data->ghanacard);
            $stmt->bindParam(':department_id', $data->department_id);
            $stmt->bindParam(':designation_id', $data->designation_id);
            $stmt->bindParam(':status', $data->status);
            $stmt->bindParam(':bank_name', $data->bank_name);
            $stmt->bindParam(':account_number', $data->account_number);
            $stmt->bindParam(':basic_salary', $data->basic_salary);
            $stmt->bindParam(':hire_date', $data->hire_date);
            $action = 'UPDATE';

            if (isset($data->allowances)) {
                $deleteAllowanceQuery = "DELETE FROM staff_allowances WHERE staff_id = :staff_id";
                $deleteAllowanceStmt = $db->prepare($deleteAllowanceQuery);
                $deleteAllowanceStmt->bindParam(':staff_id', $data->id);
                $deleteAllowanceStmt->execute();

                if (is_array($data->allowances) && count($data->allowances) > 0) {
                    $allowanceQuery = "INSERT INTO staff_allowances (staff_id, allowance_id) VALUES (:staff_id, :allowance_id)";
                    $allowanceStmt = $db->prepare($allowanceQuery);
                    foreach ($data->allowances as $allowanceId) {
                        $allowanceStmt->bindParam(':staff_id', $data->id);
                        $allowanceStmt->bindParam(':allowance_id', $allowanceId);
                        $allowanceStmt->execute();
                    }
                }
            }

            if (isset($data->deductions)) {
                $deleteDeductionQuery = "DELETE FROM staff_deductions WHERE staff_id = :staff_id";
                $deleteDeductionStmt = $db->prepare($deleteDeductionQuery);
                $deleteDeductionStmt->bindParam(':staff_id', $data->id);
                $deleteDeductionStmt->execute();

                if (is_array($data->deductions) && count($data->deductions) > 0) {
                    $deductionQuery = "INSERT INTO staff_deductions (staff_id, deduction_id) VALUES (:staff_id, :deduction_id)";
                    $deductionStmt = $db->prepare($deductionQuery);
                    foreach ($data->deductions as $deductionId) {
                        $deductionStmt->bindParam(':staff_id', $data->id);
                        $deductionStmt->bindParam(':deduction_id', $deductionId);
                        $deductionStmt->execute();
                    }
                }
            }
        }

        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, :action, 'staffs', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':action', $action);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Staff updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update staff'
            ]);
        }
    }

    // DELETE - Delete staff
    else if ($method === 'DELETE') {
        requireAdmin($user);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Staff ID is required'
            ]);
            exit();
        }

        $query = "DELETE FROM staffs WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);

        if ($stmt->execute()) {
            $logQuery = "INSERT INTO audit_logs (user_id, action, table_name, record_id) 
                         VALUES (:user_id, 'DELETE', 'staffs', :record_id)";
            $logStmt = $db->prepare($logQuery);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->bindParam(':record_id', $data->id);
            $logStmt->execute();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Staff deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete staff'
            ]);
        }
    }
} catch (PDOException $e) {
    ErrorLogger::logDatabaseError($e, $query ?? 'Unknown query', [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'staffs',
        'staff_number' => $_GET['staff_number'] ?? 'N/A'
    ]);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred - ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    ErrorLogger::logError($e, [
        'method' => $method ?? 'Unknown',
        'endpoint' => 'staffs'
    ]);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred'
    ]);
}
