// src/pages/user/UserCheckout.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { creerCheckout, confirmerCheckout } from "../../services/paiements";
import { mesInscriptions } from "../../services/inscriptions";

export default function UserCheckout() {
  const { inscriptionId } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);

  const [checkout, setCheckout] = useState(null);
  const [inscription, setInscription] = useState(null);

  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expMonth, setExpMonth] = useState("12");
  const [expYear, setExpYear] = useState(String(new Date().getFullYear() + 2));
  const [cvc, setCvc] = useState("123");
  const [simulate, setSimulate] = useState("auto"); // auto | success | fail

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const formattedInscriptionId = useMemo(() => Number(inscriptionId), [inscriptionId]);

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

  const createCheckout = async () => {
    setCreating(true);
    setError("");
    setMsg("");
    try {
      const data = await creerCheckout(formattedInscriptionId);
      setCheckout(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Impossible de créer le paiement.");
      setCheckout(null);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadInscription();
      await createCheckout();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedInscriptionId]);

  const onPay = async () => {
    if (!checkout?.paiementId) return;

    setPaying(true);
    setError("");
    setMsg("");

    try {
      const payload = {
        cardNumber,
        expMonth: Number(expMonth),
        expYear: Number(expYear),
        cvc,
        simulate, // auto|success|fail
      };

      const res = await confirmerCheckout(checkout.paiementId, payload);

      if (res?.statut === "SUCCES") {
        setMsg("✅ Paiement validé ! Ton inscription est maintenant PAYEE.");
        // refresh inscription & checkout state
        await loadInscription();
      } else if (res?.statut === "ECHEC") {
        setError("❌ Paiement refusé (test). Réessaie avec une autre carte.");
      } else {
        setMsg("⏳ Paiement en attente.");
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur lors du paiement.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <section className="u-panel">
        <div style={{ color: "#64748b", fontWeight: 800 }}>Chargement…</div>
      </section>
    );
  }

  const titre = inscription?.formationTitre ?? checkout?.formationTitre ?? "Formation";
  const montant = checkout?.montant ?? inscription?.formationPrix ?? 0;

  return (
    <section className="u-panel">
      <div className="u-item__top" style={{ marginBottom: 10 }}>
        <div>
          <h2 className="u-title" style={{ margin: 0 }}>Paiement</h2>
          <div className="u-item__meta">
            Inscription #{formattedInscriptionId} • {titre}
          </div>
        </div>

        <Link to="/user/sessions" className="u-btn u-btn--ghost" style={{ textDecoration: "none" }}>
          ← Retour
        </Link>
      </div>

      {msg ? <div className="u-msg u-msg--ok" style={{ marginBottom: 10 }}>{msg}</div> : null}
      {error ? <div className="u-msg u-msg--err" style={{ marginBottom: 10 }}>{error}</div> : null}

      <div className="u-item" style={{ gap: 12 }}>
        <div className="u-item__top">
          <div>
            <div className="u-item__name">{titre}</div>
            <div className="u-item__meta">
              Montant à payer : <b>{montant}€</b>
              {inscription?.statut ? ` • Statut inscription : ${inscription.statut}` : ""}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>{montant}€</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 900 }}>Carte (test)</div>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900 }}>Mois</div>
              <input value={expMonth} onChange={(e) => setExpMonth(e.target.value)} placeholder="12" />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900 }}>Année</div>
              <input value={expYear} onChange={(e) => setExpYear(e.target.value)} placeholder="2028" />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900 }}>CVC</div>
              <input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontWeight: 900 }}>Simulation :</div>
            <select value={simulate} onChange={(e) => setSimulate(e.target.value)}>
              <option value="auto">Auto (selon carte)</option>
              <option value="success">Forcer succès</option>
              <option value="fail">Forcer échec</option>
            </select>
          </div>

          <div className="u-actions">
            <button className="u-btn u-btn--ghost" onClick={createCheckout} disabled={creating}>
              {creating ? "Création..." : "Recréer un paiement"}
            </button>

            <button className="u-btn u-btn--primary" onClick={onPay} disabled={!checkout?.paiementId || paying}>
              {paying ? "Paiement..." : "Payer"}
            </button>

            <button
              className="u-btn u-btn--ghost"
              onClick={() => nav("/user/paiements")}
              style={{ marginLeft: "auto" }}
            >
              Voir mes paiements →
            </button>
          </div>

          <div style={{ color: "#64748b", fontWeight: 700, fontSize: 13, marginTop: 4 }}>
            Cartes de test (inspirées Stripe) :
            <br />
            ✅ Succès : <b>4242 4242 4242 4242</b>
            <br />
            ❌ Échec : <b>4000 0000 0000 0002</b>
          </div>
        </div>
      </div>
    </section>
  );
}
