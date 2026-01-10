import http from "../api/http";

// -----------------------------
// Sessions / participants
// -----------------------------
export async function mesSessionsFormateur() {
  const res = await http.get("/api/formateur/sessions");
  return res.data;
}

export async function participantsSession(sessionId) {
  const res = await http.get(`/api/formateur/sessions/${sessionId}/participants`);
  return res.data;
}

// -----------------------------
// Emargement
// -----------------------------
export async function marquerPresence(payload) {
  // payload: { inscriptionId, dateJour, present }
  const res = await http.post("/api/formateur/emargement", payload);
  return res.data;
}

// -----------------------------
// Evaluations
// -----------------------------
export async function enregistrerEvaluation(payload) {
  // payload: { inscriptionId, note, commentaire }
  const res = await http.post("/api/formateur/evaluations", payload);
  return res.data;
}

// -----------------------------
// Attestations
// -----------------------------
export async function listAttestations(sessionId) {
  const res = await http.get(`/api/formateur/sessions/${sessionId}/attestations`);
  return res.data;
}

export async function uploadAttestation({ inscriptionId, file }) {
  const fd = new FormData();
  fd.append("inscriptionId", inscriptionId);
  fd.append("file", file);

  const res = await http.post("/api/formateur/attestations/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function generateAttestation(inscriptionId) {
  const res = await http.post(`/api/formateur/attestations/${inscriptionId}/generate`);
  return res.data;
}

export async function downloadAttestation(inscriptionId) {
  const res = await http.get(`/api/formateur/attestations/${inscriptionId}/download`, {
    responseType: "blob",
  });
  return res.data; // Blob PDF
}

// -----------------------------
// Heures
// -----------------------------
export async function getHeuresSession(sessionId) {
  const res = await http.get(`/api/formateur/sessions/${sessionId}/heures`);
  return res.data;
}

export async function setHeuresSession(payload) {
  // payload: { sessionId, dateJour, heures }
  const res = await http.post("/api/formateur/heures", payload);
  return res.data;
}

export async function getTotalHeuresFormateur() {
  const res = await http.get("/api/formateur/heures/total");
  return res.data;
}
