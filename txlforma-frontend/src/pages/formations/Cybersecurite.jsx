import React from "react";
import { useNavigate } from "react-router-dom";
import "./domaine.css";

export default function Cybersecurite() {
  const navigate = useNavigate();

  return (
    <div className="dp">
      <div className="dpHero">
        <div className="dpHero__inner">
          <div>
            <div className="dpKicker">Domaine • Cybersécurité</div>
            <h1 className="dpTitle">Cybersécurité</h1>
            <p className="dpDesc">
              Apprends les fondamentaux : réseaux, risques, OWASP, audit et bonnes pratiques pour sécuriser des systèmes.
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
              src="/cyber-placeholder.jpg"
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
            <li>Réseaux & protocoles</li>
            <li>OWASP Top 10</li>
            <li>Threat basics</li>
            <li>Bonnes pratiques</li>
          </ul>
        </div>

        <div className="dpCard">
          <h3>Projets typiques</h3>
          <ul className="dpList">
            <li>Analyse de vulnérabilités</li>
            <li>Checklist sécurité</li>
            <li>Audit simple</li>
            <li>Plan de remédiation</li>
          </ul>
        </div>

        <div className="dpCard">
          <h3>Prérequis</h3>
          <ul className="dpList">
            <li>Curiosité</li>
            <li>Bases PC / web</li>
            <li>Rigueur</li>
          </ul>
        </div>
      </div>

      <div className="dpCTA">
        <div>
          <h3>Prêt à sécuriser ?</h3>
          <p>Crée ton compte pour suivre le parcours cybersécurité.</p>
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
