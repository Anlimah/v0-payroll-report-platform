# Payroll Management System

A comprehensive monthly payroll report platform for university institutions with role-based access control.

## Features

- **User Management**: Admin and view-only roles
- **CRUD Operations**: Manage staffs, departments, designations, allowances, and deductions
- **Payroll Processing**: Monthly payroll calculation with automatic computations
- **Currency Management**: Set USD to GHS exchange rates
- **Reports & Analytics**: Comprehensive reporting by date and other parameters
- **Audit Logging**: Track all system activities
- **Error Logging**: Comprehensive database error logging to text files

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Vanilla PHP (API-based)
- **Database**: MySQL

## Installation

1. **Database Setup**:
   - Create a MySQL database named `payroll_system`
   - Update database credentials in `api/config/database.php`
   - Run the SQL script in `scripts/01_create_tables.sql`

2. **Server Setup**:
   - Place the project in your web server directory (e.g., `htdocs/payroll-system`)
   - Ensure PHP 7.4+ and MySQL are installed
   - Enable `mod_rewrite` for Apache
   - Ensure the `logs/` directory has write permissions (chmod 755)

3. **Configuration**:
   - Update `API_BASE_URL` in `js/config.js` to match your server URL

4. **Default Login**:
   - Username: `admin`
   - Password: `admin123`

## Project Structure

\`\`\`
payroll-system/
├── api/
│   ├── auth/          # Authentication endpoints
│   ├── config/        # Database, CORS, and error logging configuration
│   ├── middleware/    # Authentication middleware
│   ├── users/         # User management endpoints
│   ├── departments/   # Department management
│   ├── staffs/        # Staff management
│   ├── payroll/       # Payroll processing
│   └── reports/       # Reporting endpoints
├── css/
│   └── styles.css     # Application styles
├── js/
│   ├── config.js      # API configuration
│   ├── auth.js        # Authentication service
│   └── *.js           # Page-specific scripts
├── logs/
│   └── database_errors.log  # Error log file (auto-created)
├── scripts/
│   └── *.sql          # Database scripts
└── *.html             # Application pages
\`\`\`

## User Roles

- **Admin** (HR, DUR): Full CRUD access, user management, payroll processing
- **View** (UR, Senior Internal Auditor): Read-only access to reports and data

## Error Logging

The system includes comprehensive error logging for all database operations:

- **Log Location**: `logs/database_errors.log`
- **What's Logged**: 
  - Timestamp of error occurrence
  - Error message and type
  - File and line number where error occurred
  - Full stack trace for debugging
  - Query context (SQL query and parameters)
  - Endpoint and request method information
  - User context when available

- **Error Types Logged**:
  - Database connection errors
  - SQL query execution errors
  - Authentication errors
  - General application exceptions

- **Log Format**: Each error entry is separated by a line of equals signs (=) for easy reading

**Example Log Entry**:
\`\`\`
================================================================================
[2025-01-08 14:30:45] ERROR
Message: SQLSTATE[42S22]: Column not found: 1054 Unknown column 'invalid_column'
File: /path/to/api/users/index.php
Line: 45
Context: {"query":"SELECT * FROM users WHERE invalid_column = ?","params":["value"],"type":"DATABASE_ERROR"}
Stack Trace:
#0 /path/to/api/users/index.php(45): PDO->prepare()
#1 {main}
================================================================================
\`\`\`

**Monitoring**: Regularly check the error log file to identify and fix issues. Consider setting up log rotation for production environments.

## Security Notes

- Change the JWT secret key in `api/middleware/auth.php`
- Use HTTPS in production
- Update default admin password after first login
- Implement rate limiting for API endpoints
- Regular database backups recommended
- Monitor error logs for security issues
- Restrict access to the `logs/` directory via `.htaccess`
