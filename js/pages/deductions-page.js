class DeductionsPage {
	constructor() {
		this.crudManager = new window.CRUDManager(
			window.API_ENDPOINTS.DEDUCTIONS,
			"deduction"
		);
		this.currentDeduction = null;
		this.showArchived = false;
	}

	render() {
		return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Deductions Management</h2>
          <div style="display: flex; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
              <input type="checkbox" id="showArchivedDeductions" ${
								this.showArchived ? "checked" : ""
							}>
              Show Archived
            </label>
            <button class="btn btn-primary" onclick="window.deductionsPage.showCreateModal()">
              <span>+</span> Add Deduction
            </button>
          </div>
        </div>
        
        <div class="table-container">
          <table id="deductions-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Default Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="deductions-tbody">
              <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                  <div class="loader" style="margin: 0 auto;"></div>
                  <p style="margin-top: 12px; color: var(--text-secondary);">Loading deductions...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div id="deduction-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title">Add Deduction</h3>
            <button class="modal-close" onclick="window.deductionsPage.closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <form id="deduction-form">
              <div class="form-group">
                <label for="deduction_code">Deduction Code *</label>
                <input type="text" id="deduction_code" name="deduction_code" required>
              </div>

              <div class="form-group">
                <label for="deduction_name">Deduction Name *</label>
                <input type="text" id="deduction_name" name="deduction_name" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="is_percentage">Type *</label>
                  <select id="is_percentage" name="is_percentage" required>
                    <option value="">Select Type</option>
                    <option value="0">Fixed Amount</option>
                    <option value="1">Percentage</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="default_amount">Default Amount *</label>
                  <input type="number" id="default_amount" name="default_amount" step="0.01" min="0" required>
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="3"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.deductionsPage.closeModal()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="window.deductionsPage.saveDeduction()">Save Deduction</button>
          </div>
        </div>
      </div>
    `;
	}

	async init() {
		this.attachEventListeners();
		await this.loadDeductions();
	}

	attachEventListeners() {
		// Add event listener for show archived checkbox after render
		setTimeout(() => {
			const checkbox = document.getElementById("showArchivedDeductions");
			if (checkbox) {
				checkbox.addEventListener("change", (e) => {
					this.showArchived = e.target.checked;
					this.loadDeductions();
				});
			}
		}, 100);
	}

	async loadDeductions() {
		try {
			const response = await this.crudManager.getAll(this.showArchived);
			console.log("[v0] Deductions response:", response);
			const deductions = response.data || [];
			this.renderTable(deductions);
		} catch (error) {
			console.error("[v0] Error loading deductions:", error);
			document.getElementById("deductions-tbody").innerHTML = `
        <tr>
          <td colspan="7" class="error-message">Failed to load deductions. Please try again.</td>
        </tr>
      `;
		}
	}

	renderTable(deductions) {
		const tbody = document.getElementById("deductions-tbody");

		if (deductions.length === 0) {
			tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-text">No deductions found. Create your first deduction to get started.</div>
          </td>
        </tr>
      `;
			return;
		}

		tbody.innerHTML = deductions
			.map(
				(deduction) => `
      <tr>
        <td><strong>${deduction.deduction_code}</strong></td>
        <td>${deduction.deduction_name}</td>
        <td><span class="badge badge-primary">${
					deduction.is_percentage ? "Percentage" : "Fixed"
				}</span></td>
        <td>${
					deduction.is_percentage
						? deduction.default_amount + "%"
						: "$" + Number.parseFloat(deduction.default_amount).toFixed(2)
				}</td>
        <td>${deduction.description || "-"}</td>
        <td>
          <span class="badge ${
						deduction.is_archived ? "badge-danger" : "badge-success"
					}">
            ${deduction.is_archived ? "Archived" : "Active"}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary" onclick="window.deductionsPage.showEditModal(${
							deduction.id
						})" title="Edit">
              Edit
            </button>
            <button class="btn btn-sm ${
							deduction.is_archived ? "btn-success" : "btn-warning"
						}" 
                    onclick="window.deductionsPage.toggleArchive(${
											deduction.id
										}, ${deduction.is_archived})" 
                    title="${deduction.is_archived ? "Unarchive" : "Archive"}">
              ${deduction.is_archived ? "Unarchive" : "Archive"}
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.deductionsPage.deleteDeduction(${
							deduction.id
						})" title="Delete">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `
			)
			.join("");
	}

	showCreateModal() {
		this.currentDeduction = null;
		document.getElementById("modal-title").textContent = "Add Deduction";
		document.getElementById("deduction-form").reset();
		document.getElementById("deduction-modal").classList.add("active");
	}

	async showEditModal(id) {
		try {
			const response = await this.crudManager.getById(id);
			this.currentDeduction = response.data;
			document.getElementById("modal-title").textContent = "Edit Deduction";

			document.getElementById("deduction_code").value =
				this.currentDeduction.deduction_code;
			document.getElementById("deduction_name").value =
				this.currentDeduction.deduction_name;
			document.getElementById("is_percentage").value =
				this.currentDeduction.is_percentage;
			document.getElementById("default_amount").value =
				this.currentDeduction.default_amount;
			document.getElementById("description").value =
				this.currentDeduction.description || "";

			document.getElementById("deduction-modal").classList.add("active");
		} catch (error) {
			console.error("[v0] Error loading deduction:", error);
			this.crudManager.showMessage("Failed to load deduction details", "error");
		}
	}

	closeModal() {
		document.getElementById("deduction-modal").classList.remove("active");
		this.currentDeduction = null;
	}

	async saveDeduction() {
		const form = document.getElementById("deduction-form");
		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		try {
			let response;
			if (this.currentDeduction) {
				response = await this.crudManager.update(
					this.currentDeduction.id,
					data
				);
			} else {
				response = await this.crudManager.create(data);
			}

			if (response.success) {
				this.crudManager.showMessage(
					response.message || "Deduction saved successfully!",
					"success"
				);
				this.closeModal();
				await this.loadDeductions();
			} else {
				this.crudManager.showMessage(
					response.message || "Failed to save deduction",
					"error"
				);
			}
		} catch (error) {
			console.error("[v0] Error saving deduction:", error);
			this.crudManager.showMessage(
				"Failed to save deduction. Please try again.",
				"error"
			);
		}
	}

	async toggleArchive(id, isArchived) {
		const action = isArchived ? "unarchive" : "archive";
		if (!confirm(`Are you sure you want to ${action} this deduction?`)) {
			return;
		}

		try {
			const response = await this.crudManager.archive(id, !isArchived);
			if (response.success) {
				this.crudManager.showMessage(
					`Deduction ${action}d successfully!`,
					"success"
				);
				await this.loadDeductions();
			} else {
				this.crudManager.showMessage(
					response.message || `Failed to ${action} deduction`,
					"error"
				);
			}
		} catch (error) {
			console.error(`[v0] Error ${action}ing deduction:`, error);
			this.crudManager.showMessage(
				`Failed to ${action} deduction. Please try again.`,
				"error"
			);
		}
	}

	async deleteDeduction(id) {
		if (
			!confirm(
				"Are you sure you want to permanently delete this deduction? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			const response = await this.crudManager.delete(id);
			if (response.success) {
				this.crudManager.showMessage(
					"Deduction deleted successfully!",
					"success"
				);
				await this.loadDeductions();
			} else {
				this.crudManager.showMessage(
					response.message || "Failed to delete deduction",
					"error"
				);
			}
		} catch (error) {
			console.error("[v0] Error deleting deduction:", error);
			this.crudManager.showMessage(
				"Failed to delete deduction. Please try again.",
				"error"
			);
		}
	}
}

window.deductionsPage = new DeductionsPage();
