# Bulk Payroll Entry Implementation Guide

## Overview

The bulk payroll entry feature allows you to add multiple staff payroll entries for a specific period in a single operation. This is useful for mass payroll processing while maintaining data integrity and providing detailed error reporting.

## Features

- **Batch Processing**: Add multiple staff entries in one request
- **Validation**: Validates each entry before processing
- **Error Handling**: Continues processing even if individual entries fail
- **Transaction Safety**: Uses database transactions for data consistency
- **Security**: Validates input, authenticates users, and requires admin privileges
- **Detailed Feedback**: Returns success/failure status for each entry

## API Endpoint

### POST `/api/payroll/bulk-entries.php`

**Request Body:**
```json
{
  "payroll_period_id": 1,
  "entries": [
    {
      "staff_id": 1,
      "basic_salary": 1000.00,
      "allowances": [
        {
          "id": 1,
          "amount": 100.00,
          "is_percentage": false
        },
        {
          "id": 2,
          "percentage_value": 5,
          "is_percentage": true
        }
      ],
      "deductions": [
        {
          "id": 1,
          "amount": 50.00,
          "is_percentage": false
        }
      ]
    },
    {
      "staff_id": 2,
      "basic_salary": 1200.00,
      "allowances": [],
      "deductions": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Processed 2 entries: 2 successful, 0 failed",
  "data": {
    "successCount": 2,
    "failureCount": 0,
    "totalCount": 2,
    "results": [
      {
        "staff_id": 1,
        "success": true,
        "entry_id": 5,
        "gross_salary": 1155.00,
        "net_salary": 1105.00
      },
      {
        "staff_id": 2,
        "success": true,
        "entry_id": 6,
        "gross_salary": 1200.00,
        "net_salary": 1200.00
      }
    ]
  }
}
```

## Frontend Usage

### JavaScript Example

```javascript
// Initialize PayrollManager
const payrollManager = new PayrollManager();
await payrollManager.initialize();

// Prepare staff entries array
const staffEntries = [
  {
    staffId: 1,
    basicSalary: 1000.00,
    allowances: [
      { id: 1, amount: 100.00, is_percentage: false },
      { id: 2, percentage_value: 5, is_percentage: true }
    ],
    deductions: [
      { id: 1, amount: 50.00, is_percentage: false }
    ]
  },
  {
    staffId: 2,
    basicSalary: 1200.00,
    allowances: [],
    deductions: []
  },
  {
    staffId: 3,
    basicSalary: 1500.00,
    allowances: [
      { id: 3, amount: 200.00, is_percentage: false }
    ],
    deductions: []
  }
];

// Call bulk save function
const periodId = 1; // Your payroll period ID
const result = await payrollManager.savePayrollEntriesBulk(periodId, staffEntries);

// Handle result
if (result.success) {
  console.log(`Successfully added ${result.data.successCount} payroll entries`);
  
  // Process individual results
  result.data.results.forEach(entry => {
    if (entry.success) {
      console.log(`✓ Staff ${entry.staffId}: Entry ID ${entry.entryId}`);
    } else {
      console.log(`✗ Staff ${entry.staffId}: ${entry.error}`);
    }
  });
} else {
  console.log("No entries were processed:", result.message);
}
```

### HTML Form Example

```html
<div id="bulkPayrollForm">
  <h3>Bulk Payroll Entry</h3>
  
  <div>
    <label>Payroll Period:</label>
    <select id="periodSelect">
      <option value="">-- Select Period --</option>
      <option value="1">January 2024</option>
      <option value="2">February 2024</option>
    </select>
  </div>

  <div id="staffEntries">
    <div class="staff-entry">
      <input type="number" placeholder="Staff ID" class="staffId" />
      <input type="number" placeholder="Basic Salary" class="basicSalary" />
      <button onclick="addAllowanceRow(this)">+ Allowance</button>
      <button onclick="addDeductionRow(this)">+ Deduction</button>
    </div>
  </div>

  <button onclick="submitBulkPayroll()">Process Payroll</button>
</div>

<script>
async function submitBulkPayroll() {
  const periodId = parseInt(document.getElementById('periodSelect').value);
  if (!periodId) {
    alert('Please select a payroll period');
    return;
  }

  const entries = [];
  document.querySelectorAll('.staff-entry').forEach(entryDiv => {
    const staffId = parseInt(entryDiv.querySelector('.staffId').value);
    const basicSalary = parseFloat(entryDiv.querySelector('.basicSalary').value);
    
    if (staffId && basicSalary) {
      entries.push({
        staffId,
        basicSalary,
        allowances: [],
        deductions: []
      });
    }
  });

  const payrollManager = new PayrollManager();
  await payrollManager.initialize();
  
  const result = await payrollManager.savePayrollEntriesBulk(periodId, entries);
  
  if (result.success) {
    alert(`Success: ${result.data.successCount} entries added`);
  } else {
    alert(`Error: ${result.message}`);
  }
}
</script>
```

## Validation Rules

1. **Required Fields**:
   - `staff_id`: Must be an integer and exist in the staff table
   - `basic_salary`: Must be a positive number

2. **Optional Fields**:
   - `allowances`: Array of allowance objects (can be empty)
   - `deductions`: Array of deduction objects (can be empty)

3. **Allowance/Deduction Objects**:
   - Either `amount` (fixed value) OR `percentage_value` with `is_percentage=true`
   - Invalid values are skipped silently

## Error Handling

### Individual Entry Failures
If a single entry fails, processing continues with remaining entries. Possible error reasons:
- "Missing required fields"
- "Invalid basic salary value"
- "Staff member not found"
- "Database error occurred"

### Transaction Rollback
If a critical error occurs during processing, the entire transaction is rolled back to ensure data consistency.

## Security Considerations

1. **Authentication**: All requests must be authenticated
2. **Authorization**: Only users with admin privilege can use this endpoint
3. **Input Validation**: All numeric values are validated before database operations
4. **SQL Injection Prevention**: Uses prepared statements for all database queries
5. **Error Logging**: Failed operations are logged without exposing sensitive details

## Performance Notes

- Batch size recommendation: 50-100 entries per request
- For larger batches (1000+), consider splitting into multiple requests
- Database indexes on `staff_id`, `payroll_period_id`, and `created_at` improve performance

## Example Integration with Payroll Processing

```javascript
// Step 1: Fetch staff for a department
const staffList = await ApiService.get(
  `${API_BASE_URL}/payroll/list-by-department.php?department_id=1&month=1&year=2024`
);

// Step 2: Prepare entries with their allowances/deductions
const entries = staffList.data.map(staff => ({
  staffId: staff.id,
  basicSalary: staff.basic_salary,
  allowances: staff.allowances || [],
  deductions: staff.deductions || []
}));

// Step 3: Process bulk payroll
const payrollManager = new PayrollManager();
const result = await payrollManager.savePayrollEntriesBulk(
  staffList.payroll_period_id,
  entries
);

// Step 4: Display results
displayBulkResults(result.data.results);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Method not allowed" | Ensure you're using POST request |
| "Missing required fields" | Check request includes `payroll_period_id` and `entries` array |
| "Staff member not found" | Verify staff IDs exist in database |
| "Invalid basic salary value" | Ensure salary is a positive number |
| Transaction rolled back | Check error logs for critical errors |
