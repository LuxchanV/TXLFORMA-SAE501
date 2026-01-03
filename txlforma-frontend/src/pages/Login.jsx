import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/auth.css";

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, motDePasse);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.message === "Network Error"
          ? "Impossible de joindre le backend. Vérifie qu’il tourne sur 8080 (et le proxy Vite)."
          : err?.response?.data?.message || err?.message || "Erreur login";
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
            <span className="auth-ic"><IconMail /></span>
            <input
              type="email"
              placeholder="Example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input">
            <span className="auth-ic"><IconLock /></span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Afficher / masquer"
            >
              <IconEye off={!showPassword} />
            </button>
          </div>

          <button className="auth-submit" type="submit">Se connecter</button>

          {error && <p className="auth-msg auth-msg--err">{error}</p>}
        </form>

        <p className="auth-bottom">
          Vous voulez vous inscrire ? <Link to="/register">S’inscrire</Link>
        </p>
      </div>

      <div className="auth-right">
        <h1>Connexion</h1>
        <p>
          Accédez à votre espace personnel : inscriptions, paiements, sessions et attestations.
          Après connexion vous êtes redirigé automatiquement vers votre dashboard.
        </p>
      </div>
    </div>
  );
}
