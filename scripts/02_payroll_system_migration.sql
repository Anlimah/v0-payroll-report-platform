-- ============================================================================
-- PAYROLL SYSTEM MIGRATION - UP
-- This migration adds comprehensive payroll processing features:
-- - Dollar rate management with active flag enforcement
-- - Staff salary currency based on employment status
-- - Bonded/study leave functionality
-- - Staff-level allowances and deductions with custom amounts
-- - Exchange rate persistence for historical payroll records
-- ============================================================================

-- Step 1: Add new columns to staffs table for currency and leave management
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS salary_currency ENUM('GHS','USD') NOT NULL DEFAULT 'GHS' AFTER status;
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS on_bonded_or_study_leave TINYINT(1) NOT NULL DEFAULT 0 AFTER salary_currency;

-- Step 2: Update salary_currency based on existing status (permanent = USD, others = GHS)
UPDATE staffs SET salary_currency = 'USD' WHERE status = 'permanent';
UPDATE staffs SET salary_currency = 'GHS' WHERE status != 'permanent';

-- Step 3: Add new columns to allowances table
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS type ENUM('fixed','percent') NOT NULL DEFAULT 'fixed' AFTER is_percentage;
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS allowed_on_leave TINYINT(1) NOT NULL DEFAULT 1 AFTER type;

-- Step 4: Add new columns to deductions table
ALTER TABLE deductions ADD COLUMN IF NOT EXISTS type ENUM('fixed','percent') NOT NULL DEFAULT 'fixed' AFTER is_percentage;

-- Step 5: Create staff_allowances junction table with custom amounts
CREATE TABLE IF NOT EXISTS staff_allowances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    allowance_id INT NOT NULL,
    custom_amount DECIMAL(15,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_staff_allowance (staff_id, allowance_id),
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (allowance_id) REFERENCES allowances(id) ON DELETE CASCADE
);

-- Step 6: Create staff_deductions junction table with custom amounts
CREATE TABLE IF NOT EXISTS staff_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    deduction_id INT NOT NULL,
    custom_amount DECIMAL(15,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_staff_deduction (staff_id, deduction_id),
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (deduction_id) REFERENCES deductions(id) ON DELETE CASCADE
);

-- Step 7: Update dollar_rates table to enforce single active rate
ALTER TABLE currency_rates MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;
CREATE INDEX idx_active_rate ON currency_rates(is_active);

-- Step 8: Add exchange rate and local currency columns to payroll_entries
ALTER TABLE payroll_entries ADD COLUMN IF NOT EXISTS exchange_rate_used DECIMAL(12,6) NULL AFTER currency_rate;
ALTER TABLE payroll_entries ADD COLUMN IF NOT EXISTS basic_salary_local DECIMAL(15,2) NULL AFTER exchange_rate_used;
ALTER TABLE payroll_entries ADD COLUMN IF NOT EXISTS salary_currency ENUM('GHS','USD') NOT NULL DEFAULT 'GHS' AFTER basic_salary_local;

-- Step 9: Create trigger to ensure only one active currency rate
DELIMITER //
CREATE TRIGGER enforce_single_active_rate BEFORE INSERT ON currency_rates
FOR EACH ROW
BEGIN
    IF NEW.is_active = 1 THEN
        UPDATE currency_rates SET is_active = 0 WHERE is_active = 1;
    END IF;
END//
DELIMITER ;

-- Step 10: Migrate existing payroll entries to store exchange rate used
UPDATE payroll_entries 
SET exchange_rate_used = currency_rate, 
    basic_salary_local = basic_salary,
    salary_currency = 'GHS'
WHERE exchange_rate_used IS NULL;

-- ============================================================================
-- EXAMPLE SEED DATA
-- ============================================================================

-- Insert example dollar rate
INSERT INTO currency_rates (currency_from, currency_to, rate, effective_date, is_active, created_by)
VALUES ('USD', 'GHS', 15.50, CURDATE(), 1, 1)
ON DUPLICATE KEY UPDATE is_active = 1;

-- Deactivate old rates (if any)
UPDATE currency_rates SET is_active = 0 WHERE id < LAST_INSERT_ID() AND is_active = 1;

-- Update allowances with new type and leave fields
UPDATE allowances SET type = 'fixed', allowed_on_leave = 1 WHERE is_percentage = 0;
UPDATE allowances SET type = 'percent', allowed_on_leave = 1 WHERE is_percentage = 1;

-- Update deductions with new type field
UPDATE deductions SET type = 'fixed' WHERE is_percentage = 0;
UPDATE deductions SET type = 'percent' WHERE is_percentage = 1;

-- ============================================================================
-- DOWN MIGRATION (Rollback)
-- Uncomment and run to revert these changes
-- ============================================================================

/*
-- Step 1: Drop new tables
DROP TABLE IF EXISTS staff_deductions;
DROP TABLE IF EXISTS staff_allowances;

-- Step 2: Drop trigger
DROP TRIGGER IF EXISTS enforce_single_active_rate;

-- Step 3: Remove columns from payroll_entries
ALTER TABLE payroll_entries DROP COLUMN IF EXISTS salary_currency;
ALTER TABLE payroll_entries DROP COLUMN IF EXISTS basic_salary_local;
ALTER TABLE payroll_entries DROP COLUMN IF EXISTS exchange_rate_used;

-- Step 4: Remove columns from allowances
ALTER TABLE allowances DROP COLUMN IF EXISTS allowed_on_leave;
ALTER TABLE allowances DROP COLUMN IF EXISTS type;

-- Step 5: Remove columns from deductions
ALTER TABLE deductions DROP COLUMN IF EXISTS type;

-- Step 6: Remove columns from staffs
ALTER TABLE staffs DROP COLUMN IF EXISTS on_bonded_or_study_leave;
ALTER TABLE staffs DROP COLUMN IF EXISTS salary_currency;

-- Step 7: Drop index
DROP INDEX idx_active_rate ON currency_rates;
*/
