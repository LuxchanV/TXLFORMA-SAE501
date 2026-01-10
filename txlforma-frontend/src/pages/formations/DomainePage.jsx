// src/pages/formations/DomainePage.jsx
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DomainePage.css";

export default function DomainPage({ domain: domainProp }) {
  const navigate = useNavigate();
  const params = useParams();

  const domain = domainProp || params.domain;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [domain]);

  const data = useMemo(() => {
    const map = {
      "front-end": {
        label: "Domaine",
        title: "Développement Front-End",
        subtitle: "Interfaces modernes, responsive, accessibles.",
        chips: ["React", "UI/UX", "Responsive", "Accessibilité", "API"],
        items: [
          "Composants & hooks (React)",
          "Routing & navigation",
          "Consommation d’API REST",
          "UI responsive et clean",
          "Bonnes pratiques & accessibilité",
        ],
      },
      "back-end": {
        label: "Domaine",
        title: "Développement Back-End",
        subtitle: "APIs robustes, sécurité, base de données, architecture propre.",
        chips: ["Spring Boot", "JPA", "MySQL", "JWT", "Validation"],
        items: [
          "Spring Boot (REST)",
          "Auth (JWT) & rôles",
          "JPA / MySQL",
          "Validation & gestion d’erreurs",
          "Architecture & clean code",
        ],
      },
      cybersecurite: {
        label: "Domaine",
        title: "Cybersécurité",
        subtitle: "Comprendre, auditer, protéger.",
        chips: ["OWASP", "Réseaux", "Audit", "Risques", "Bonnes pratiques"],
        items: [
          "Réseaux & protocoles",
          "OWASP Top 10",
          "Audit et analyse simple",
          "Bonnes pratiques (hardening)",
          "Gestion des risques (bases)",
        ],
      },
      devops: {
        label: "Domaine",
        title: "DevOps & Cloud",
        subtitle: "Automatisation, CI/CD, containers et déploiements modernes.",
        chips: ["CI/CD", "Docker", "Cloud", "Monitoring", "Automatisation"],
        items: [
          "CI/CD (bases)",
          "Docker & containers",
          "Déploiement & environnements",
          "Observabilité (logs/monitoring)",
          "Bonnes pratiques DevOps",
        ],
      },
    };

    return map[domain] || null;
  }, [domain]);

  if (!data) {
    return (
      <div className="dpPage">
        <div className="dpHero">
          <div className="dpContainer">
            <button className="dpBack" onClick={() => navigate("/")}>← Retour accueil</button>
            <h1 className="dpTitle">Domaine introuvable</h1>
            <p className="dpSub">
              Le domaine demandé n’existe pas. Retourne à l’accueil pour choisir une formation.
            </p>
            <div className="dpActions">
              <button className="dpBtn dpBtn--primary" onClick={() => navigate("/")}>Accueil</button>
              <button className="dpBtn dpBtn--ghost" onClick={() => navigate("/catalogue")}>Catalogue</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dpPage">
      <div className="dpHero">
        <div className="dpContainer">
          <button className="dpBack" onClick={() => navigate("/")}>← Retour</button>

          <div className="dpKicker">{data.label} • {domain}</div>
          <h1 className="dpTitle">{data.title}</h1>
          <p className="dpSub">{data.subtitle}</p>

          <div className="dpChips">
            {data.chips.map((c) => (
              <span key={c} className="dpChip">{c}</span>
            ))}
          </div>

          <div className="dpActions">
            <button className="dpBtn dpBtn--primary" onClick={() => navigate("/register")}>
              Créer un compte
            </button>
            <button className="dpBtn dpBtn--ghost" onClick={() => navigate("/login")}>
              Se connecter
            </button>
            <button className="dpBtn dpBtn--soft" onClick={() => navigate("/catalogue")}>
              Voir le catalogue
            </button>
          </div>
        </div>
      </div>

      <div className="dpContainer dpBody">
        <h2 className="dpH2">Programme</h2>

        <div className="dpGrid">
          {data.items.map((x) => (
            <div key={x} className="dpCard">
              <span className="dpDot" />
              <span className="dpCardText">{x}</span>
            </div>
          ))}
        </div>

        <div className="dpCTA">
          <div>
            <h3>Aller plus loin</h3>
            <p>Inscris-toi et commence dès maintenant avec un parcours clair, moderne et progressif.</p>
          </div>
          <div className="dpCTAButtons">
            <button className="dpBtn dpBtn--primary" onClick={() => navigate("/register")}>
              S&apos;inscrire
            </button>
            <button className="dpBtn dpBtn--ghost" onClick={() => navigate("/")}>
              Retour accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
