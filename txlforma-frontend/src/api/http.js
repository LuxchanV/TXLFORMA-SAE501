import axios from "axios";

const TOKEN_KEY = "token";

const http = axios.create({
  // en dev: on reste sur le même domaine (vite) + proxy
  baseURL: "",
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("auth:changed"));
    }
    return Promise.reject(err);
  }
);

export default http;
