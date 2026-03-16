import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" }
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("mc_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
