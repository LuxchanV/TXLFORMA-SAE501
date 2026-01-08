import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { createPaymentIntent, confirmPaymentIntent } from "../services/stripe";

const pk = import.meta.env.VITE_STRIPE_PK;
const stripePromise = loadStripe(pk);

function CheckoutForm({ inscriptionId, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // anti double-run (React StrictMode)
  const didInit = useRef(false);
  const lastId = useRef(null);

  useEffect(() => {
    if (!inscriptionId) return;

    if (lastId.current !== inscriptionId) {
      didInit.current = false;
      lastId.current = inscriptionId;
    }
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      setErr("");
      setMsg("");
      setClientSecret(null);

      if (!pk) {
        setErr("VITE_STRIPE_PK manquante (front). Ajoute-la dans .env / Vercel.");
        return;
      }

      try {
        const pi = await createPaymentIntent(Number(inscriptionId));
        setClientSecret(pi.clientSecret);
      } catch (e) {
        setErr(e?.response?.data?.message || "Impossible de créer le paiement Stripe.");
      }
    })();
  }, [inscriptionId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    try {
      const card = elements.getElement(CardElement);

      const res = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (res.error) {
        setErr(res.error.message || "Paiement refusé.");
        return;
      }

      const pi = res.paymentIntent;

      if (pi?.status === "succeeded") {
        // ✅ sync back (sans webhook local ça met PAYEE)
        try {
          await confirmPaymentIntent(pi.id);
        } catch (e2) {
          // si ça échoue, on affiche quand même que Stripe a réussi,
          // mais l’inscription peut rester EN_ATTENTE côté back
          setErr(e2?.response?.data?.message || "Paiement Stripe OK, mais sync serveur impossible.");
          return;
        }

        setMsg("✅ Paiement validé !");
        onPaid?.();
      } else {
        setMsg("⏳ Paiement en traitement : " + (pi?.status || "unknown"));
      }
    } catch {
      setErr("Erreur paiement Stripe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="paybox">
      <div className="paybox-methods" aria-label="Méthodes de paiement">
        <div className="paybox-method is-active">VISA</div>
        <div className="paybox-method">MASTERCARD</div>
        <div className="paybox-method">AMEX</div>
        <div className="paybox-method">PAYPAL</div>
      </div>

      <div className="paybox-grid">
        <div className="paybox-field">
          <label>Carte</label>
          <div
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,.45)",
              background: "#fff",
            }}
          >
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </div>

        <button className="paybox-paybtn" type="submit" disabled={!stripe || !clientSecret || loading}>
          {loading ? "Paiement..." : clientSecret ? "Confirmer le paiement" : "Initialisation..."}
        </button>

        {msg ? <div className="u-msg u-msg--ok">{msg}</div> : null}
        {err ? <div className="u-msg u-msg--err">{err}</div> : null}

        <div className="paybox-hint">
          Mode test Stripe : <b>4242 4242 4242 4242</b> = succès.
        </div>
      </div>
    </form>
  );
}

export default function StripeCheckout({ inscriptionId, onPaid }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm inscriptionId={inscriptionId} onPaid={onPaid} />
    </Elements>
  );
}
