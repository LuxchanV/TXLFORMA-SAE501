import React from "react";
import { useNavigate } from "react-router-dom";
import "./domaine.css";

export default function BackEnd() {
  const navigate = useNavigate();

  return (
    <div className="dp">
      <div className="dpHero">
        <div className="dpHero__inner">
          <div>
            <div className="dpKicker">Domaine • Back-End</div>
            <h1 className="dpTitle">Développement Back-End</h1>
            <p className="dpDesc">
              Développe des APIs robustes : Spring Boot, JWT, base de données, bonnes pratiques et architecture.
            </p>

            <div className="dpActions">
              <button className="btn btn--primary" onClick={() => navigate("/register")}>
                S’inscrire
              </button>
              <button className="btn btn--ghost" onClick={() => navigate("/")}>
                Retour accueil
              </button>
              <button className="btn btn--soft" onClick={() => navigate("/catalogue")}>
                Voir le catalogue
              </button>
            </div>
          </div>

          <div className="dpVisual" aria-hidden="true">
            <img
              className="dpVisual__img"
              src="/backend-placeholder.jpg"
              alt=""
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div className="dpVisual__badge">Image placeholder</div>
          </div>
        </div>
      </div>

      <div className="dpGrid">
        <div className="dpCard">
          <h3>Ce que tu vas apprendre</h3>
          <ul className="dpList">
            <li>Spring Boot (REST)</li>
            <li>Auth JWT</li>
            <li>MySQL / JPA</li>
            <li>Gestion d’erreurs</li>
          </ul>
        </div>

        <div className="dpCard">
          <h3>Projets typiques</h3>
          <ul className="dpList">
            <li>API formation/inscriptions</li>
            <li>CRUD + validation</li>
            <li>Security + roles</li>
            <li>Tests & clean code</li>
          </ul>
        </div>

        <div className="dpCard">
          <h3>Prérequis</h3>
          <ul className="dpList">
            <li>Java bases</li>
            <li>Notions HTTP</li>
            <li>Persévérance</li>
          </ul>
        </div>
      </div>

      <div className="dpCTA">
        <div>
          <h3>Prêt à construire une API ?</h3>
          <p>Inscris-toi pour accéder aux parcours Back-End.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn--primary" onClick={() => navigate("/register")}>
            Créer un compte
          </button>
          <button className="btn btn--ghost" onClick={() => navigate("/login")}>
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
