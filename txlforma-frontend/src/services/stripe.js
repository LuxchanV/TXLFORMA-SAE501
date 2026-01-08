import http from "../api/http";

export async function createPaymentIntent(inscriptionId) {
  const { data } = await http.post("/api/stripe/payment-intent", { inscriptionId });
  // { clientSecret, paymentIntentId, montant, formationTitre, currency, paiementId, inscriptionId }
  return data;
}

export async function confirmPaymentIntent(paymentIntentId) {
  const { data } = await http.post("/api/stripe/confirm", { paymentIntentId });
  // { paiementId, inscriptionId, paymentIntentStatus, paiementStatut, inscriptionStatut }
  return data;
}
