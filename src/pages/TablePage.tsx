import { useEffect, useState } from "react";
import { clientesApi } from "../data/clientesApi";
import ClienteDetail from "./ClienteDetail";
import ClienteFormModal from "./ClienteFormModal";
import type { Cliente } from "../types";

function val(c: Cliente, key: string): string {
  const v = c.values[key];
  if (v === undefined || v === null) return "";
  return Array.isArray(v) ? v.join(", ") : String(v);
}

function fullName(c: Cliente): string {
  return [val(c, "nombre"), val(c, "primerApellido"), val(c, "segundoApellido")]
    .filter((s) => s.trim() !== "")
    .join(" ");
}

function sexoIcon(sexo: string): string | null {
  if (sexo === "Varón") return "♂";
  if (sexo === "Mujer") return "♀";
  return null;
}

function Avatar({ fotoPath }: { fotoPath: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setUrl(null);
    clientesApi.fotoUrl(fotoPath).then(setUrl);
  }, [fotoPath]);

  if (!url) return <span className="avatar avatar-placeholder" />;
  return <img className="avatar" src={url} alt="" />;
}

export default function TablePage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

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

  const handleDeleteFromRow = async (id: string, nombre: string) => {
    if (!confirm(`¿Seguro que quieres eliminar a ${nombre || "este usuario"}?`)) return;
    await handleDelete(id);
  };

  const handleEstadoChange = async (id: string, estado: Cliente["estado"]) => {
    await clientesApi.updateEstado(id, estado);
    refresh();
  };

  const viewing = clientes.find((c) => c.id === viewId) ?? null;
  const editing = clientes.find((c) => c.id === editId) ?? null;

  return (
    <div className="container container-wide">
      <div className="toolbar">
        <button className="btn" onClick={() => setAdding(true)}>
          Añadir
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
                  <th>Acciones</th>
                  <th>Fecha alta</th>
                  <th>Nombre y apellidos</th>
                  <th>Edad</th>
                  <th>Localidad</th>
                  <th>Teléfono / Email</th>
                  <th>Objetivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="row-clickable"
                    onClick={() => setViewId(c.id)}
                  >
                    <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Ver"
                        aria-label="Ver"
                        onClick={() => setViewId(c.id)}
                      >
                        👁
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Editar"
                        aria-label="Editar"
                        onClick={() => setEditId(c.id)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="btn-icon danger"
                        title="Borrar"
                        aria-label="Borrar"
                        onClick={() => handleDeleteFromRow(c.id, fullName(c))}
                      >
                        🗑
                      </button>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString("es-ES")}</td>
                    <td>
                      <span className="cell-nombre">
                        {val(c, "foto") && <Avatar fotoPath={val(c, "foto")} />}
                        {sexoIcon(val(c, "sexo")) && (
                          <span className="sexo-icon" title={val(c, "sexo")}>
                            {sexoIcon(val(c, "sexo"))}
                          </span>
                        )}
                        {fullName(c) || "—"}
                      </span>
                    </td>
                    <td>{val(c, "edad") || "—"}</td>
                    <td>{val(c, "localidad") || "—"}</td>
                    <td>
                      {val(c, "telefono") || "—"}
                      {val(c, "email") ? ` / ${val(c, "email")}` : ""}
                    </td>
                    <td>{val(c, "objetivosEspecificos") || "—"}</td>
                    <td>
                      <span className={`badge ${c.estado}`}>
                        {c.estado === "activo" ? "Activo" : "Baja"}
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

      {viewing && (
        <ClienteDetail
          cliente={viewing}
          onClose={() => setViewId(null)}
          onDelete={handleDelete}
          onEstadoChange={handleEstadoChange}
        />
      )}

      {editing && (
        <ClienteFormModal
          cliente={editing}
          onClose={() => setEditId(null)}
          onSaved={refresh}
        />
      )}

      {adding && (
        <ClienteFormModal
          cliente={null}
          onClose={() => setAdding(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
