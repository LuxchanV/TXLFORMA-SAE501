import http from "../api/http";

// -------- Sessions / Participants --------
export async function mesSessionsFormateur() {
  const { data } = await http.get("/api/formateur/sessions");
  return data;
}

export async function participantsSession(sessionId) {
  const { data } = await http.get(`/api/formateur/sessions/${sessionId}/participants`);
  return data;
}

// -------- Émargement / Évaluations --------
export async function marquerPresence({ inscriptionId, dateJour, present }) {
  await http.post("/api/formateur/emargement", { inscriptionId, dateJour, present });
  return true;
}

export async function enregistrerEvaluation({ inscriptionId, note, commentaire }) {
  await http.post("/api/formateur/evaluations", { inscriptionId, note, commentaire });
  return true;
}

// -------- Attestations --------
export async function listAttestations(sessionId) {
  const { data } = await http.get(`/api/formateur/sessions/${sessionId}/attestations`);
  return data;
}

export async function uploadAttestation({ inscriptionId, file }) {
  const form = new FormData();
  form.append("inscriptionId", String(inscriptionId));
  form.append("file", file);

  const { data } = await http.post("/api/formateur/attestations/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function downloadAttestation(inscriptionId) {
  const res = await http.get(`/api/formateur/attestations/${inscriptionId}/download`, {
    responseType: "blob",
  });
  return res.data;
}

// -------- Heures réalisées --------
export async function getHeuresSession(sessionId) {
  const { data } = await http.get(`/api/formateur/sessions/${sessionId}/heures`);
  return data;
}

export async function setHeuresSession({ sessionId, dateJour, heures }) {
  await http.post("/api/formateur/heures", { sessionId, dateJour, heures });
  return true;
}

export async function getTotalHeuresFormateur() {
  const { data } = await http.get("/api/formateur/heures/total");
  return data;
}
