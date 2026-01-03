import { useEffect, useState } from "react";
import { annulerInscription, mesInscriptions } from "../../services/inscriptions";
import { simulerPaiement } from "../../services/paiements";

export default function MesInscriptions() {
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await mesInscriptions();
      setData(res);
    } catch (e) {
      setError("Impossible de charger tes inscriptions");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCancel = async (id) => {
    setMsg(""); setError("");
    try {
      await annulerInscription(id);
      setMsg("✅ Inscription annulée");
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur annulation");
    }
  };

  const onPay = async (id) => {
    setMsg(""); setError("");
    try {
      await simulerPaiement(id);
      setMsg("✅ Paiement simulé (inscription payée)");
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur paiement");
    }
  };

  return (
    <div className="card">
      <h1>Mes inscriptions</h1>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      <div className="list">
        {data.map((i) => (
          <div key={i.id} className="list-item">
            <div>
              <b>Inscription #{i.id}</b>
              <div className="muted">
                Statut: {i.statut}
              </div>
            </div>

            <div className="row">
              <button className="btn-outline" onClick={() => onPay(i.id)}>Payer</button>
              <button className="btn-danger" onClick={() => onCancel(i.id)}>Annuler</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
