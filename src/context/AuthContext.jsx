import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { TOKEN_KEY } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);

  const isAuthenticated = !!token;

  const login = async ({ email, senha }) => {
    // seu backend: POST /users/login
    const res = await api.post("/users/login", { email, senha });

    const newToken = res.data?.token;
    const newUser = res.data?.user;

    if (!newToken) throw new Error("Token não retornou do backend.");

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser ?? null);

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // Se interceptor disparar logout global
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}
