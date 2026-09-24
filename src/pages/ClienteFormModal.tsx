import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SECTIONS } from "../data/fields";
import { clientesApi } from "../data/clientesApi";
import FormField, { OTHER_VALUE } from "../components/FormField";
import type { Cliente, ClienteValue } from "../types";
import { calcularEdad } from "../lib/age";

interface Props {
  cliente: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ClienteFormModal({ cliente, onClose, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, ClienteValue>>(
    cliente ? { ...cliente.values } : {}
  );
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<Cliente["estado"]>(cliente?.estado ?? "activo");
  const [consent, setConsent] = useState(!!cliente);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = (key: string, value: ClienteValue) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const setOther = (key: string, text: string) => {
    setOtherTexts((prev) => ({ ...prev, [key]: text }));
  };

  useEffect(() => {
    setValue("edad", calcularEdad(values.fechaNacimiento as string | undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.fechaNacimiento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      setError("Debes aceptar el consentimiento para continuar.");
      return;
    }

    const finalValues: Record<string, ClienteValue> = { ...values };
    for (const [key, text] of Object.entries(otherTexts)) {
      if (finalValues[key] === OTHER_VALUE && text.trim() !== "") {
        finalValues[key] = text.trim();
      }
    }

    setSaving(true);
    setError(null);
    try {
      if (cliente) {
        await clientesApi.update(cliente.id, finalValues, estado);
      } else {
        await clientesApi.create(finalValues, estado);
      }
      onSaved();
      onClose();
    } catch {
      setError("No se ha podido guardar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <h2>{cliente ? "Editar usuario" : "Añadir usuario"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ maxWidth: 240 }}>
            <label htmlFor="estado-select-modal">Estado</label>
            <select
              id="estado-select-modal"
              value={estado}
              onChange={(e) => setEstado(e.target.value as Cliente["estado"])}
            >
              <option value="activo">Activo</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          {SECTIONS.map((section) => (
            <div key={section.key} style={{ marginBottom: 24 }}>
              <h3 className="subsection-title">{section.title}</h3>
              {section.fields.map((field) => (
                <div key={field.key}>
                  {field.groupStart && (
                    <h3 className="subsection-title">{field.groupStart}</h3>
                  )}
                  <FormField
                    field={field}
                    value={values[field.key]}
                    otherText={otherTexts[field.key]}
                    onChange={(v) => setValue(field.key, v)}
                    onOtherTextChange={(t) => setOther(field.key, t)}
                  />
                </div>
              ))}
              {section.key === "cierre" && (
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    Acepto que mis datos personales y de salud sean utilizados
                    por Reacondicionamiento Físico y Salud IJ únicamente para
                    diseñar y adaptar mi plan de entrenamiento y alimentación.
                    Estos datos se almacenan de forma segura en una base de
                    datos en la nube, con acceso restringido únicamente al
                    personal autorizado de Reacondicionamiento Físico y Salud
                    IJ. Más información en la{" "}
                    <Link to="/formulario/politica-proteccion-datos">
                      Política de protección de datos
                    </Link>
                    .
                  </span>
                </label>
              )}
            </div>
          ))}

          {error && (
            <p className="error-text" style={{ textAlign: "center" }}>
              {error}
            </p>
          )}

          <div className="btn-row">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button className="btn secondary" type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
