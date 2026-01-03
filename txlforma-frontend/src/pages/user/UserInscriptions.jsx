import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { annulerInscription, mesInscriptions } from "../../services/inscriptions";
import { simulerPaiement, paiementsParInscription } from "../../services/paiements";
import { telechargerAttestation } from "../../services/attestations";

export default function UserInscriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [paymentsMap, setPaymentsMap] = useState({});

  const load = async () => {
    setLoading(true);
    setError("");
    setMsg("");

    try {
      const data = await mesInscriptions();
      const list = Array.isArray(data) ? data : [];
      setItems(list);

      // charge paiements (optionnel)
      const entries = await Promise.all(
        list.map(async (ins) => {
          try {
            const ps = await paiementsParInscription(ins.id);
            return [ins.id, Array.isArray(ps) ? ps : []];
          } catch {
            return [ins.id, []];
          }
        })
      );

      const map = {};
      for (const [id, ps] of entries) map[id] = ps;
      setPaymentsMap(map);
    } catch (e) {
      setError(e?.response?.data?.message || "Impossible de charger tes inscriptions");
      setItems([]);
      setPaymentsMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAnnuler = async (id, statut) => {
    setMsg("");
    setError("");
    try {
      // logique métier: on bloque côté UI si PAYEE
      if (statut === "PAYEE") {
        setError("Inscription déjà payée : annulation bloquée.");
        return;
      }
      await annulerInscription(id);
      setMsg("✅ Inscription annulée");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur lors de l’annulation");
    }
  };

  const onPayer = async (id, statut) => {
    setMsg("");
    setError("");
    setPayingId(id);

    try {
      if (statut === "PAYEE") {
        setMsg("Déjà payé ✅");
        return;
      }
      if (statut === "ANNULEE") {
        setError("Inscription annulée : paiement impossible.");
        return;
      }

      const paiement = await simulerPaiement(id);
      setMsg(`✅ Paiement OK (montant: ${paiement?.montant ?? "?"}€)`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur paiement");
    } finally {
      setPayingId(null);
    }
  };

  const onTelechargerPdf = async (id) => {
    setMsg("");
    setError("");
    setDownloadingId(id);

    try {
      const blob = await telechargerAttestation(id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attestation_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMsg("✅ Attestation téléchargée");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        setError("Attestation indisponible (évaluation manquante ou session non validée).");
      } else if (status === 403) {
        setError("Accès refusé (token/role).");
      } else {
        setError(e?.response?.data?.message || "Erreur téléchargement attestation");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="card">
      <h1>Mes inscriptions</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="btn" onClick={load} disabled={loading}>
          Rafraîchir
        </button>
        <Link className="btn" to="/catalogue">
          Aller au catalogue
        </Link>
      </div>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Chargement…</p>
      ) : items.length === 0 ? (
        <p className="muted">Aucune inscription pour l’instant.</p>
      ) : (
        <div className="list">
          {items.map((ins) => {
            const id = ins.id;
            const statut = ins.statut ?? "—";
            const sessionId = ins.sessionId ?? ins.session?.id ?? "—";

            const titreFormation =
              ins.formationTitre ??
              ins.session?.formation?.titre ??
              ins.sessionFormation?.formation?.titre ??
              null;

            const datesSession =
              ins.dateDebut && ins.dateFin ? `${ins.dateDebut} → ${ins.dateFin}` : null;

            const payments = paymentsMap[id] || [];
            const isPayee = statut === "PAYEE";
            const isAnnulee = statut === "ANNULEE";

            return (
              <div key={id} className="list-item">
                <div>
                  <b>Inscription #{id}</b>
                  <div className="muted">
                    Statut : {statut} • Session #{sessionId}
                    {payments.length ? ` • Paiements: ${payments.length}` : ""}
                  </div>

                  {titreFormation && <div className="muted">Formation : {titreFormation}</div>}
                  {datesSession && <div className="muted">Dates : {datesSession}</div>}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="btn"
                    onClick={() => onAnnuler(id, statut)}
                    disabled={isPayee || isAnnulee}
                  >
                    Annuler
                  </button>

                  <button
                    className="btn"
                    onClick={() => onPayer(id, statut)}
                    disabled={isPayee || isAnnulee || payingId === id}
                  >
                    {payingId === id ? "Paiement..." : isPayee ? "Déjà payé" : "Payer"}
                  </button>

                  <button
                    className="btn"
                    onClick={() => onTelechargerPdf(id)}
                    disabled={!isPayee || isAnnulee || downloadingId === id}
                  >
                    {downloadingId === id ? "Téléchargement..." : "Attestation PDF"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
