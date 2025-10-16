let currentPage = "overview";

// Assume AuthService, ApiService, API_ENDPOINTS, usersPage, departmentsPage, departmentsPage, designationsPage, staffsPage are defined elsewhere or globally available.
// For the purpose of this merge, we will assume they are accessible.

document.addEventListener("DOMContentLoaded", () => {
	// Check authentication
	if (typeof window.AuthService !== "undefined") {
		window.AuthService.checkAuth();
	}

	// Initialize user info
	initializeUserInfo();

	// Setup navigation
	setupNavigation();

	// Setup logout
	document.getElementById("logoutBtn").addEventListener("click", handleLogout);

	// Load initial page
	loadPage("overview");
});

function initializeUserInfo() {
	const user = window.AuthService.getUser();

	if (!user) {
		window.AuthService.logout();
		return;
	}

	// Set user info
	document.getElementById("userName").textContent = user.full_name;
	document.getElementById("userRole").textContent = user.role;

	// Set avatar initials
	const initials = user.full_name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();
	document.getElementById("userAvatar").textContent = initials;

	// Show admin menu if user is admin
	if (user.role === "admin") {
		document.getElementById("adminMenu").style.display = "block";
	}
}

function setupNavigation() {
	const navItems = document.querySelectorAll(".nav-item");

	navItems.forEach((item) => {
		item.addEventListener("click", (e) => {
			e.preventDefault();

			const page = item.getAttribute("data-page");

			// Update active state
			navItems.forEach((nav) => nav.classList.remove("active"));
			item.classList.add("active");

			// Load page
			loadPage(page);
		});
	});
}

function loadPage(page) {
	currentPage = page;

	const pageTitle = document.getElementById("pageTitle");
	const mainContent = document.getElementById("mainContent");

	// Update page title
	const titles = {
		overview: "Dashboard",
		users: "User Management",
		departments: "Departments",
		designations: "Designations",
		staffs: "Staff Management",
		allowances: "Allowances",
		deductions: "Deductions",
		currency: "Currency Rates",
		payroll: "Process Payroll",
		reports: "Reports & Analytics",
	};

	pageTitle.textContent = titles[page] || "Dashboard";

	// Load page content
	switch (page) {
		case "overview":
			loadOverview();
			break;
		case "users":
			loadUsersPage();
			break;
		case "departments":
			loadDepartmentsPage();
			break;
		case "designations":
			loadDesignationsPage();
			break;
		case "staffs":
			loadStaffsPage();
			break;
		case "allowances":
			loadAllowancesPage();
			break;
		case "deductions":
			loadDeductionsPage();
			break;
		case "currency":
			loadCurrencyPage();
			break;
		case "payroll":
			loadPayrollPage();
			break;
		case "reports":
			loadReportsPage();
			break;
		default:
			loadOverview();
	}
}

async function loadOverview() {
	const mainContent = document.getElementById("mainContent");

	mainContent.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Staff</div>
        <div class="stat-value" id="totalStaff">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Departments</div>
        <div class="stat-value" id="totalDepartments">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">This Month's Payroll</div>
        <div class="stat-value" id="monthlyPayroll">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Users</div>
        <div class="stat-value" id="activeUsers">-</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recent Activity</h3>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody id="recentActivity">
            <tr>
              <td colspan="4" style="text-align: center; padding: 40px;">
                Loading...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

	// Load dashboard stats
	loadDashboardStats();
}

async function loadDashboardStats() {
	try {
		// Load stats from API
		const statsData = await window.ApiService.get(
			window.API_ENDPOINTS.REPORTS + "?type=dashboard"
		);

		if (statsData && statsData.success) {
			document.getElementById("totalStaff").textContent =
				statsData.data.total_staff || 0;
			document.getElementById("totalDepartments").textContent =
				statsData.data.total_departments || 0;
			document.getElementById("monthlyPayroll").textContent =
				"GHS " + (statsData.data.monthly_payroll || 0).toLocaleString();
			document.getElementById("activeUsers").textContent =
				statsData.data.active_users || 0;

			// Load recent activity
			if (statsData.data.recent_activity) {
				const tbody = document.getElementById("recentActivity");
				tbody.innerHTML = statsData.data.recent_activity
					.map(
						(activity) => `
          <tr>
            <td>${new Date(activity.created_at).toLocaleDateString()}</td>
            <td>${activity.user_name}</td>
            <td><span class="badge badge-primary">${activity.action}</span></td>
            <td>${activity.details || "-"}</td>
          </tr>
        `
					)
					.join("");
			}
		}
	} catch (error) {
		console.error("Error loading dashboard stats:", error);
	}
}

