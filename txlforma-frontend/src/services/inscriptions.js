import http from "../api/http";

export async function creerInscription(sessionId) {
  const { data } = await http.post("/api/inscriptions", { sessionId });
  return data;
}

export async function mesInscriptions() {
  const { data } = await http.get("/api/inscriptions/me");
  return data; // tableau
}

export async function annulerInscription(inscriptionId) {
  await http.delete(`/api/inscriptions/${inscriptionId}`);
}
