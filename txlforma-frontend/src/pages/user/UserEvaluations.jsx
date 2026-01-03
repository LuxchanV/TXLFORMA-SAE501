import { useEffect, useState } from "react";
import { mesInscriptions } from "../../services/inscriptions";
import { evaluationParInscription } from "../../services/evaluations";

export default function UserEvaluations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const ins = await mesInscriptions();
      const list = Array.isArray(ins) ? ins : [];

      const all = [];
      for (const i of list) {
        try {
          const ev = await evaluationParInscription(i.id);
          all.push({ inscriptionId: i.id, formationTitre: i.formationTitre ?? "—", ev });
        } catch {
          all.push({ inscriptionId: i.id, formationTitre: i.formationTitre ?? "—", ev: null });
        }
      }
      setRows(all);
    } catch {
      setError("Impossible de charger tes évaluations.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="u-panel">
      <div className="u-item__top" style={{ marginBottom: 10 }}>
        <h2 className="u-title" style={{ margin: 0 }}>Mes évaluations</h2>
        <button className="u-btn u-btn--ghost" onClick={load} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {error ? <div className="u-msg u-msg--err">{error}</div> : null}

      {loading ? (
        <div style={{ color: "#64748b", fontWeight: 700 }}>Chargement…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#64748b", fontWeight: 700 }}>Aucune donnée.</div>
      ) : (
        <div className="u-list">
          {rows.map((r) => {
            const ev = r.ev;
            const done = !!ev;
            return (
              <div key={r.inscriptionId} className="u-item">
                <div className="u-item__top">
                  <div>
                    <div className="u-item__name">{r.formationTitre}</div>
                    <div className="u-item__meta">Inscription #{r.inscriptionId}</div>
                  </div>

                  <span className={`u-chip ${done ? "u-chip--ok" : "u-chip--wait"}`}>
                    {done ? "Validée" : "En attente…"}
                  </span>
                </div>

                {done ? (
                  <div style={{ color: "#64748b", fontWeight: 700 }}>
                    Note : <b style={{ color: "#0f172a" }}>{ev.note}/20</b>
                    {ev.commentaire ? ` • "${ev.commentaire}"` : ""}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