async function handleLogout() {
	try {
		await window.ApiService.post(window.API_ENDPOINTS.LOGOUT, {});
	} catch (error) {
		console.error("Logout error:", error);
	} finally {
		window.AuthService.logout();
	}
}

function loadUsersPage() {
	const mainContent = document.getElementById("mainContent");
	if (typeof window.usersPage !== "undefined") {
		mainContent.innerHTML = window.usersPage.render();
		window.usersPage.init();
	} else {
		mainContent.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">User Management</h3>
        </div>
        <p style="padding: 20px;">Loading user management...</p>
      </div>
    `;
	}
}

function loadDepartmentsPage() {
	const mainContent = document.getElementById("mainContent");
	if (typeof window.departmentsPage !== "undefined") {
		mainContent.innerHTML = window.departmentsPage.render();
		window.departmentsPage.init();
	} else {
		mainContent.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Departments</h3>
        </div>
        <p style="padding: 20px;">Loading departments...</p>
      </div>
    `;
	}
}

function loadDesignationsPage() {
	const mainContent = document.getElementById("mainContent");
	if (typeof window.designationsPage !== "undefined") {
		mainContent.innerHTML = window.designationsPage.render();
		window.designationsPage.init();
	} else {
		mainContent.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Designations</h3>
        </div>
        <p style="padding: 20px;">Loading designations...</p>
      </div>
    `;
	}
}

function loadStaffsPage() {
	const mainContent = document.getElementById("mainContent");
	if (typeof window.staffsPage !== "undefined") {
		mainContent.innerHTML = window.staffsPage.render();
		window.staffsPage.loadDepartmentsAndDesignations();
		window.staffsPage.attachEventListeners();
		window.staffsPage.init();
	} else {
		mainContent.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Staff Management</h3>
        </div>
        <p style="padding: 20px;">Loading staff management...</p>
      </div>
    `;
	}
}

function loadAllowancesPage() {
	const mainContent = document.getElementById("mainContent");
	if (typeof window.allowancesPage !== "undefined") {
		mainContent.innerHTML = window.allowancesPage.render();
		window.allowancesPage.init();
	} else {
		mainContent.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Allowances</h3>
        </div>
        <p style="padding: 20px;">Loading allowances management...</p>
      </div>
    `;
	}
}

function loadDeductionsPage() {
	const mainContent = document.getElementById("mainContent");
	if (typeof window.deductionsPage !== "undefined") {
		mainContent.innerHTML = window.deductionsPage.render();
		window.deductionsPage.init();
	} else {
		mainContent.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Deductions</h3>
        </div>
        <p style="padding: 20px;">Loading deductions management...</p>
      </div>
    `;
	}
}

