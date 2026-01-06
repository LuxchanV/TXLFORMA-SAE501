import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DomainePage.css";

export default function DomainPage({ domain }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const data = useMemo(() => {
    const map = {
      "front-end": {
        title: "Développement Front-End",
        subtitle: "Interfaces modernes, responsive, accessibles.",
        items: ["React & composants", "Routing", "API REST", "UI responsive", "Accessibilité"],
      },
      "back-end": {
        title: "Développement Back-End",
        subtitle: "APIs sécurisées, base de données, architecture propre.",
        items: ["Spring Boot", "JPA / MySQL", "JWT / Auth", "Validation", "Clean architecture"],
      },
      cybersecurite: {
        title: "Cybersécurité",
        subtitle: "Comprendre, auditer, protéger.",
        items: ["Réseaux", "OWASP", "Audit", "Bonnes pratiques", "Gestion des risques"],
      },
    };
    return map[domain];
  }, [domain]);

  if (!data) return null;

  return (
    <div className="dp">
      <div className="dp__hero">
        <div className="dp__container">
          <button className="dp__back" onClick={() => navigate("/")}>← Retour</button>

          <h1 className="dp__title">{data.title}</h1>
          <p className="dp__sub">{data.subtitle}</p>

          <div className="dp__actions">
            <button className="dp__btn dp__btn--primary" onClick={() => navigate("/register")}>
              Créer un compte
            </button>
            <button className="dp__btn dp__btn--ghost" onClick={() => navigate("/login")}>
              Se connecter
            </button>
          </div>
        </div>
      </div>

      <div className="dp__container dp__body">
        <h2 className="dp__h">Programme</h2>
        <div className="dp__grid">
          {data.items.map((x) => (
            <div key={x} className="dp__card">
              <span className="dp__dot" />
              <span>{x}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
