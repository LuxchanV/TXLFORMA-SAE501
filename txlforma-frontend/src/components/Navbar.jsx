import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/public-navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const goHomeAndScroll = (id) => {
    const doScroll = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(doScroll, 160);
    } else {
      doScroll();
    }
  };

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className={`txl-nav ${scrolled ? "txl-nav--scrolled" : ""}`}>
      <div className="txl-nav__inner">
        {/* LEFT: BRAND */}
        <div className="txl-brand" onClick={() => navigate("/")}>
          {/* Mets ton logo dans /public/logo.png */}
          <img
            src="/logo.png"
            className="txl-brand__logo"
            alt="TXL FORMA"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <span className="txl-brand__name">TXL FORMA</span>
        </div>

        {/* MOBILE BURGER */}
        <button
          className="txl-burger"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        {/* CENTER LINKS (✅ pas de Catalogue) */}
        <nav className={`txl-links ${open ? "txl-links--open" : ""}`}>
          <button className="txl-link" onClick={() => goHomeAndScroll("contact-section")}>
            Contact
          </button>
          <button className="txl-link" onClick={() => goHomeAndScroll("about-section")}>
            À propos
          </button>
        </nav>

        {/* RIGHT: ACTIONS */}
        <div className="txl-actions">
          {!user ? (
            <>
              <button className="txl-btn txl-btn--ghost" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="txl-btn txl-btn--primary" onClick={() => navigate("/register")}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              <span className="txl-chip">
                {user.prenom} — {user.role}
              </span>
              <button className="txl-btn txl-btn--ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>
              <button className="txl-btn txl-btn--danger" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
