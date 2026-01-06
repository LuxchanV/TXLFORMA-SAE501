// src/pages/user/UserPaiements.jsx
import { useEffect, useState } from "react";
import { mesInscriptions } from "../../services/inscriptions";
import { paiementsParInscription } from "../../services/paiements";

export default function UserPaiements() {
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
          const ps = await paiementsParInscription(i.id);
          const arr = Array.isArray(ps) ? ps : [];
          for (const p of arr) {
            all.push({
              inscriptionId: i.id,
              formationTitre: i.formationTitre ?? "—",
              statutInscription: i.statut ?? "—",
              paiement: p,
            });
          }
        } catch {
          // ignore
        }
      }

      // tri: plus récent d'abord (si datePaiement dispo)
      all.sort((a, b) => {
        const da = a.paiement?.datePaiement ? new Date(a.paiement.datePaiement).getTime() : 0;
        const db = b.paiement?.datePaiement ? new Date(b.paiement.datePaiement).getTime() : 0;
        return db - da;
      });

      setRows(all);
    } catch {
      setError("Impossible de charger l’historique des paiements.");
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
        <h2 className="u-title" style={{ margin: 0 }}>Historique des paiements</h2>
        <button className="u-btn u-btn--ghost" onClick={load} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {error ? <div className="u-msg u-msg--err">{error}</div> : null}

      {loading ? (
        <div style={{ color: "#64748b", fontWeight: 700 }}>Chargement…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#64748b", fontWeight: 700 }}>Aucun paiement pour l’instant.</div>
      ) : (
        <div className="u-list">
          {rows.map((r) => {
            const p = r.paiement;
            const st = (p?.statut || "").toUpperCase();

            const ok = st === "SUCCES";
            const fail = st === "ECHEC";
            const wait = st === "EN_ATTENTE" || (!ok && !fail);

            const chipClass = ok ? "u-chip--ok" : fail ? "u-chip--bad" : "u-chip--wait";
            const chipLabel = ok ? "Validée" : fail ? "Échec" : "En attente";

            return (
              <div key={`${r.inscriptionId}-${p.id}`} className="u-item">
                <div className="u-item__top">
                  <div>
                    <div className="u-item__name">{r.formationTitre}</div>
                    <div className="u-item__meta">
                      Inscription #{r.inscriptionId} • Paiement #{p.id} • {p.modePaiement} • {p.statut}
                      {p.datePaiement ? ` • ${String(p.datePaiement).replace("T", " ").slice(0, 19)}` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{p.montant}€</div>
                    <span className={`u-chip ${chipClass}`}>{chipLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
