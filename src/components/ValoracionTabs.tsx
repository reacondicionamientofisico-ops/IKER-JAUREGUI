import { NavLink } from "react-router-dom";

export default function ValoracionTabs() {
  return (
    <nav className="nav nav-sub">
      <NavLink to="/valoracion" end className={({ isActive }) => (isActive ? "active" : "")}>
        Registro
      </NavLink>
      <NavLink to="/valoracion/tabla" className={({ isActive }) => (isActive ? "active" : "")}>
        Tabla
      </NavLink>
    </nav>
  );
}
