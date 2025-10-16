class ApiService {
	static async request(url, options = {}) {
		const defaultOptions = {
			headers: window.AuthService.getAuthHeaders(),
		};

		const mergedOptions = {
			...defaultOptions,
			...options,
			headers: {
				...defaultOptions.headers,
				...options.headers,
			},
		};

		try {
			const response = await fetch(url, mergedOptions);
			const data = await response.json();

			if (response.status === 401) {
				window.AuthService.logout();
				return;
			}

			return data;
		} catch (error) {
			console.error("API Error:", error);
			throw error;
		}
	}

	static async get(url) {
		return this.request(url, { method: "GET" });
	}

	static async post(url, body) {
		return this.request(url, {
			method: "POST",
			body: JSON.stringify(body),
		});
	}

	static async put(url, body) {
		return this.request(url, {
			method: "PUT",
			body: JSON.stringify(body),
		});
	}

	static async delete(url) {
		return this.request(url, { method: "DELETE" });
	}
}

window.ApiService = ApiService;
