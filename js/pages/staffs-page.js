class StaffsPage {
  constructor() {
    this.crudManager = new window.CRUDManager(window.API_ENDPOINTS.STAFFS, "staff")
    this.currentEditId = null
    this.showArchived = false
    this.departments = []
    this.designations = []
  }

  render() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Staff Management</h2>
          <div style="display: flex; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
              <input type="checkbox" id="showArchivedStaffs" ${this.showArchived ? "checked" : ""}>
              Show Archived
            </label>
            <button class="btn btn-primary" id="addStaffBtn">Add New Staff</button>
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
                <th>Basic Salary (USD)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="staffsTableBody">
              <tr>
                <td colspan="7" style="text-align: center;">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Staff Modal -->
      <div class="modal" id="staffModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title" id="staffModalTitle">Add New Staff</h3>
            <button class="modal-close" id="closeStaffModal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="staffForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Staff Number *</label>
                  <input type="text" id="staffNumber" required placeholder="e.g., STF001">
                </div>
                <div class="form-group">
                  <label>First Name *</label>
                  <input type="text" id="firstName" required placeholder="John">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Last Name *</label>
                  <input type="text" id="lastName" required placeholder="Doe">
                </div>
                <div class="form-group">
                  <label>Other Names</label>
                  <input type="text" id="otherNames" placeholder="Middle name(s)">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" id="email" placeholder="staff@example.com">
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" id="phone" placeholder="+233 XX XXX XXXX">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Department *</label>
                  <select id="departmentId" required>
                    <option value="">Select Department</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Designation *</label>
                  <select id="designationId" required>
                    <option value="">Select Designation</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Basic Salary (USD) *</label>
                  <input type="number" id="basicSalary" required step="0.01" min="0" placeholder="0.00">
                </div>
                <div class="form-group">
                  <label>Date of Joining</label>
                  <input type="date" id="dateOfJoining">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Bank Name</label>
                  <input type="text" id="bankName" placeholder="e.g., GCB Bank">
                </div>
                <div class="form-group">
                  <label>Account Number</label>
                  <input type="text" id="accountNumber" placeholder="Bank account number">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancelStaffBtn">Cancel</button>
            <button class="btn btn-primary" id="saveStaffBtn">Save Staff</button>
          </div>
        </div>
      </div>
    `
  }

  async loadDepartmentsAndDesignations() {
    try {
      const [deptResponse, desigResponse] = await Promise.all([
        window.ApiService.get(window.API_ENDPOINTS.DEPARTMENTS),
        window.ApiService.get(window.API_ENDPOINTS.DESIGNATIONS),
      ])

      if (deptResponse.success) {
        this.departments = deptResponse.data.filter((d) => !d.is_archived)
      }

      if (desigResponse.success) {
        this.designations = desigResponse.data.filter((d) => !d.is_archived)
      }

      this.populateDropdowns()
    } catch (error) {
      console.error("Error loading departments and designations:", error)
    }
  }

  populateDropdowns() {
    const deptSelect = document.getElementById("departmentId")
    const desigSelect = document.getElementById("designationId")

    if (deptSelect) {
      deptSelect.innerHTML =
        '<option value="">Select Department</option>' +
        this.departments.map((d) => `<option value="${d.id}">${d.department_name}</option>`).join("")
    }

    if (desigSelect) {
      desigSelect.innerHTML =
        '<option value="">Select Designation</option>' +
        this.designations.map((d) => `<option value="${d.id}">${d.designation_title}</option>`).join("")
    }
  }

  attachEventListeners() {
    document.getElementById("addStaffBtn").addEventListener("click", () => this.openModal())
    document.getElementById("closeStaffModal").addEventListener("click", () => this.closeModal())
    document.getElementById("cancelStaffBtn").addEventListener("click", () => this.closeModal())
    document.getElementById("saveStaffBtn").addEventListener("click", () => this.saveStaff())
    document.getElementById("showArchivedStaffs").addEventListener("change", (e) => {
      this.showArchived = e.target.checked
      this.loadStaffs()
    })
  }

  async loadStaffs() {
    try {
      const response = await this.crudManager.getAll(this.showArchived)
      const tbody = document.getElementById("staffsTableBody")

      if (response.success && response.data.length > 0) {
        tbody.innerHTML = response.data
          .map(
            (staff) => `
          <tr>
            <td><strong>${staff.staff_number}</strong></td>
            <td>${staff.first_name} ${staff.last_name}${staff.other_names ? " " + staff.other_names : ""}</td>
            <td>${staff.department_name || "-"}</td>
            <td>${staff.designation_name || "-"}</td>
            <td>$${Number.parseFloat(staff.basic_salary).toFixed(2)}</td>
            <td><span class="badge ${staff.is_archived ? "badge-danger" : "badge-success"}">${staff.is_archived ? "Archived" : "Active"}</span></td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="staffsPage.editStaff(${staff.id})">Edit</button>
                ${
                  !staff.is_archived
                    ? `<button class="btn btn-sm btn-warning" onclick="staffsPage.archiveStaff(${staff.id})">Archive</button>`
                    : `<button class="btn btn-sm btn-success" onclick="staffsPage.unarchiveStaff(${staff.id})">Unarchive</button>`
                }
                <button class="btn btn-sm btn-danger" onclick="staffsPage.deleteStaff(${staff.id})">Delete</button>
              </div>
            </td>
          </tr>
        `,
          )
          .join("")
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="7">
              <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <div class="empty-state-text">No staff members found</div>
              </div>
            </td>
          </tr>
        `
      }
    } catch (error) {
      console.error("Error loading staffs:", error)
      alert("Failed to load staff members")
    }
  }

  openModal(staff = null) {
    this.currentEditId = staff ? staff.id : null
    const modal = document.getElementById("staffModal")
    const title = document.getElementById("staffModalTitle")
    const form = document.getElementById("staffForm")

    title.textContent = staff ? "Edit Staff" : "Add New Staff"
    form.reset()

    if (staff) {
      document.getElementById("staffNumber").value = staff.staff_number
      document.getElementById("firstName").value = staff.first_name
      document.getElementById("lastName").value = staff.last_name
      document.getElementById("otherNames").value = staff.other_names || ""
      document.getElementById("email").value = staff.email || ""
      document.getElementById("phone").value = staff.phone || ""
      document.getElementById("departmentId").value = staff.department_id || ""
      document.getElementById("designationId").value = staff.designation_id || ""
      document.getElementById("basicSalary").value = staff.basic_salary
      document.getElementById("dateOfJoining").value = staff.date_of_joining || ""
      document.getElementById("bankName").value = staff.bank_name || ""
      document.getElementById("accountNumber").value = staff.account_number || ""
    }

    modal.classList.add("active")
  }

  closeModal() {
    document.getElementById("staffModal").classList.remove("active")
    this.currentEditId = null
  }

  async saveStaff() {
    const staffNumber = document.getElementById("staffNumber").value.trim()
    const firstName = document.getElementById("firstName").value.trim()
    const lastName = document.getElementById("lastName").value.trim()
    const otherNames = document.getElementById("otherNames").value.trim()
    const email = document.getElementById("email").value.trim()
    const phone = document.getElementById("phone").value.trim()
    const departmentId = document.getElementById("departmentId").value
    const designationId = document.getElementById("designationId").value
    const basicSalary = document.getElementById("basicSalary").value
    const dateOfJoining = document.getElementById("dateOfJoining").value
    const bankName = document.getElementById("bankName").value.trim()
    const accountNumber = document.getElementById("accountNumber").value.trim()

    if (!staffNumber || !firstName || !lastName || !departmentId || !designationId || !basicSalary) {
      alert("Please fill in all required fields")
      return
    }

    const data = {
      staff_number: staffNumber,
      first_name: firstName,
      last_name: lastName,
      other_names: otherNames || null,
      email: email || null,
      phone: phone || null,
      department_id: Number.parseInt(departmentId),
      designation_id: Number.parseInt(designationId),
      basic_salary: Number.parseFloat(basicSalary),
      date_of_joining: dateOfJoining || null,
      bank_name: bankName || null,
      account_number: accountNumber || null,
    }

    try {
      const response = await this.crudManager.save(data, this.currentEditId)
      if (response.success) {
        alert(this.currentEditId ? "Staff updated successfully!" : "Staff created successfully!")
        this.closeModal()
        await this.loadStaffs()
      } else {
        alert(response.message || "An error occurred while saving the staff")
      }
    } catch (error) {
      console.error("Error saving staff:", error)
      alert("An error occurred while saving the staff")
    }
  }

  async editStaff(id) {
    try {
      const response = await this.crudManager.getById(id)
      if (response.success && response.data) {
        this.openModal(response.data)
      }
    } catch (error) {
      console.error("Error loading staff:", error)
      alert("Failed to load staff details")
    }
  }

  async archiveStaff(id) {
    if (!confirm("Are you sure you want to archive this staff member?")) return

    try {
      const response = await this.crudManager.archive(id, true)
      if (response.success) {
        alert("Staff archived successfully")
        await this.loadStaffs()
      } else {
        alert(response.message || "Failed to archive staff")
      }
    } catch (error) {
      console.error("Error archiving staff:", error)
      alert("An error occurred while archiving the staff")
    }
  }

  async unarchiveStaff(id) {
    try {
      const response = await this.crudManager.archive(id, false)
      if (response.success) {
        alert("Staff unarchived successfully")
        await this.loadStaffs()
      } else {
        alert(response.message || "Failed to unarchive staff")
      }
    } catch (error) {
      console.error("Error unarchiving staff:", error)
      alert("An error occurred while unarchiving the staff")
    }
  }

  async deleteStaff(id) {
    if (!confirm("Are you sure you want to permanently delete this staff member? This action cannot be undone.")) return

    try {
      const response = await this.crudManager.delete(id)
      if (response.success) {
        alert("Staff deleted successfully")
        await this.loadStaffs()
      } else {
        alert(response.message || "Failed to delete staff")
      }
    } catch (error) {
      console.error("Error deleting staff:", error)
      alert("An error occurred while deleting the staff")
    }
  }

  async init() {
    await this.loadDepartmentsAndDesignations()
    this.attachEventListeners()
    await this.loadStaffs()
  }
}

window.staffsPage = new StaffsPage()
