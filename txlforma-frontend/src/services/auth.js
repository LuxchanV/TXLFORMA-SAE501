import http from "../api/http";

const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth:changed"));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth:changed"));
}

export async function login(email, motDePasse) {
  const { data } = await http.post("/api/auth/login", { email, motDePasse });

  const token = data?.token || data?.accessToken || data?.jwt;
  if (!token || typeof token !== "string") {
    throw new Error("Token introuvable dans la réponse backend");
  }

  setToken(token);
  return token;
}

export async function register(payload) {
  const { data } = await http.post("/api/auth/register", payload);
  return data;
}
