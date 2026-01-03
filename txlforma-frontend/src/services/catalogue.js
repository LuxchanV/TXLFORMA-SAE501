import http from "../api/http";

export const getCategories = async () => (await http.get("/api/catalogue/categories")).data;

export const getFormations = async (categorieId) =>
  (await http.get("/api/catalogue/formations", { params: categorieId ? { categorieId } : {} })).data;

export const getFormation = async (id) => (await http.get(`/api/catalogue/formations/${id}`)).data;

export const getSessionsByFormation = async (formationId) =>
  (await http.get(`/api/catalogue/formations/${formationId}/sessions`)).data;

export const getSessions = async (formationId) =>
  (await http.get(`/api/catalogue/sessions`, { params: formationId ? { formationId } : {} })).data;

export const getSession = async (id) => (await http.get(`/api/catalogue/sessions/${id}`)).data;
