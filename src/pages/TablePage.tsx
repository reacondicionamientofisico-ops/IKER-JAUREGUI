import { useMemo, useState } from "react";
import { clientesStorage } from "../data/storage";
import { downloadCsv } from "../data/csv";
import ClienteDetail from "./ClienteDetail";
import type { Cliente } from "../types";

function val(c: Cliente, key: string): string {
  const v = c.values[key];
  if (v === undefined || v === null) return "";
  return Array.isArray(v) ? v.join(", ") : String(v);
}

export default function TablePage() {
  const [version, setVersion] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const clientes = useMemo(() => clientesStorage.list(), [version]);
  const filtered = clientes;

  const refresh = () => setVersion((v) => v + 1);

  const handleDelete = (id: string) => {
    clientesStorage.remove(id);
    refresh();
  };

  const handleEstadoChange = (id: string, estado: Cliente["estado"]) => {
    clientesStorage.update(id, { estado });
    refresh();
  };

  const selected = clientes.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="container">
      <div className="toolbar">
        <button className="btn secondary" onClick={() => downloadCsv(filtered)}>
          Exportar CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <p>
            {clientes.length === 0
              ? "Todavía no hay usuarios registrados. Comparte el formulario para empezar a recibir respuestas."
              : "No hay resultados con los filtros actuales."}
          </p>
        </div>
      ) : (
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
      )}

      <p className="storage-note">
        Estos datos se guardan localmente en este navegador (sin backend
        todavía). {clientes.length} usuario(s) en total.
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
