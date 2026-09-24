import { useEffect, useState } from "react";
import { clientesApi } from "../data/clientesApi";
import { downloadCsv } from "../data/csv";
import { useAuth } from "../lib/auth";
import ClienteDetail from "./ClienteDetail";
import type { Cliente } from "../types";

function val(c: Cliente, key: string): string {
  const v = c.values[key];
  if (v === undefined || v === null) return "";
  return Array.isArray(v) ? v.join(", ") : String(v);
}

export default function TablePage() {
  const { signOut } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    clientesApi
      .list()
      .then(setClientes)
      .catch(() => setError("No se han podido cargar los usuarios."))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const filtered = clientes;

  const handleDelete = async (id: string) => {
    await clientesApi.remove(id);
    refresh();
  };

  const handleEstadoChange = async (id: string, estado: Cliente["estado"]) => {
    await clientesApi.updateEstado(id, estado);
    refresh();
  };

  const selected = clientes.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="container">
      <div className="toolbar">
        <button className="btn secondary" onClick={() => downloadCsv(filtered)}>
          Exportar CSV
        </button>
        <button className="btn secondary" onClick={() => signOut()}>
          Cerrar sesión
        </button>
      </div>

      {loading && <p className="help">Cargando usuarios...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && filtered.length === 0 ? (
        <div className="empty-state card">
          <p>
            Todavía no hay usuarios registrados. Comparte el formulario para
            empezar a recibir respuestas.
          </p>
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre y apellidos</th>
                  <th>Edad</th>
                  <th>Sexo</th>
                  <th>Localidad</th>
                  <th>Teléfono / Email</th>
                  <th>Objetivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} onClick={() => setSelectedId(c.id)}>
                    <td>{new Date(c.createdAt).toLocaleDateString("es-ES")}</td>
                    <td>{val(c, "nombre") || "—"}</td>
                    <td>{val(c, "edad") || "—"}</td>
                    <td>{val(c, "sexo") || "—"}</td>
                    <td>{val(c, "localidad") || "—"}</td>
                    <td>
                      {val(c, "telefono") || "—"}
                      {val(c, "email") ? ` / ${val(c, "email")}` : ""}
                    </td>
                    <td>{val(c, "objetivosEspecificos") || "—"}</td>
                    <td>
                      <span className={`badge ${c.estado}`}>
                        {c.estado === "nuevo"
                          ? "Nuevo"
                          : c.estado === "en_seguimiento"
                          ? "En seguimiento"
                          : "Archivado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <p className="storage-note">
        Estos datos se guardan en Supabase. {clientes.length} usuario(s) en
        total.
      </p>

      {selected && (
        <ClienteDetail
          cliente={selected}
          onClose={() => setSelectedId(null)}
          onDelete={handleDelete}
          onEstadoChange={handleEstadoChange}
        />
      )}
    </div>
  );
}
