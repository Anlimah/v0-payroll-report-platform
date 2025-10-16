class AuthService {
  static TOKEN_KEY = "payroll_token"
  static USER_KEY = "payroll_user"

  static saveAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token)
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static getUser() {
    const user = localStorage.getItem(this.USER_KEY)
    return user ? JSON.parse(user) : null
  }

  static isAuthenticated() {
    return !!this.getToken()
  }

  static isAdmin() {
    const user = this.getUser()
    return user && user.role === "admin"
  }

  static logout() {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    window.location.href = "index.html"
  }

  static checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "index.html"
    }
  }

  static getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.getToken()}`,
    }
  }
}

window.AuthService = AuthService
