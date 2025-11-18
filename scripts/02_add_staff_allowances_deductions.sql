-- Create staff_allowances table
CREATE TABLE IF NOT EXISTS staff_allowances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    allowance_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (allowance_id) REFERENCES allowances(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_allowance (staff_id, allowance_id)
);
ALTER TABLE staff_allowances ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2) DEFAULT 0.00 AFTER allowance_id;
ALTER TABLE staff_allowances ADD COLUMN IF NOT EXISTS is_percentage BOOLEAN DEFAULT 0 AFTER allowance_id;

-- Create staff_deductions table
CREATE TABLE IF NOT EXISTS staff_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    deduction_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (deduction_id) REFERENCES deductions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_deduction (staff_id, deduction_id)
);
ALTER TABLE staff_deductions ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2) DEFAULT 0.00 AFTER deduction_id;
ALTER TABLE staff_deductions ADD COLUMN IF NOT EXISTS is_percentage BOOLEAN DEFAULT 0 AFTER deduction_id;
