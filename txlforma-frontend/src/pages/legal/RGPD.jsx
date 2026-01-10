// src/pages/legal/RGPD.jsx
import React from "react";
import "./Legal.css";

export default function RGPD() {
  return (
    <div className="container legalWrap">
      <div className="legalCard">
        <h1 className="legalTitle">RGPD (contenu fictif)</h1>
        <p className="legalP">
          Cette page existe pour démontrer la présence d’une conformité RGPD dans un projet étudiant :
          information, transparence, droits des utilisateurs, et gestion du consentement.
        </p>
        <p className="legalP">
          Exemple : vous pouvez demander l’accès, la rectification ou la suppression de vos données (fonctionnalités à implémenter côté backend si nécessaire).
        </p>
      </div>
    </div>
  );
}
