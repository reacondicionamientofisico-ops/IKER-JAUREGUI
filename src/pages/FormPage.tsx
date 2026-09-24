import { useState } from "react";
import { Link } from "react-router-dom";
import { SECTIONS } from "../data/fields";
import { clientesApi } from "../data/clientesApi";
import FormField, { OTHER_VALUE } from "../components/FormField";
import type { ClienteValue } from "../types";
import logo from "../assets/logo.jpeg";

export default function FormPage() {
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState<Record<string, ClienteValue>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setValue = (key: string, value: ClienteValue) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const setOther = (key: string, text: string) => {
    setOtherTexts((prev) => ({ ...prev, [key]: text }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const section of SECTIONS) {
      for (const field of section.fields) {
        if (field.required) {
          const v = values[field.key];
          const isEmpty =
            v === undefined ||
            v === "" ||
            (Array.isArray(v) && v.length === 0);
          if (isEmpty) newErrors[field.key] = "Este campo es obligatorio.";
        }
      }
    }
    if (!consent) newErrors["__consent"] = "Debes aceptar el consentimiento para continuar.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== "") return; // bot detectado, ignorar silenciosamente
    if (!validate()) return;

    const finalValues: Record<string, ClienteValue> = { ...values };
    for (const [key, text] of Object.entries(otherTexts)) {
      if (finalValues[key] === OTHER_VALUE && text.trim() !== "") {
        finalValues[key] = text.trim();
      }
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await clientesApi.submit(finalValues);
      setSubmitted(true);
    } catch {
      setSubmitError(
        "No se ha podido enviar el cuestionario. Comprueba tu conexión e inténtalo de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <div className="card confirmation">
          <img src={logo} alt="Logo IJ" />
          <h2>¡Gracias por completar el cuestionario!</h2>
          <p>
            Hemos recibido tus datos correctamente. Nos pondremos en contacto
            contigo en breve para empezar a trabajar en tu plan.
          </p>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="container">
        <div className="card intro-card">
          <img src={logo} alt="Logo IJ" />
          <h2>Cuestionario inicial</h2>
          <p>
            Bienvenido/a a Reacondicionamiento Físico y Salud IJ. Antes de
            empezar a entrenar juntos, necesito conocerte mejor: tus datos,
            tus objetivos, tu estilo de vida y tu alimentación. Tómate tu
            tiempo para responder con el máximo detalle posible, así podré
            diseñar un plan realmente adaptado a ti.
          </p>
          <p className="help">
            El cuestionario tiene tres partes: ficha del usuario, hábitos de
            entrenamiento y hábitos dietéticos. Tardarás unos 10-15 minutos.
          </p>
          <div className="btn-row">
            <button className="btn" onClick={() => setStarted(true)}>
              Empezar cuestionario
            </button>
            <Link className="btn secondary" to="/formulario/politica-proteccion-datos">
              Política de protección de datos
            </Link>
            <Link className="btn secondary" to="/clientes">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="btn-row" style={{ justifyContent: "flex-start", marginTop: 0, marginBottom: 16 }}>
        <button type="button" className="btn secondary" onClick={() => setStarted(false)}>
          Volver a inicio
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="honeypot"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
        {SECTIONS.map((section) => (
          <div className="card" key={section.key}>
            <h2 className="section-title">{section.title}</h2>
            {section.fields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={values[field.key]}
                otherText={otherTexts[field.key]}
                error={errors[field.key]}
                onChange={(v) => setValue(field.key, v)}
                onOtherTextChange={(t) => setOther(field.key, t)}
              />
            ))}
          </div>
        ))}

        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Acepto que mis datos personales y de salud sean utilizados por
            Reacondicionamiento Físico y Salud IJ únicamente para diseñar y
            adaptar mi plan de entrenamiento y alimentación. Estos datos se
            almacenan de forma segura en una base de datos en la nube, con
            acceso restringido únicamente al personal autorizado de
            Reacondicionamiento Físico y Salud IJ. Más información en la{" "}
            <Link to="/formulario/politica-proteccion-datos">
              Política de protección de datos
            </Link>
            .
          </span>
        </label>
        {errors["__consent"] && (
          <p className="error-text" style={{ textAlign: "center" }}>
            {errors["__consent"]}
          </p>
        )}
        {submitError && (
          <p className="error-text" style={{ textAlign: "center" }}>
            {submitError}
          </p>
        )}

        <div className="btn-row">
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar cuestionario"}
          </button>
        </div>
      </form>
    </div>
  );
}
