import axios from "axios";

export const TOKEN_KEY = "token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request: coloca Bearer token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: se token expirou/inválido, limpa e “desloga”
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      // opcional: forçar voltar pro login
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  }
);

export default api;
