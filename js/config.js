const API_BASE_URL = "http://localhost/v0-payroll-report-platform/api";

const API_ENDPOINTS = {
	// Auth
	LOGIN: `${API_BASE_URL}/auth/login.php`,
	LOGOUT: `${API_BASE_URL}/auth/logout.php`,

	// Users
	USERS: `${API_BASE_URL}/users/index.php`,

	// Departments
	DEPARTMENTS: `${API_BASE_URL}/departments/index.php`,

	// Designations
	DESIGNATIONS: `${API_BASE_URL}/designations/index.php`,

	// Staffs
	STAFFS: `${API_BASE_URL}/staffs/index.php`,

	// Allowances
	ALLOWANCES: `${API_BASE_URL}/allowances/index.php`,

	// Deductions
	DEDUCTIONS: `${API_BASE_URL}/deductions/index.php`,

	// Currency Rates
	CURRENCY_RATES: `${API_BASE_URL}/currency-rates/index.php`,

	// Payroll
	PAYROLL_PERIODS: `${API_BASE_URL}/payroll/periods.php`,
	PAYROLL_ENTRIES: `${API_BASE_URL}/payroll/entries.php`,
	PAYROLL_STAFF_SEARCH: `${API_BASE_URL}/payroll/staff-search.php`,

	// Reports
	REPORTS: `${API_BASE_URL}/reports/index.php`,
};

window.API_ENDPOINTS = API_ENDPOINTS;
