// Generic CRUD Manager for handling common operations

class CRUDManager {
	constructor(endpoint, entityName) {
		this.endpoint = endpoint;
		this.entityName = entityName;
	}

	async getAll(includeArchived = false) {
		const url = includeArchived
			? `${this.endpoint}?include_archived=true`
			: this.endpoint;
		return await window.ApiService.get(url);
	}

	async getById(id) {
		return await window.ApiService.get(`${this.endpoint}?id=${id}`);
	}

	async create(data) {
		return await window.ApiService.post(this.endpoint, data);
	}

	async update(id, data) {
		return await window.ApiService.put(this.endpoint, { id, ...data });
	}

	async archive(id, isArchived = true) {
		return await window.ApiService.put(this.endpoint, {
			id,
			is_archived: isArchived,
		});
	}

	async delete(id) {
		return await window.ApiService.delete(this.endpoint, { id });
	}

	// UI Helper Methods
	showMessage(message, type = "success") {
		const messageDiv = document.createElement("div");
		messageDiv.className =
			type === "success" ? "success-message" : "error-message";
		messageDiv.textContent = message;
		messageDiv.style.position = "fixed";
		messageDiv.style.top = "20px";
		messageDiv.style.right = "20px";
		messageDiv.style.zIndex = "9999";
		messageDiv.style.padding = "12px 20px";
		messageDiv.style.borderRadius = "6px";
		messageDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

		document.body.appendChild(messageDiv);

		setTimeout(() => {
			messageDiv.remove();
		}, 3000);
	}

	confirmDelete(callback) {
		if (confirm(`Are you sure you want to delete this ${this.entityName}?`)) {
			callback();
		}
	}

	confirmArchive(callback) {
		if (confirm(`Are you sure you want to archive this ${this.entityName}?`)) {
			callback();
		}
	}
}

window.CRUDManager = CRUDManager;
