import { useState } from "react";
import { SECTIONS } from "../data/fields";
import { clientesApi } from "../data/clientesApi";
import FormField, { OTHER_VALUE } from "../components/FormField";
import type { Cliente, ClienteValue } from "../types";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = (key: string, value: ClienteValue) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const setOther = (key: string, text: string) => {
    setOtherTexts((prev) => ({ ...prev, [key]: text }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        await clientesApi.update(cliente.id, finalValues);
      } else {
        await clientesApi.create(finalValues);
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
          {SECTIONS.map((section) => (
            <div key={section.key} style={{ marginBottom: 24 }}>
              <h3 className="section-title" style={{ fontSize: "1.2rem" }}>
                {section.title}
              </h3>
              {section.fields.map((field) => (
                <FormField
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  otherText={otherTexts[field.key]}
                  onChange={(v) => setValue(field.key, v)}
                  onOtherTextChange={(t) => setOther(field.key, t)}
                />
              ))}
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
