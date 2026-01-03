import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import "./user.css";

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const dateLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

  const pageLabel = useMemo(() => {
    const p = location.pathname;
    if (p.includes("/catalogue")) return "Catalogue";
    if (p.includes("/sessions")) return "Mes sessions";
    if (p.includes("/paiements")) return "Mes paiements";
    if (p.includes("/evaluations")) return "Mes évaluations";
    return "Mes formations";
  }, [location.pathname]);

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="user-shell">
      {/* Sidebar */}
      <aside className={`user-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="user-brand">
          <div className="user-logo">TXL</div>
          <div>
            <div className="user-brand__name">TXL FORMA</div>
            <div className="user-brand__role">Utilisateur</div>
          </div>
        </div>

        <nav className="user-nav">
          <NavLink
            to="/user"
            end
            className={({ isActive }) => `user-nav__link ${isActive ? "is-active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Mes formations
          </NavLink>

          <NavLink
            to="/user/sessions"
            className={({ isActive }) => `user-nav__link ${isActive ? "is-active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Mes sessions
          </NavLink>

          <NavLink
            to="/user/paiements"
            className={({ isActive }) => `user-nav__link ${isActive ? "is-active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Mes paiements
          </NavLink>

          <NavLink
            to="/user/evaluations"
            className={({ isActive }) => `user-nav__link ${isActive ? "is-active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Mes évaluations
          </NavLink>
        </nav>

        <button className="user-logout" onClick={onLogout}>
          Déconnexion
        </button>
      </aside>

      {/* Main */}
      <div className="user-main">
        {/* Topbar */}
        <div className="user-topbar">
          <button
            className="user-burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Ouvrir / fermer le menu"
          >
            ☰
          </button>

          {/* Onglets haut : Catalogue au-dessus de “Mes formations” (DA + UX demandée) */}
          <div className="user-tabs" aria-label="Navigation principale">
            <NavLink
              to="/user"
              end
              className={({ isActive }) => `user-tab ${isActive ? "is-active" : ""}`}
            >
              Mon espace
            </NavLink>
            <NavLink
              to="/user/catalogue"
              className={({ isActive }) => `user-tab ${isActive ? "is-active" : ""}`}
            >
              Catalogue
            </NavLink>
          </div>

          <div className="user-profile">
            <div className="user-profile__text">
              <div className="user-profile__name">
                {user?.prenom} {user?.nom}
              </div>
              <div className="user-profile__sub">{pageLabel}</div>
            </div>
            <div className="user-profile__avatar" aria-hidden="true">
              {(user?.prenom?.[0] ?? "U").toUpperCase()}
            </div>
          </div>
        </div>

        {/* Banner (style maquette, images remplacées par toi ensuite) */}
        <header className="user-banner">
          <div className="user-banner__text">
            <div className="user-banner__date">{dateLabel}</div>
            <div className="user-banner__title">Bonjour {user?.prenom ?? ""}</div>
            <div className="user-banner__subtitle">Bienvenue sur ton dashboard</div>
          </div>

          <div className="user-banner__illu" aria-hidden="true">
            <div className="illu-book" />
            <div className="illu-cap" />
            <div className="illu-sparkles" />
          </div>
        </header>

        <main className="user-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
