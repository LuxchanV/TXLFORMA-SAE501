import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Catalogue from "./pages/Catalogue.jsx";
import FormationDetails from "./pages/FormationDetails.jsx";

import FormateurHome from "./pages/formateur/FormateurHome.jsx";
import AdminHome from "./pages/admin/AdminHome.jsx";

import UserLayout from "./pages/user/UserLayout.jsx";
import UserHome from "./pages/user/UserHome.jsx";
import UserCatalogue from "./pages/user/UserCatalogue.jsx";
import UserFormationDetails from "./pages/user/UserFormationDetails.jsx";
import UserSessions from "./pages/user/UserSessions.jsx";
import UserPaiements from "./pages/user/UserPaiements.jsx";
import UserEvaluations from "./pages/user/UserEvaluations.jsx";

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

  // ✅ Navbar uniquement sur pages publiques (pas login/register, pas dashboard)
  const showNavbar = !isDashboard && !isAuth;

  // ✅ container seulement sur pages “contenu” (catalogue/details)
  const useContainer = !isDashboard && !isAuth && location.pathname !== "/";

  return (
    <>
      {showNavbar && <Navbar />}

      <div className={useContainer ? "container" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/formations/:id" element={<FormationDetails />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["ROLE_USER", "ROLE_FORMATEUR", "ROLE_ADMIN"]}>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

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
            <Route path="paiements" element={<UserPaiements />} />
            <Route path="evaluations" element={<UserEvaluations />} />
          </Route>

          <Route
            path="/formateur"
            element={
              <ProtectedRoute roles={["ROLE_FORMATEUR"]}>
                <FormateurHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ROLE_ADMIN"]}>
                <AdminHome />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
