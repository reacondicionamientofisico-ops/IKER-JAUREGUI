import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import logo from "../assets/logo.jpeg";

export default function LoginPage() {
  const { session, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    const from = (location.state as { from?: string } | null)?.from ?? "/clientes";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const err = await signIn(email, password);
    setSubmitting(false);
    if (err) setError("Email o contraseña incorrectos.");
  };

  return (
    <div className="container">
      <div className="card intro-card">
        <img src={logo} alt="Logo IJ" />
        <h2>Acceso administración</h2>
        <form onSubmit={handleSubmit}>
          <div className="field required">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field required">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="btn-row">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
