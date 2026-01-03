import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/public-navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goHomeAndScroll = (id) => {
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const cataloguePath = user?.role === "ROLE_USER" ? "/user/catalogue" : "/catalogue";

  return (
    <header className={`p-navbar ${scrolled ? "p-navbar--scrolled" : ""}`}>
      <div className="p-navbar__inner">
        <div className="p-brand" onClick={() => navigate("/")}>
          {/* Logo optionnel si tu l’as dans public/logonoir.png */}
          <img
            className="p-brand__logo"
            src="/logonoir.png"
            alt="TXL FORMA"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="p-brand__txt">TXL FORMA</span>
        </div>

        <nav className="p-nav">
          <button onClick={() => goHomeAndScroll("formations-section")}>Formations</button>
          <button onClick={() => goHomeAndScroll("contact-section")}>Contact</button>
          <button onClick={() => goHomeAndScroll("about-section")}>À propos</button>
          <NavLink to={cataloguePath}>Catalogue</NavLink>
        </nav>

        <div className="p-actions">
          {!user ? (
            <>
              <button className="p-btn p-btn--ghost" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="p-btn" onClick={() => navigate("/register")}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              <span className="p-chip">
                {user.prenom} — {user.role}
              </span>
              <button className="p-btn p-btn--ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>
              <button className="p-btn p-btn--danger" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
