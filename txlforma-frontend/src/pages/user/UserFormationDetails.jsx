import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getFormation, getSessionsByFormation } from "../../services/catalogue";
import { creerInscription } from "../../services/inscriptions";
import { getToken } from "../../services/auth";

export default function UserFormationDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const token = getToken();

  const [formation, setFormation] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const [f, s] = await Promise.all([getFormation(id), getSessionsByFormation(id)]);
        setFormation(f);
        setSessions(Array.isArray(s) ? s : []);
      } catch {
        setError("Impossible de charger la formation");
      }
    })();
  }, [id]);

  const onInscrire = async (sessionId) => {
    setMsg("");
    setError("");

    if (!token) {
      nav("/login", { state: { from: `/user/formations/${id}` } });
      return;
    }

    try {
      const ins = await creerInscription(sessionId);
      setMsg(`✅ Inscription créée (id: ${ins.id})`);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur inscription (déjà inscrit ?)");
    }
  };

  if (!formation) {
    return (
      <section className="u-panel">
        <div style={{ color: "#64748b", fontWeight: 800 }}>Chargement…</div>
      </section>
    );
  }

  return (
    <section className="u-panel">
      <div className="u-item__top" style={{ marginBottom: 10 }}>
        <h2 className="u-title" style={{ margin: 0 }}>{formation.titre}</h2>
        <Link to="/user/catalogue" className="u-btn u-btn--ghost" style={{ textDecoration: "none" }}>
          ← Retour catalogue
        </Link>
      </div>

      {formation.description ? (
        <div style={{ color: "#64748b", fontWeight: 700, marginBottom: 10 }}>{formation.description}</div>
      ) : null}

      {msg ? <div className="u-msg u-msg--ok">{msg}</div> : null}
      {error ? <div className="u-msg u-msg--err">{error}</div> : null}

      <h3 className="u-title" style={{ marginTop: 16 }}>Sessions</h3>
      <div className="u-list">
        {sessions.map((s) => (
          <div key={s.id} className="u-item">
            <div className="u-item__top">
              <div>
                <div className="u-item__name">Session #{s.id}</div>
                <div className="u-item__meta">
                  {s.dateDebut} → {s.dateFin} • {s.salle || "Salle ?"} • {s.nbPlacesMax} places • {s.statut}
                </div>
              </div>

              <button className="u-btn u-btn--primary" onClick={() => onInscrire(s.id)}>
                S’inscrire
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
