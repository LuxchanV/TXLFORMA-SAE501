import http from "../api/http";

export async function simulerPaiement(inscriptionId) {
  const { data } = await http.post("/api/paiements/simuler", { inscriptionId });
  return data;
}

export async function paiementsParInscription(inscriptionId) {
  const { data } = await http.get(`/api/paiements/inscription/${inscriptionId}`);
  return data;
}
