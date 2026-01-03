import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ roles, children }) {
  const { user, loadingUser } = useAuth();
  const location = useLocation();

  if (loadingUser) return <div className="container">Chargement…</div>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    // pas le bon rôle => on renvoie au dashboard (qui redirige)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
