import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, getFormations } from "../services/catalogue";

export default function Catalogue() {
  const [categories, setCategories] = useState([]);
  const [formations, setFormations] = useState([]);
  const [categorieId, setCategorieId] = useState("");
  const [error, setError] = useState("");

  const load = async (cid) => {
    setError("");
    try {
      const [cats, forms] = await Promise.all([
        getCategories(),
        getFormations(cid ? Number(cid) : null),
      ]);
      setCategories(cats);
      setFormations(forms);
    } catch (e) {
      setError("Erreur chargement catalogue");
    }
  };

  useEffect(() => {
    load(null);
  }, []);

  return (
    <div className="card">
      <h1>Catalogue</h1>

      <div className="row">
        <select value={categorieId} onChange={(e) => { setCategorieId(e.target.value); load(e.target.value); }}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="list">
        {formations.map((f) => (
          <div key={f.id} className="list-item">
            <div>
              <b>{f.titre}</b>
              <div className="muted">{f.niveau || "N/A"} • {f.dureeHeures || "?"}h • {f.prix ?? "?"}€</div>
            </div>
            <Link className="btn-outline" to={`/formations/${f.id}`}>Voir</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
