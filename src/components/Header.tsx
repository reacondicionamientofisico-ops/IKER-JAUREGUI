import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";

export default function Header() {
  const location = useLocation();
  const isClientesRoute = location.pathname.startsWith("/clientes");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/formulario`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(textarea);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="header">
      <img src={logo} alt="Logo Reacondicionamiento Físico y Salud IJ" />
      <div className="titles">
        <h1>Reacondicionamiento Físico y Salud IJ</h1>
        <p>Centro de entrenamiento personal</p>
      </div>
      {isClientesRoute && (
        <nav className="nav">
          <Link to="/clientes" className="active">
            Usuarios
          </Link>
          <Link to="/formulario">Formulario</Link>
          <button
            type="button"
            className="btn secondary"
            onClick={handleCopyLink}
          >
            {copied ? "¡Enlace copiado!" : "ENLACE PARA ALTAS"}
          </button>
        </nav>
      )}
    </header>
  );
}
