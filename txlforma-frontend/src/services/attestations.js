import http from "../api/http";

/**
 * Retourne un BLOB PDF (à télécharger côté UI).
 */
export async function telechargerAttestation(inscriptionId) {
  const res = await http.get(`/api/attestations/inscription/${inscriptionId}`, {
    responseType: "blob",
  });
  return res.data; // Blob PDF
}
