import { useMemo, useState } from "react";
import "./admin.css";

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "stats":
      return (
        <svg {...common}>
          <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 19V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 19V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 19V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "comptes":
      return (
        <svg {...common}>
          <path d="M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "categories":
      return (
        <svg {...common}>
          <path d="M4 6h8v8H4V6Z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 6h6v6h-6V6Z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 14h6v6h-6v-6Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 16h8v4H4v-4Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "formations":
      return (
        <svg {...common}>
          <path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="2" />
          <path d="M7 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "sessions":
      return (
        <svg {...common}>
          <path d="M7 4v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 4v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 9h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "intervenants":
      return (
        <svg {...common}>
          <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "inscriptions":
      return (
        <svg {...common}>
          <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="2" />
          <path d="M9 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "paiements":
      return (
        <svg {...common}>
          <path d="M4 7h16v10H4V7Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 11h16" stroke="currentColor" strokeWidth="2" />
          <path d="M8 15h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export default function AdminLayout({
  title = "Espace Admin",
  subtitle = "TXL FORMA",
  tab,
  setTab,
  tabs,
  onLogout,
  profileName = "Admin",
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabMap = useMemo(() => {
    const m = new Map();
    for (const t of tabs) m.set(t.id, t);
    return m;
  }, [tabs]);

  const current = tabMap.get(tab);

  return (
    <div className="admin-root">
      {sidebarOpen ? <div className="admin-overlay" onClick={() => setSidebarOpen(false)} /> : null}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand__logo" aria-label="Logo">
            <span style={{ fontWeight: 900, letterSpacing: 1 }}>TXL</span>
          </div>
          <div className="admin-brand__title">
            <b>{subtitle}</b>
            <span>Dashboard</span>
          </div>
        </div>

        <div className="admin-nav__sectionTitle">Navigation</div>

        <nav className="admin-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`admin-navItem ${tab === t.id ? "admin-navItem--active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setSidebarOpen(false);
              }}
            >
              <Icon name={t.id} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-navFooter">
          <button type="button" className="admin-logout" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="admin-page">
        <header className="admin-header">
          <div className="admin-headerLeft">
            <button className="admin-burger" type="button" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div>
              <h1 className="admin-title">{title}</h1>
              <div className="admin-subtitle">{current ? current.label : ""}</div>
            </div>
          </div>

          <div className="admin-profile">
            <div>
              <div style={{ fontWeight: 850 }}>{profileName}</div>
              <small>Connecté</small>
            </div>
            <div className="admin-avatar" />
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-surface">{children}</div>
        </div>
      </main>
    </div>
  );
}
