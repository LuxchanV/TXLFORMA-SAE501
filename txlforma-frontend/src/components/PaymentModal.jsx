import { useEffect, useMemo, useState } from "react";
import { confirmerCheckout } from "../services/paiements";

export default function PaymentModal({ open, checkout, onClose, onPaid }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [simulate, setSimulate] = useState("auto"); // auto | success | fail
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expMonth, setExpMonth] = useState(12);
  const [expYear, setExpYear] = useState(2030);
  const [cvc, setCvc] = useState("123");

  const title = useMemo(() => checkout?.formationTitre ?? "Paiement", [checkout]);

  useEffect(() => {
    if (!open) {
      setMsg("");
      setErr("");
      setLoading(false);
      setSimulate("auto");
      setCardNumber("4242 4242 4242 4242");
      setExpMonth(12);
      setExpYear(2030);
      setCvc("123");
    }
  }, [open]);

  if (!open) return null;

  const payer = async () => {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const payload = {
        simulate, // "auto" => basé sur numéro, sinon force success/fail
        cardNumber,
        expMonth: Number(expMonth),
        expYear: Number(expYear),
        cvc,
      };

      const res = await confirmerCheckout(checkout.paiementId, payload);

      if (String(res?.statut).toUpperCase() === "SUCCES") {
        setMsg("✅ Paiement validé !");
        onPaid?.();
        // petit délai UX
        setTimeout(() => onClose?.(), 600);
      } else {
        setErr("❌ Paiement refusé (test). Réessaye avec une autre carte.");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Erreur paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paymodal-backdrop" onMouseDown={onClose}>
      <div className="paymodal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="paymodal-head">
          <div>
            <div className="paymodal-title">{title}</div>
            <div className="paymodal-sub">
              Montant : <b>{checkout?.montant ?? "?"}€</b>
            </div>
          </div>
          <button className="paymodal-x" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        <div className="paymodal-body">
          <div className="paymodal-hint">
            <b>Cartes test :</b> 4242… = succès • 4000…0002 = échec
          </div>

          <div className="paymodal-row">
            <label className="paymodal-label">Simulation</label>
            <select
              className="paymodal-input"
              value={simulate}
              onChange={(e) => setSimulate(e.target.value)}
              disabled={loading}
            >
              <option value="auto">Auto (via carte)</option>
              <option value="success">Forcer succès</option>
              <option value="fail">Forcer échec</option>
            </select>
          </div>

          <div className="paymodal-row">
            <label className="paymodal-label">Numéro de carte</label>
            <input
              className="paymodal-input"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
              disabled={loading}
            />
            <div className="paymodal-mini">
              <button
                type="button"
                className="paymodal-miniBtn"
                onClick={() => setCardNumber("4242 4242 4242 4242")}
                disabled={loading}
              >
                Mettre succès
              </button>
              <button
                type="button"
                className="paymodal-miniBtn"
                onClick={() => setCardNumber("4000 0000 0000 0002")}
                disabled={loading}
              >
                Mettre échec
              </button>
            </div>
          </div>

          <div className="paymodal-grid3">
            <div>
              <label className="paymodal-label">Mois</label>
              <input
                className="paymodal-input"
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="paymodal-label">Année</label>
              <input
                className="paymodal-input"
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="paymodal-label">CVC</label>
              <input
                className="paymodal-input"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {msg ? <div className="paymodal-ok">{msg}</div> : null}
          {err ? <div className="paymodal-err">{err}</div> : null}

          <div className="paymodal-actions">
            <button className="paymodal-btn ghost" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button className="paymodal-btn" onClick={payer} disabled={loading || !checkout?.paiementId}>
              {loading ? "Paiement..." : "Payer (test)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
