import { useState } from "react";
import { Link } from "react-router-dom";
import CopyFormLinkButton from "./CopyFormLinkButton";
import { useAuth } from "../lib/auth";
import tarifasImg from "../assets/tarifas.jpeg";

interface Props {
  // Apartado actual: el botón correspondiente se muestra relleno.
  current: "usuarios" | "valoraciones";
  // Si se indica, "Usuarios" ejecuta esta acción en lugar de navegar a /clientes.
  onUsuarios?: () => void;
}

// Barra principal compartida (Usuarios · Tarifas · Valoraciones · Formulario · Salir):
// mismo orden y posición en el apartado de usuarios y en el de valoraciones.
export default function MainToolbar({ current, onUsuarios }: Props) {
  const { signOut } = useAuth();
  const [tarifasOpen, setTarifasOpen] = useState(false);

  const usuariosClass = current === "usuarios" ? "btn" : "btn secondary";
  const valoracionesClass = current === "valoraciones" ? "btn" : "btn secondary";

  return (
    <>
      <div className="toolbar main-toolbar">
        {onUsuarios ? (
          <button type="button" className={usuariosClass} onClick={onUsuarios}>
            Usuarios
          </button>
        ) : (
          <Link className={usuariosClass} to="/clientes">
            Usuarios
          </Link>
        )}
        <button type="button" className="btn secondary" onClick={() => setTarifasOpen(true)}>
          Tarifas
        </button>
        <Link className={valoracionesClass} to="/valoracion">
          Valoraciones
        </Link>
        <CopyFormLinkButton />
        <button type="button" className="btn btn-outline" style={{ marginLeft: "auto" }} onClick={() => void signOut()}>
          Salir
        </button>
      </div>

      {tarifasOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Tarifas"
          onClick={() => setTarifasOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="btn-row policy-top-actions">
              <button type="button" className="btn secondary" onClick={() => setTarifasOpen(false)}>
                Cerrar
              </button>
            </div>
            <img
              src={tarifasImg}
              alt="Tarifas de Iker Jauregui"
              style={{ display: "block", maxWidth: "100%", maxHeight: "calc(100vh - 200px)", width: "auto", margin: "12px auto", borderRadius: 6 }}
            />
          </div>
        </div>
      )}
    </>
  );
}