function loadCurrencyPage() {
	const mainContent = document.getElementById("mainContent");
	if (typeof window.currencyRatesPage !== "undefined") {
		mainContent.innerHTML = window.currencyRatesPage.render();
		window.currencyRatesPage.init();
	} else {
		mainContent.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Currency Rates</h3>
        </div>
        <p style="padding: 20px;">Loading currency rates management...</p>
      </div>
    `;
	}
}

function loadPayrollPage() {
	const mainContent = document.getElementById("mainContent");

	mainContent.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Monthly Payroll Processing</h3>
      </div>
      <div style="padding: 24px;">
        <div class="form-row" style="margin-bottom: 24px;">
          <div class="form-group">
            <label for="payrollMonth">Month</label>
            <select id="payrollMonth" class="form-control">
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div class="form-group">
            <label for="payrollYear">Year</label>
            <select id="payrollYear" class="form-control">
              ${generateYearOptions()}
            </select>
          </div>
        </div>
        
        <button id="selectPeriodBtn" class="btn btn-primary">Select Period</button>
        
        <div id="payrollForm" style="display: none; margin-top: 32px;">
          <h4 style="margin-bottom: 20px;">Add Staff to Payroll</h4>
          
          <div class="form-group">
            <label for="staffNumber">Staff Number</label>
            <div style="display: flex; gap: 12px;">
              <input type="text" id="staffNumber" placeholder="Enter staff number" style="flex: 1;">
              <button id="searchStaffBtn" class="btn btn-primary">Search</button>
            </div>
          </div>
          
          <div id="staffDetails" style="display: none; margin-top: 24px;">
            <div class="card" style="background-color: #f8fafc; padding: 20px; margin-bottom: 24px;">
              <h5 style="margin-bottom: 16px;">Staff Information</h5>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div>
                  <strong>Name:</strong> <span id="staffName"></span>
                </div>
                <div>
                  <strong>Department:</strong> <span id="staffDepartment"></span>
                </div>
                <div>
                  <strong>Designation:</strong> <span id="staffDesignation"></span>
                </div>
                <div>
                  <strong>Basic Salary:</strong> <span id="staffBasicSalary"></span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="isBonded">Bonded/Study Leave</label>
                <select id="isBonded" class="form-control">
                    <option value="0" selected>No</option>
                    <option value="1">Yes</option>
                </select>
            </div>
            
            <div class="form-group">
              <label for="basicSalaryInput">Basic Salary (USD)</label>
              <input type="number" id="basicSalaryInput" step="0.01" min="0">
            </div>
            
            <div class="form-group">
              <label>Allowances</label>
              <div id="allowancesList"></div>
            </div>
            
            <div class="form-group">
              <label>Deductions</label>
              <div id="deductionsList"></div>
            </div>
            
            <div class="card" style="background-color: #eff6ff; padding: 20px; margin: 24px 0;">
              <h5 style="margin-bottom: 16px;">Payroll Summary</h5>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Basic Salary:</span>
                  <strong id="summaryBasic">$0.00</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: #10b981;">
                  <span>Total Allowances:</span>
                  <strong id="summaryAllowances">$0.00</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Gross Salary:</span>
                  <strong id="summaryGross">$0.00</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: #ef4444;">
                  <span>Total Deductions:</span>
                  <strong id="summaryDeductions">$0.00</strong>
                </div>
                <div style="border-top: 2px solid #2563eb; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 18px;">
                  <span>Net Salary (USD):</span>
                  <strong id="summaryNet">$0.00</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; color: #2563eb;">
                  <span>Net Salary (GHS):</span>
                  <strong id="summaryNetGHS">GHS 0.00</strong>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                  Exchange Rate: <span id="exchangeRate">1.0000</span>
                </div>
              </div>
            </div>
            
            <div style="display: flex; gap: 12px;">
              <button id="savePayrollBtn" class="btn btn-success">Save Payroll Entry</button>
              <button id="resetFormBtn" class="btn btn-secondary">Reset</button>
            </div>
          </div>
        </div>
        
        <div id="payrollEntries" style="display: none; margin-top: 32px;">
          <h4 style="margin-bottom: 20px;">Payroll Entries</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Staff Number</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary (GHS)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="entriesTableBody">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

	// Set current month and year
	const now = new Date();
	document.getElementById("payrollMonth").value = now.getMonth() + 1;
	document.getElementById("payrollYear").value = now.getFullYear();

	// Initialize payroll manager
	const payrollManager = new window.PayrollManager();
	payrollManager.initialize();

	// Setup event listeners
	setupPayrollEventListeners(payrollManager);
}

function generateYearOptions() {
	const currentYear = new Date().getFullYear();
	let options = "";
	for (let year = currentYear - 5; year <= currentYear + 5; year++) {
		options += `<option value="${year}" ${
			year === currentYear ? "selected" : ""
		}>${year}</option>`;
	}
	return options;
}

function setupPayrollEventListeners(payrollManager) {
	// Select period button
	document
		.getElementById("selectPeriodBtn")
		.addEventListener("click", async () => {
			const month = document.getElementById("payrollMonth").value;
			const year = document.getElementById("payrollYear").value;

			// Create or get period
			try {
				const response = await window.ApiService.post(
					window.API_ENDPOINTS.PAYROLL_PERIODS,
					{
						month: Number.parseInt(month),
						year: Number.parseInt(year),
					}
				);

				if (response.success) {
					payrollManager.currentPeriod = response.id;
					document.getElementById("payrollForm").style.display = "block";
					document.getElementById("payrollEntries").style.display = "block";
					loadPayrollEntries(response.id);
				}
			} catch (error) {
				// Period might already exist, try to get it
				const periods = await window.ApiService.get(
					window.API_ENDPOINTS.PAYROLL_PERIODS
				);
				const period = periods.data.find(
					(p) => p.month == month && p.year == year
				);

				if (period) {
					payrollManager.currentPeriod = period.id;
					document.getElementById("payrollForm").style.display = "block";
					document.getElementById("payrollEntries").style.display = "block";
					loadPayrollEntries(period.id);
				}
			}
		});

	// Search staff button
	document
		.getElementById("searchStaffBtn")
		.addEventListener("click", async () => {
			const staffNumber = document.getElementById("staffNumber").value;

			if (!staffNumber) {
				alert("Please enter a staff number");
				return;
			}

			const staff = await payrollManager.searchStaff(staffNumber);

			if (staff) {
				displayStaffDetails(staff, payrollManager);
				await loadAllowancesAndDeductions(payrollManager);
			} else {
				alert("Staff not found");
			}
		});

	// Calculate on input change
	document.getElementById("basicSalaryInput")?.addEventListener("input", () => {
		calculateAndDisplaySummary(payrollManager);
	});

	// Save payroll button
	document
		.getElementById("savePayrollBtn")
		?.addEventListener("click", async () => {
			await savePayrollEntry(payrollManager);
		});

	// Reset button
	document.getElementById("resetFormBtn")?.addEventListener("click", () => {
		resetPayrollForm();
	});

	// Display exchange rate
	document.getElementById("exchangeRate").textContent =
		payrollManager.currencyRate.toFixed(4);
}

function displayStaffDetails(staff, payrollManager) {
	document.getElementById("staffName").textContent =
		`${staff.first_name} ${staff.last_name}` +
		(staff.other_names ? ` ${staff.other_names}` : "");
	document.getElementById("staffDepartment").textContent =
		staff.department_name || "N/A";
	document.getElementById("staffDesignation").textContent =
		staff.designation_name || "N/A";
	document.getElementById("staffBasicSalary").textContent =
		payrollManager.formatCurrency(staff.basic_salary);

	document.getElementById("basicSalaryInput").value = staff.basic_salary;
	document.getElementById("staffDetails").style.display = "block";
}

async function loadAllowancesAndDeductions(payrollManager) {
	try {
		const [allowancesRes, deductionsRes] = await Promise.all([
			window.ApiService.get(window.API_ENDPOINTS.ALLOWANCES),
			window.ApiService.get(window.API_ENDPOINTS.DEDUCTIONS),
		]);

		if (allowancesRes.success) {
			displayAllowances(allowancesRes.data, payrollManager);
		}

		if (deductionsRes.success) {
			displayDeductions(deductionsRes.data, payrollManager);
		}
	} catch (error) {
		console.error("Error loading allowances and deductions:", error);
	}
}

function displayAllowances(allowances, payrollManager) {
	const container = document.getElementById("allowancesList");
	container.innerHTML = allowances
		.map(
			(allowance) => `
    <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px;">
      <input type="checkbox" id="allow_${allowance.id}" data-id="${
				allowance.id
			}" class="allowance-checkbox" data-isBonded="${
				allowance.is_bonded ? 1 : 0
			}">
      <label for="allow_${allowance.id}" style="flex: 1; margin: 0;">${
				allowance.allowance_name
			}</label>
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="number" id="allow_amount_${allowance.id}" placeholder="${
				allowance.is_percentage ? "%" : "Amount"
			}" 
               step="0.01" min="0" value="${allowance.default_amount}" 
               style="width: 100px;" disabled>
        <span style="font-size: 12px; color: #64748b;">${
					allowance.is_percentage ? "%" : "USD"
				}</span>
      </div>
    </div>
  `
		)
		.join("");

	// Add event listeners
	document.querySelectorAll(".allowance-checkbox").forEach((checkbox) => {
		checkbox.addEventListener("change", (e) => {
			const amountInput = document.getElementById(
				`allow_amount_${e.target.dataset.id}`
			);
			amountInput.disabled = !e.target.checked;
			calculateAndDisplaySummary(payrollManager);
		});
	});

	document.querySelectorAll('[id^="allow_amount_"]').forEach((input) => {
		input.addEventListener("input", () => {
			calculateAndDisplaySummary(payrollManager);
		});
	});
}

// function to hide all allowances that are bonded when bonded is yes
function hideBondedAllowances() {
	const isBonded = document.getElementById("isBonded").value === "1";
	document.querySelectorAll(".allowance-checkbox").forEach((checkbox) => {
		const isBondedAllowance = checkbox.dataset.isBonded === "1";
		const amountInput = document.getElementById(
			`allow_amount_${checkbox.dataset.id}`
		);
		if (isBonded && isBondedAllowance) {
			checkbox.checked = false;
			checkbox.disabled = true;
			amountInput.value = "";
			amountInput.disabled = true;
		} else {
			checkbox.disabled = false;
		}
	});
	calculateAndDisplaySummary();
}

// Attach event listener to bonded select
document
	.getElementById("isBonded")
	?.addEventListener("change", hideBondedAllowances);

function displayDeductions(deductions, payrollManager) {
	const container = document.getElementById("deductionsList");
	container.innerHTML = deductions
		.map(
			(deduction) => `
    <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px;">
      <input type="checkbox" id="deduct_${deduction.id}" data-id="${
				deduction.id
			}" class="deduction-checkbox">
      <label for="deduct_${deduction.id}" style="flex: 1; margin: 0;">${
				deduction.deduction_name
			}</label>
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="number" id="deduct_amount_${deduction.id}" placeholder="${
				deduction.is_percentage ? "%" : "Amount"
			}" 
               step="0.01" min="0" value="${deduction.default_amount}" 
               style="width: 100px;" disabled>
        <span style="font-size: 12px; color: #64748b;">${
					deduction.is_percentage ? "%" : "USD"
				}</span>
      </div>
    </div>
  `
		)
		.join("");

	// Add event listeners
	document.querySelectorAll(".deduction-checkbox").forEach((checkbox) => {
		checkbox.addEventListener("change", (e) => {
			const amountInput = document.getElementById(
				`deduct_amount_${e.target.dataset.id}`
			);
			amountInput.disabled = !e.target.checked;
			calculateAndDisplaySummary(payrollManager);
		});
	});

	document.querySelectorAll('[id^="deduct_amount_"]').forEach((input) => {
		input.addEventListener("input", () => {
			calculateAndDisplaySummary(payrollManager);
		});
	});
}

function calculateAndDisplaySummary(payrollManager) {
	const basicSalary =
		Number.parseFloat(document.getElementById("basicSalaryInput").value) || 0;

	// Get selected allowances
	const allowances = [];
	document
		.querySelectorAll(".allowance-checkbox:checked")
		.forEach((checkbox) => {
			const id = checkbox.dataset.id;
			const amountInput = document.getElementById(`allow_amount_${id}`);
			const amount = Number.parseFloat(amountInput.value) || 0;

			// Determine if percentage based on placeholder
			const isPercentage = amountInput.placeholder.includes("%");

			allowances.push({
				allowance_id: Number.parseInt(id),
				amount: amount,
				is_percentage: isPercentage,
				percentage_value: isPercentage ? amount : 0,
			});
		});

	// Get selected deductions
	const deductions = [];
	document
		.querySelectorAll(".deduction-checkbox:checked")
		.forEach((checkbox) => {
			const id = checkbox.dataset.id;
			const amountInput = document.getElementById(`deduct_amount_${id}`);
			const amount = Number.parseFloat(amountInput.value) || 0;

			const isPercentage = amountInput.placeholder.includes("%");

			deductions.push({
				deduction_id: Number.parseInt(id),
				amount: amount,
				is_percentage: isPercentage,
				percentage_value: isPercentage ? amount : 0,
			});
		});

	// Calculate
	const summary = payrollManager.calculatePayroll(
		basicSalary,
		allowances,
		deductions
	);

	// Display
	document.getElementById("summaryBasic").textContent =
		payrollManager.formatCurrency(summary.basic_salary);
	document.getElementById("summaryAllowances").textContent =
		payrollManager.formatCurrency(summary.total_allowances);
	document.getElementById("summaryGross").textContent =
		payrollManager.formatCurrency(summary.gross_salary);
	document.getElementById("summaryDeductions").textContent =
		payrollManager.formatCurrency(summary.total_deductions);
	document.getElementById("summaryNet").textContent =
		payrollManager.formatCurrency(summary.net_salary);
	document.getElementById("summaryNetGHS").textContent =
		payrollManager.formatCurrencyGHS(summary.net_salary_ghs);
}

async function savePayrollEntry(payrollManager) {
	if (!payrollManager.currentPeriod || !payrollManager.currentStaff) {
		alert("Please select a period and staff member");
		return;
	}

	const basicSalary =
		Number.parseFloat(document.getElementById("basicSalaryInput").value) || 0;

	// Get selected allowances
	const allowances = [];
	document
		.querySelectorAll(".allowance-checkbox:checked")
		.forEach((checkbox) => {
			const id = checkbox.dataset.id;
			const amountInput = document.getElementById(`allow_amount_${id}`);
			const amount = Number.parseFloat(amountInput.value) || 0;
			const isPercentage = amountInput.placeholder.includes("%");

			allowances.push({
				allowance_id: Number.parseInt(id),
				amount: amount,
				is_percentage: isPercentage,
				percentage_value: isPercentage ? amount : 0,
			});
		});

	// Get selected deductions
	const deductions = [];
	document
		.querySelectorAll(".deduction-checkbox:checked")
		.forEach((checkbox) => {
			const id = checkbox.dataset.id;
			const amountInput = document.getElementById(`deduct_amount_${id}`);
			const amount = Number.parseFloat(amountInput.value) || 0;
			const isPercentage = amountInput.placeholder.includes("%");

			deductions.push({
				deduction_id: Number.parseInt(id),
				amount: amount,
				is_percentage: isPercentage,
				percentage_value: isPercentage ? amount : 0,
			});
		});

	try {
		const response = await payrollManager.savePayrollEntry(
			payrollManager.currentPeriod,
			payrollManager.currentStaff.id,
			basicSalary,
			allowances,
			deductions
		);

		if (response.success) {
			alert("Payroll entry saved successfully!");
			resetPayrollForm();
			loadPayrollEntries(payrollManager.currentPeriod);
		} else {
			alert(response.message || "Failed to save payroll entry");
		}
	} catch (error) {
		alert("An error occurred while saving the payroll entry");
		console.error(error);
	}
}

function resetPayrollForm() {
	document.getElementById("staffNumber").value = "";
	document.getElementById("staffDetails").style.display = "none";
	document
		.querySelectorAll(".allowance-checkbox, .deduction-checkbox")
		.forEach((cb) => {
			cb.checked = false;
		});
	document
		.querySelectorAll('[id^="allow_amount_"], [id^="deduct_amount_"]')
		.forEach((input) => {
			input.disabled = true;
		});
}

async function loadPayrollEntries(periodId) {
	try {
		const response = await window.ApiService.get(
			window.API_ENDPOINTS.PAYROLL_ENTRIES + `?period_id=${periodId}`
		);

		if (response.success) {
			const tbody = document.getElementById("entriesTableBody");
			tbody.innerHTML = response.data
				.map(
					(entry) => `
        <tr>
          <td>${entry.staff_number}</td>
          <td>${entry.first_name} ${entry.last_name}</td>
          <td>${entry.department_name || "N/A"}</td>
          <td>$${Number.parseFloat(entry.basic_salary).toFixed(2)}</td>
          <td style="color: #10b981;">$${Number.parseFloat(
						entry.total_allowances
					).toFixed(2)}</td>
          <td style="color: #ef4444;">$${Number.parseFloat(
						entry.total_deductions
					).toFixed(2)}</td>
          <td><strong>GHS ${Number.parseFloat(
						entry.net_salary_ghs
					).toLocaleString()}</strong></td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-danger" onclick="deletePayrollEntry(${
								entry.id
							})">Delete</button>
            </div>
          </td>
        </tr>
      `
				)
				.join("");
		}
	} catch (error) {
		console.error("Error loading payroll entries:", error);
	}
}

async function deletePayrollEntry(entryId) {
	if (!confirm("Are you sure you want to delete this payroll entry?")) {
		return;
	}

	try {
		const response = await window.ApiService.delete(
			window.API_ENDPOINTS.PAYROLL_ENTRIES,
			{ id: entryId }
		);

		if (response.success) {
			alert("Payroll entry deleted successfully");
			// Reload entries
			const periodId = document.querySelector("#payrollForm").dataset.periodId;
			if (periodId) {
				loadPayrollEntries(periodId);
			}
		}
	} catch (error) {
		alert("Failed to delete payroll entry");
		console.error(error);
	}
}

function loadReportsPage() {
	const mainContent = document.getElementById("mainContent");

	mainContent.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Reports & Analytics</h3>
      </div>
      <div style="padding: 24px;">
        <div class="form-row" style="margin-bottom: 24px;">
          <div class="form-group">
            <label for="reportType">Report Type</label>
            <select id="reportType" class="form-control">
              <option value="payroll_summary">Payroll Summary</option>
              <option value="department_payroll">Department Payroll</option>
              <option value="yearly_comparison">Yearly Comparison</option>
              <option value="allowances_deductions">Allowances & Deductions Breakdown</option>
            </select>
          </div>
          <div class="form-group" id="monthGroup">
            <label for="reportMonth">Month</label>
            <select id="reportMonth" class="form-control">
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div class="form-group">
            <label for="reportYear">Year</label>
            <select id="reportYear" class="form-control">
              ${generateYearOptions()}
            </select>
          </div>
        </div>
        
        <button id="generateReportBtn" class="btn btn-primary">Generate Report</button>
        <button id="exportReportBtn" class="btn btn-secondary" style="display: none;">Export to CSV</button>
        
        <div id="reportContent" style="margin-top: 32px;"></div>
      </div>
    </div>
  `;

	// Set current month and year
	const now = new Date();
	document.getElementById("reportMonth").value = now.getMonth() + 1;
	document.getElementById("reportYear").value = now.getFullYear();

	// Setup event listeners
	setupReportsEventListeners();
}

