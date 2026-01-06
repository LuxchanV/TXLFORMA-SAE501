import React from "react";
import { useNavigate } from "react-router-dom";
import "./domaine.css";

export default function FrontEnd() {
  const navigate = useNavigate();

  return (
    <div className="dp">
      <div className="dpHero">
        <div className="dpHero__inner">
          <div>
            <div className="dpKicker">Domaine • Front-End</div>
            <h1 className="dpTitle">Développement Front-End</h1>
            <p className="dpDesc">
              Construis des interfaces modernes et performantes : composants, design responsive, accessibilité et
              consommation d’API.
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

          {/* Placeholder visuel : tu mets ton image plus tard */}
          <div className="dpVisual" aria-hidden="true">
            <img
              className="dpVisual__img"
              src="/front-placeholder.jpg"
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
            <li>React (components, hooks)</li>
            <li>Routing & navigation</li>
            <li>UI responsive & clean</li>
            <li>Consommer une API REST</li>
          </ul>
        </div>

        <div className="dpCard">
          <h3>Projets typiques</h3>
          <ul className="dpList">
            <li>Landing page moderne</li>
            <li>Dashboard UI</li>
            <li>Catalogue + détails</li>
            <li>Auth (login/register)</li>
          </ul>
        </div>

        <div className="dpCard">
          <h3>Prérequis</h3>
          <ul className="dpList">
            <li>HTML/CSS bases</li>
            <li>JavaScript basics</li>
            <li>Motivation & pratique</li>
          </ul>
        </div>
      </div>

      <div className="dpCTA">
        <div>
          <h3>Prêt à démarrer ?</h3>
          <p>Crée ton compte pour accéder aux parcours et suivre ta progression.</p>
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
