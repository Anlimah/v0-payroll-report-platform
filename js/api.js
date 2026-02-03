if (!window.API_ENDPOINTS) {
  throw new Error("API_ENDPOINTS not loaded. Check script order.");
}

class ApiService {
	
	static async request(url, options = {}) {
  const token = window.AuthService.getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API returned non-JSON:", text);
    throw new Error("Invalid server response");
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

	static async delete(url, body) {
		return this.request(url, {
			method: "DELETE",
			body: body ? JSON.stringify(body) : undefined,
		});
	}
}

window.ApiService = ApiService;
