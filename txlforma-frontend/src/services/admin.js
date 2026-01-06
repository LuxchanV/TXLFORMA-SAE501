import http from "../api/http";

// -------------------------
// STATS
// -------------------------
export async function statsEffectifsParFormation() {
  const { data } = await http.get("/api/admin/stats/effectifs-par-formation");
  return data;
}

export async function statsTauxReussiteParFormation() {
  const { data } = await http.get("/api/admin/stats/taux-reussite-par-formation");
  return data;
}

export async function statsCaParFormation() {
  const { data } = await http.get("/api/admin/stats/ca-par-formation");
  return data;
}

export async function adminStatsOverview() {
  const [effectifs, taux, ca] = await Promise.all([
    statsEffectifsParFormation(),
    statsTauxReussiteParFormation(),
    statsCaParFormation(),
  ]);
  return { effectifs, taux, ca };
}

// -------------------------
// CATEGORIES
// -------------------------
export async function adminCategories() {
  const { data } = await http.get("/api/admin/categories");
  return data;
}

export async function adminCreateCategorie(payload) {
  const { data } = await http.post("/api/admin/categories", payload);
  return data;
}

export async function adminUpdateCategorie(id, payload) {
  const { data } = await http.put(`/api/admin/categories/${id}`, payload);
  return data;
}

export async function adminDeleteCategorie(id) {
  await http.delete(`/api/admin/categories/${id}`);
}

// -------------------------
// FORMATIONS
// -------------------------
export async function adminFormations(params = {}) {
  const { data } = await http.get("/api/admin/formations", { params });
  return data;
}

export async function adminCreateFormation(payload) {
  const { data } = await http.post("/api/admin/formations", payload);
  return data;
}

export async function adminUpdateFormation(id, payload) {
  const { data } = await http.put(`/api/admin/formations/${id}`, payload);
  return data;
}

export async function adminDeleteFormation(id) {
  await http.delete(`/api/admin/formations/${id}`);
}

// -------------------------
// SESSIONS
// -------------------------
export async function adminSessions(params = {}) {
  const { data } = await http.get("/api/admin/sessions", { params });
  return data;
}

export async function adminCreateSession(payload) {
  const body = {
    formationId: Number(payload.formationId),
    intervenantId:
      payload.intervenantId === "" || payload.intervenantId == null
        ? null
        : Number(payload.intervenantId),
    dateDebut: payload.dateDebut,
    dateFin: payload.dateFin,
    salle: payload.salle?.trim() || null,
    nbPlacesMax:
      payload.nbPlacesMax === "" || payload.nbPlacesMax == null
        ? null
        : Number(payload.nbPlacesMax),
    statut: payload.statut || "OUVERTE",
  };

  const { data } = await http.post("/api/admin/sessions", body);
  return data;
}

export async function adminUpdateSession(id, payload) {
  const body = {
    formationId:
      payload.formationId === "" || payload.formationId == null
        ? null
        : Number(payload.formationId),
    intervenantId:
      payload.intervenantId === "" || payload.intervenantId == null
        ? null
        : Number(payload.intervenantId),
    dateDebut: payload.dateDebut ?? null,
    dateFin: payload.dateFin ?? null,
    salle: payload.salle?.trim() || null,
    nbPlacesMax:
      payload.nbPlacesMax === "" || payload.nbPlacesMax == null
        ? null
        : Number(payload.nbPlacesMax),
    statut: payload.statut ?? null,
  };

  const { data } = await http.put(`/api/admin/sessions/${id}`, body);
  return data;
}

export async function adminDeleteSession(id) {
  await http.delete(`/api/admin/sessions/${id}`);
}

// -------------------------
// INTERVENANTS
// -------------------------
export async function adminIntervenants() {
  const { data } = await http.get("/api/admin/intervenants");
  return data;
}

export async function adminCreateIntervenant(payload) {
  const body = {
    utilisateurId: Number(payload.utilisateurId),
    specialite: payload.specialite ?? null,
    statut: payload.statut ?? "FREELANCE",
    tauxHoraire:
      payload.tauxHoraire === "" || payload.tauxHoraire == null
        ? null
        : Number(payload.tauxHoraire),
  };
  const { data } = await http.post("/api/admin/intervenants", body);
  return data;
}

export async function adminUpdateIntervenant(id, dto) {
  const { data } = await http.put(`/api/admin/intervenants/${id}`, dto);
  return data;
}

export async function adminDeleteIntervenant(id) {
  await http.delete(`/api/admin/intervenants/${id}`);
}

// -------------------------
// INSCRIPTIONS
// -------------------------
export async function adminInscriptions(params = {}) {
  const { data } = await http.get("/api/admin/inscriptions", { params });
  return data;
}

export async function adminGetInscription(id) {
  const { data } = await http.get(`/api/admin/inscriptions/${id}`);
  return data;
}

export async function adminUpdateInscriptionStatut(id, statut) {
  const { data } = await http.patch(`/api/admin/inscriptions/${id}/statut`, { statut });
  return data;
}

export async function adminMarquerInscriptionPayee(id) {
  const { data } = await http.post(`/api/admin/inscriptions/${id}/marquer-payee`);
  return data;
}

export async function adminRefuserInscription(id) {
  const { data } = await http.post(`/api/admin/inscriptions/${id}/refuser`);
  return data;
}

// -------------------------
// PAIEMENTS
// -------------------------
export async function adminPaiements(params = {}) {
  const { data } = await http.get("/api/admin/paiements", { params });
  return data;
}

export async function adminGetPaiement(id) {
  const { data } = await http.get(`/api/admin/paiements/${id}`);
  return data;
}

export async function adminCreatePaiement(payload) {
  const body = {
    inscriptionId: Number(payload.inscriptionId),
    montant:
      payload.montant === "" || payload.montant == null
        ? null
        : Number(payload.montant),
    modePaiement: payload.modePaiement ?? "ADMIN",
    statut: payload.statut ?? "SUCCES",
    referenceExterne: payload.referenceExterne ?? null,
  };
  const { data } = await http.post(`/api/admin/paiements`, body);
  return data;
}

export async function adminUpdatePaiementStatut(id, statut) {
  const { data } = await http.patch(`/api/admin/paiements/${id}/statut`, { statut });
  return data;
}

// -------------------------
// UTILISATEURS (ADMIN)
// -------------------------
export async function adminUsers(params = {}) {
  const { data } = await http.get("/api/admin/utilisateurs", { params });
  return data;
}

export async function adminCreateUser(payload) {
  const { data } = await http.post("/api/admin/utilisateurs", payload);
  return data;
}

export async function adminUpdateUser(id, payload) {
  const { data } = await http.put(`/api/admin/utilisateurs/${id}`, payload);
  return data;
}

export async function adminChangeUserRole(id, role) {
  const { data } = await http.patch(`/api/admin/utilisateurs/${id}/role`, { role });
  return data;
}

export async function adminChangeUserActif(id, actif) {
  const { data } = await http.patch(`/api/admin/utilisateurs/${id}/actif`, { actif });
  return data;
}

export async function adminDeleteUser(id) {
  await http.delete(`/api/admin/utilisateurs/${id}`);
}
