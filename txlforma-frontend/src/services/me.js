import http from "../api/http";

// Mets ton endpoint ici si différent
// Exemple: "/api/auth/me" ou "/api/me"
const ME_PATH = import.meta.env.VITE_ME_PATH || "/api/me";

export async function fetchMe() {
  const { data } = await http.get(ME_PATH);
  return data;
}
