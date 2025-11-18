-- Create database tables for payroll management system

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role ENUM('admin', 'view') NOT NULL DEFAULT 'view',
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(50) UNIQUE NOT NULL,
    department_name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Designations table
CREATE TABLE IF NOT EXISTS designations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    designation_code VARCHAR(50) UNIQUE NOT NULL,
    designation_name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Staffs table
CREATE TABLE IF NOT EXISTS staffs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    other_names VARCHAR(100),
    ssnit VARCHAR(20) UNIQUE,
    ghana_card VARCHAR(20) UNIQUE,
    department_id INT,
    designation_id INT,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    basic_salary DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status ENUM('permanent', 'contract') DEFAULT 'permanent',
    bonded BOOLEAN DEFAULT FALSE,
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (designation_id) REFERENCES designations(id)
);

ALTER TABLE staffs ADD COLUMN IF NOT EXISTS `salary_currency` VARCHAR(3) DEFAULT 'GHS' AFTER `basic_salary`;

-- Allowances table
CREATE TABLE IF NOT EXISTS allowances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    allowance_code VARCHAR(50) UNIQUE NOT NULL,
    allowance_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_percentage BOOLEAN DEFAULT FALSE,
    default_amount DECIMAL(15, 2) DEFAULT 0.00,
    is_bonded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE
);

ALTER TABLE allowances ADD COLUMN IF NOT EXISTS is_bonded BOOLEAN DEFAULT FALSE AFTER default_amount;
-- Update allowances table to add leave flag
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS allowed_on_leave BOOLEAN DEFAULT TRUE AFTER is_bonded;

-- Deductions table
CREATE TABLE IF NOT EXISTS deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deduction_code VARCHAR(50) UNIQUE NOT NULL,
    deduction_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_percentage BOOLEAN DEFAULT FALSE,
    default_amount DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Currency rates table
CREATE TABLE IF NOT EXISTS currency_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    currency_from VARCHAR(10) NOT NULL DEFAULT 'USD',
    currency_to VARCHAR(10) NOT NULL DEFAULT 'GHS',
    rate DECIMAL(15, 4) NOT NULL,
    effective_date DATE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

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


-- Payroll periods table
CREATE TABLE IF NOT EXISTS payroll_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month INT NOT NULL,
    year INT NOT NULL,
    status ENUM('draft', 'finalized', 'archived') DEFAULT 'draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_period (month, year),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Payroll entries table
CREATE TABLE IF NOT EXISTS payroll_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_period_id INT NOT NULL,
    staff_id INT NOT NULL,
    basic_salary DECIMAL(15, 2) NOT NULL,
    total_allowances DECIMAL(15, 2) DEFAULT 0.00,
    total_deductions DECIMAL(15, 2) DEFAULT 0.00,
    gross_salary DECIMAL(15, 2) NOT NULL,
    net_salary DECIMAL(15, 2) NOT NULL,
    currency_rate DECIMAL(15, 4) DEFAULT 1.0000,
    net_salary_ghs DECIMAL(15, 2),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staffs(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_staff_period (payroll_period_id, staff_id)
);

-- Payroll allowances (junction table)
CREATE TABLE IF NOT EXISTS payroll_allowances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_entry_id INT NOT NULL,
    allowance_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    is_percentage BOOLEAN DEFAULT FALSE,
    percentage_value DECIMAL(5, 2),
    FOREIGN KEY (payroll_entry_id) REFERENCES payroll_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (allowance_id) REFERENCES allowances(id)
);

-- Payroll deductions (junction table)
CREATE TABLE IF NOT EXISTS payroll_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_entry_id INT NOT NULL,
    deduction_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    is_percentage BOOLEAN DEFAULT FALSE,
    percentage_value DECIMAL(5, 2),
    FOREIGN KEY (payroll_entry_id) REFERENCES payroll_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (deduction_id) REFERENCES deductions(id)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user (password: admin123 - hashed)
INSERT INTO users (username, password, full_name, email, role, position) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin@university.edu', 'admin', 'HR Manager')
ON DUPLICATE KEY UPDATE username=username;


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
