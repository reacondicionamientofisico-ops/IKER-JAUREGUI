import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";

export default function Header() {
  const location = useLocation();
  const isClientesRoute = location.pathname.startsWith("/clientes");

  return (
    <header className={`header${isClientesRoute ? " header-wide" : ""}`}>
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
        </nav>
      )}
      {!isClientesRoute && (
        <nav className="nav">
          <Link to="/clientes">Inicio</Link>
        </nav>
      )}
    </header>
  );
}