function setupReportsEventListeners() {
	const reportType = document.getElementById("reportType");
	const monthGroup = document.getElementById("monthGroup");

	reportType.addEventListener("change", () => {
		// Hide month selector for yearly comparison
		if (reportType.value === "yearly_comparison") {
			monthGroup.style.display = "none";
		} else {
			monthGroup.style.display = "block";
		}
	});

	document
		.getElementById("generateReportBtn")
		.addEventListener("click", generateReport);
	document
		.getElementById("exportReportBtn")
		.addEventListener("click", exportReport);
}

async function generateReport() {
	const reportType = document.getElementById("reportType").value;
	const month = document.getElementById("reportMonth").value;
	const year = document.getElementById("reportYear").value;

	const reportContent = document.getElementById("reportContent");
	reportContent.innerHTML =
		'<p style="text-align: center; padding: 40px;">Loading report...</p>';

	try {
		let url = `${window.API_ENDPOINTS.REPORTS}?type=${reportType}`;

		if (reportType !== "yearly_comparison") {
			url += `&month=${month}`;
		}
		url += `&year=${year}`;

		const response = await window.ApiService.get(url);

		if (response.success) {
			document.getElementById("exportReportBtn").style.display = "inline-flex";

			switch (reportType) {
				case "payroll_summary":
					displayPayrollSummary(response.data);
					break;
				case "department_payroll":
					displayDepartmentPayroll(response.data);
					break;
				case "yearly_comparison":
					displayYearlyComparison(response.data);
					break;
				case "allowances_deductions":
					displayAllowancesDeductions(response.data);
					break;
			}
		} else {
			reportContent.innerHTML =
				'<p style="text-align: center; padding: 40px; color: #ef4444;">Failed to load report</p>';
		}
	} catch (error) {
		console.error("Error generating report:", error);
		reportContent.innerHTML =
			'<p style="text-align: center; padding: 40px; color: #ef4444;">An error occurred</p>';
	}
}

