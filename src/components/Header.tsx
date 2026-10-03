import { NavLink, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { useAuth } from "../lib/auth";

// VITE_ONLY_VALORACION=true → build público solo con Valoración (sin apartado de alumnos)
const ONLY_VALORACION = import.meta.env.VITE_ONLY_VALORACION === "true";

export default function Header() {
  const location = useLocation();
  const isWide =
    location.pathname.startsWith("/valoracion/tabla") || location.pathname.startsWith("/clientes");

  const { session, signOut } = useAuth();
  // Sin navegación en las páginas públicas (cuestionario) ni antes de iniciar sesión
  const isPublic = location.pathname.startsWith("/cuestionario") || !session;
  const isMedium = !isWide && location.pathname.startsWith("/valoracion");

  return (
    <header className={`header${isWide ? " header-wide" : isMedium ? " header-medium" : ""}`}>
      <img src={logo} alt="Logo Reacondicionamiento Físico y Salud IJ" />
      <div className="titles">
        <h1>Reacondicionamiento Físico y Salud IJ</h1>
        <p>Centro de entrenamiento personal</p>
      </div>
      <div className="header-right">
      {isPublic || location.pathname.startsWith("/clientes") ? null : ONLY_VALORACION ? (
        <span className="header-section">Valoraciones</span>
      ) : (
        <nav className="nav">
          <NavLink to="/clientes" className={({ isActive }) => (isActive ? "active" : "")}>
            Usuarios
          </NavLink>
          <NavLink to="/valoracion" className={({ isActive }) => (isActive ? "active" : "")}>
            Valoraciones
          </NavLink>
        </nav>
      )}
      {session && !location.pathname.startsWith("/cuestionario") && !location.pathname.startsWith("/clientes") && (
        <button type="button" className="btn btn-outline" onClick={() => void signOut()}>
          Salir
        </button>
      )}
      </div>
    </header>
  );
}
