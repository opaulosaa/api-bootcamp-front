import { useState } from "react";
import api from "./services/api";
import { useAuth } from "./context/AuthContext";

export default function Teste() {
  const { isAuthenticated, login, logout, user } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [out, setOut] = useState("");

  const handleLogin = async () => {
    try {
      setOut("logando...");
      const data = await login({ email, senha });
      setOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setOut(e?.response?.data?.error || e.message);
    }
  };

  const testarOfertas = async () => {
    try {
      setOut("carregando /ofertas ...");
      const res = await api.get("/ofertas");
      setOut(JSON.stringify(res.data, null, 2));
    } catch (e) {
      setOut(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Teste Integração + Auth</h1>

      <p>
        Auth: <b>{isAuthenticated ? "SIM" : "NÃO"}</b>{" "}
        {user?.nome ? `(user: ${user.nome})` : ""}
      </p>

      {!isAuthenticated ? (
        <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
          <input
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={testarOfertas}>GET /ofertas</button>
          <button onClick={logout}>Logout</button>
        </div>
      )}

      <pre style={{ marginTop: 16, background: "#111", color: "#0f0", padding: 12 }}>
        {out}
      </pre>
    </div>
  );
}
