import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, getFormations } from "../../services/catalogue";

export default function UserCatalogue() {
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
      setCategories(Array.isArray(cats) ? cats : []);
      setFormations(Array.isArray(forms) ? forms : []);
    } catch {
      setError("Erreur chargement catalogue");
    }
  };

  useEffect(() => {
    load(null);
  }, []);

  return (
    <section className="u-panel">
      <div className="u-item__top" style={{ marginBottom: 10 }}>
        <h2 className="u-title" style={{ margin: 0 }}>Catalogue</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            value={categorieId}
            onChange={(e) => {
              setCategorieId(e.target.value);
              load(e.target.value);
            }}
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.12)",
              fontWeight: 800,
            }}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="u-msg u-msg--err">{error}</div> : null}

      <div className="u-list" style={{ marginTop: 12 }}>
        {formations.map((f) => (
          <div key={f.id} className="u-item">
            <div className="u-item__top">
              <div>
                <div className="u-item__name">{f.titre}</div>
                <div className="u-item__meta">
                  {f.niveau || "N/A"} • {f.dureeHeures || "?"}h • {f.prix ?? "?"}€
                </div>
              </div>

              <Link className="u-btn u-btn--ghost" to={`/user/formations/${f.id}`} style={{ textDecoration: "none" }}>
                Voir
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
