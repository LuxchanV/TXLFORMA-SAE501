import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";
import "../styles/auth.css";

const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 21a8 8 0 0 0-16 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const IconMail = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="2" />
    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 11V8a5 5 0 0 1 10 0v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M6 11h12v10H6V11Z" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconPhone = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 3h4l2 5-2 1c1 3 3 5 6 6l1-2 5 2v4c0 1-1 2-2 2C10 21 3 14 3 5c0-1 1-2 3-2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const IconEye = ({ off }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    {!off ? (
      <>
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ) : (
      <>
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M2 12s3.5-7 10-7c2.2 0 4.1.8 5.6 1.9M22 12s-3.5 7-10 7c-2.2 0-4.1-.8-5.6-1.9"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    )}
  </svg>
);

export default function Register() {
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    telephone: "",
    adressePostale: "",
    entreprise: "",
  });

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      nav("/login");
    } catch (err) {
      const msg =
        err?.message === "Network Error"
          ? "Impossible de joindre le backend. Vérifie qu’il tourne sur 8080 (et le proxy Vite)."
          : err?.response?.data?.message || "Erreur register (email déjà pris ?)";
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <img
          src="/logoblanc.png"
          alt="TXL FORMA"
          className="auth-logo"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-input">
            <span className="auth-ic"><IconUser /></span>
            <input placeholder="Nom" value={form.nom} onChange={(e) => onChange("nom", e.target.value)} required />
          </div>

          <div className="auth-input">
            <span className="auth-ic"><IconUser /></span>
            <input placeholder="Prénom" value={form.prenom} onChange={(e) => onChange("prenom", e.target.value)} required />
          </div>

          <div className="auth-input">
            <span className="auth-ic"><IconMail /></span>
            <input type="email" placeholder="Example@gmail.com" value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
          </div>

          <div className="auth-input">
            <span className="auth-ic"><IconLock /></span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={form.motDePasse}
              onChange={(e) => onChange("motDePasse", e.target.value)}
              required
            />
            <button type="button" className="auth-eye" onClick={() => setShowPassword((s) => !s)}>
              <IconEye off={!showPassword} />
            </button>
          </div>

          <div className="auth-input">
            <span className="auth-ic"><IconPhone /></span>
            <input placeholder="Numéro de téléphone" value={form.telephone} onChange={(e) => onChange("telephone", e.target.value)} required />
          </div>

          <button className="auth-submit" type="submit">Créer mon compte</button>

          {error && <p className="auth-msg auth-msg--err">{error}</p>}
        </form>

        <p className="auth-bottom">
          Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>

      <div className="auth-right">
        <h1>Inscription</h1>
        <p>
          Créez votre compte pour accéder au catalogue et à votre espace personnel.
          Une fois inscrit, connectez-vous pour être redirigé vers votre dashboard.
        </p>
      </div>
    </div>
  );
}
