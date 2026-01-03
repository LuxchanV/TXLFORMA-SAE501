import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

import AdminLayout from "./AdminLayout.jsx";

import {
  adminStatsOverview,
  adminCategories,
  adminCreateCategorie,
  adminUpdateCategorie,
  adminDeleteCategorie,
  adminFormations,
  adminCreateFormation,
  adminUpdateFormation,
  adminDeleteFormation,
  adminSessions,
  adminCreateSession,
  adminUpdateSession,
  adminDeleteSession,
  adminIntervenants,
  adminCreateIntervenant,
  adminUpdateIntervenant,
  adminDeleteIntervenant,

  adminInscriptions,
  adminUpdateInscriptionStatut,
  adminMarquerInscriptionPayee,
  adminRefuserInscription,

  adminPaiements,
  adminCreatePaiement,
  adminUpdatePaiementStatut,
} from "../../services/admin";

function normalizeStatPoint(p) {
  const label = p?.label ?? p?.name ?? p?.nom ?? "—";
  const value = p?.value ?? p?.valeur ?? 0;
  return { label, value: Number(value) || 0 };
}

function money(n) {
  if (n == null || n === "") return "—";
  const v = Number(n || 0);
  return `${v.toFixed(2)} €`;
}

function toText(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v);
}

function safeLower(v) {
  return toText(v).toLowerCase();
}

function Field({ label, required, error, children }) {
  return (
    <div className="admin-field">
      <label>
        {label} {required ? <span className="admin-req">requis</span> : null}
      </label>
      {children}
      {error ? <div className="admin-help" style={{ color: "#7f1d1d", fontWeight: 700 }}>{error}</div> : null}
    </div>
  );
}

function Badge({ kind = "neutral", children }) {
  return <span className={`admin-badge admin-badge--${kind}`}>{children}</span>;
}

function extractUserFromAny(obj) {
  const u = obj?.utilisateur ?? obj?.user ?? obj?.utilisateurDto ?? obj?.utilisateurEntity ?? {};
  const id = obj?.utilisateurId ?? u?.id ?? obj?.userId ?? obj?.idUtilisateur ?? null;
  const prenom = obj?.utilisateurPrenom ?? u?.prenom ?? u?.firstName ?? "";
  const nom = obj?.utilisateurNom ?? u?.nom ?? u?.lastName ?? "";
  const email = obj?.utilisateurEmail ?? u?.email ?? obj?.email ?? "";
  return { id, prenom, nom, email };
}

function extractFormationTitleFromAny(obj) {
  const f =
    obj?.formation ??
    obj?.formationDto ??
    obj?.session?.formation ??
    obj?.sessionDto?.formation ??
    {};
  return obj?.formationTitre ?? f?.titre ?? f?.title ?? "";
}

function extractSessionIdFromAny(obj) {
  return obj?.sessionId ?? obj?.session?.id ?? obj?.idSession ?? null;
}

function extractMontantFromAny(obj) {
  return obj?.montant ?? obj?.prix ?? obj?.total ?? obj?.amount ?? obj?.session?.formation?.prix ?? null;
}

function extractDateFromAny(obj) {
  return obj?.dateInscription ?? obj?.createdAt ?? obj?.dateCreation ?? obj?.date ?? obj?.horodatage ?? null;
}

function formatMaybeDate(v) {
  if (!v) return "—";
  // Si c’est déjà une string propre, on affiche
  return toText(v);
}

