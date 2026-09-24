import { useEffect, useState } from "react";
import { SECTIONS } from "../data/fields";
import { clientesApi } from "../data/clientesApi";
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

function isFullWidth(type: string): boolean {
  return type === "textarea" || type === "file" || type === "multiselect";
}

function buildRows<T extends { type: string }>(fields: T[]): T[][] {
  const rows: T[][] = [];
  let i = 0;
  while (i < fields.length) {
    const field = fields[i];
    if (isFullWidth(field.type)) {
      rows.push([field]);
      i += 1;
      continue;
    }
    const next = fields[i + 1];
    if (next && !isFullWidth(next.type)) {
      rows.push([field, next]);
      i += 2;
    } else {
      rows.push([field]);
      i += 1;
    }
  }
  return rows;
}

export default function ClienteDetail({
  cliente,
  onClose,
  onDelete,
  onEstadoChange,
}: Props) {
  const fotoPath = cliente.values["foto"] as string | undefined;
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    setFotoUrl(null);
    if (fotoPath) {
      clientesApi.fotoUrl(fotoPath).then(setFotoUrl);
    }
  }, [fotoPath]);

  const telefonoRaw = cliente.values["telefono"] as string | undefined;
  const telefonoDigits = telefonoRaw ? telefonoRaw.replace(/[^\d+]/g, "") : "";
  const emailRaw = cliente.values["email"] as string | undefined;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <div className="profile-header">
          {fotoPath &&
            (fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto"
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo profile-photo-placeholder">Cargando...</div>
            ))}
          <div>
            <h2>{formatValue(cliente.values["nombre"])}</h2>
            <p className="help">
              Recibido el {new Date(cliente.createdAt).toLocaleString("es-ES")}
            </p>
          </div>
        </div>

        <div className="field" style={{ maxWidth: 240 }}>
          <label htmlFor="estado-select">Estado</label>
          <select
            id="estado-select"
            value={cliente.estado}
            onChange={(e) =>
              onEstadoChange(cliente.id, e.target.value as Cliente["estado"])
            }
          >
            <option value="activo">Activo</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        {(telefonoRaw || emailRaw) && (
          <div className="detail-section">
            <h3 className="detail-section-title">Contacto</h3>
            <div className="detail-grid">
              {buildRows(
                [
                  telefonoRaw && { key: "telefono", type: "text" },
                  emailRaw && { key: "email", type: "text" },
                ].filter(Boolean) as { key: string; type: string }[]
              ).map((row) => (
                <div className="detail-row-line" key={row.map((f) => f.key).join("-")}>
                  {row.map((field) =>
                    field.key === "telefono" ? (
                      <div className="detail-field" key="telefono">
                        <div className="k">Teléfono</div>
                        <div className="v">
                          {formatValue(telefonoRaw)}
                          {telefonoDigits && (
                            <div className="contact-actions">
                              <a
                                className="btn contact-btn whatsapp"
                                href={`https://wa.me/${telefonoDigits.replace("+", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                WhatsApp
                              </a>
                              <a className="btn contact-btn call" href={`tel:${telefonoDigits}`}>
                                Llamar
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="detail-field" key="email">
                        <div className="k">Email</div>
                        <div className="v">
                          {formatValue(emailRaw)}
                          <div className="contact-actions">
                            <a className="btn contact-btn mail" href={`mailto:${emailRaw}`}>
                              Enviar email
                            </a>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {SECTIONS.map((section) => (
          <div className="detail-section" key={section.key}>
            <h3 className="detail-section-title">{section.title}</h3>
            <div className="detail-grid">
              {buildRows(
                section.fields.filter(
                  (field) =>
                    field.key !== "telefono" &&
                    field.key !== "email" &&
                    field.key !== "nombre" &&
                    field.key !== "foto"
                )
              ).map((row) => (
                <div className="detail-row-line" key={row.map((f) => f.key).join("-")}>
                  {row.map((field) => (
                    <div
                      className={`detail-field${
                        row.length === 1 && isFullWidth(field.type) ? " full" : ""
                      }`}
                      key={field.key}
                    >
                      <div className="k">{field.label}</div>
                      <div className="v">
                        {field.type === "file" && fotoPath ? (
                          fotoUrl ? (
                            <img
                              src={fotoUrl}
                              alt="Foto"
                              style={{ maxWidth: 160, maxHeight: 160, borderRadius: 8 }}
                            />
                          ) : (
                            "Cargando foto..."
                          )
                        ) : (
                          formatValue(cliente.values[field.key])
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
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