function displayPayrollSummary(data) {
	const reportContent = document.getElementById("reportContent");

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	reportContent.innerHTML = `
    <div class="card" style="background-color: #f8fafc; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin-bottom: 16px;">Payroll Summary - ${
				monthNames[data.period.month - 1]
			} ${data.period.year}</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div>
          <div style="font-size: 12px; color: #64748b;">Total Staff</div>
          <div style="font-size: 24px; font-weight: 700;">${
						data.totals.count
					}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b;">Total Basic Salary</div>
          <div style="font-size: 24px; font-weight: 700;">$${Number.parseFloat(
						data.totals.basic_salary
					).toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b;">Total Allowances</div>
          <div style="font-size: 24px; font-weight: 700; color: #10b981;">$${Number.parseFloat(
						data.totals.total_allowances
					).toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b;">Total Deductions</div>
          <div style="font-size: 24px; font-weight: 700; color: #ef4444;">$${Number.parseFloat(
						data.totals.total_deductions
					).toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b;">Total Net (GHS)</div>
          <div style="font-size: 24px; font-weight: 700; color: #2563eb;">GHS ${Number.parseFloat(
						data.totals.net_salary_ghs
					).toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Staff No.</th>
            <th>Name</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Basic Salary</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th>Net Salary (GHS)</th>
            <th>Bank</th>
            <th>Account No.</th>
          </tr>
        </thead>
        <tbody>
          ${data.entries
						.map(
							(entry) => `
            <tr>
              <td>${entry.staff_number}</td>
              <td>${entry.staff_name}</td>
              <td>${entry.department_name || "N/A"}</td>
              <td>${entry.designation_name || "N/A"}</td>
              <td>$${Number.parseFloat(entry.basic_salary).toFixed(2)}</td>
              <td style="color: #10b981;">$${Number.parseFloat(
								entry.total_allowances
							).toFixed(2)}</td>
              <td style="color: #ef4444;">$${Number.parseFloat(
								entry.total_deductions
							).toFixed(2)}</td>
              <td><strong>GHS ${Number.parseFloat(
								entry.net_salary_ghs
							).toLocaleString()}</strong></td>
              <td>${entry.bank_name || "N/A"}</td>
              <td>${entry.account_number || "N/A"}</td>
            </tr>
          `
						)
						.join("")}
        </tbody>
      </table>
    </div>
  `;
}

