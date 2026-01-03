import { useMemo, useState } from "react";
import "./formateur.css";

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "sessions":
      return (
        <svg {...common}>
          <path d="M7 4v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 4v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 9h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "evaluations":
      return (
        <svg {...common}>
          <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="2" />
          <path d="M9 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "attestations":
      return (
        <svg {...common}>
          <path d="M6 3h12v18H6V3Z" stroke="currentColor" strokeWidth="2" />
          <path d="M8 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 11h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "heures":
      return (
        <svg {...common}>
          <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function FormateurLayout({
  tab,
  setTab,
  profileName = "Formateur",
  heroTitle = "Bonjour,",
  onLogout,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = useMemo(
    () => [
      { id: "sessions", label: "Mes sessions", icon: "sessions" },
      { id: "evaluations", label: "Évaluations", icon: "evaluations" },
      { id: "attestations", label: "Attestations", icon: "attestations" },
      { id: "heures", label: "Heures réalisées", icon: "heures" },
    ],
    []
  );

  const current = tabs.find((t) => t.id === tab);

  return (
    <div className="f-root">
      {sidebarOpen ? <div className="f-overlay" onClick={() => setSidebarOpen(false)} /> : null}

      <aside className={`f-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="f-brand">
          <div className="f-logo" aria-label="Logo">
            <span style={{ fontWeight: 900 }}>TXL</span>
          </div>
          <div className="f-brandText">
            <b>TXL FORMA</b>
            <span>Formateur</span>
          </div>
        </div>

        <nav className="f-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`f-navItem ${tab === t.id ? "active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setSidebarOpen(false);
              }}
            >
              <Icon name={t.icon} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="f-navFooter">
          <button type="button" className="f-logout" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="f-main">
        <header className="f-topbar">
          <button className="f-burger" type="button" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="f-profile">
            <div>
              <div style={{ fontWeight: 850 }}>{profileName}</div>
              <small>{current?.label || ""}</small>
            </div>
            <div className="f-avatar" />
          </div>
        </header>

        <section className="f-hero">
          <div className="f-heroLeft">
            <div className="f-heroHello">{heroTitle}</div>
            <div className="f-heroName">{profileName.toUpperCase()}</div>
          </div>
          <div className="f-heroClouds" />
        </section>

        <div className="f-content">{children}</div>
      </main>
    </div>
  );
}
