import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getToken, login as apiLogin, logout as apiLogout } from "../services/auth";
import { fetchMe } from "../services/me";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadMe = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const me = await fetchMe();
      setUser(me);
    } catch (e) {
      apiLogout();
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadMe();
    const onAuthChanged = () => loadMe();
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, []);

  const login = async (email, motDePasse) => {
    await apiLogin(email, motDePasse);
    setLoadingUser(true);
    await loadMe();
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    window.dispatchEvent(new Event("auth:changed"));
  };

  const value = useMemo(
    () => ({ user, loadingUser, login, logout, refreshMe: loadMe }),
    [user, loadingUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
