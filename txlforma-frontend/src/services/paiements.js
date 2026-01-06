import http from "../api/http";

// ✅ NEW : crée un checkout (paiement EN_ATTENTE)
export async function creerCheckout(inscriptionId) {
  const { data } = await http.post("/api/paiements/checkout", { inscriptionId });
  return data; // { paiementId, inscriptionId, montant, formationTitre }
}

// ✅ NEW : confirme un paiement
export async function confirmerCheckout(paiementId, payload) {
  const { data } = await http.post(`/api/paiements/confirm/${paiementId}`, payload);
  return data; // PaiementDto
}

// (tu peux garder ton simulate si tu veux)
export async function simulerPaiement(inscriptionId) {
  const { data } = await http.post("/api/paiements/simuler", { inscriptionId });
  return data;
}

export async function paiementsParInscription(inscriptionId) {
  const { data } = await http.get(`/api/paiements/inscription/${inscriptionId}`);
  return data;
}