export default function AdminHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("stats");
  const tabs = useMemo(
    () => [
      { id: "stats", label: "Stats" },
      { id: "categories", label: "Catégories" },
      { id: "formations", label: "Formations" },
      { id: "sessions", label: "Sessions" },
      { id: "intervenants", label: "Formateurs" },
      { id: "inscriptions", label: "Inscriptions" },
      { id: "paiements", label: "Paiements" },
    ],
    []
  );

  const profileName = user?.prenom ? `${user.prenom}` : "Admin";

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const resetMessages = () => {
    setMsg("");
    setError("");
  };

  const safeError = (e, fallback) => e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;

  // data
  const [stats, setStats] = useState({ effectifs: [], taux: [], ca: [] });
  const [categories, setCategories] = useState([]);
  const [formations, setFormations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [intervenants, setIntervenants] = useState([]);

  const [inscriptions, setInscriptions] = useState([]);
  const [paiements, setPaiements] = useState([]);

  // SEARCH (pour tabs CRUD)
  const [q, setQ] = useState("");

  // ---- forms + errors
  const [catForm, setCatForm] = useState({ id: null, nom: "" });
  const [catErrors, setCatErrors] = useState({});

  const [formationForm, setFormationForm] = useState({
    id: null,
    titre: "",
    description: "",
    prix: "",
    niveau: "",
    dureeHeures: "",
    categorieId: "",
  });
  const [formationErrors, setFormationErrors] = useState({});

  const [sessionForm, setSessionForm] = useState({
    id: null,
    formationId: "",
    intervenantId: "",
    dateDebut: "",
    dateFin: "",
    salle: "",
    nbPlacesMax: 12,
    statut: "OUVERTE",
  });
  const [sessionErrors, setSessionErrors] = useState({});

  const [intervenantForm, setIntervenantForm] = useState({
    id: null,
    utilisateurId: "",
    specialite: "",
    statut: "FREELANCE",
    tauxHoraire: "",
  });
  const [intervenantErrors, setIntervenantErrors] = useState({});

  // ---- Inscriptions (filters + edition)
  const [insParams, setInsParams] = useState({ statut: "" });
  const [insFilters, setInsFilters] = useState({ nom: "", email: "", formation: "" });
  const [insEditId, setInsEditId] = useState(null);
  const [insEditStatut, setInsEditStatut] = useState("EN_ATTENTE");

  // ---- Paiements (create + filters)
  const [payParams, setPayParams] = useState({ statut: "", inscriptionId: "", utilisateurId: "" });
  const [payForm, setPayForm] = useState({
    inscriptionId: "",
    montant: "",
    modePaiement: "ADMIN",
    statut: "SUCCES",
    referenceExterne: "",
  });
  const [payErrors, setPayErrors] = useState({});

  // ---- LOADERS
  const loadStats = async () => {
    setLoading(true);
    resetMessages();
    try {
      const data = await adminStatsOverview();
      setStats({
        effectifs: Array.isArray(data.effectifs) ? data.effectifs : [],
        taux: Array.isArray(data.taux) ? data.taux : [],
        ca: Array.isArray(data.ca) ? data.ca : [],
      });
    } catch (e) {
      setError(safeError(e, "Impossible de charger les stats"));
      setStats({ effectifs: [], taux: [], ca: [] });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    resetMessages();
    try {
      const data = await adminCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les catégories"));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFormations = async () => {
    setLoading(true);
    resetMessages();
    try {
      const data = await adminFormations();
      setFormations(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les formations"));
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    setLoading(true);
    resetMessages();
    try {
      const data = await adminSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les sessions"));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadIntervenants = async () => {
    setLoading(true);
    resetMessages();
    try {
      const data = await adminIntervenants();
      setIntervenants(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les formateurs"));
      setIntervenants([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInscriptions = async (params = {}) => {
    setLoading(true);
    resetMessages();
    try {
      const data = await adminInscriptions(params);
      setInscriptions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les inscriptions"));
      setInscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPaiements = async (params = {}) => {
    setLoading(true);
    resetMessages();
    try {
      const data = await adminPaiements(params);
      setPaiements(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les paiements"));
      setPaiements([]);
    } finally {
      setLoading(false);
    }
  };

  // bootstrap
  useEffect(() => {
    (async () => {
      await loadCategories();
      await loadFormations();
      await loadIntervenants();
      await loadStats();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load on tab switch
  useEffect(() => {
    setQ("");
    resetMessages();

    if (tab === "stats") loadStats();
    if (tab === "categories") loadCategories();
    if (tab === "formations") loadFormations();
    if (tab === "sessions") loadSessions();
    if (tab === "intervenants") loadIntervenants();

    if (tab === "inscriptions") {
      // par défaut : pas de filtre serveur
      const p = {};
      setInsParams({ statut: "" });
      setInsFilters({ nom: "", email: "", formation: "" });
      loadInscriptions(p);
    }

    if (tab === "paiements") {
      const p = {};
      setPayParams({ statut: "", inscriptionId: "", utilisateurId: "" });
      setPayErrors({});
      loadPaiements(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // maps
  const categorieNameById = useMemo(() => {
    const map = {};
    for (const c of categories) map[c.id] = c.nom ?? `Catégorie #${c.id}`;
    return map;
  }, [categories]);

  const formationTitleById = useMemo(() => {
    const map = {};
    for (const f of formations) map[f.id] = f.titre ?? `Formation #${f.id}`;
    return map;
  }, [formations]);

  // computed stats
  const effectifs = (stats.effectifs || []).map(normalizeStatPoint);
  const taux = (stats.taux || []).map(normalizeStatPoint);
  const ca = (stats.ca || []).map(normalizeStatPoint);

  const totalEffectifs = effectifs.reduce((acc, p) => acc + p.value, 0);
  const revenuTotal = ca.reduce((acc, p) => acc + p.value, 0);

  // filtered lists (CRUD)
  const qLower = q.trim().toLowerCase();

  const categoriesFiltered = useMemo(() => {
    if (!qLower) return categories;
    return categories.filter((c) => `${c.id} ${c.nom}`.toLowerCase().includes(qLower));
  }, [categories, qLower]);

  const formationsFiltered = useMemo(() => {
    if (!qLower) return formations;
    return formations.filter((f) =>
      `${f.id} ${f.titre} ${f.niveau ?? ""} ${categorieNameById[f.categorieId ?? f.categorie?.id] ?? ""}`
        .toLowerCase()
        .includes(qLower)
    );
  }, [formations, qLower, categorieNameById]);

  const sessionsFiltered = useMemo(() => {
    if (!qLower) return sessions;
    return sessions.filter((s) => {
      const t = formationTitleById[s.formationId ?? s.formation?.id] || "";
      return `${s.id} ${t} ${s.dateDebut ?? ""} ${s.dateFin ?? ""} ${s.salle ?? ""} ${s.statut ?? ""}`
        .toLowerCase()
        .includes(qLower);
    });
  }, [sessions, qLower, formationTitleById]);

  const intervenantsFiltered = useMemo(() => {
    if (!qLower) return intervenants;
    return intervenants.filter((itv) => {
      const prenom = itv.prenom ?? itv.utilisateurPrenom ?? itv.utilisateur?.prenom ?? "";
      const nom = itv.nom ?? itv.utilisateurNom ?? itv.utilisateur?.nom ?? "";
      const email = itv.email ?? itv.utilisateurEmail ?? itv.utilisateur?.email ?? "";
      return `${itv.id} ${prenom} ${nom} ${email} ${itv.specialite ?? ""} ${itv.statut ?? ""}`.toLowerCase().includes(qLower);
    });
  }, [intervenants, qLower]);

  // ---- ACTIONS: CATEGORIES
  const saveCategorie = async () => {
    resetMessages();
    const e = {};
    if (!catForm.nom.trim()) e.nom = "Le nom est obligatoire";
    setCatErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      if (!catForm.id) {
        await adminCreateCategorie({ nom: catForm.nom.trim() });
        setMsg("✅ Catégorie créée");
      } else {
        await adminUpdateCategorie(catForm.id, { nom: catForm.nom.trim() });
        setMsg("✅ Catégorie modifiée");
      }
      setCatForm({ id: null, nom: "" });
      await loadCategories();
    } catch (err) {
      setError(safeError(err, "Erreur sauvegarde catégorie"));
    } finally {
      setLoading(false);
    }
  };

  const editCategorie = (c) => {
    setCatErrors({});
    setCatForm({ id: c.id, nom: c.nom || "" });
  };

  const removeCategorie = async (id) => {
    resetMessages();
    if (!window.confirm(`Supprimer la catégorie #${id} ?`)) return;
    setLoading(true);
    try {
      await adminDeleteCategorie(id);
      setMsg("✅ Catégorie supprimée");
      await loadCategories();
    } catch (err) {
      setError(safeError(err, "Erreur suppression catégorie (liée à des formations ?)"));
    } finally {
      setLoading(false);
    }
  };

  // ---- ACTIONS: FORMATIONS
  const saveFormation = async () => {
    resetMessages();
    const e = {};
    if (!formationForm.titre.trim()) e.titre = "Le titre est obligatoire";
    if (!formationForm.categorieId) e.categorieId = "Choisis une catégorie";
    setFormationErrors(e);
    if (Object.keys(e).length) return;

    const payload = {
      titre: formationForm.titre.trim(),
      description: formationForm.description?.trim() || null,
      prix: formationForm.prix === "" ? null : Number(formationForm.prix),
      niveau: formationForm.niveau?.trim() || null,
      dureeHeures: formationForm.dureeHeures === "" ? null : Number(formationForm.dureeHeures),
      categorieId: Number(formationForm.categorieId),
    };

    setLoading(true);
    try {
      if (!formationForm.id) {
        await adminCreateFormation(payload);
        setMsg("✅ Formation créée");
      } else {
        await adminUpdateFormation(formationForm.id, payload);
        setMsg("✅ Formation modifiée");
      }
      setFormationForm({ id: null, titre: "", description: "", prix: "", niveau: "", dureeHeures: "", categorieId: "" });
      setFormationErrors({});
      await loadFormations();
    } catch (err) {
      setError(safeError(err, "Erreur sauvegarde formation"));
    } finally {
      setLoading(false);
    }
  };

  const editFormation = (f) => {
    setFormationErrors({});
    setFormationForm({
      id: f.id,
      titre: f.titre || "",
      description: f.description || "",
      prix: f.prix ?? "",
      niveau: f.niveau ?? "",
      dureeHeures: f.dureeHeures ?? "",
      categorieId: f.categorieId ?? f.categorie?.id ?? "",
    });
  };

  const removeFormation = async (id) => {
    resetMessages();
    if (!window.confirm(`Supprimer la formation #${id} ?`)) return;
    setLoading(true);
    try {
      await adminDeleteFormation(id);
      setMsg("✅ Formation supprimée");
      await loadFormations();
    } catch (err) {
      setError(safeError(err, "Erreur suppression formation (liée à des sessions ?)"));
    } finally {
      setLoading(false);
    }
  };

  // ---- ACTIONS: SESSIONS
  const saveSession = async () => {
    resetMessages();
    const e = {};
    if (!sessionForm.formationId) e.formationId = "Choisis une formation";
    if (!sessionForm.dateDebut) e.dateDebut = "Date début obligatoire";
    if (!sessionForm.dateFin) e.dateFin = "Date fin obligatoire";
    setSessionErrors(e);
    if (Object.keys(e).length) return;

    const dto = {
      dateDebut: sessionForm.dateDebut,
      dateFin: sessionForm.dateFin,
      salle: sessionForm.salle?.trim() || null,
      nbPlacesMax: Number(sessionForm.nbPlacesMax ?? 12),
      statut: sessionForm.statut || "OUVERTE",
    };

    setLoading(true);
    try {
      if (!sessionForm.id) {
        await adminCreateSession({
          formationId: sessionForm.formationId,
          intervenantId: sessionForm.intervenantId || null,
          ...dto,
        });
        setMsg("✅ Session créée");
      } else {
        await adminUpdateSession(sessionForm.id, {
          formationId: sessionForm.formationId,
          intervenantId: sessionForm.intervenantId || null,
          ...dto,
        });
        setMsg("✅ Session modifiée");
      }

      setSessionForm({
        id: null,
        formationId: "",
        intervenantId: "",
        dateDebut: "",
        dateFin: "",
        salle: "",
        nbPlacesMax: 12,
        statut: "OUVERTE",
      });
      setSessionErrors({});
      await loadSessions();
    } catch (err) {
      setError(safeError(err, "Erreur sauvegarde session"));
    } finally {
      setLoading(false);
    }
  };

  const editSession = (s) => {
    setSessionErrors({});
    setSessionForm({
      id: s.id,
      formationId: s.formationId ?? s.formation?.id ?? "",
      intervenantId: s.intervenantId ?? s.intervenant?.id ?? "",
      dateDebut: s.dateDebut ?? "",
      dateFin: s.dateFin ?? "",
      salle: s.salle ?? "",
      nbPlacesMax: s.nbPlacesMax ?? 12,
      statut: s.statut ?? "OUVERTE",
    });
  };

  const removeSession = async (id) => {
    resetMessages();
    if (!window.confirm(`Supprimer la session #${id} ?`)) return;
    setLoading(true);
    try {
      await adminDeleteSession(id);
      setMsg("✅ Session supprimée");
      await loadSessions();
    } catch (err) {
      setError(safeError(err, "Erreur suppression session"));
    } finally {
      setLoading(false);
    }
  };

  // ---- ACTIONS: INTERVENANTS
  const saveIntervenant = async () => {
    resetMessages();
    const e = {};
    if (!intervenantForm.id && !intervenantForm.utilisateurId) e.utilisateurId = "Utilisateur ID obligatoire pour créer";
    setIntervenantErrors(e);
    if (Object.keys(e).length) return;

    const dto = {
      utilisateurId: intervenantForm.utilisateurId,
      specialite: intervenantForm.specialite?.trim() || null,
      statut: intervenantForm.statut || "FREELANCE",
      tauxHoraire: intervenantForm.tauxHoraire === "" ? null : Number(intervenantForm.tauxHoraire),
    };

    setLoading(true);
    try {
      if (!intervenantForm.id) {
        await adminCreateIntervenant(dto);
        setMsg("✅ Formateur créé");
      } else {
        await adminUpdateIntervenant(intervenantForm.id, {
          specialite: dto.specialite,
          statut: dto.statut,
          tauxHoraire: dto.tauxHoraire,
        });
        setMsg("✅ Formateur modifié");
      }

      setIntervenantForm({ id: null, utilisateurId: "", specialite: "", statut: "FREELANCE", tauxHoraire: "" });
      setIntervenantErrors({});
      await loadIntervenants();
    } catch (err) {
      setError(safeError(err, "Erreur sauvegarde formateur"));
    } finally {
      setLoading(false);
    }
  };

  const editIntervenant = (itv) => {
    setIntervenantErrors({});
    setIntervenantForm({
      id: itv.id,
      utilisateurId: itv.utilisateurId ?? itv.utilisateur?.id ?? "",
      specialite: itv.specialite ?? "",
      statut: itv.statut ?? "FREELANCE",
      tauxHoraire: itv.tauxHoraire ?? "",
    });
  };

  const removeIntervenant = async (id) => {
    resetMessages();
    if (!window.confirm(`Supprimer le formateur #${id} ?`)) return;
    setLoading(true);
    try {
      await adminDeleteIntervenant(id);
      setMsg("✅ Formateur supprimé");
      await loadIntervenants();
    } catch (err) {
      setError(safeError(err, "Erreur suppression formateur (lié à des sessions ?)"));
    } finally {
      setLoading(false);
    }
  };

  // ---- ACTIONS: INSCRIPTIONS
  const inscriptionBadge = (statut) => {
    if (statut === "PAYEE") return <Badge kind="success">PAYÉ</Badge>;
    if (statut === "EN_ATTENTE") return <Badge kind="warning">EN ATTENTE</Badge>;
    if (statut === "REFUSEE") return <Badge kind="danger">REFUSÉE</Badge>;
    return <Badge kind="neutral">{toText(statut) || "—"}</Badge>;
  };

  const inscriptionsFiltered = useMemo(() => {
    const nomQ = safeLower(insFilters.nom).trim();
    const emailQ = safeLower(insFilters.email).trim();
    const formationQ = safeLower(insFilters.formation).trim();

    return (inscriptions || []).filter((ins) => {
      const u = extractUserFromAny(ins);
      const formationTitre = extractFormationTitleFromAny(ins);
      const okNom = !nomQ || `${u.prenom} ${u.nom}`.toLowerCase().includes(nomQ);
      const okEmail = !emailQ || safeLower(u.email).includes(emailQ);
      const okFormation = !formationQ || safeLower(formationTitre).includes(formationQ);
      return okNom && okEmail && okFormation;
    });
  }, [inscriptions, insFilters]);

  const applyInscriptionFilterServer = async () => {
    const p = {};
    if (insParams.statut) p.statut = insParams.statut;
    await loadInscriptions(p);
  };

  const markPayee = async (id) => {
    resetMessages();
    setLoading(true);
    try {
      await adminMarquerInscriptionPayee(id);
      setMsg("✅ Inscription marquée PAYÉE");
      await applyInscriptionFilterServer();
    } catch (e) {
      setError(safeError(e, "Impossible de marquer PAYÉE"));
    } finally {
      setLoading(false);
    }
  };

  const saveInscriptionStatut = async (id) => {
    resetMessages();
    setLoading(true);
    try {
      await adminUpdateInscriptionStatut(id, insEditStatut);
      setMsg("✅ Statut inscription modifié");
      setInsEditId(null);
      await applyInscriptionFilterServer();
    } catch (e) {
      setError(safeError(e, "Impossible de modifier le statut"));
    } finally {
      setLoading(false);
    }
  };

  const refuserInscription = async (id) => {
    resetMessages();
    if (!window.confirm(`Refuser l'inscription #${id} ?`)) return;
    setLoading(true);
    try {
      await adminRefuserInscription(id);
      setMsg("✅ Inscription refusée");
      await applyInscriptionFilterServer();
    } catch (e) {
      setError(safeError(e, "Impossible de refuser"));
    } finally {
      setLoading(false);
    }
  };

  // ---- ACTIONS: PAIEMENTS
  const paiementBadge = (statut) => {
    if (statut === "SUCCES") return <Badge kind="success">SUCCESS</Badge>;
    if (statut === "EN_ATTENTE") return <Badge kind="warning">EN ATTENTE</Badge>;
    if (statut === "ECHEC") return <Badge kind="danger">ECHEC</Badge>;
    return <Badge kind="neutral">{toText(statut) || "—"}</Badge>;
  };

  const applyPaiementFilterServer = async () => {
    const p = {};
    if (payParams.statut) p.statut = payParams.statut;
    if (payParams.inscriptionId) p.inscriptionId = Number(payParams.inscriptionId);
    if (payParams.utilisateurId) p.utilisateurId = Number(payParams.utilisateurId);
    await loadPaiements(p);
  };

  const savePaiement = async () => {
    resetMessages();
    const e = {};
    if (!payForm.inscriptionId) e.inscriptionId = "Inscription ID obligatoire";
    if (payForm.montant === "" || payForm.montant == null) e.montant = "Montant obligatoire";
    setPayErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await adminCreatePaiement(payForm);
      setMsg("✅ Paiement créé");
      setPayForm({ inscriptionId: "", montant: "", modePaiement: "ADMIN", statut: "SUCCES", referenceExterne: "" });
      setPayErrors({});
      await applyPaiementFilterServer();
    } catch (err) {
      setError(safeError(err, "Erreur création paiement"));
    } finally {
      setLoading(false);
    }
  };

  const markSucces = async (id) => {
    resetMessages();
    setLoading(true);
    try {
      await adminUpdatePaiementStatut(id, "SUCCES");
      setMsg("✅ Paiement marqué SUCCESS");
      await applyPaiementFilterServer();
    } catch (e) {
      setError(safeError(e, "Impossible de marquer SUCCESS"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Espace Admin"
      subtitle="TXL FORMA"
      tab={tab}
      setTab={setTab}
      tabs={tabs}
      onLogout={onLogout}
      profileName={profileName}
    >
      <div key={tab} className="admin-fade">
        {loading ? <div className="admin-alert admin-alert--success" style={{ opacity: 0.8 }}>Chargement…</div> : null}
        {msg ? <div className="admin-alert admin-alert--success">{msg}</div> : null}
        {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

        {/* STATS */}
        {tab === "stats" && (
          <>
            <h2 className="admin-sectionTitle">Dashboard Stats</h2>

            <div className="admin-card">
              <div className="admin-grid admin-grid--2">
                <div className="admin-card">
                  <div className="admin-itemTitle">Total inscriptions</div>
                  <div className="admin-itemSub">PAYÉE + EN ATTENTE</div>
                  <div style={{ fontSize: 44, fontWeight: 900, marginTop: 10 }}>{totalEffectifs}</div>
                </div>

                <div className="admin-card">
                  <div className="admin-itemTitle">Revenu total</div>
                  <div className="admin-itemSub">paiements SUCCESS</div>
                  <div style={{ fontSize: 44, fontWeight: 900, marginTop: 10 }}>{money(revenuTotal)}</div>
                </div>
              </div>
            </div>

            <div style={{ height: 14 }} />

            <div className="admin-grid admin-grid--2">
              <div className="admin-card">
                <div className="admin-itemTitle" style={{ marginBottom: 10 }}>CA par formation</div>
                {ca.length === 0 ? <div className="admin-itemSub">Aucune donnée.</div> : (
                  <div className="admin-list">
                    {ca.map((p) => (
                      <div key={p.label} className="admin-item">
                        <div>
                          <div className="admin-itemTitle">{p.label}</div>
                          <div className="admin-itemSub">{money(p.value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-card">
                <div className="admin-itemTitle" style={{ marginBottom: 10 }}>Effectifs / Taux</div>
                {effectifs.length === 0 ? <div className="admin-itemSub">Aucune donnée.</div> : (
                  <div className="admin-list">
                    {effectifs.map((p) => {
                      const t = taux.find((x) => x.label === p.label)?.value ?? null;
                      return (
                        <div key={p.label} className="admin-item">
                          <div>
                            <div className="admin-itemTitle">{p.label}</div>
                            <div className="admin-itemSub">
                              {p.value} inscrits{t != null ? ` • ${t.toFixed(1)}% réussite` : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* CATEGORIES */}
        {tab === "categories" && (
          <>
            <h2 className="admin-sectionTitle">Catégories</h2>

            <div className="admin-card">
              <div className="admin-grid">
                <Field label="Nom" required error={catErrors.nom}>
                  <input
                    className={`admin-input ${catErrors.nom ? "is-invalid" : ""}`}
                    value={catForm.nom}
                    onChange={(e) => {
                      setCatForm((p) => ({ ...p, nom: e.target.value }));
                      if (catErrors.nom) setCatErrors((p) => ({ ...p, nom: undefined }));
                    }}
                    placeholder="Ex: Développement Web"
                  />
                </Field>

                <div />

                <button className="admin-btn" type="button" onClick={saveCategorie}>
                  {catForm.id ? "Modifier" : "Créer"}
                </button>
              </div>

              {catForm.id ? (
                <div className="admin-help" style={{ marginTop: 10 }}>
                  Édition catégorie #{catForm.id} •{" "}
                  <button
                    className="admin-btn admin-btn--ghost"
                    type="button"
                    onClick={() => {
                      setCatForm({ id: null, nom: "" });
                      setCatErrors({});
                    }}
                  >
                    Annuler
                  </button>
                </div>
              ) : null}

              <div className="admin-search">
                <input className="admin-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" />
              </div>

              <div className="admin-itemTitle" style={{ margin: "8px 0 10px" }}>Liste</div>

              {categoriesFiltered.length === 0 ? (
                <div className="admin-itemSub">Aucune catégorie.</div>
              ) : (
                <div className="admin-list">
                  {categoriesFiltered.map((c) => (
                    <div key={c.id} className="admin-item">
                      <div>
                        <div className="admin-itemTitle">#{c.id} — {c.nom}</div>
                      </div>
                      <div className="admin-actions">
                        <button className="admin-btn" type="button" onClick={() => editCategorie(c)}>Éditer</button>
                        <button className="admin-btn admin-btn--danger" type="button" onClick={() => removeCategorie(c.id)}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* FORMATIONS */}
        {tab === "formations" && (
          <>
            <h2 className="admin-sectionTitle">Formations</h2>

            <div className="admin-card">
              <div className="admin-grid">
                <Field label="Titre" required error={formationErrors.titre}>
                  <input
                    className={`admin-input ${formationErrors.titre ? "is-invalid" : ""}`}
                    value={formationForm.titre}
                    onChange={(e) => {
                      setFormationForm((p) => ({ ...p, titre: e.target.value }));
                      if (formationErrors.titre) setFormationErrors((p) => ({ ...p, titre: undefined }));
                    }}
                    placeholder="Ex: Spring Boot avancé"
                  />
                </Field>

                <Field label="Catégorie" required error={formationErrors.categorieId}>
                  <select
                    className={`admin-select ${formationErrors.categorieId ? "is-invalid" : ""}`}
                    value={formationForm.categorieId}
                    onChange={(e) => {
                      setFormationForm((p) => ({ ...p, categorieId: e.target.value }));
                      if (formationErrors.categorieId) setFormationErrors((p) => ({ ...p, categorieId: undefined }));
                    }}
                  >
                    <option value="">— choisir —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </Field>

                <button className="admin-btn" type="button" onClick={saveFormation}>
                  {formationForm.id ? "Modifier" : "Créer"}
                </button>
              </div>

              <div style={{ height: 12 }} />

              <div className="admin-grid admin-grid--3">
                <Field label="Description">
                  <input
                    className="admin-input"
                    value={formationForm.description}
                    onChange={(e) => setFormationForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Courte description…"
                  />
                </Field>

                <Field label="Prix (€)">
                  <input
                    className="admin-input"
                    type="number"
                    value={formationForm.prix}
                    onChange={(e) => setFormationForm((p) => ({ ...p, prix: e.target.value }))}
                    placeholder="599.99"
                  />
                </Field>

                <Field label="Niveau">
                  <input
                    className="admin-input"
                    value={formationForm.niveau}
                    onChange={(e) => setFormationForm((p) => ({ ...p, niveau: e.target.value }))}
                    placeholder="Débutant / Intermédiaire…"
                  />
                </Field>

                <Field label="Durée (heures)">
                  <input
                    className="admin-input"
                    type="number"
                    value={formationForm.dureeHeures}
                    onChange={(e) => setFormationForm((p) => ({ ...p, dureeHeures: e.target.value }))}
                    placeholder="40"
                  />
                </Field>

                <div />
                <div>
                  {formationForm.id ? (
                    <button
                      className="admin-btn admin-btn--ghost"
                      type="button"
                      onClick={() => {
                        setFormationForm({ id: null, titre: "", description: "", prix: "", niveau: "", dureeHeures: "", categorieId: "" });
                        setFormationErrors({});
                      }}
                    >
                      Annuler
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="admin-search">
                <input className="admin-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" />
              </div>

              <div className="admin-itemTitle" style={{ margin: "8px 0 10px" }}>Liste</div>

              {formationsFiltered.length === 0 ? (
                <div className="admin-itemSub">Aucune formation.</div>
              ) : (
                <div className="admin-list">
                  {formationsFiltered.map((f) => (
                    <div key={f.id} className="admin-item">
                      <div>
                        <div className="admin-itemTitle">
                          #{f.id} — {f.titre} • {categorieNameById[f.categorieId ?? f.categorie?.id] || "Catégorie ?"}
                        </div>
                        <div className="admin-itemSub">
                          {f.niveau ? `${f.niveau} • ` : ""}
                          {f.dureeHeures ? `${f.dureeHeures}h • ` : ""}
                          {f.prix != null ? `${f.prix}€` : ""}
                        </div>
                      </div>
                      <div className="admin-actions">
                        <button className="admin-btn" type="button" onClick={() => editFormation(f)}>Éditer</button>
                        <button className="admin-btn admin-btn--danger" type="button" onClick={() => removeFormation(f.id)}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* SESSIONS */}
        {tab === "sessions" && (
          <>
            <h2 className="admin-sectionTitle">Sessions</h2>

            <div className="admin-card">
              <div className="admin-grid">
                <Field label="Formation" required error={sessionErrors.formationId}>
                  <select
                    className={`admin-select ${sessionErrors.formationId ? "is-invalid" : ""}`}
                    value={sessionForm.formationId}
                    onChange={(e) => {
                      setSessionForm((p) => ({ ...p, formationId: e.target.value }));
                      if (sessionErrors.formationId) setSessionErrors((p) => ({ ...p, formationId: undefined }));
                    }}
                  >
                    <option value="">— choisir —</option>
                    {formations.map((f) => (
                      <option key={f.id} value={f.id}>{f.titre}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Formateur (optionnel)">
                  <select
                    className="admin-select"
                    value={sessionForm.intervenantId}
                    onChange={(e) => setSessionForm((p) => ({ ...p, intervenantId: e.target.value }))}
                  >
                    <option value="">— aucun —</option>
                    {intervenants.map((itv) => {
                      const prenom = itv.prenom ?? itv.utilisateurPrenom ?? itv.utilisateur?.prenom ?? "";
                      const nom = itv.nom ?? itv.utilisateurNom ?? itv.utilisateur?.nom ?? "";
                      return (
                        <option key={itv.id} value={itv.id}>
                          #{itv.id} — {prenom} {nom} ({itv.specialite || "?"})
                        </option>
                      );
                    })}
                  </select>
                </Field>

                <button className="admin-btn" type="button" onClick={saveSession}>
                  {sessionForm.id ? "Modifier" : "Créer"}
                </button>
              </div>

              <div style={{ height: 12 }} />

              <div className="admin-grid admin-grid--3">
                <Field label="Date début" required error={sessionErrors.dateDebut}>
                  <input
                    className={`admin-input ${sessionErrors.dateDebut ? "is-invalid" : ""}`}
                    type="date"
                    value={sessionForm.dateDebut}
                    onChange={(e) => {
                      setSessionForm((p) => ({ ...p, dateDebut: e.target.value }));
                      if (sessionErrors.dateDebut) setSessionErrors((p) => ({ ...p, dateDebut: undefined }));
                    }}
                  />
                </Field>

                <Field label="Date fin" required error={sessionErrors.dateFin}>
                  <input
                    className={`admin-input ${sessionErrors.dateFin ? "is-invalid" : ""}`}
                    type="date"
                    value={sessionForm.dateFin}
                    onChange={(e) => {
                      setSessionForm((p) => ({ ...p, dateFin: e.target.value }));
                      if (sessionErrors.dateFin) setSessionErrors((p) => ({ ...p, dateFin: undefined }));
                    }}
                  />
                </Field>

                <Field label="Salle">
                  <input className="admin-input" value={sessionForm.salle} onChange={(e) => setSessionForm((p) => ({ ...p, salle: e.target.value }))} />
                </Field>

                <Field label="Places max">
                  <input
                    className="admin-input"
                    type="number"
                    value={sessionForm.nbPlacesMax}
                    onChange={(e) => setSessionForm((p) => ({ ...p, nbPlacesMax: e.target.value }))} />
                </Field>

                <Field label="Statut">
                  <select className="admin-select" value={sessionForm.statut} onChange={(e) => setSessionForm((p) => ({ ...p, statut: e.target.value }))}>
                    <option value="OUVERTE">OUVERTE</option>
                    <option value="PLANIFIEE">PLANIFIEE</option>
                    <option value="FERMEE">FERMEE</option>
                    <option value="ANNULEE">ANNULEE</option>
                  </select>
                </Field>

                <div>
                  {sessionForm.id ? (
                    <button
                      className="admin-btn admin-btn--ghost"
                      type="button"
                      onClick={() => {
                        setSessionForm({ id: null, formationId: "", intervenantId: "", dateDebut: "", dateFin: "", salle: "", nbPlacesMax: 12, statut: "OUVERTE" });
                        setSessionErrors({});
                      }}
                    >
                      Annuler
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="admin-search">
                <input className="admin-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" />
              </div>

              <div className="admin-itemTitle" style={{ margin: "8px 0 10px" }}>Liste</div>

              {sessionsFiltered.length === 0 ? (
                <div className="admin-itemSub">Aucune session.</div>
              ) : (
                <div className="admin-list">
                  {sessionsFiltered.map((s) => (
                    <div key={s.id} className="admin-item">
                      <div>
                        <div className="admin-itemTitle">
                          Session #{s.id} — {formationTitleById[s.formationId ?? s.formation?.id] || s.formationTitre || "Formation ?"}
                        </div>
                        <div className="admin-itemSub">
                          {s.dateDebut} → {s.dateFin} • {s.salle || "Salle ?"} • {s.nbPlacesMax ?? "—"} places • {s.statut}
                        </div>
                        <div className="admin-itemSub">Formateur : {s.intervenantId ?? s.intervenant?.id ?? "—"}</div>
                      </div>
                      <div className="admin-actions">
                        <button className="admin-btn" type="button" onClick={() => editSession(s)}>Éditer</button>
                        <button className="admin-btn admin-btn--danger" type="button" onClick={() => removeSession(s.id)}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* INTERVENANTS */}
        {tab === "intervenants" && (
          <>
            <h2 className="admin-sectionTitle">Formateurs</h2>

            <div className="admin-card">
              <div className="admin-grid">
                <Field label="Utilisateur ID" required={!intervenantForm.id} error={intervenantErrors.utilisateurId}>
                  <input
                    className={`admin-input ${intervenantErrors.utilisateurId ? "is-invalid" : ""}`}
                    type="number"
                    value={intervenantForm.utilisateurId}
                    onChange={(e) => {
                      setIntervenantForm((p) => ({ ...p, utilisateurId: e.target.value }));
                      if (intervenantErrors.utilisateurId) setIntervenantErrors((p) => ({ ...p, utilisateurId: undefined }));
                    }}
                    disabled={!!intervenantForm.id}
                    placeholder="ex: 5"
                  />
                </Field>

                <Field label="Spécialité">
                  <input className="admin-input" value={intervenantForm.specialite} onChange={(e) => setIntervenantForm((p) => ({ ...p, specialite: e.target.value }))} />
                </Field>

                <button className="admin-btn" type="button" onClick={saveIntervenant}>
                  {intervenantForm.id ? "Modifier" : "Créer"}
                </button>
              </div>

              <div style={{ height: 12 }} />

              <div className="admin-grid admin-grid--3">
                <Field label="Statut">
                  <select className="admin-select" value={intervenantForm.statut} onChange={(e) => setIntervenantForm((p) => ({ ...p, statut: e.target.value }))}>
                    <option value="FREELANCE">FREELANCE</option>
                    <option value="CDD">CDD</option>
                    <option value="VACATAIRE">VACATAIRE</option>
                  </select>
                </Field>

                <Field label="Taux horaire">
                  <input className="admin-input" type="number" value={intervenantForm.tauxHoraire} onChange={(e) => setIntervenantForm((p) => ({ ...p, tauxHoraire: e.target.value }))} />
                </Field>

                <div>
                  {intervenantForm.id ? (
                    <button
                      className="admin-btn admin-btn--ghost"
                      type="button"
                      onClick={() => {
                        setIntervenantForm({ id: null, utilisateurId: "", specialite: "", statut: "FREELANCE", tauxHoraire: "" });
                        setIntervenantErrors({});
                      }}
                    >
                      Annuler
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="admin-search">
                <input className="admin-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" />
              </div>

              <div className="admin-itemTitle" style={{ margin: "8px 0 10px" }}>Liste</div>

              {intervenantsFiltered.length === 0 ? (
                <div className="admin-itemSub">Aucun formateur.</div>
              ) : (
                <div className="admin-list">
                  {intervenantsFiltered.map((itv) => {
                    const prenom = itv.prenom ?? itv.utilisateurPrenom ?? itv.utilisateur?.prenom ?? "";
                    const nom = itv.nom ?? itv.utilisateurNom ?? itv.utilisateur?.nom ?? "";
                    const email = itv.email ?? itv.utilisateurEmail ?? itv.utilisateur?.email ?? "";
                    const userId = itv.utilisateurId ?? itv.utilisateur?.id ?? "—";

                    return (
                      <div key={itv.id} className="admin-item">
                        <div>
                          <div className="admin-itemTitle">#{itv.id} — {prenom} {nom}</div>
                          <div className="admin-itemSub">
                            userId: {userId} • {email || "—"} • {itv.specialite || "?"} • {itv.statut || "?"} • {itv.tauxHoraire ?? "—"}€/h
                          </div>
                        </div>
                        <div className="admin-actions">
                          <button className="admin-btn" type="button" onClick={() => editIntervenant(itv)}>Éditer</button>
                          <button className="admin-btn admin-btn--danger" type="button" onClick={() => removeIntervenant(itv.id)}>Supprimer</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* INSCRIPTIONS */}
        {tab === "inscriptions" && (
          <>
            <h2 className="admin-sectionTitle">Inscriptions</h2>

            <div className="admin-card">
              <div className="admin-itemTitle" style={{ marginBottom: 10 }}>Filtres</div>

              <div className="admin-grid admin-grid--4">
                <Field label="Nom">
                  <input className="admin-input" value={insFilters.nom} onChange={(e) => setInsFilters((p) => ({ ...p, nom: e.target.value }))} placeholder="ex: Dupont" />
                </Field>

                <Field label="Email">
                  <input className="admin-input" value={insFilters.email} onChange={(e) => setInsFilters((p) => ({ ...p, email: e.target.value }))} placeholder="ex: user@test.fr" />
                </Field>

                <Field label="Formation">
                  <input className="admin-input" value={insFilters.formation} onChange={(e) => setInsFilters((p) => ({ ...p, formation: e.target.value }))} placeholder="ex: Spring Boot" />
                </Field>

                <div>
                  <Field label="Statut (serveur)">
                    <select className="admin-select" value={insParams.statut} onChange={(e) => setInsParams({ statut: e.target.value })}>
                      <option value="">Tous</option>
                      <option value="PAYEE">PAYÉ</option>
                      <option value="EN_ATTENTE">EN ATTENTE</option>
                      <option value="REFUSEE">REFUSÉE</option>
                    </select>
                  </Field>

                  <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                    <button className="admin-btn admin-btn--ghost" type="button" onClick={() => {
                      setInsParams({ statut: "" });
                      setInsFilters({ nom: "", email: "", formation: "" });
                      loadInscriptions({});
                    }}>
                      Reset filtres
                    </button>
                    <button className="admin-btn" type="button" onClick={applyInscriptionFilterServer}>Filtrer</button>
                  </div>
                </div>
              </div>

              <div className="admin-itemTitle" style={{ marginTop: 14 }}>Liste</div>

              {inscriptionsFiltered.length === 0 ? (
                <div className="admin-itemSub">Aucune inscription.</div>
              ) : (
                <div className="admin-list" style={{ marginTop: 10 }}>
                  {inscriptionsFiltered.map((ins) => {
                    const u = extractUserFromAny(ins);
                    const formationTitre = extractFormationTitleFromAny(ins);
                    const sessionId = extractSessionIdFromAny(ins);
                    const montant = extractMontantFromAny(ins);
                    const date = extractDateFromAny(ins);
                    const statut = ins?.statut;

                    return (
                      <div key={ins.id} className="admin-item">
                        <div style={{ minWidth: 0 }}>
                          <div className="admin-itemTitle">Inscription #{ins.id}</div>
                          <div className="admin-itemSub">
                            userId: {u.id ?? "—"} • {u.email || "—"} • {inscriptionBadge(statut)} • {montant != null ? `+ ${money(montant)}` : "—"}
                          </div>
                          <div className="admin-itemSub">
                            Formation: {formationTitre || "—"} • Session: {sessionId ?? "—"} • Inscrit le {formatMaybeDate(date)}
                          </div>

                          {insEditId === ins.id ? (
                            <div className="admin-grid admin-grid--3" style={{ marginTop: 10 }}>
                              <Field label="Modifier statut">
                                <select className="admin-select" value={insEditStatut} onChange={(e) => setInsEditStatut(e.target.value)}>
                                  <option value="EN_ATTENTE">EN_ATTENTE</option>
                                  <option value="PAYEE">PAYEE</option>
                                  <option value="REFUSEE">REFUSEE</option>
                                </select>
                              </Field>
                              <div />
                              <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                                <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setInsEditId(null)}>Annuler</button>
                                <button className="admin-btn" type="button" onClick={() => saveInscriptionStatut(ins.id)}>Enregistrer</button>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="admin-actions">
                          <button
                            className="admin-btn admin-btn--success"
                            type="button"
                            onClick={() => markPayee(ins.id)}
                            disabled={statut === "PAYEE"}
                            title={statut === "PAYEE" ? "Déjà PAYÉE" : "Marquer PAYÉE"}
                          >
                            Marquer PAYÉ
                          </button>

                          <button
                            className="admin-btn"
                            type="button"
                            onClick={() => {
                              setInsEditId(ins.id);
                              setInsEditStatut(statut || "EN_ATTENTE");
                            }}
                          >
                            Modifier
                          </button>

                          <button
                            className="admin-btn admin-btn--danger"
                            type="button"
                            onClick={() => refuserInscription(ins.id)}
                            disabled={statut === "REFUSEE"}
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* PAIEMENTS */}
        {tab === "paiements" && (
          <>
            <h2 className="admin-sectionTitle">Paiements</h2>

            <div className="admin-card">
              <div className="admin-itemTitle">Créer un paiement (admin)</div>

              <div className="admin-grid admin-grid--5" style={{ marginTop: 10 }}>
                <Field label="Inscription ID" required error={payErrors.inscriptionId}>
                  <input
                    className={`admin-input ${payErrors.inscriptionId ? "is-invalid" : ""}`}
                    value={payForm.inscriptionId}
                    onChange={(e) => {
                      setPayForm((p) => ({ ...p, inscriptionId: e.target.value }));
                      if (payErrors.inscriptionId) setPayErrors((p) => ({ ...p, inscriptionId: undefined }));
                    }}
                    placeholder="ex: 177"
                  />
                </Field>

                <Field label="Montant" required error={payErrors.montant}>
                  <input
                    className={`admin-input ${payErrors.montant ? "is-invalid" : ""}`}
                    type="number"
                    value={payForm.montant}
                    onChange={(e) => {
                      setPayForm((p) => ({ ...p, montant: e.target.value }));
                      if (payErrors.montant) setPayErrors((p) => ({ ...p, montant: undefined }));
                    }}
                    placeholder="299.99"
                  />
                </Field>

                <Field label="Mode/Paiement">
                  <select className="admin-select" value={payForm.modePaiement} onChange={(e) => setPayForm((p) => ({ ...p, modePaiement: e.target.value }))}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SIMULATION">SIMULATION</option>
                    <option value="CB">CB</option>
                    <option value="VIREMENT">VIREMENT</option>
                  </select>
                </Field>

                <Field label="Statut">
                  <select className="admin-select" value={payForm.statut} onChange={(e) => setPayForm((p) => ({ ...p, statut: e.target.value }))}>
                    <option value="SUCCES">SUCCESS</option>
                    <option value="EN_ATTENTE">EN ATTENTE</option>
                    <option value="ECHEC">ECHEC</option>
                  </select>
                </Field>

                <button className="admin-btn" type="button" onClick={savePaiement}>
                  Créer
                </button>
              </div>

              <div className="admin-help" style={{ marginTop: 10 }}>
                Une fois le paiement en <b>SUCCESS</b>, ça peut automatiquement mettre l’inscription en <b>PAYÉE</b> côté backend.
              </div>

              <div style={{ height: 16 }} />

              <div className="admin-itemTitle">Filtres</div>

              <div className="admin-grid admin-grid--4" style={{ marginTop: 10 }}>
                <Field label="Statut">
                  <select className="admin-select" value={payParams.statut} onChange={(e) => setPayParams((p) => ({ ...p, statut: e.target.value }))}>
                    <option value="">Tous</option>
                    <option value="SUCCES">SUCCESS</option>
                    <option value="EN_ATTENTE">EN ATTENTE</option>
                    <option value="ECHEC">ECHEC</option>
                  </select>
                </Field>

                <Field label="Inscription ID">
                  <input className="admin-input" value={payParams.inscriptionId} onChange={(e) => setPayParams((p) => ({ ...p, inscriptionId: e.target.value }))} placeholder="ex: 177" />
                </Field>

                <Field label="Utilisateur Id">
                  <input className="admin-input" value={payParams.utilisateurId} onChange={(e) => setPayParams((p) => ({ ...p, utilisateurId: e.target.value }))} placeholder="ex: 1" />
                </Field>

                <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                  <button className="admin-btn admin-btn--ghost" type="button" onClick={() => {
                    setPayParams({ statut: "", inscriptionId: "", utilisateurId: "" });
                    loadPaiements({});
                  }}>
                    Reset filtres
                  </button>
                  <button className="admin-btn" type="button" onClick={applyPaiementFilterServer}>Filtrer</button>
                </div>
              </div>

              <div className="admin-itemTitle" style={{ marginTop: 14 }}>Liste</div>

              {paiements.length === 0 ? (
                <div className="admin-itemSub">Aucun paiement.</div>
              ) : (
                <div className="admin-list" style={{ marginTop: 10 }}>
                  {paiements.map((p) => {
                    const id = p?.id;
                    const inscriptionId = p?.inscriptionId ?? p?.inscription?.id ?? p?.idInscription ?? null;
                    const montant = p?.montant ?? p?.amount ?? null;
                    const statut = p?.statut;
                    const mode = p?.modePaiement ?? p?.mode ?? "—";
                    const date = p?.datePaiement ?? p?.createdAt ?? p?.dateCreation ?? null;
                    const u = extractUserFromAny(p);

                    return (
                      <div key={id ?? `${inscriptionId}-${montant}-${statut}`} className="admin-item">
                        <div style={{ minWidth: 0 }}>
                          <div className="admin-itemTitle">
                            Paiement #{id ?? "—"} — Inscription: #{inscriptionId ?? "—"} • {montant != null ? `+ ${money(montant)}` : "—"}
                          </div>
                          <div className="admin-itemSub">
                            fait le {formatMaybeDate(date)} • mode: {mode} • userId: {u.id ?? "—"} • {u.email || "—"}
                          </div>
                        </div>

                        <div className="admin-actions">
                          {paiementBadge(statut)}
                          <button
                            className="admin-btn admin-btn--success"
                            type="button"
                            onClick={() => markSucces(id)}
                            disabled={statut === "SUCCES" || !id}
                          >
                            Marquer SUCCESS
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
