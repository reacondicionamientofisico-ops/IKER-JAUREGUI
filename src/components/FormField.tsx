import type { FieldDef, ClienteValue } from "../types";

const OTHER_VALUE = "__otro__";

interface Props {
  field: FieldDef;
  value: ClienteValue;
  otherText?: string;
  error?: string;
  onChange: (value: ClienteValue) => void;
  onOtherTextChange?: (text: string) => void;
}

export default function FormField({
  field,
  value,
  otherText,
  error,
  onChange,
  onOtherTextChange,
}: Props) {
  const id = `field-${field.key}`;

  const body = () => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={id}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "select": {
        const isOther = value === OTHER_VALUE;
        return (
          <>
            <select
              id={id}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Selecciona...</option>
              {field.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
              {field.allowOther && <option value={OTHER_VALUE}>Otro</option>}
            </select>
            {isOther && (
              <input
                type="text"
                style={{ marginTop: 8 }}
                placeholder="Especifica..."
                value={otherText ?? ""}
                onChange={(e) => onOtherTextChange?.(e.target.value)}
              />
            )}
          </>
        );
      }
      case "multiselect": {
        const selected = Array.isArray(value) ? value : [];
        const toggle = (v: string) => {
          if (selected.includes(v)) {
            onChange(selected.filter((s) => s !== v));
          } else {
            onChange([...selected, v]);
          }
        };
        return (
          <div className="checkbox-grid">
            {field.options?.map((o) => (
              <label
                key={o.value}
                className={`checkbox-pill${selected.includes(o.value) ? " checked" : ""}`}
              >
                <input
                  type="checkbox"
                  style={{ display: "none" }}
                  checked={selected.includes(o.value)}
                  onChange={() => toggle(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        );
      }
      case "file": {
        const dataUrl = (value as string) ?? "";
        const isPreviewable = dataUrl.startsWith("data:");
        const handleFile = (file: File | undefined) => {
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result as string);
          reader.readAsDataURL(file);
        };
        return (
          <div className="file-field">
            {isPreviewable && (
              <img
                src={dataUrl}
                alt="Vista previa"
                style={{ maxWidth: 160, maxHeight: 160, display: "block", marginBottom: 8, borderRadius: 8 }}
              />
            )}
            {dataUrl && !isPreviewable && (
              <p className="help">Ya hay una foto guardada. Sube otra para reemplazarla.</p>
            )}
            <input
              id={id}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {dataUrl && (
              <button
                type="button"
                className="btn secondary"
                style={{ marginTop: 8 }}
                onClick={() => onChange(undefined)}
              >
                Quitar foto
              </button>
            )}
          </div>
        );
      }
      case "number":
        return (
          <input
            id={id}
            type="number"
            min={field.min}
            max={field.max}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "date":
      case "time":
      case "tel":
      case "email":
        return (
          <input
            id={id}
            type={field.type}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      default:
        return (
          <input
            id={id}
            type="text"
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className={`field${field.required ? " required" : ""}`}>
      <label htmlFor={id}>{field.label}</label>
      {body()}
      {field.help && <p className="help">{field.help}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export { OTHER_VALUE };
