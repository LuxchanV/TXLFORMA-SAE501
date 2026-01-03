import { useEffect, useMemo, useState } from "react";
import { mesInscriptions } from "../../services/inscriptions";

function parseISO(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function UserSessions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await mesInscriptions();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Impossible de charger tes sessions.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const groups = useMemo(() => {
    const today = new Date();
    const current = [];
    const upcoming = [];
    const past = [];

    for (const ins of items) {
      const d1 = parseISO(ins.dateDebut);
      const d2 = parseISO(ins.dateFin);
      const statut = ins.statut ?? "—";
      if (statut === "ANNULEE") continue;

      if (d1 && d2 && d1 <= today && today <= d2) current.push(ins);
      else if (d1 && d1 > today) upcoming.push(ins);
      else past.push(ins);
    }

    return { current, upcoming, past };
  }, [items]);

  const render = (title, list) => (
    <div style={{ display: "grid", gap: 12 }}>
      <h2 className="u-title" style={{ margin: 0 }}>{title}</h2>
      {list.length === 0 ? (
        <div style={{ color: "#64748b", fontWeight: 700 }}>Aucune session.</div>
      ) : (
        <div className="u-list">
          {list.map((ins) => (
            <div key={ins.id} className="u-item">
              <div className="u-item__top">
                <div>
                  <div className="u-item__name">{ins.formationTitre ?? "—"}</div>
                  <div className="u-item__meta">
                    {ins.dateDebut} → {ins.dateFin} • {ins.salle || "Salle ?"} • Inscription #{ins.id}
                  </div>
                </div>
                <span className={`u-chip ${ins.statut === "PAYEE" ? "u-chip--ok" : "u-chip--wait"}`}>
                  {ins.statut ?? "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="u-panel">
      <div className="u-item__top" style={{ marginBottom: 10 }}>
        <h2 className="u-title" style={{ margin: 0 }}>Mes sessions</h2>
        <button className="u-btn u-btn--ghost" onClick={load} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {error ? <div className="u-msg u-msg--err">{error}</div> : null}

      {loading ? (
        <div style={{ color: "#64748b", fontWeight: 700 }}>Chargement…</div>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {render("Session du jour", groups.current)}
          {render("Sessions à venir", groups.upcoming)}
          {render("Sessions passées", groups.past)}
        </div>
      )}
    </section>
  );
}
