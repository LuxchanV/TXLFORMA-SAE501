// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./styles/appFixes.css";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import ThemeToggleFab from "./components/ThemeToggleFab.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import PublicFooter from "./components/PublicFooter.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Catalogue from "./pages/Catalogue.jsx";
import FormationDetails from "./pages/FormationDetails.jsx";

import DomainPage from "./pages/formations/DomainePage.jsx";

import FormateurHome from "./pages/formateur/FormateurHome.jsx";
import AdminHome from "./pages/admin/AdminHome.jsx";

import UserLayout from "./pages/user/UserLayout.jsx";
import UserHome from "./pages/user/UserHome.jsx";
import UserCatalogue from "./pages/user/UserCatalogue.jsx";
import UserFormationDetails from "./pages/user/UserFormationDetails.jsx";
import UserSessions from "./pages/user/UserSessions.jsx";
import UserPaiements from "./pages/user/UserPaiements.jsx";
import UserEvaluations from "./pages/user/UserEvaluations.jsx";
import UserCheckout from "./pages/user/UserCheckout.jsx";

// Legal pages
import RGPD from "./pages/legal/RGPD.jsx";
import ViePrivee from "./pages/legal/ViePrivee.jsx";
import Confidentialite from "./pages/legal/Confidentialite.jsx";
import MentionsLegales from "./pages/legal/MentionsLegales.jsx";

function DashboardRedirect() {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <div className="container">Chargement…</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "ROLE_ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "ROLE_FORMATEUR") return <Navigate to="/formateur" replace />;
  return <Navigate to="/user" replace />;
}

export default function App() {
  const location = useLocation();

  const isDashboard =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/formateur") ||
    location.pathname.startsWith("/user");

  const isAuth = location.pathname === "/login" || location.pathname === "/register";

  const showNavbar = !isDashboard && !isAuth;
  const useContainer = !isDashboard && !isAuth && location.pathname !== "/";

  const showPublicFooter = !isDashboard && !isAuth;
  const showThemeToggle = !isDashboard; // public + auth

  return (
    <>
      <ThemeToggleFab show={showThemeToggle} />

      {showNavbar && <Navbar />}

      <div className={useContainer ? "container" : ""}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />

          {/* ✅ Domaines */}
          <Route path="/formations/front-end" element={<DomainPage domain="front-end" />} />
          <Route path="/formations/back-end" element={<DomainPage domain="back-end" />} />
          <Route path="/formations/cybersecurite" element={<DomainPage domain="cybersecurite" />} />
          <Route path="/formations/devops" element={<DomainPage domain="devops" />} />

          {/* Détails formation (id) */}
          <Route path="/formations/:id" element={<FormationDetails />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Legal */}
          <Route path="/rgpd" element={<RGPD />} />
          <Route path="/vie-privee" element={<ViePrivee />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />

          {/* Dashboard redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["ROLE_USER", "ROLE_FORMATEUR", "ROLE_ADMIN"]}>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* USER */}
          <Route
            path="/user"
            element={
              <ProtectedRoute roles={["ROLE_USER"]}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserHome />} />
            <Route path="catalogue" element={<UserCatalogue />} />
            <Route path="formations/:id" element={<UserFormationDetails />} />
            <Route path="sessions" element={<UserSessions />} />
            <Route path="paiement/:inscriptionId" element={<UserCheckout />} />
            <Route path="paiements" element={<UserPaiements />} />
            <Route path="evaluations" element={<UserEvaluations />} />
          </Route>

          {/* FORMATEUR */}
          <Route
            path="/formateur"
            element={
              <ProtectedRoute roles={["ROLE_FORMATEUR"]}>
                <FormateurHome />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <AdminHome />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isDashboard && <CookieConsent />}
      {showPublicFooter && <PublicFooter />}
    </>
  );
}