function displayDepartmentPayroll(data) {
	const reportContent = document.getElementById("reportContent");

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	reportContent.innerHTML = `
    <div class="card" style="background-color: #f8fafc; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin-bottom: 16px;">Department Payroll - ${
				monthNames[data.period.month - 1]
			} ${data.period.year}</h4>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Staff Count</th>
            <th>Total Basic</th>
            <th>Total Allowances</th>
            <th>Total Deductions</th>
            <th>Total Gross</th>
            <th>Total Net (GHS)</th>
          </tr>
        </thead>
        <tbody>
          ${data.departments
						.map(
							(dept) => `
            <tr>
              <td><strong>${dept.department_name || "Unassigned"}</strong></td>
              <td>${dept.staff_count}</td>
              <td>$${Number.parseFloat(dept.total_basic).toLocaleString()}</td>
              <td style="color: #10b981;">$${Number.parseFloat(
								dept.total_allowances
							).toLocaleString()}</td>
              <td style="color: #ef4444;">$${Number.parseFloat(
								dept.total_deductions
							).toLocaleString()}</td>
              <td>$${Number.parseFloat(dept.total_gross).toLocaleString()}</td>
              <td><strong>GHS ${Number.parseFloat(
								dept.total_net_ghs
							).toLocaleString()}</strong></td>
            </tr>
          `
						)
						.join("")}
        </tbody>
      </table>
    </div>
  `;
}

