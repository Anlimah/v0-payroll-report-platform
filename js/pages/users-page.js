class UsersPage {
	constructor() {
		this.crudManager = new window.CRUDManager(
			window.API_ENDPOINTS.USERS,
			"user"
		);
		this.currentEditId = null;
		this.showArchived = false;
	}

	render() {
		return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">User Management</h2>
          <div style="display: flex; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
              <input type="checkbox" id="showArchivedUsers" ${
								this.showArchived ? "checked" : ""
							}>
              Show Archived
            </label>
            <button class="btn btn-primary" id="addUserBtn">Add New User</button>
          </div>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              <tr>
                <td colspan="6" style="text-align: center;">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Modal -->
      <div class="modal" id="userModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title" id="userModalTitle">Add New User</h3>
            <button class="modal-close" id="closeUserModal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="userForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Username *</label>
                  <input type="text" id="username" required>
                </div>
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" id="fullName" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" id="email" required>
                </div>
                <div class="form-group">
                  <label>Role *</label>
                  <select id="role" required>
                    <option value="">Select Role</option>
                    <option value="admin">Admin (HR/DUR)</option>
                    <option value="view">View Only (UR/Auditor)</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group" id="passwordGroup">
                <label>Password *</label>
                <input type="password" id="password">
                <small style="color: var(--text-secondary); font-size: 12px;">
                  Leave blank to keep current password (when editing)
                </small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancelUserBtn">Cancel</button>
            <button class="btn btn-primary" id="saveUserBtn">Save User</button>
          </div>
        </div>
      </div>
    `;
	}

	attachEventListeners() {
		document
			.getElementById("addUserBtn")
			.addEventListener("click", () => this.openModal());
		document
			.getElementById("closeUserModal")
			.addEventListener("click", () => this.closeModal());
		document
			.getElementById("cancelUserBtn")
			.addEventListener("click", () => this.closeModal());
		document
			.getElementById("saveUserBtn")
			.addEventListener("click", () => this.saveUser());
		document
			.getElementById("showArchivedUsers")
			.addEventListener("change", (e) => {
				this.showArchived = e.target.checked;
				this.loadUsers();
			});
	}

	async loadUsers() {
		try {
			const response = await this.crudManager.getAll(this.showArchived);
			const tbody = document.getElementById("usersTableBody");

			if (response.success && response.data.length > 0) {
				tbody.innerHTML = response.data
					.map(
						(user) => `
          <tr>
            <td>${user.username}</td>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td><span class="badge ${
							user.role === "admin" ? "badge-primary" : "badge-success"
						}">${user.role}</span></td>
            <td><span class="badge ${
							user.is_archived ? "badge-danger" : "badge-success"
						}">${user.is_archived ? "Archived" : "Active"}</span></td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="usersPage.editUser(${
									user.id
								})">Edit</button>
                ${
									!user.is_archived
										? `<button class="btn btn-sm btn-warning" onclick="usersPage.archiveUser(${user.id})">Archive</button>`
										: `<button class="btn btn-sm btn-success" onclick="usersPage.unarchiveUser(${user.id})">Unarchive</button>`
								}
                <button class="btn btn-sm btn-danger" onclick="usersPage.deleteUser(${
									user.id
								})">Delete</button>
              </div>
            </td>
          </tr>
        `
					)
					.join("");
			} else {
				tbody.innerHTML = `
          <tr>
            <td colspan="6">
              <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <div class="empty-state-text">No users found</div>
              </div>
            </td>
          </tr>
        `;
			}
		} catch (error) {
			console.error("Error loading users:", error);
			alert("Failed to load users");
		}
	}

	openModal(user = null) {
		this.currentEditId = user ? user.id : null;
		const modal = document.getElementById("userModal");
		const title = document.getElementById("userModalTitle");
		const form = document.getElementById("userForm");

		title.textContent = user ? "Edit User" : "Add New User";
		form.reset();

		if (user) {
			document.getElementById("username").value = user.username;
			document.getElementById("fullName").value = user.full_name;
			document.getElementById("email").value = user.email;
			document.getElementById("role").value = user.role;
			document.getElementById("password").removeAttribute("required");
		} else {
			document.getElementById("password").setAttribute("required", "required");
		}

		modal.classList.add("active");
	}

	closeModal() {
		document.getElementById("userModal").classList.remove("active");
		this.currentEditId = null;
	}

	async saveUser() {
		const username = document.getElementById("username").value.trim();
		const fullName = document.getElementById("fullName").value.trim();
		const email = document.getElementById("email").value.trim();
		const role = document.getElementById("role").value;
		const password = document.getElementById("password").value;

		if (!username || !fullName || !email || !role) {
			alert("Please fill in all required fields");
			return;
		}

		if (!this.currentEditId && !password) {
			alert("Password is required for new users");
			return;
		}

		const data = { username, full_name: fullName, email, role };
		if (password) {
			data.password = password;
		}

		try {
			let response;
			if (this.currentEditId) {
				response = await this.crudManager.update(this.currentEditId, data);
			} else {
				response = await this.crudManager.create(data);
			}

			if (response.success) {
				alert(response.message || "User saved successfully");
				this.closeModal();
				await this.loadUsers();
			} else {
				alert(response.message || "Failed to save user");
			}
		} catch (error) {
			console.error("Error saving user:", error);
			alert("An error occurred while saving the user");
		}
	}

	async editUser(id) {
		try {
			const response = await this.crudManager.getById(id);
			if (response.success && response.data) {
				this.openModal(response.data);
			}
		} catch (error) {
			console.error("Error loading user:", error);
			alert("Failed to load user details");
		}
	}

	async archiveUser(id) {
		if (!confirm("Are you sure you want to archive this user?")) return;

		try {
			const response = await this.crudManager.archive(id, true);
			if (response.success) {
				alert("User archived successfully");
				await this.loadUsers();
			} else {
				alert(response.message || "Failed to archive user");
			}
		} catch (error) {
			console.error("Error archiving user:", error);
			alert("An error occurred while archiving the user");
		}
	}

	async unarchiveUser(id) {
		try {
			const response = await this.crudManager.archive(id, false);
			if (response.success) {
				alert("User unarchived successfully");
				await this.loadUsers();
			} else {
				alert(response.message || "Failed to unarchive user");
			}
		} catch (error) {
			console.error("Error unarchiving user:", error);
			alert("An error occurred while unarchiving the user");
		}
	}

	async deleteUser(id) {
		if (
			!confirm(
				"Are you sure you want to permanently delete this user? This action cannot be undone."
			)
		)
			return;

		try {
			const response = await this.crudManager.delete(id);
			if (response.success) {
				alert("User deleted successfully");
				await this.loadUsers();
			} else {
				alert(response.message || "Failed to delete user");
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			alert("An error occurred while deleting the user");
		}
	}

	async init() {
		this.attachEventListeners();
		await this.loadUsers();
	}
}

window.usersPage = new UsersPage();
