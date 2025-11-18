// ... existing code ...

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
                // <CHANGE> Updated to include all allowance data needed for frontend
                $allowancesQuery = "SELECT a.id, a.allowance_name, a.allowance_code, a.type, a.is_bonded, a.default_amount, a.is_percentage, sa.amount, sa.is_percentage as staff_is_percentage 
                                   FROM allowances a
                                   INNER JOIN staff_allowances sa ON a.id = sa.allowance_id
                                   WHERE sa.staff_id = :staff_id AND a.is_archived = 0";
                $allowancesStmt = $db->prepare($allowancesQuery);
                $allowancesStmt->bindParam(':staff_id', $data['id']);
                $allowancesStmt->execute();
                $data['allowances'] = $allowancesStmt->fetchAll();

                // <CHANGE> Updated to include all deduction data needed for frontend
                $deductionsQuery = "SELECT d.id, d.deduction_name, d.deduction_code, d.type, d.default_amount, d.is_percentage, sd.amount, sd.is_percentage as staff_is_percentage 
                                   FROM deductions d
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
                // <CHANGE> Updated to include all allowance data needed for frontend
                $allowancesQuery = "SELECT a.id, a.allowance_name, a.allowance_code, a.type, a.is_bonded, a.default_amount, a.is_percentage, sa.amount, sa.is_percentage as staff_is_percentage 
                                   FROM allowances a
                                   INNER JOIN staff_allowances sa ON a.id = sa.allowance_id
                                   WHERE sa.staff_id = :staff_id AND a.is_archived = 0";
                $allowancesStmt = $db->prepare($allowancesQuery);
                $allowancesStmt->bindParam(':staff_id', $data['id']);
                $allowancesStmt->execute();
                $data['allowances'] = $allowancesStmt->fetchAll();

                // <CHANGE> Updated to include all deduction data needed for frontend
                $deductionsQuery = "SELECT d.id, d.deduction_name, d.deduction_code, d.type, d.default_amount, d.is_percentage, sd.amount, sd.is_percentage as staff_is_percentage 
                                   FROM deductions d
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
            // ... existing code ...
        }
    }