function displayYearlyComparison(data) {
	const reportContent = document.getElementById("reportContent");

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	// Calculate total
	let totalPayroll = 0;
	let totalStaff = 0;

	data.months.forEach((month) => {
		totalPayroll += Number.parseFloat(month.total_payroll || 0);
		totalStaff += Number.parseInt(month.staff_count || 0);
	});

	reportContent.innerHTML = `
    <div class="card" style="background-color: #f8fafc; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin-bottom: 16px;">Yearly Comparison - ${data.year}</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div>
          <div style="font-size: 12px; color: #64748b;">Total Annual Payroll</div>
          <div style="font-size: 24px; font-weight: 700; color: #2563eb;">GHS ${totalPayroll.toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b;">Average Monthly</div>
          <div style="font-size: 24px; font-weight: 700;">GHS ${(
						totalPayroll / (data.months.length || 1)
					).toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Staff Count</th>
            <th>Total Payroll (GHS)</th>
          </tr>
        </thead>
        <tbody>
          ${data.months
						.map(
							(month) => `
            <tr>
              <td><strong>${monthNames[month.month - 1]} ${
								month.year
							}</strong></td>
              <td>${month.staff_count || 0}</td>
              <td>GHS ${Number.parseFloat(
								month.total_payroll || 0
							).toLocaleString()}</td>
            </tr>
          `
						)
						.join("")}
        </tbody>
      </table>
    </div>
  `;
}

