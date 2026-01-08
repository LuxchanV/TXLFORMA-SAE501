import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { mesInscriptions, annulerInscription } from "../../services/inscriptions";
import { paiementsParInscription } from "../../services/paiements";
import { evaluationParInscription } from "../../services/evaluations";
import { telechargerAttestation } from "../../services/attestations";

function parseISO(dateStr) {
  if (!dateStr) return null;
  // "YYYY-MM-DD"
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmtDate(dateStr) {
  const d = parseISO(dateStr);
  if (!d) return "—";
  return d.toLocaleDateString("fr-FR");
}

export default function UserHome() {
  const { user, refreshMe } = useAuth();
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [paymentsMap, setPaymentsMap] = useState({});
  const [evalMap, setEvalMap] = useState({});
  const [openPayments, setOpenPayments] = useState({});
  const [openEval, setOpenEval] = useState({});

  const load = async () => {
    setLoading(true);
    setMsg("");
    setError("");
    setPaymentsMap({});
    setEvalMap({});
    setOpenPayments({});
    setOpenEval({});

    try {
      await refreshMe?.();
      const data = await mesInscriptions();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Impossible de charger ton espace");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    let upcoming = 0;
    let todayTitle = "—";
    let paid = 0;

    for (const ins of items) {
      const statut = ins.statut ?? "—";
      if (statut === "PAYEE") paid++;

      const d1 = parseISO(ins.dateDebut);
      const d2 = parseISO(ins.dateFin);

      if (d1 && d1 > today && statut !== "ANNULEE") upcoming++;

      if (d1 && d2 && d1 <= today && today <= d2 && statut !== "ANNULEE") {
        todayTitle = ins.formationTitre ?? "Formation du jour";
      }
    }

    return { upcoming, todayTitle, paid, total: items.length };
  }, [items]);

  const onAnnuler = async (id, statut) => {
    setMsg("");
    setError("");
    try {
      if (statut === "PAYEE") {
        setError("Inscription déjà payée : annulation impossible.");
        return;
      }
      if (statut === "ANNULEE") return;

      await annulerInscription(id);
      setMsg("✅ Inscription annulée");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur annulation");
    }
  };

  // ✅ FIX: ne plus “simulerPaiement” ici => redirection checkout Stripe
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

      // ✅ redirection vers la page qui affiche la carte
      nav(`/user/paiement/${id}`);
    } finally {
      setPayingId(null);
    }
  };

  const togglePayments = async (inscriptionId) => {
    setOpenPayments((p) => ({ ...p, [inscriptionId]: !p[inscriptionId] }));
    if (paymentsMap[inscriptionId]) return;

    try {
      const ps = await paiementsParInscription(inscriptionId);
      setPaymentsMap((m) => ({ ...m, [inscriptionId]: Array.isArray(ps) ? ps : [] }));
    } catch {
      setPaymentsMap((m) => ({ ...m, [inscriptionId]: [] }));
    }
  };

  const toggleEval = async (inscriptionId) => {
    setOpenEval((p) => ({ ...p, [inscriptionId]: !p[inscriptionId] }));
    if (Object.prototype.hasOwnProperty.call(evalMap, inscriptionId)) return;

    try {
      const ev = await evaluationParInscription(inscriptionId);
      setEvalMap((m) => ({ ...m, [inscriptionId]: ev }));
    } catch {
      setEvalMap((m) => ({ ...m, [inscriptionId]: null }));
    }
  };

  const onAttestation = async (inscriptionId, statut) => {
    setMsg("");
    setError("");
    setDownloadingId(inscriptionId);

    try {
      if (statut !== "PAYEE") {
        setError("Attestation disponible uniquement quand l’inscription est PAYEE.");
        return;
      }

      const blob = await telechargerAttestation(inscriptionId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attestation_inscription_${inscriptionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMsg("✅ Attestation téléchargée");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) setError("Attestation indisponible (pas d’évaluation / pas autorisé / pas de fichier).");
      else if (status === 403) setError("Accès refusé (token/role).");
      else setError(e?.response?.data?.message || "Attestation indisponible");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      {/* KPIs */}
      <section className="u-panel">
        <div className="u-grid-3">
          <div className="u-kpi">
            <div className="u-kpi__label">Formations à venir</div>
            <div className="u-kpi__value">{stats.upcoming}</div>
          </div>

          <div className="u-kpi">
            <div className="u-kpi__label">Formation du jour</div>
            <div className="u-kpi__value" style={{ fontSize: 18, lineHeight: 1.2 }}>
              {stats.todayTitle}
            </div>
          </div>

          <div className="u-kpi">
            <div className="u-kpi__label">Inscriptions payées</div>
            <div className="u-kpi__value">
              {stats.paid}/{stats.total}
            </div>
          </div>
        </div>
      </section>

      {/* Messages */}
      {(msg || error) && (
        <section className="u-panel">
          {msg ? <div className="u-msg u-msg--ok">{msg}</div> : null}
          {error ? <div className="u-msg u-msg--err">{error}</div> : null}
        </section>
      )}

      {/* List */}
      <section className="u-panel">
        <div className="u-item__top" style={{ marginBottom: 10 }}>
          <h2 className="u-title" style={{ margin: 0 }}>
            Mes formations
          </h2>
          <button className="u-btn u-btn--ghost" onClick={load} disabled={loading}>
            {loading ? "Chargement..." : "Rafraîchir"}
          </button>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", fontWeight: 700 }}>Chargement…</div>
        ) : items.length === 0 ? (
          <div style={{ color: "#64748b", fontWeight: 700 }}>Aucune inscription pour l’instant.</div>
        ) : (
          <div className="u-list">
            {items.map((ins) => {
              const id = ins.id;
              const statut = ins.statut ?? "—";

              const isPayee = statut === "PAYEE";
              const isAnnulee = statut === "ANNULEE";

              const formationTitre = ins.formationTitre ?? "—";
              const dates = `${fmtDate(ins.dateDebut)} → ${fmtDate(ins.dateFin)}`;
              const salle = ins.salle ? ` • ${ins.salle}` : "";
              const intervenant = ins.intervenantPrenom
                ? ` • Formateur: ${ins.intervenantPrenom} ${ins.intervenantNom}`
                : "";

              const paysOpen = !!openPayments[id];
              const evalOpen = !!openEval[id];
              const payments = paymentsMap[id] || [];
              const ev = evalMap[id];

              const chipClass =
                statut === "PAYEE" ? "u-chip--ok" : statut === "ANNULEE" ? "u-chip--bad" : "u-chip--wait";

              return (
                <div key={id} className="u-item">
                  <div className="u-item__top">
                    <div>
                      <div className="u-item__name">{formationTitre}</div>
                      <div className="u-item__meta">
                        Inscription #{id} • {dates}
                        {salle}
                        {intervenant}
                      </div>
                    </div>

                    <span className={`u-chip ${chipClass}`}>{statut}</span>
                  </div>

                  <div className="u-actions">
                    <button
                      className="u-btn u-btn--danger"
                      onClick={() => onAnnuler(id, statut)}
                      disabled={isPayee || isAnnulee}
                    >
                      Annuler
                    </button>

                    <button
                      className="u-btn u-btn--primary"
                      onClick={() => onPayer(id, statut)}
                      disabled={isPayee || isAnnulee || payingId === id}
                    >
                      {payingId === id ? "Redirection..." : isPayee ? "Déjà payé" : "Payer"}
                    </button>

                    <button className="u-btn u-btn--ghost" onClick={() => togglePayments(id)}>
                      {paysOpen ? "Masquer paiements" : "Voir paiements"}
                    </button>

                    <button className="u-btn u-btn--ghost" onClick={() => toggleEval(id)}>
                      {evalOpen ? "Masquer évaluation" : "Voir évaluation"}
                    </button>

                    <button
                      className="u-btn u-btn--dark"
                      onClick={() => onAttestation(id, statut)}
                      disabled={!isPayee || downloadingId === id}
                    >
                      {downloadingId === id ? "Téléchargement..." : "Télécharger le PDF"}
                    </button>
                  </div>

                  {paysOpen && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>Paiements</div>
                      {payments.length === 0 ? (
                        <div style={{ color: "#64748b", fontWeight: 700 }}>Aucun paiement.</div>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: 18, color: "#64748b", fontWeight: 700 }}>
                          {payments.map((p) => (
                            <li key={p.id}>
                              #{p.id} • {p.montant}€ • {p.statut} • {p.modePaiement}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {evalOpen && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>Évaluation</div>
                      {ev === undefined ? (
                        <div style={{ color: "#64748b", fontWeight: 700 }}>Chargement…</div>
                      ) : ev === null ? (
                        <div style={{ color: "#64748b", fontWeight: 700 }}>Pas encore d’évaluation.</div>
                      ) : (
                        <div style={{ color: "#64748b", fontWeight: 700 }}>
                          Note : <b style={{ color: "#0f172a" }}>{ev.note}/20</b>
                          {ev.commentaire ? ` • "${ev.commentaire}"` : ""}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Profil rapide */}
      <section className="u-panel">
        <h2 className="u-title">Mes informations</h2>
        <div style={{ color: "#64748b", fontWeight: 700 }}>
          <div>
            <b style={{ color: "#0f172a" }}>
              {user?.prenom} {user?.nom}
            </b>
          </div>
          <div>{user?.email}</div>
          {user?.telephone ? <div>Tél: {user.telephone}</div> : null}
          {user?.adressePostale ? <div>Adresse: {user.adressePostale}</div> : null}
          {user?.entreprise ? <div>Entreprise: {user.entreprise}</div> : null}
        </div>
      </section>
    </>
  );
}
