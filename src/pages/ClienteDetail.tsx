import { ALL_FIELDS } from "../data/fields";
import type { Cliente } from "../types";

interface Props {
  cliente: Cliente;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEstadoChange: (id: string, estado: Cliente["estado"]) => void;
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

export default function ClienteDetail({
  cliente,
  onClose,
  onDelete,
  onEstadoChange,
}: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <h2>{formatValue(cliente.values["nombre"])}</h2>
        <p className="help">
          Recibido el {new Date(cliente.createdAt).toLocaleString("es-ES")}
        </p>

        <div className="field" style={{ maxWidth: 240 }}>
          <label htmlFor="estado-select">Estado</label>
          <select
            id="estado-select"
            value={cliente.estado}
            onChange={(e) =>
              onEstadoChange(cliente.id, e.target.value as Cliente["estado"])
            }
          >
            <option value="nuevo">Nuevo</option>
            <option value="en_seguimiento">En seguimiento</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>

        {ALL_FIELDS.map((field) => (
          <div className="detail-row" key={field.key}>
            <div className="k">{field.label}</div>
            <div className="v">
              {field.type === "file" && cliente.values[field.key] ? (
                <img
                  src={cliente.values[field.key] as string}
                  alt="Foto"
                  style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
                />
              ) : (
                formatValue(cliente.values[field.key])
              )}
            </div>
          </div>
        ))}

        <div className="btn-row">
          <button
            className="btn danger"
            onClick={() => {
              if (confirm("¿Seguro que quieres eliminar este registro?")) {
                onDelete(cliente.id);
                onClose();
              }
            }}
          >
            Eliminar registro
          </button>
          <button className="btn secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