function displayAllowancesDeductions(data) {
	const reportContent = document.getElementById("reportContent");

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	reportContent.innerHTML = `
    <div class="card" style="background-color: #f8fafc; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin-bottom: 16px;">Allowances & Deductions Breakdown - ${
				monthNames[data.period.month - 1]
			} ${data.period.year}</h4>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
      <div>
        <h5 style="margin-bottom: 16px; color: #10b981;">Allowances</h5>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Allowance</th>
                <th>Usage Count</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
								data.allowances.length > 0
									? data.allowances
											.map(
												(allow) => `
                <tr>
                  <td>${allow.allowance_name}</td>
                  <td>${allow.usage_count}</td>
                  <td style="color: #10b981;"><strong>$${Number.parseFloat(
										allow.total_amount
									).toLocaleString()}</strong></td>
                </tr>
              `
											)
											.join("")
									: '<tr><td colspan="3" style="text-align: center; padding: 20px;">No allowances data</td></tr>'
							}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h5 style="margin-bottom: 16px; color: #ef4444;">Deductions</h5>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Deduction</th>
                <th>Usage Count</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
								data.deductions.length > 0
									? data.deductions
											.map(
												(deduct) => `
                <tr>
                  <td>${deduct.deduction_name}</td>
                  <td>${deduct.usage_count}</td>
                  <td style="color: #ef4444;"><strong>$${Number.parseFloat(
										deduct.total_amount
									).toLocaleString()}</strong></td>
                </tr>
              `
											)
											.join("")
									: '<tr><td colspan="3" style="text-align: center; padding: 20px;">No deductions data</td></tr>'
							}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function exportReport() {
	const reportType = document.getElementById("reportType").value;
	const month = document.getElementById("reportMonth").value;
	const year = document.getElementById("reportYear").value;

	// Get the table data
	const table = document.querySelector("#reportContent table");

	if (!table) {
		alert("No report data to export");
		return;
	}

	const csv = [];
	const rows = table.querySelectorAll("tr");

	rows.forEach((row) => {
		const cols = row.querySelectorAll("td, th");
		const csvRow = [];

		cols.forEach((col) => {
			csvRow.push('"' + col.textContent.replace(/"/g, '""') + '"');
		});

		csv.push(csvRow.join(","));
	});

	const csvContent = csv.join("\n");
	const blob = new Blob([csvContent], { type: "text/csv" });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");

	a.href = url;
	a.download = `${reportType}_${year}_${month}.csv`;
	a.click();

	window.URL.revokeObjectURL(url);
}
