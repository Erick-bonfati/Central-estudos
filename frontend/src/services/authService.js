const API_BASE_URL = "http://localhost:3001"

export const authService = {
  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) throw new Error("Erro ao registrar")
    return await res.json()
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error("Erro ao fazer login")
    const data = await res.json()
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return data
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getToken() {
    return localStorage.getItem("token")
  },
}
