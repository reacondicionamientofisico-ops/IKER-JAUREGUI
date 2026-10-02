import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SECTIONS } from "../data/fields";
import { clientesApi } from "../data/clientesApi";
import CopyFormLinkButton from "../components/CopyFormLinkButton";
import FormField,{ OTHER_VALUE } from "../components/FormField";
import type { ClienteValue } from "../types";
import { calcularEdad } from "../lib/age";
import ContratoPage from "./ContratoPage";
import logo from "../assets/logo.jpeg";

const CONTACTO_ID = "form-sub-contacto";
const CONTACTO_KEY = "contacto";

// Menú del cuestionario: las secciones, con un acceso directo a "Contacto" tras la ficha.
const MENU_ITEMS = SECTIONS.flatMap((s) =>
  s.key === SECTIONS[0].key ? [s, { key: CONTACTO_KEY, title: "Contacto" }] : [s]
);
const menuTargetId = (key: string) => (key === CONTACTO_KEY ? CONTACTO_ID : `form-sec-${key}`);

export default function FormPage({ publico = false }: { publico?: boolean }) {
  const base = publico ? "/cuestionario" : "/formulario";
  const draftKey = `form-draft:${base}`;
  // Borrador en sessionStorage: se conserva al ir al contrato o a la política en la misma pestaña.
  const [draft] = useState(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [started, setStarted] = useState<boolean>(draft?.started ?? false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].key);
  const [values, setValues] = useState<Record<string, ClienteValue>>(draft?.values ?? {});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>(draft?.otherTexts ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState<boolean>(draft?.consent ?? false);
  const [contratoFirmado, setContratoFirmado] = useState<boolean>(draft?.contratoFirmado ?? false);
  const [contratoOpen, setContratoOpen] = useState(false);
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

  useEffect(() => {
    try {
      if (submitted) sessionStorage.removeItem(draftKey);
      else sessionStorage.setItem(draftKey, JSON.stringify({ started, values, otherTexts, consent, contratoFirmado }));
    } catch {
      /* sin almacenamiento disponible: el borrador simplemente no se conserva */
    }
  }, [draftKey, started, values, otherTexts, consent, contratoFirmado, submitted]);

  // Bloquea el scroll de la página mientras el contrato está abierto.
  useEffect(() => {
    if (!contratoOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [contratoOpen]);

  useEffect(() => {
    setValue("edad", calcularEdad(values.fechaNacimiento as string | undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.fechaNacimiento]);

  // Publica la altura de la barra fija (botones + menú) para el scroll a secciones.
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    if (!started || !el) return;
    const update = () => document.documentElement.style.setProperty("--form-bar-h", `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--form-bar-h");
    };
  }, [started]);

  // Resalta en el menú la sección que se está viendo.
  useEffect(() => {
    if (!started) return;
    const onScroll = () => {
      const offset =
        (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sticky-h")) || 0) +
        (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--form-bar-h")) || 0) +
        24;
      let current = MENU_ITEMS[0].key;
      for (const { key } of MENU_ITEMS) {
        const el = document.getElementById(menuTargetId(key));
        if (el && el.getBoundingClientRect().top <= offset) current = key;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [started]);

  const goToSection = (key: string) => {
    document.getElementById(menuTargetId(key))?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (!contratoFirmado) newErrors["__contrato"] = "Debes rellenar y firmar el contrato de entrenamiento personal.";
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
            {!publico && (
              <Link className="btn secondary" to={`${base}/politica-proteccion-datos`}>
                Política de protección de datos
              </Link>
            )}
          </div>
          {!publico && (
            <div className="btn-row">
              <CopyFormLinkButton />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-bar" ref={barRef}>
      <div className="btn-row" style={{ justifyContent: "flex-start", flexWrap: "wrap", marginTop: 0, marginBottom: 0 }}>
        <button type="button" className="btn secondary" onClick={() => setStarted(false)}>
          Volver a inicio
        </button>
        <button type="button" className="btn doc" onClick={() => setContratoOpen(true)}>
          Contrato entrenamiento personal
        </button>
        <Link className="btn doc" to={`${base}/politica-proteccion-datos`}>
          Política de protección de datos
        </Link>
      </div>
      <nav className="valoracion-menu form-menu" aria-label="Secciones del cuestionario">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeSection === item.key ? "active" : ""}
            aria-current={activeSection === item.key ? "true" : undefined}
            onClick={() => goToSection(item.key)}
          >
            {item.title}
          </button>
        ))}
      </nav>
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
          <div className="card form-section" id={`form-sec-${section.key}`} key={section.key}>
            <h2 className="section-title">{section.title}</h2>
            {section.fields.map((field) => (
              <div key={field.key}>
                {field.groupStart && (
                  <h3
                    className="subsection-title"
                    id={field.groupStart === "Contacto" ? CONTACTO_ID : undefined}
                  >
                    {field.groupStart}
                  </h3>
                )}
                <FormField
                  field={field}
                  value={values[field.key]}
                  otherText={otherTexts[field.key]}
                  error={errors[field.key]}
                  onChange={(v) => setValue(field.key, v)}
                  onOtherTextChange={(t) => setOther(field.key, t)}
                />
              </div>
            ))}
            {section.key === "cierre" && (
              <>
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
                    <Link to={`${base}/politica-proteccion-datos`}>
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
                <div className="btn-row">
                  <button type="button" className="btn doc" onClick={() => setContratoOpen(true)}>
                    Contrato entrenamiento personal
                  </button>
                </div>
                <p className="help" style={{ textAlign: "center" }}>
                  {contratoFirmado
                    ? "✓ Contrato firmado correctamente."
                    : "Obligatorio: rellena todos los campos del contrato y fírmalo."}
                </p>
                {errors["__contrato"] && (
                  <p className="error-text" style={{ textAlign: "center" }}>
                    {errors["__contrato"]}
                  </p>
                )}
              </>
            )}
          </div>
        ))}

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
      {contratoOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Contrato de entrenamiento personal">
          <div className="modal">
            <ContratoPage
              embedded
              initial={{
                nombre: [values.nombre, values.primerApellido, values.segundoApellido]
                  .filter((x) => typeof x === "string" && x.trim())
                  .join(" "),
                email: typeof values.email === "string" ? values.email : "",
              }}
              onClose={() => setContratoOpen(false)}
              onSigned={() => {
                setContratoFirmado(true);
                setContratoOpen(false);
                setErrors((prev) => {
                  const { __contrato: _omit, ...rest } = prev;
                  return rest;
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
