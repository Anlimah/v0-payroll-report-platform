-- Create staff_allowances table for staff-specific allowance configuration
DROP TABLE IF EXISTS staff_allowances;
CREATE TABLE IF NOT EXISTS staff_allowances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    allowance_id INT NOT NULL,
    is_percentage BOOLEAN DEFAULT FALSE,
    amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (allowance_id) REFERENCES allowances(id),
    UNIQUE KEY unique_staff_allowance (staff_id, allowance_id)
);

-- Create staff_deductions table for staff-specific deduction configuration
DROP TABLE IF EXISTS staff_deductions;
CREATE TABLE IF NOT EXISTS staff_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    deduction_id INT NOT NULL,
    is_percentage BOOLEAN DEFAULT FALSE,
    amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (deduction_id) REFERENCES deductions(id),
    UNIQUE KEY unique_staff_deduction (staff_id, deduction_id)
);
