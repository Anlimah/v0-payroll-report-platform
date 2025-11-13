# Payroll System Integration Guide

## Overview
This integration guide provides step-by-step instructions to implement the comprehensive payroll processing system with multi-currency support, leave-based allowance handling, and historical data preservation.

## Prerequisites
- PHP 7.4+
- MySQL 5.7+
- Existing payroll database with users, staffs, departments, designations tables
- Web server with PHP PDO support

## Step 1: Run Database Migration

Execute the migration script to add new tables and columns:

\`\`\`bash
mysql -u root -p payroll_system < scripts/02_payroll_system_migration.sql
\`\`\`

**What this does:**
- Adds `salary_currency`, `on_bonded_or_study_leave` columns to staffs table
- Adds `type` and `allowed_on_leave` columns to allowances table
- Adds `type` column to deductions table
- Creates `staff_allowances` and `staff_deductions` junction tables
- Adds exchange rate fields to payroll_entries
- Creates trigger to enforce single active currency rate
- Migrates existing payroll entries to store exchange rates

**Rollback (if needed):**
See the commented section at the end of `02_payroll_system_migration.sql`

## Step 2: Seed Test Data

(Optional) Populate sample data for testing:

\`\`\`bash
mysql -u root -p payroll_system < scripts/03_seed_test_data.sql
\`\`\`

This adds:
- Sample allowances (fixed and percent types)
- Sample deductions (fixed and percent types)
- Sample staff with different currencies
- Staff allowance/deduction assignments

## Step 3: Deploy Backend APIs

Upload the new API endpoints to your server:

- `/api/payroll/staff-allowances.php` - Manage staff allowance assignments
- `/api/payroll/staff-deductions.php` - Manage staff deduction assignments
- `/api/payroll/process-details.php` - Fetch payroll breakdown for a staff
- `/api/payroll/list-by-department.php` - List staff by department for processing

## Step 4: Update Frontend Configuration

Update `js/config.js` with new API endpoints:

\`\`\`javascript
PAYROLL_STAFF_ALLOWANCES: `${API_BASE_URL}/payroll/staff-allowances.php`,
PAYROLL_STAFF_DEDUCTIONS: `${API_BASE_URL}/payroll/staff-deductions.php`,
PAYROLL_PROCESS_DETAILS: `${API_BASE_URL}/payroll/process-details.php`,
PAYROLL_LIST_BY_DEPARTMENT: `${API_BASE_URL}/payroll/list-by-department.php`,
\`\`\`

## Step 5: Deploy Updated Frontend Pages

Update/deploy the following JavaScript page files:

- `/js/pages/staffs-page.js` - Enhanced with salary currency toggle and leave status
- `/js/pages/process-payroll-page.js` - Updated with new calculation logic

## Step 6: Verify Installation

Run the test script:

\`\`\`bash
php scripts/test-payroll-system.php
\`\`\`

Expected output:
- ✓ Single active rate enforcement
- ✓ Staff currency matches employment status
- ✓ Leave status allowance filtering works
- ✓ Payroll calculations include all components
- ✓ Database schema contains all required tables

## Features Implemented

### 1. Dollar Rate Management
- **Single Active Rate:** Only one exchange rate is active at any time
- **Rate Switching:** Creating a new rate automatically deactivates the previous one
- **Historical Preservation:** Old payroll entries retain their original rates

**API Endpoint:** `POST /api/currency-rates/manage.php`

\`\`\`json
Request:
{
  "rate": 15.50,
  "effective_date": "2024-01-01"
}

Response:
{
  "success": true,
  "message": "New rate activated",
  "previous_rate_deactivated": true
}
\`\`\`

### 2. Staff Salary Currency by Status
- **Permanent Staff:** Salary input in USD, converted to GHS using active rate
- **Contract/Other Staff:** Salary input in GHS directly
- **Currency Label Toggle:** UI updates dynamically based on selected status

**How it works:**
1. User selects "permanent" status → Currency field shows USD
2. Basic salary stored as USD
3. `salary_currency` field set to 'USD'
4. On payroll processing, `basic_salary_local` = `basic_salary` × `exchange_rate_used`

### 3. Bonded/Study Leave Allowance Filtering
- **Leave Status Field:** `on_bonded_or_study_leave` boolean on staffs table
- **Allowance Filtering:** Allowances marked `allowed_on_leave = 1` shown when on leave
- **Checkbox Disabling:** Disallowed allowances are grayed out in UI

**Logic:**
\`\`\`
if (staff.on_bonded_or_study_leave == true) {
  show only allowances where allowed_on_leave = 1
  disable other allowance checkboxes
} else {
  show all allowances
  enable all checkboxes
}
\`\`\`

### 4. Staff-Level Allowances and Deductions
- **Junction Tables:** `staff_allowances` and `staff_deductions`
- **Custom Amounts:** Fixed allowances/deductions can have staff-specific amounts
- **Percent Types:** Percentage allowances/deductions use global percent (not customizable per staff)

**Implementation:**
- Fixed allowance: User enters custom amount → `staff_allowances.custom_amount`
- Percent allowance: Global % applied → `staff_allowances.custom_amount = NULL`
- Calculation: `final_amount = (type == 'percent') ? (salary × percent/100) : custom_amount`

### 5. Process Payroll UI
- **Department Filtering:** Server-side filtering with pagination
- **Period Selection:** Month/Year dropdowns for selecting payroll period
- **Payroll Breakdown Modal:** Shows detailed calculations for each employee

**Displayed Information:**
- Staff info (number, name, department, designation, status, leave)
- Basic salary (original currency)
- Allowances list with calculated amounts
- Deductions list with calculated amounts
- Gross salary
- Net salary
- Exchange rate used (if USD salary)
- GHS equivalent (if USD salary)

### 6. Historical Data Preservation
- **Exchange Rate Storage:** `payroll_entries.exchange_rate_used`
- **Local Currency Amount:** `payroll_entries.basic_salary_local`
- **Immutability:** Historical records never change when new rates are created
- **Audit Trail:** All rates are stored with created_by and created_at

**Example:**
\`\`\`
Payroll processed on 2024-01-15 with rate 15.50:
- exchange_rate_used = 15.50
- basic_salary_local = 2500 × 15.50 = 38,750

Later, rate changes to 16.00:
- Old payroll entry unchanged
- exchange_rate_used still = 15.50
- basic_salary_local still = 38,750
\`\`\`

## API Response Examples

### Get Staff with Allowances and Deductions
`GET /api/payroll/staff-allowances.php?staff_id=1&on_leave=0`

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "allowance_name": "Housing Allowance",
      "type": "fixed",
      "default_amount": 300.00,
      "allowed_on_leave": 1,
      "custom_amount": 350.00,
      "is_assigned": 1,
      "is_disabled_on_leave": 0
    }
  ],
  "on_leave": 0
}
\`\`\`

### Get Payroll Details for Processing
`GET /api/payroll/process-details.php?staff_id=1&period_month=1&period_year=2024`

\`\`\`json
{
  "success": true,
  "data": {
    "staff": {
      "id": 1,
      "staff_number": "PERM001",
      "first_name": "James",
      "status": "permanent",
      "salary_currency": "USD"
    },
    "salary_currency": "USD",
    "basic_salary": 2500.00,
    "basic_salary_local": 38750.00,
    "exchange_rate": 15.50,
    "allowances": [
      {
        "id": 1,
        "allowance_name": "Housing Allowance",
        "type": "fixed",
        "amount": 300.00,
        "calculated_amount": 300.00,
        "source": "assigned"
      }
    ],
    "total_allowances": 1200.00,
    "deductions": [
      {
        "id": 1,
        "deduction_name": "Income Tax",
        "type": "percent",
        "amount": 5.00,
        "calculated_amount": 1987.50,
        "source": "assigned"
      }
    ],
    "total_deductions": 2587.50,
    "gross_salary": 39950.00,
    "net_salary": 37362.50
  }
}
\`\`\`

### List Employees by Department
`GET /api/payroll/list-by-department.php?department_id=1&limit=50&offset=0`

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "staff_number": "PERM001",
      "first_name": "James",
      "last_name": "Mensah",
      "basic_salary": 2500.00,
      "salary_currency": "USD",
      "department_name": "IT",
      "designation_name": "Manager",
      "on_bonded_or_study_leave": 0
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 50,
    "offset": 0
  }
}
\`\`\`

## Testing Checklist

- [ ] Database migration executed without errors
- [ ] Seed data inserted successfully
- [ ] Test script passes all verifications
- [ ] Currency rate enforces single active record
- [ ] Staff salary currency matches employment status
- [ ] Leave status filters allowances correctly
- [ ] Fixed allowances show custom amount inputs
- [ ] Percent allowances show percentage (not editable)
- [ ] Process Payroll page loads staff list by department
- [ ] Payroll breakdown modal shows correct calculations
- [ ] Historical payroll records unchanged after rate changes
- [ ] USD-denominated salaries show GHS equivalent with exchange rate

## Troubleshooting

### "Multiple active rates" error
- Check: `SELECT COUNT(*) FROM currency_rates WHERE is_active = 1;`
- Fix: `UPDATE currency_rates SET is_active = 0 WHERE id NOT IN (SELECT MAX(id) FROM currency_rates);`

### Staff currency not updating
- Ensure `salary_currency` column exists: `SHOW COLUMNS FROM staffs LIKE 'salary_currency';`
- Update existing staff: `UPDATE staffs SET salary_currency = 'USD' WHERE status = 'permanent';`

### Leave allowances not filtering
- Check `allowed_on_leave` column: `SHOW COLUMNS FROM allowances LIKE 'allowed_on_leave';`
- Verify staff leave status: `SELECT on_bonded_or_study_leave FROM staffs WHERE id = ?;`

### Payroll calculations wrong
- Verify exchange rate: `SELECT rate FROM currency_rates WHERE is_active = 1;`
- Check allowance types: `SELECT id, type FROM allowances;`
- Verify staff assignments: `SELECT * FROM staff_allowances WHERE staff_id = ?;`

## Support & Maintenance

### Regular Tasks
- **Monthly:** Review and update exchange rates as needed
- **Quarterly:** Run test suite to verify system integrity
- **Annually:** Archive old rates and create performance indexes

### Database Optimization
\`\`\`sql
-- Add performance indexes
CREATE INDEX idx_staff_allowances_staff ON staff_allowances(staff_id);
CREATE INDEX idx_staff_deductions_staff ON staff_deductions(staff_id);
CREATE INDEX idx_payroll_rate_active ON currency_rates(is_active);
CREATE INDEX idx_payroll_entries_period ON payroll_entries(payroll_period_id);
\`\`\`

## Conclusion
This payroll system integration provides comprehensive multi-currency support with full historical data preservation. All features prioritize data integrity and prevent retroactive changes to historical records.
