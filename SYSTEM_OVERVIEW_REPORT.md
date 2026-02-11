# PAYROLL MANAGEMENT SYSTEM - COMPREHENSIVE OVERVIEW REPORT

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Pages & Components](#frontend-pages--components)
5. [Data Flow & Workflows](#data-flow--workflows)
6. [Key Features](#key-features)
7. [Technology Stack](#technology-stack)
8. [User Roles & Access Control](#user-roles--access-control)

---

## System Architecture

### High-Level Overview
The Payroll Management System is built with a classic 3-tier architecture:

```
┌─────────────────────┐
│   Frontend (UI)     │  HTML5, CSS, JavaScript (ES6+)
│  - Dashboard        │  - Pages: Users, Departments, Designations, Staffs, Allowances, Deductions, Currency Rates, Bulk Payroll
│  - Modal Dialogs    │  - Live Calculations & Real-time Updates
│  - Forms & Tables   │  - Responsive Design
└──────────┬──────────┘
           │
           │ REST API (JSON over HTTP)
           │
┌──────────▼──────────┐
│   Backend (API)     │  PHP 8.1+ with PDO
│  - 29 Endpoints     │  - CORS Support
│  - Auth Middleware  │  - Error Logging
│  - CRUD Operations  │  - Database Transactions
└──────────┬──────────┘
           │
           │ SQL Queries (PDO Prepared Statements)
           │
┌──────────▼──────────┐
│   Database (MySQL)  │  MySQL 8.0.31
│  - 10 Core Tables   │  - Audit Logging
│  - Normalization    │  - Constraints & Relationships
│  - Data Integrity   │  - UNIQUE Keys on Period & Staff
└─────────────────────┘
```

### Key Architectural Principles
- **Separation of Concerns**: Frontend handles UI/UX, Backend handles business logic
- **API-First Design**: All operations go through REST API endpoints
- **Security**: JWT authentication, CORS validation, prepared statements
- **Audit Trail**: All CRUD operations logged with user tracking
- **Scalability**: Stateless API design allows horizontal scaling

---

## Database Schema

### 10 Core Tables

#### 1. **users**
```sql
- id (INT, PK)
- username (VARCHAR)
- password (VARCHAR, hashed)
- email (VARCHAR)
- role (ENUM: admin, hr, staff)
- is_active (TINYINT)
- created_at (TIMESTAMP)
```
**Purpose**: User authentication and authorization

#### 2. **departments**
```sql
- id (INT, PK)
- department_code (VARCHAR, UNIQUE)
- department_name (VARCHAR)
- description (TEXT)
- is_archived (TINYINT)
- created_at, updated_at (TIMESTAMP)
```
**Purpose**: Organizational structure - grouping staffs

#### 3. **designations**
```sql
- id (INT, PK)
- designation_code (VARCHAR, UNIQUE)
- designation_name (VARCHAR)
- description (TEXT)
- is_archived (TINYINT)
- created_at, updated_at (TIMESTAMP)
```
**Purpose**: Job titles and positions

#### 4. **staffs**
```sql
- id (INT, PK)
- staff_number (VARCHAR, UNIQUE)
- first_name, last_name, other_names (VARCHAR)
- ssnit, ghana_card (VARCHAR)
- department_id (FK -> departments)
- designation_id (FK -> designations)
- bank_name, account_number (VARCHAR)
- salary_currency (VARCHAR: GHS, USD)
- basic_salary (DECIMAL)
- hire_date (DATE)
- contract_type (ENUM: permanent, contract)
- is_archived (TINYINT)
- created_at, updated_at (TIMESTAMP)
```
**Purpose**: Employee master data

#### 5. **allowances**
```sql
- id (INT, PK)
- allowance_code (VARCHAR, UNIQUE)
- allowance_name (VARCHAR)
- description (TEXT)
- is_percentage (TINYINT) [0=Fixed Amount, 1=Percentage]
- default_amount (DECIMAL) [% or fixed value]
- is_bonded (TINYINT)
- eligible_status (ENUM: permanent, contract, both)
- is_archived (TINYINT)
- created_at, updated_at (TIMESTAMP)
```
**Purpose**: Define allowance types system-wide

#### 6. **deductions**
```sql
- id (INT, PK)
- deduction_code (VARCHAR, UNIQUE)
- deduction_name (VARCHAR)
- description (TEXT)
- is_percentage (TINYINT) [0=Fixed Amount, 1=Percentage]
- default_amount (DECIMAL) [% or fixed value]
- is_archived (TINYINT)
- created_at, updated_at (TIMESTAMP)
```
**Purpose**: Define deduction types system-wide

#### 7. **staff_allowances**
```sql
- id (INT, PK)
- staff_id (FK -> staffs)
- allowance_id (FK -> allowances)
- amount (DECIMAL) [Staff-specific override]
- is_percentage (TINYINT)
- assigned_at (TIMESTAMP)
```
**Purpose**: Staff-specific allowance assignments and overrides

#### 8. **staff_deductions**
```sql
- id (INT, PK)
- staff_id (FK -> staffs)
- deduction_id (FK -> deductions)
- amount (DECIMAL) [Staff-specific override]
- is_percentage (TINYINT)
- assigned_at (TIMESTAMP)
```
**Purpose**: Staff-specific deduction assignments and overrides

#### 9. **payroll_periods**
```sql
- id (INT, PK)
- month (INT)
- year (INT)
- status (ENUM: draft, finalized, archived)
- created_by (FK -> users)
- created_at, updated_at (TIMESTAMP)
- approved_at (DATETIME)
- UNIQUE(month, year)
```
**Purpose**: Monthly payroll cycles

#### 10. **payroll_entries**
```sql
- id (INT, PK)
- payroll_period_id (FK -> payroll_periods)
- staff_id (FK -> staffs)
- basic_salary (DECIMAL)
- total_allowances (DECIMAL)
- total_deductions (DECIMAL)
- gross_salary (DECIMAL) [Basic + Allowances]
- net_salary (DECIMAL) [Gross - Deductions]
- salary_currency (VARCHAR: GHS, USD)
- currency_rate (DECIMAL) [Exchange rate]
- net_salary_ghs (DECIMAL) [Converted to GHS]
- is_approved (TINYINT)
- is_finalized (TINYINT)
- created_by (FK -> users)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(payroll_period_id, staff_id)
```
**Purpose**: Individual payroll records

#### 11. **payroll_allowances**
```sql
- id (INT, PK)
- payroll_entry_id (FK -> payroll_entries)
- allowance_id (FK -> allowances)
- amount (DECIMAL) [Calculated value for this period]
- is_percentage (TINYINT)
- percentage_value (DECIMAL) [If percentage, the %]
```
**Purpose**: Allowances applied to each payroll entry

#### 12. **payroll_deductions**
```sql
- id (INT, PK)
- payroll_entry_id (FK -> payroll_entries)
- deduction_id (FK -> deductions)
- amount (DECIMAL) [Calculated value for this period]
- is_percentage (TINYINT)
- percentage_value (DECIMAL) [If percentage, the %]
```
**Purpose**: Deductions applied to each payroll entry

#### 13. **currency_rates**
```sql
- id (INT, PK)
- currency_from (VARCHAR) [Default: USD]
- currency_to (VARCHAR) [Default: GHS]
- rate (DECIMAL) [Exchange rate]
- effective_date (DATE)
- created_by (FK -> users)
- is_active (TINYINT)
- created_at (TIMESTAMP)
```
**Purpose**: Currency conversion rates for multi-currency payroll

#### 14. **audit_logs**
```sql
- id (INT, PK)
- user_id (FK -> users)
- action (VARCHAR: CREATE, UPDATE, DELETE, ARCHIVE, RESTORE, LOGIN, LOGOUT)
- table_name (VARCHAR)
- record_id (INT)
- old_values (TEXT, JSON)
- new_values (TEXT, JSON)
- ip_address (VARCHAR)
- created_at (TIMESTAMP)
```
**Purpose**: Complete audit trail of all system activities

---

## API Endpoints

### Authentication (2 endpoints)
```
POST   /api/auth/login.php         - User login (returns JWT token)
POST   /api/auth/logout.php        - User logout
```

### Users (1 endpoint)
```
GET    /api/users/index.php        - List all users
POST   /api/users/index.php        - Create user
PUT    /api/users/index.php        - Update user
DELETE /api/users/index.php        - Delete user
```

### Departments (1 endpoint)
```
GET    /api/departments/index.php  - List all departments
POST   /api/departments/index.php  - Create department
PUT    /api/departments/index.php  - Update department
DELETE /api/departments/index.php  - Delete department
```

### Designations (1 endpoint)
```
GET    /api/designations/index.php - List all designations
POST   /api/designations/index.php - Create designation
PUT    /api/designations/index.php - Update designation
DELETE /api/designations/index.php - Delete designation
```

### Staffs (1 endpoint)
```
GET    /api/staffs/index.php       - List all staffs
POST   /api/staffs/index.php       - Create staff
PUT    /api/staffs/index.php       - Update staff
DELETE /api/staffs/index.php       - Delete staff
```

### Allowances (1 endpoint)
```
GET    /api/allowances/index.php   - List all allowances
POST   /api/allowances/index.php   - Create allowance
PUT    /api/allowances/index.php   - Update allowance
DELETE /api/allowances/index.php   - Delete allowance
```

### Deductions (1 endpoint)
```
GET    /api/deductions/index.php   - List all deductions
POST   /api/deductions/index.php   - Create deduction
PUT    /api/deductions/index.php   - Update deduction
DELETE /api/deductions/index.php   - Delete deduction
```

### Currency Rates (2 endpoints)
```
GET    /api/currency-rates/index.php   - List all currency rates
POST   /api/currency-rates/index.php   - Create currency rate
PUT    /api/currency-rates/manage.php  - Manage active rates
```

### Payroll Operations (10 endpoints)
```
GET    /api/payroll/periods.php                  - List payroll periods
POST   /api/payroll/periods.php                  - Create payroll period

GET    /api/payroll/get-or-create-period.php    - Get or create period (atomic operation)

GET    /api/payroll/load-payroll-entries.php    - Load eligible staff or existing entries
POST   /api/payroll/entries.php                 - Create payroll entry
PUT    /api/payroll/entries.php                 - Update payroll entry
DELETE /api/payroll/entries.php                 - Delete payroll entry

POST   /api/payroll/bulk-entries.php            - Create/update multiple entries
GET    /api/payroll/staff-search.php            - Search staff with allowances/deductions
GET    /api/payroll/staff-allowances.php        - Get staff allowances
GET    /api/payroll/staff-deductions.php        - Get staff deductions
GET    /api/payroll/process-details.php        - Get payroll calculation details
GET    /api/payroll/list-by-department.php     - List payroll by department
```

### Reports (1 endpoint)
```
GET    /api/reports/index.php      - Generate payroll reports
```

---

## Frontend Pages & Components

### 1. **Users Page** (`js/pages/users-page.js`)
- Display list of system users
- Create, update, delete users
- Assign roles (admin, hr, staff)
- Status activation/deactivation

### 2. **Departments Page** (`js/pages/departments-page.js`)
- CRUD operations for departments
- Department codes and names
- Archive/restore functionality

### 3. **Designations Page** (`js/pages/designations-page.js`)
- CRUD operations for job titles
- Designation codes and descriptions
- Archive/restore functionality

### 4. **Staffs Page** (`js/pages/staffs-page.js`)
- Complete staff master data management
- Staff number, name, contact details
- Department and designation assignment
- Bank account information
- Salary currency and basic salary
- Contract type (permanent/contract)
- Hire date tracking
- Archive/restore functionality

### 5. **Allowances Page** (`js/pages/allowances-page.js`)
- Create system-wide allowance types
- Define as percentage or fixed amount
- Set default amounts
- Eligible status (permanent, contract, both)
- Archive/restore functionality

### 6. **Deductions Page** (`js/pages/deductions-page.js`)
- Create system-wide deduction types
- Define as percentage or fixed amount
- Set default amounts
- Archive/restore functionality

### 7. **Currency Rates Page** (`js/pages/currency-rates-page.js`)
- Manage exchange rates
- Set effective dates
- Activate/deactivate rates
- Multi-currency support (USD, GHS)

### 8. **Process Bulk Payroll Page** (`js/pages/process-payroll-page.js`)
- Select month and year for payroll
- Load eligible staff automatically
- Display payroll entries in table format
- Edit individual payroll entries with modal
- Live calculation of:
  - Gross Salary = Basic + Allowances
  - Net Salary = Gross - Deductions
  - Handles percentage and fixed allowances/deductions
  - Currency conversion
- Save changes per staff
- Submit bulk payroll

### 9. **PayrollManager Class** (`js/payroll.js`)
- Calculation engine for payroll
- Format currencies
- Handle percentage vs. fixed amounts
- Currency rate conversions
- Tax and deduction calculations

---

## Data Flow & Workflows

### Workflow 1: System Setup (One-time)
```
1. Create Users (HR Manager)
   ↓
2. Create Departments & Designations
   ↓
3. Create Allowances & Deductions (system-wide)
   ↓
4. Set Currency Rates
   ↓
5. Add Staff with:
   - Department assignment
   - Designation assignment
   - Basic salary
   - Salary currency
   - Hire date
```

### Workflow 2: Staff Allowance/Deduction Setup
```
1. For each staff member, assign allowances/deductions
2. Set staff-specific overrides (if different from defaults)
3. Store in staff_allowances and staff_deductions tables
4. These override system defaults for that staff
```

### Workflow 3: Monthly Payroll Processing
```
1. Select Month & Year
   ↓
2. System Creates/Fetches Payroll Period
   ↓
3. Load Eligible Staff:
   - If period is NEW:
     * Get staff hired before/on period date
     * Load staff_allowances & staff_deductions
     * Create payroll_entries
   - If period EXISTS:
     * Load existing payroll_entries
     * Load associated payroll_allowances & payroll_deductions
   ↓
4. Display Staff in Table with Calculations
   ↓
5. For each staff:
   - Click "Edit" to open modal
   - Select allowances to include (checkboxes)
   - Set/override amounts for fixed allowances
   - Real-time calculation updates
   - Save changes
   ↓
6. Submit Bulk Payroll
   - Create/update payroll_allowances & payroll_deductions
   - Update payroll_entries totals
   - Set is_approved flag
```

### Workflow 4: Payroll Calculation
```
For each staff member:

1. Get Basic Salary (in staff currency)

2. Calculate Allowances:
   FOR EACH selected allowance:
     IF is_percentage = 1
       amount = (basic_salary * percentage) / 100
     ELSE
       amount = fixed_amount
     total_allowances += amount
   
3. Calculate Gross Salary:
   gross_salary = basic_salary + total_allowances

4. Calculate Deductions:
   FOR EACH selected deduction:
     IF is_percentage = 1
       amount = (gross_salary * percentage) / 100  [Note: % of gross]
     ELSE
       amount = fixed_amount
     total_deductions += amount

5. Calculate Net Salary:
   net_salary = gross_salary - total_deductions

6. Handle Currency Conversion (if needed):
   IF salary_currency != 'GHS'
     net_salary_ghs = net_salary * currency_rate
   ELSE
     net_salary_ghs = net_salary
```

---

## Key Features

### 1. **Multi-Currency Support**
- Staffs can have salaries in different currencies (USD, GHS)
- Exchange rates stored in currency_rates table
- Automatic conversion to GHS for reporting
- Per-entry currency_rate field for historical tracking

### 2. **Flexible Allowances/Deductions**
- Support for percentage-based (e.g., 5% of salary)
- Support for fixed amount (e.g., 150 GHS)
- System-wide defaults overrideable per staff
- Status-based eligibility (permanent vs. contract staff)
- Audit trail of all changes

### 3. **Live Payroll Calculations**
- Real-time updates as allowances/deductions change
- Gross salary = Basic + Allowances
- Net salary = Gross - Deductions
- Handles mixed percentage and fixed amounts
- Proper calculation order (deductions on gross for some, on basic for others)

### 4. **Bulk Payroll Processing**
- Process entire staff list for a month at once
- Edit individual entries in modal
- Save changes immediately with validation
- Prevent duplicate entries (UNIQUE constraint on period+staff)

### 5. **Audit & Compliance**
- Complete audit trail (audit_logs table)
- Track user, action, timestamp, IP address
- JSON tracking of old/new values
- Archive/restore instead of hard delete
- Approval workflow (is_approved, is_finalized flags)

### 6. **User Authentication & Authorization**
- JWT-based authentication
- Role-based access control (admin, hr, staff)
- Session management
- Login/logout tracking

### 7. **Data Integrity**
- Foreign key relationships
- UNIQUE constraints (department_code, allowance_code, etc.)
- Prepared statements prevent SQL injection
- Transaction support for atomic operations

### 8. **Error Handling & Logging**
- Try-catch blocks with detailed error messages
- Error logging to system log
- User-friendly error messages in API responses
- HTTP status codes (200, 400, 401, 404, 500)

---

## Technology Stack

### Frontend
- **HTML5** - Structure and markup
- **CSS** - Styling and layout (custom styles.css)
- **JavaScript (ES6+)** - Logic and interactivity
  - No external frameworks (vanilla JS)
  - Fetch API for HTTP requests
  - DOM manipulation
  - Event handling

### Backend
- **PHP 8.1.13** - Server-side logic
- **PDO (PHP Data Objects)** - Database abstraction layer
- **Prepared Statements** - SQL injection prevention

### Database
- **MySQL 8.0.31** - Relational database
- **MyISAM Engine** - For most tables
- **InnoDB** - For tables requiring transactions

### Architecture Patterns
- **MVC Pattern** - Model (DB), View (Frontend), Controller (API)
- **REST API** - Stateless, HTTP-based
- **CRUD Operations** - Standard Create, Read, Update, Delete
- **Middleware Pattern** - Auth, CORS, Error Logging

---

## User Roles & Access Control

### Role: Admin
- Full system access
- User management
- All CRUD operations
- Payroll processing and approval
- Report generation
- Settings and configuration

### Role: HR
- Staff management
- Department/Designation management
- Allowance/Deduction management
- Payroll processing
- Report viewing

### Role: Staff
- View own payroll information
- View reports (limited)
- Cannot modify data

---

## Security Features

1. **Authentication**
   - Username/password login
   - JWT token generation
   - Session timeout

2. **Authorization**
   - Role-based access control
   - Endpoint-level permission checks
   - User ID verification in requests

3. **Data Protection**
   - Prepared statements for SQL injection prevention
   - Input validation and sanitization
   - CORS headers for cross-origin requests
   - Password hashing (bcrypt or similar)

4. **Audit & Monitoring**
   - Complete audit logs
   - IP address tracking
   - User action logging
   - Timestamp tracking for all operations

---

## System Constraints & Limits

1. **Unique Constraints**
   - One payroll entry per staff per period
   - Department code, designation code unique
   - Allowance code, deduction code unique
   - Staff number unique

2. **Validation Rules**
   - Staff hire date must be before or on period date
   - Salary amounts must be positive decimals
   - Percentage values between 0-100
   - Valid currency codes (GHS, USD)

3. **Business Rules**
   - Cannot process payroll for future periods
   - Cannot delete finalized payroll entries
   - Cannot modify archived staff
   - Deductions calculated on gross salary (for most types)

---

## Current System Status

### Completed Features
✅ User authentication and authorization
✅ Master data management (departments, designations, staffs)
✅ Allowances and deductions configuration
✅ Currency rate management
✅ Bulk payroll processing with live calculations
✅ Edit modal for individual payroll adjustments
✅ Audit logging for compliance
✅ Multi-currency support with conversion
✅ Percentage and fixed amount handling

### In Development / Pending
⏳ Payroll submission and approval workflow
⏳ Report generation and export (PDF/Excel)
⏳ Bank file generation for fund transfer
⏳ Email notifications for payroll events
⏳ Dashboard analytics and statistics
⏳ Performance optimization for large datasets

---

## Getting Started

### Prerequisites
- PHP 8.1+
- MySQL 8.0+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- WAMP/LAMP/XAMPP for local development

### Installation
1. Extract files to web root
2. Import database: `scripts/01_create_tables.sql`
3. Configure database connection in `api/config/database.php`
4. Access via `http://localhost/payroll_system/dashboard.html`
5. Default credentials: (Check with system administrator)

### API Response Format
All endpoints return JSON:
```json
{
  "success": true/false,
  "data": {} or [],
  "message": "Success or error message",
  "entries_exist": true/false  [for specific payroll endpoints]
}
```

---

## Support & Maintenance

For issues, bugs, or feature requests, contact the development team.
Ensure regular backups of the database for data protection and disaster recovery.
