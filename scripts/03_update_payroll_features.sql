-- Add new columns to staffs table
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS salary_currency VARCHAR(10) DEFAULT 'USD' AFTER basic_salary;
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS on_bonded_or_study_leave BOOLEAN DEFAULT FALSE AFTER bonded;

-- Update allowances table to add leave flag
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS allowed_on_leave BOOLEAN DEFAULT TRUE AFTER is_bonded;
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'standard' COMMENT 'standard, fixed, percentage' AFTER allowed_on_leave;

-- Create staff_fixed_allowances table for staff-level editable fixed allowances
CREATE TABLE IF NOT EXISTS staff_fixed_allowances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    allowance_id INT NOT NULL,
    fixed_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (allowance_id) REFERENCES allowances(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_allowance (staff_id, allowance_id)
);

-- Create staff_fixed_deductions table for staff-level fixed deduction amounts
CREATE TABLE IF NOT EXISTS staff_fixed_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    deduction_id INT NOT NULL,
    fixed_amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (deduction_id) REFERENCES deductions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_deduction (staff_id, deduction_id)
);

-- Ensure only one active currency rate at a time
-- Note: Use application logic to enforce this
ALTER TABLE currency_rates MODIFY COLUMN currency_from VARCHAR(10) NOT NULL DEFAULT 'USD';
ALTER TABLE currency_rates MODIFY COLUMN currency_to VARCHAR(10) NOT NULL DEFAULT 'GHS';
