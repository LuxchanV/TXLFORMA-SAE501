import React from "react";
import { useNavigate } from "react-router-dom";
import "./PublicFooter.css";

export default function PublicFooter() {
  const navigate = useNavigate();

  const openCookies = () => {
    window.dispatchEvent(new Event("txlforma:open-cookies"));
  };

  return (
    <footer className="pubFooter">
      <div className="pubFooter__inner">
        <div className="pubFooter__brand">
          <div className="pubFooter__logoRow">
            <img
              className="pubFooter__logo"
              src="/logonoir.png"
              alt="Logo TXL FORMA"
              decoding="async"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div>
              <div className="pubFooter__subtitle">Plateforme de formation numérique</div>
            </div>
          </div>

          <p className="pubFooter__desc">
            Projet étudiant : interface moderne, navigation propre, et éléments légaux (contenu fictif).
          </p>

          <button className="pubFooter__cookieBtn" type="button" onClick={openCookies}>
            Gérer mes cookies
          </button>
        </div>

        <div className="pubFooter__col">
          <div className="pubFooter__h">Légal</div>
          <button className="pubFooter__link" onClick={() => navigate("/rgpd")}>RGPD</button>
          <button className="pubFooter__link" onClick={() => navigate("/vie-privee")}>Vie privée</button>
          <button className="pubFooter__link" onClick={() => navigate("/confidentialite")}>Confidentialité</button>
          <button className="pubFooter__link" onClick={() => navigate("/mentions-legales")}>Mentions légales</button>
        </div>

        <div className="pubFooter__col">
          <div className="pubFooter__h">Navigation</div>
          <button className="pubFooter__link" onClick={() => navigate("/")}>Accueil</button>
          <button className="pubFooter__link" onClick={() => navigate("/catalogue")}>Catalogue</button>
          <button className="pubFooter__link" onClick={() => navigate("/register")}>Inscription</button>
          <button className="pubFooter__link" onClick={() => navigate("/login")}>Connexion</button>
        </div>
      </div>

      <div className="pubFooter__bottom">
        <div>© 2025 TXLFORMA — Tous droits réservés.</div>
      </div>
    </footer>
  );
}
