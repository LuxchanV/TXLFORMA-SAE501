import { useEffect, useMemo, useState } from "react";
import {
  adminUsers,
  adminCreateUser,
  adminUpdateUser,
  adminChangeUserRole,
  adminChangeUserActif,
  adminDeleteUser,
} from "../../services/admin";

const ROLES = ["ROLE_USER", "ROLE_FORMATEUR", "ROLE_ADMIN"];

function Field({ label, required, error, children }) {
  return (
    <div className="admin-field">
      <label>
        {label} {required ? <span className="admin-req">requis</span> : null}
      </label>
      {children}
      {error ? (
        <div className="admin-help" style={{ color: "#7f1d1d", fontWeight: 700 }}>
          {error}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminUsersTab() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [actif, setActif] = useState(""); // "" | "true" | "false"

  const [users, setUsers] = useState([]);

  const [createdCreds, setCreatedCreds] = useState(null); // { email, temporaryPassword, id, role }

  // form create/edit
  const [form, setForm] = useState({
    id: null,
    nom: "",
    prenom: "",
    email: "",
    role: "ROLE_USER",
    actif: true,
    temporaryPassword: "",

    telephone: "",
    adressePostale: "",
    entreprise: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const resetMessages = () => {
    setMsg("");
    setError("");
  };

  const safeError = (e, fallback) =>
    e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;

  const load = async () => {
    setLoading(true);
    resetMessages();
    try {
      const params = {};
      if (q.trim()) params.q = q.trim();
      if (role) params.role = role;
      if (actif === "true") params.actif = true;
      if (actif === "false") params.actif = false;

      const data = await adminUsers(params);
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(safeError(e, "Impossible de charger les utilisateurs"));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Nom obligatoire";
    if (!form.prenom.trim()) e.prenom = "Prénom obligatoire";
    if (!form.email.trim()) e.email = "Email obligatoire";
    if (!form.email.includes("@")) e.email = "Email invalide";
    if (!form.id && !form.role) e.role = "Rôle obligatoire";
    return e;
  };

  const isEdit = !!form.id;

  const startCreate = () => {
    setFormErrors({});
    setCreatedCreds(null);
    setForm({
      id: null,
      nom: "",
      prenom: "",
      email: "",
      role: "ROLE_USER",
      actif: true,
      temporaryPassword: "",

      telephone: "",
      adressePostale: "",
      entreprise: "",
    });
  };

  const startEdit = (u) => {
    setFormErrors({});
    setCreatedCreds(null);
    setForm({
      id: u.id,
      nom: u.nom ?? "",
      prenom: u.prenom ?? "",
      email: u.email ?? "",
      role: u.role ?? "ROLE_USER",
      actif: u.actif ?? true,
      temporaryPassword: "",

      telephone: u.telephone ?? "",
      adressePostale: u.adressePostale ?? "",
      entreprise: u.entreprise ?? "",
    });
  };

  const submit = async () => {
    resetMessages();
    const e = validate();
    setFormErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      if (!isEdit) {
        const payload = {
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          email: form.email.trim(),
          role: form.role,
          actif: !!form.actif,
          temporaryPassword: form.temporaryPassword?.trim() || null,
        };

        const created = await adminCreateUser(payload);

        setMsg("✅ Utilisateur créé (mot de passe temporaire affiché ci-dessous)");
        setCreatedCreds({
          id: created.id,
          role: created.role,
          email: created.email,
          temporaryPassword: created.temporaryPassword,
        });

        startCreate();
        await load();
        return;
      }

      // edit
      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        telephone: form.telephone?.trim() || null,
        adressePostale: form.adressePostale?.trim() || null,
        entreprise: form.entreprise?.trim() || null,
      };

      await adminUpdateUser(form.id, payload);
      setMsg("✅ Utilisateur modifié");
      await load();
    } catch (err) {
      setError(safeError(err, "Erreur sauvegarde utilisateur"));
    } finally {
      setLoading(false);
    }
  };

  const toggleActif = async (u) => {
    resetMessages();
    setLoading(true);
    try {
      await adminChangeUserActif(u.id, !(u.actif ?? true));
      setMsg("✅ Statut actif modifié");
      await load();
    } catch (e) {
      setError(safeError(e, "Impossible de modifier actif"));
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (u, newRole) => {
    resetMessages();
    setLoading(true);
    try {
      await adminChangeUserRole(u.id, newRole);
      setMsg("✅ Rôle modifié");
      await load();
    } catch (e) {
      setError(safeError(e, "Impossible de modifier le rôle"));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (u) => {
    resetMessages();
    if (!window.confirm(`Supprimer ${u.email} (#${u.id}) ?`)) return;
    setLoading(true);
    try {
      await adminDeleteUser(u.id);
      setMsg("✅ Utilisateur supprimé");
      await load();
    } catch (e) {
      setError(safeError(e, "Impossible de supprimer"));
    } finally {
      setLoading(false);
    }
  };

  const filteredCount = useMemo(() => users.length, [users]);

  const copyCreds = async () => {
    if (!createdCreds?.temporaryPassword) return;
    const txt =
      `Email: ${createdCreds.email}\n` +
      `Mot de passe temporaire: ${createdCreds.temporaryPassword}\n` +
      `Role: ${createdCreds.role}\n` +
      `UserId: ${createdCreds.id}\n`;

    try {
      await navigator.clipboard.writeText(txt);
      setMsg("✅ Identifiants copiés");
    } catch {
      setMsg("✅ (Copie impossible auto) — sélectionne et copie manuellement");
    }
  };

  return (
    <>
      {loading ? (
        <div className="admin-alert admin-alert--success" style={{ opacity: 0.8 }}>
          Chargement…
        </div>
      ) : null}
      {msg ? <div className="admin-alert admin-alert--success">{msg}</div> : null}
      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

      {/* création/édition */}
      <div className="admin-card">
        <div className="admin-itemTitle" style={{ marginBottom: 10 }}>
          {isEdit ? `Éditer utilisateur #${form.id}` : "Créer un utilisateur"}
        </div>

        <div className="admin-grid">
          <Field label="Nom" required error={formErrors.nom}>
            <input
              className={`admin-input ${formErrors.nom ? "is-invalid" : ""}`}
              value={form.nom}
              onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
              placeholder="Dupont"
            />
          </Field>

          <Field label="Prénom" required error={formErrors.prenom}>
            <input
              className={`admin-input ${formErrors.prenom ? "is-invalid" : ""}`}
              value={form.prenom}
              onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))}
              placeholder="Jean"
            />
          </Field>

          <button className="admin-btn" type="button" onClick={submit} disabled={loading}>
            {isEdit ? "Enregistrer" : "Créer"}
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="admin-grid admin-grid--3">
          <Field label="Email" required error={formErrors.email}>
            <input
              className={`admin-input ${formErrors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="email@domaine.fr"
            />
          </Field>

          {!isEdit ? (
            <Field label="Rôle" required error={formErrors.role}>
              <select
                className={`admin-select ${formErrors.role ? "is-invalid" : ""}`}
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Téléphone (optionnel)">
              <input
                className="admin-input"
                value={form.telephone}
                onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
                placeholder="06…"
              />
            </Field>
          )}

          {!isEdit ? (
            <Field label="Mot de passe temporaire (optionnel)">
              <input
                className="admin-input"
                value={form.temporaryPassword}
                onChange={(e) => setForm((p) => ({ ...p, temporaryPassword: e.target.value }))}
                placeholder="si vide → généré automatiquement"
              />
            </Field>
          ) : (
            <Field label="Entreprise (optionnel)">
              <input
                className="admin-input"
                value={form.entreprise}
                onChange={(e) => setForm((p) => ({ ...p, entreprise: e.target.value }))}
                placeholder="Société"
              />
            </Field>
          )}
        </div>

        {isEdit ? (
          <>
            <div style={{ height: 12 }} />
            <div className="admin-grid admin-grid--3">
              <Field label="Adresse postale (optionnel)">
                <input
                  className="admin-input"
                  value={form.adressePostale}
                  onChange={(e) => setForm((p) => ({ ...p, adressePostale: e.target.value }))}
                  placeholder="Adresse…"
                />
              </Field>

              <Field label="Actif">
                <select
                  className="admin-select"
                  value={String(!!form.actif)}
                  onChange={(e) => setForm((p) => ({ ...p, actif: e.target.value === "true" }))}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </Field>

              <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                <button className="admin-btn admin-btn--ghost" type="button" onClick={startCreate} disabled={loading}>
                  Annuler
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="admin-help" style={{ marginTop: 10 }}>
            Astuce : pour créer un <b>FORMATEUR</b>, choisis <b>ROLE_FORMATEUR</b>, puis va dans l’onglet{" "}
            <b>Formateurs</b> et crée la fiche avec le <b>UserId</b>.
          </div>
        )}
      </div>

      {/* creds affichés une fois */}
      {createdCreds?.temporaryPassword ? (
        <div className="admin-card" style={{ marginTop: 12 }}>
          <div className="admin-itemTitle">Identifiants créés (à donner au user) ✅</div>
          <div className="admin-itemSub" style={{ marginTop: 6 }}>
            UserId: <b>{createdCreds.id}</b> • Role: <b>{createdCreds.role}</b>
          </div>

          <div style={{ height: 10 }} />
          <pre
            style={{
              margin: 0,
              padding: 12,
              borderRadius: 14,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(15,23,42,0.10)",
              whiteSpace: "pre-wrap",
              fontWeight: 800,
            }}
          >
{`Email: ${createdCreds.email}
Mot de passe temporaire: ${createdCreds.temporaryPassword}`}
          </pre>

          <div className="admin-actions" style={{ marginTop: 10 }}>
            <button className="admin-btn" type="button" onClick={copyCreds}>
              Copier
            </button>
          </div>
        </div>
      ) : null}

      {/* filtres + liste */}
      <div className="admin-card" style={{ marginTop: 12 }}>
        <div className="admin-itemTitle">Liste des utilisateurs ({filteredCount})</div>

        <div className="admin-grid admin-grid--4" style={{ marginTop: 10 }}>
          <Field label="Recherche (q)">
            <input className="admin-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="nom/prénom/email…" />
          </Field>

          <Field label="Rôle">
            <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Tous</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Actif">
            <select className="admin-select" value={actif} onChange={(e) => setActif(e.target.value)}>
              <option value="">Tous</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </Field>

          <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              onClick={() => {
                setQ("");
                setRole("");
                setActif("");
              }}
              disabled={loading}
            >
              Reset
            </button>
            <button className="admin-btn" type="button" onClick={load} disabled={loading}>
              Filtrer
            </button>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {users.length === 0 ? (
          <div className="admin-itemSub">Aucun utilisateur.</div>
        ) : (
          <div className="admin-list">
            {users.map((u) => (
              <div key={u.id} className="admin-item">
                <div style={{ minWidth: 0 }}>
                  <div className="admin-itemTitle">
                    #{u.id} — {u.prenom} {u.nom}
                  </div>
                  <div className="admin-itemSub">
                    {u.email} • role: <b>{u.role}</b> • actif: <b>{String(u.actif)}</b>
                  </div>
                </div>

                <div className="admin-actions">
                  <select
                    className="admin-select"
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value)}
                    style={{ minWidth: 190 }}
                    disabled={loading}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <button className="admin-btn admin-btn--ghost" type="button" onClick={() => toggleActif(u)} disabled={loading}>
                    {u.actif ? "Désactiver" : "Activer"}
                  </button>

                  <button className="admin-btn" type="button" onClick={() => startEdit(u)} disabled={loading}>
                    Éditer
                  </button>

                  <button className="admin-btn admin-btn--danger" type="button" onClick={() => remove(u)} disabled={loading}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
