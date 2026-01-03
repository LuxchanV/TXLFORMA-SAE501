import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getFormation, getSessionsByFormation } from "../services/catalogue";
import { creerInscription } from "../services/inscriptions";
import { getToken } from "../services/auth";

export default function FormationDetails() {
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
        const [f, s] = await Promise.all([
          getFormation(id),
          getSessionsByFormation(id),
        ]);
        setFormation(f);
        setSessions(s);
      } catch (e) {
        setError("Impossible de charger la formation");
      }
    })();
  }, [id]);

  const onInscrire = async (sessionId) => {
    setMsg("");
    setError("");

    if (!token) {
      nav("/login", { state: { from: `/formations/${id}` } });
      return;
    }

    try {
      const ins = await creerInscription(sessionId);
      setMsg(`✅ Inscription créée (id: ${ins.id})`);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur inscription (déjà inscrit ?)");
    }
  };

  if (!formation) return <div className="card">Chargement...</div>;

  return (
    <div className="card">
      <Link to="/catalogue" className="muted">← Retour catalogue</Link>

      <h1>{formation.titre}</h1>
      {formation.description && <p>{formation.description}</p>}

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      <h2>Sessions</h2>
      <div className="list">
        {sessions.map((s) => (
          <div key={s.id} className="list-item">
            <div>
              <b>Session #{s.id}</b>
              <div className="muted">
                {s.dateDebut} → {s.dateFin} • {s.salle || "Salle ?"} • {s.nbPlacesMax} places • {s.statut}
              </div>
            </div>
            <button className="btn" onClick={() => onInscrire(s.id)}>S’inscrire</button>
          </div>
        ))}
      </div>
    </div>
  );
}
