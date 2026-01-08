import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mesInscriptions } from "../../services/inscriptions";
import StripeCheckout from "../../components/StripeCheckout.jsx";

export default function UserCheckout() {
  const { inscriptionId } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [inscription, setInscription] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const formattedInscriptionId = useMemo(() => Number(inscriptionId), [inscriptionId]);

  // anti double-run StrictMode
  const didInitRef = useRef(false);
  const lastIdRef = useRef(null);

  const loadInscription = async () => {
    try {
      const ins = await mesInscriptions();
      const list = Array.isArray(ins) ? ins : [];
      const found = list.find((x) => Number(x.id) === formattedInscriptionId);
      setInscription(found || null);
    } catch {
      setInscription(null);
    }
  };

  useEffect(() => {
    if (lastIdRef.current !== formattedInscriptionId) {
      didInitRef.current = false;
      lastIdRef.current = formattedInscriptionId;
    }
    if (didInitRef.current) return;
    didInitRef.current = true;

    (async () => {
      setLoading(true);
      setError("");
      setMsg("");
      await loadInscription();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedInscriptionId]);

  if (loading) {
    return (
      <section className="u-panel">
        <div style={{ color: "#64748b", fontWeight: 800 }}>Chargement…</div>
      </section>
    );
  }

  const titre = inscription?.formationTitre ?? "Formation";
  const montant = inscription?.formationPrix ?? inscription?.montant ?? 0;
  const statut = inscription?.statut ?? "";

  const isPaid = String(statut).toUpperCase() === "PAYEE";

  return (
    <section className="u-panel">
      <div className="u-item__top" style={{ marginBottom: 10 }}>
        <div>
          <h2 className="u-title" style={{ margin: 0 }}>Checkout</h2>
          <div className="u-item__meta">
            Inscription #{formattedInscriptionId} • {titre}
          </div>
        </div>

        <Link to="/user" className="u-btn u-btn--ghost" style={{ textDecoration: "none" }}>
          ← Retour
        </Link>
      </div>

      {msg ? <div className="u-msg u-msg--ok" style={{ marginBottom: 10 }}>{msg}</div> : null}
      {error ? <div className="u-msg u-msg--err" style={{ marginBottom: 10 }}>{error}</div> : null}

      <div className="u-item" style={{ gap: 14 }}>
        <div className="u-item__top">
          <div>
            <div className="u-item__name">{titre}</div>
            <div className="u-item__meta">
              Montant : <b>{montant}€</b>
              {statut ? ` • Statut : ${statut}` : ""}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>{montant}€</div>
          </div>
        </div>

        {isPaid ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="u-msg u-msg--ok">✅ Cette inscription est déjà payée.</div>
            <div className="u-actions">
              <button className="u-btn u-btn--primary" onClick={() => nav("/user/paiements")}>
                Voir mes paiements →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {/* ✅ Stripe Elements ici */}
            <StripeCheckout
              inscriptionId={formattedInscriptionId}
              onPaid={async () => {
                setMsg("✅ Paiement validé !");
                setError("");
                await loadInscription();
              }}
            />

            <div className="u-actions">
              <button className="u-btn u-btn--ghost" onClick={() => nav("/user/paiements")} style={{ marginLeft: "auto" }}>
                Voir mes paiements →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
