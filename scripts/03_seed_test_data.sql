-- ============================================================================
-- SEED DATA FOR TESTING PAYROLL SYSTEM
-- This script populates sample data for testing the payroll features
-- ============================================================================

-- Insert sample allowances with types
INSERT IGNORE INTO allowances (allowance_code, allowance_name, type, default_amount, allowed_on_leave, is_percentage) VALUES
('BASIC_BONUS', 'Basic Bonus', 'fixed', 500.00, 1, 0),
('HOUSING', 'Housing Allowance', 'fixed', 300.00, 1, 0),
('TRANSPORT', 'Transport Allowance', 'fixed', 150.00, 0, 0),
('HEALTH', 'Health Allowance', 'fixed', 100.00, 1, 0),
('PERFORMANCE', 'Performance Bonus', 'percent', 10.00, 0, 1),
('OVERTIME', 'Overtime', 'percent', 5.00, 0, 1);

-- Insert sample deductions with types
INSERT IGNORE INTO deductions (deduction_code, deduction_name, type, default_amount, is_percentage) VALUES
('INCOME_TAX', 'Income Tax', 'percent', 5.00, 1),
('NHIS', 'NHIS Contribution', 'percent', 2.50, 1),
('PENSION', 'Pension Fund', 'fixed', 100.00, 0),
('LOAN', 'Loan Deduction', 'fixed', 200.00, 0);

-- Insert sample staff with different currencies
INSERT IGNORE INTO staffs (staff_number, first_name, last_name, other_names, ssnit, ghana_card, 
                          department_id, designation_id, status, salary_currency, basic_salary, 
                          on_bonded_or_study_leave, bank_name, account_number, hire_date) 
VALUES 
('PERM001', 'James', 'Mensah', 'Kwesi', '0001234567', 'GHA-0001-2020-00001', 1, 1, 'permanent', 'USD', 2500.00, 0, 'GCB Bank', '1234567890', '2020-01-15'),
('PERM002', 'Ama', 'Boateng', 'Abena', '0002234567', 'GHA-0002-2020-00002', 1, 2, 'permanent', 'USD', 2200.00, 0, 'GCB Bank', '1234567891', '2020-06-01'),
('CONT001', 'Kwame', 'Owusu', 'Ahmed', '0003234567', 'GHA-0003-2021-00003', 2, 3, 'contract', 'GHS', 1500.00, 0, 'Zenith Bank', '9876543210', '2022-01-01'),
('CONT002', 'Abena', 'Asante', 'Mary', '0004234567', 'GHA-0004-2021-00004', 2, 4, 'contract', 'GHS', 1200.00, 1, 'Zenith Bank', '9876543211', '2022-03-15');

-- Assign allowances to staff
INSERT IGNORE INTO staff_allowances (staff_id, allowance_id) 
SELECT s.id, a.id FROM staffs s, allowances a 
WHERE s.staff_number IN ('PERM001', 'PERM002', 'CONT001', 'CONT002') 
AND a.allowance_code IN ('BASIC_BONUS', 'HOUSING', 'HEALTH')
ON DUPLICATE KEY UPDATE staff_id=staff_id;

-- Assign deductions to staff
INSERT IGNORE INTO staff_deductions (staff_id, deduction_id)
SELECT s.id, d.id FROM staffs s, deductions d
WHERE s.staff_number IN ('PERM001', 'PERM002', 'CONT001', 'CONT002')
AND d.deduction_code IN ('INCOME_TAX', 'NHIS', 'PENSION')
ON DUPLICATE KEY UPDATE staff_id=staff_id;

-- Set active currency rate
INSERT INTO currency_rates (currency_from, currency_to, rate, effective_date, is_active, created_by)
VALUES ('USD', 'GHS', 15.50, CURDATE(), 1, 1)
ON DUPLICATE KEY UPDATE is_active = 1;
