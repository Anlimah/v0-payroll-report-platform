document.addEventListener("DOMContentLoaded", () => {
	// Redirect if already logged in
	if (AuthService.isAuthenticated()) {
		window.location.href = "dashboard.html";
		return;
	}

	const loginForm = document.getElementById("loginForm");
	const errorMessage = document.getElementById("errorMessage");
	const loginText = document.getElementById("loginText");
	const loginLoader = document.getElementById("loginLoader");

	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		// Hide error message
		errorMessage.style.display = "none";

		// Show loader
		loginText.style.display = "none";
		loginLoader.style.display = "inline-block";

		try {
			const response = await fetch(API_ENDPOINTS.LOGIN, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (data.success) {
				AuthService.saveAuth(data.token, data.user);
				window.location.href = "dashboard.html";
			} else {
				errorMessage.textContent = data.message || "Login failed";
				errorMessage.style.display = "block";
			}
		} catch (error) {
			errorMessage.textContent = "An error occurred. Please try again.";
			errorMessage.style.display = "block";
			console.error("Login error:", error);
		} finally {
			loginText.style.display = "inline";
			loginLoader.style.display = "none";
		}
	});
});
