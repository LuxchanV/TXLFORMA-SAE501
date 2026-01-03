import http from "../api/http";

export async function evaluationParInscription(inscriptionId) {
  const { data } = await http.get(`/api/evaluations/inscription/${inscriptionId}`);
  return data;
}
