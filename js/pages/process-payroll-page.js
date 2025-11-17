class ProcessPayrollPage {
  constructor() {
    this.crudManager = new window.CRUDManager(window.API_ENDPOINTS.PAYROLL_ENTRIES, "payroll")
    this.departments = []
    this.selectedDepartment = ""
    this.staffList = []
    this.selectedPeriodMonth = new Date().getMonth() + 1
    this.selectedPeriodYear = new Date().getFullYear()
  }

  render() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Process Payroll</h2>
          <div style="display: flex; gap: 12px; align-items: center;">
            <div>
              <label style="margin-right: 8px;">Period:</label>
              <select id="periodMonthSelect" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; width: 100px;">
                ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i + 1 === this.selectedPeriodMonth ? "selected" : ""}>${String(i + 1).padStart(2, "0")}</option>`).join("")}
              </select>
              <select id="periodYearSelect" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; width: 100px; margin-left: 8px;">
                ${Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return `<option value="${year}" ${year === this.selectedPeriodYear ? "selected" : ""}>${year}</option>`
                }).join("")}
              </select>
            </div>
            <select id="departmentFilterSelect" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; flex: 1; max-width: 300px;">
              <option value="">All Departments</option>
            </select>
          </div>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Staff Number</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Currency</th>
                <th>Basic Salary</th>
                <th>Leave Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="payrollStaffTableBody">
              <tr>
                <td colspan="8" style="text-align: center;">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payroll Breakdown Modal -->
      <div class="modal" id="payrollBreakdownModal">
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
          <div class="modal-header">
            <h3 class="modal-title">Payroll Breakdown</h3>
            <button class="modal-close" id="closePayrollBreakdownModal">&times;</button>
          </div>
          <div class="modal-body">
            <div id="payrollBreakdownContent">
              <!-- Content will be populated here -->
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="closePayrollBreakdownBtn">Close</button>
          </div>
        </div>
      </div>
    `
  }

  async loadDepartments() {
    try {
      const response = await window.ApiService.get(window.API_ENDPOINTS.DEPARTMENTS)
      if (response.success) {
        this.departments = response.data.filter((d) => !d.is_archived)
        this.populateDepartmentSelect()
      }
    } catch (error) {
      console.error("[v0] Error loading departments:", error)
    }
  }

  populateDepartmentSelect() {
    const select = document.getElementById("departmentFilterSelect")
    if (select) {
      select.innerHTML =
        '<option value="">All Departments</option>' +
        this.departments.map((d) => `<option value="${d.id}">${d.department_name}</option>`).join("")
    }
  }

  async loadStaffForProcessPayroll() {
    try {
      let url = window.API_ENDPOINTS.PAYROLL_LIST_BY_DEPARTMENT
      if (this.selectedDepartment) {
        url += `?department_id=${this.selectedDepartment}`
      }

      const response = await window.ApiService.get(url)
      const tbody = document.getElementById("payrollStaffTableBody")

      if (response.success && response.data.length > 0) {
        this.staffList = response.data
        tbody.innerHTML = response.data
          .map(
            (staff) => `
          <tr>
            <td><strong>${staff.staff_number}</strong></td>
            <td>${staff.first_name} ${staff.last_name}</td>
            <td>${staff.department_name || "-"}</td>
            <td>${staff.designation_name || "-"}</td>
            <td><span class="badge badge-info">${staff.salary_currency}</span></td>
            <td>${staff.salary_currency} ${Number.parseFloat(staff.basic_salary).toFixed(2)}</td>
            <td><span class="badge ${
              staff.on_bonded_or_study_leave ? "badge-warning" : "badge-success"
            }">${staff.on_bonded_or_study_leave ? "On Leave" : "Active"}</span></td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="processPayrollPage.viewPayrollBreakdown(${staff.id})">View Breakdown</button>
            </td>
          </tr>
        `,
          )
          .join("")
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center;">No staff members found</td>
          </tr>
        `
      }
    } catch (error) {
      console.error("[v0] Error loading staff:", error)
      alert("Failed to load staff members")
    }
  }

  async viewPayrollBreakdown(staffId) {
    try {
      const params = new URLSearchParams({
        staff_id: staffId,
        period_month: this.selectedPeriodMonth,
        period_year: this.selectedPeriodYear,
      })

      const response = await window.ApiService.get(
        `${window.API_ENDPOINTS.PAYROLL_PROCESS_DETAILS}?${params.toString()}`,
      )

      if (response.success && response.data) {
        this.displayPayrollBreakdown(response.data)
        const modal = document.getElementById("payrollBreakdownModal")
        modal.classList.add("active")
      }
    } catch (error) {
      console.error("[v0] Error fetching payroll breakdown:", error)
      alert("Failed to load payroll breakdown")
    }
  }

  displayPayrollBreakdown(data) {
    const content = document.getElementById("payrollBreakdownContent")
    const staff = data.staff
    const breakdown = data.data

    // Build allowances HTML
    let allowancesHTML = "<strong>Allowances:</strong><ul style='margin: 8px 0 16px 20px;'>"
    if (breakdown.allowances && breakdown.allowances.length > 0) {
      breakdown.allowances.forEach((allowance) => {
        const amount = allowance.calculated_amount.toFixed(2)
        const typeLabel = allowance.type === "percent" ? `(${allowance.amount}%)` : ""
        allowancesHTML += `<li>${allowance.allowance_name} ${typeLabel}: GHS ${amount}</li>`
      })
    } else {
      allowancesHTML += "<li>No allowances</li>"
    }
    allowancesHTML += "</ul>"

    // Build deductions HTML
    let deductionsHTML = "<strong>Deductions:</strong><ul style='margin: 8px 0 16px 20px;'>"
    if (breakdown.deductions && breakdown.deductions.length > 0) {
      breakdown.deductions.forEach((deduction) => {
        const amount = deduction.calculated_amount.toFixed(2)
        const typeLabel = deduction.type === "percent" ? `(${deduction.amount}%)` : ""
        deductionsHTML += `<li>${deduction.deduction_name} ${typeLabel}: GHS ${amount}</li>`
      })
    } else {
      deductionsHTML += "<li>No deductions</li>"
    }
    deductionsHTML += "</ul>"

    // Build exchange rate info
    let exchangeRateHTML = ""
    if (breakdown.salary_currency === "USD") {
      exchangeRateHTML = `
        <div style="background: #f0f8ff; padding: 12px; border-radius: 4px; margin: 12px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>Exchange Rate Used:</strong></span>
            <span>1 USD = GHS ${breakdown.exchange_rate.toFixed(4)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Net Salary (GHS equivalent):</strong></span>
            <strong style="color: #28a745;">GHS ${(breakdown.net_salary * breakdown.exchange_rate).toFixed(2)}</strong>
          </div>
        </div>
      `
    }

    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4>${staff.first_name} ${staff.last_name} (${staff.staff_number})</h4>
        <p><strong>Department:</strong> ${staff.department_name || "-"}</p>
        <p><strong>Designation:</strong> ${staff.designation_name || "-"}</p>
        <p><strong>Status:</strong> ${staff.status} | <strong>Leave Status:</strong> ${staff.on_bonded_or_study_leave ? "On Leave" : "Active"}</p>
      </div>

      <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Basic Salary (${breakdown.salary_currency}):</span>
          <strong>${breakdown.basic_salary.toFixed(2)}</strong>
        </div>
        ${
          breakdown.salary_currency === "USD"
            ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; color: #666;">
            <span>Basic Salary (GHS):</span>
            <span>${breakdown.basic_salary_local.toFixed(2)}</span>
          </div>
        `
            : ""
        }
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Total Allowances:</span>
          <strong style="color: green;">+${breakdown.total_allowances.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Gross Salary:</span>
          <strong>${breakdown.gross_salary.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Total Deductions:</span>
          <strong style="color: red;">-${breakdown.total_deductions.toFixed(2)}</strong>
        </div>
        <hr>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: bold;">Net Salary (${breakdown.salary_currency}):</span>
          <strong style="font-size: 16px; color: #007bff;">${breakdown.net_salary.toFixed(2)}</strong>
        </div>
        ${exchangeRateHTML}
      </div>

      <div style="margin-bottom: 15px;">
        ${allowancesHTML}
      </div>

      <div>
        ${deductionsHTML}
      </div>
    `
  }

  attachEventListeners() {
    document.getElementById("departmentFilterSelect").addEventListener("change", (e) => {
      this.selectedDepartment = e.target.value
      this.loadStaffForProcessPayroll()
    })

    document.getElementById("periodMonthSelect").addEventListener("change", (e) => {
      this.selectedPeriodMonth = Number.parseInt(e.target.value)
    })

    document.getElementById("periodYearSelect").addEventListener("change", (e) => {
      this.selectedPeriodYear = Number.parseInt(e.target.value)
    })

    document.getElementById("closePayrollBreakdownModal").addEventListener("click", () => {
      document.getElementById("payrollBreakdownModal").classList.remove("active")
    })

    document.getElementById("closePayrollBreakdownBtn").addEventListener("click", () => {
      document.getElementById("payrollBreakdownModal").classList.remove("active")
    })

    // Close modal when clicking outside
    document.getElementById("payrollBreakdownModal").addEventListener("click", (e) => {
      if (e.target.id === "payrollBreakdownModal") {
        document.getElementById("payrollBreakdownModal").classList.remove("active")
      }
    })
  }

  async init() {
    await this.loadDepartments()
    this.attachEventListeners()
    await this.loadStaffForProcessPayroll()
  }
}

window.processPayrollPage = new ProcessPayrollPage()
