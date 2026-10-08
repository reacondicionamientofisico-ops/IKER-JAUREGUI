import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SignaturePad from "../components/SignaturePad";
import { contratosApi } from "../data/contratosApi";
import logo from "../assets/logo.jpeg";
import tarifas from "../assets/tarifas.jpeg";

const PARQ = [
  "¿Alguna vez un médico le ha dicho que tiene un problema en el corazón y que sólo debería hacer actividad física recomendada por un médico?",
  "¿Siente dolor en el pecho cuando hace actividad física?",
  "¿Le ha dolido el pecho en el último mes, cuando no estaba haciendo ejercicio?",
  "¿Alguna vez se ha mareado o ha perdido el conocimiento a causa de la actividad física?",
  "¿Tiene algún problema en las articulaciones (por ejemplo, espalda, rodillas o cadera) que pueda empeorar con las actividades físicas propuestas?",
  "¿Le ha indicado actualmente el médico tomar medicación para la presión arterial o el corazón?",
  "¿Conoce cualquier otra razón por la cual no debería hacer actividad física?",
];

const REQUERIDOS: [string, string][] = [
  ["nombre", "Nombre"],
  ["primerApellido", "Primer apellido"],
  ["segundoApellido", "Segundo apellido"],
  ["dni", "DNI"],
  ["lugar", "Lugar de firma"],
  ["fecha", "Fecha"],
];

const hoy = () => new Date().toISOString().slice(0, 10);

interface ContratoPageProps {
  /** Dentro de una ventana del cuestionario: sin cabecera propia y avisando al firmar. */
  embedded?: boolean;
  onSigned?: () => void;
  onClose?: () => void;
  initial?: Record<string, string>;
}

export default function ContratoPage({ embedded = false, onSigned, onClose, initial }: ContratoPageProps = {}) {
  const base = useLocation().pathname.startsWith("/cuestionario") ? "/cuestionario" : "/formulario";
  const [f, setF] = useState<Record<string, string>>({ fecha: hoy(), ...initial });
  const [firma, setFirma] = useState<string | null>(null);
  const [acepta, setAcepta] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const v = (k: string) => f[k] ?? "";
  const set = (k: string, val: string) => setF((p) => ({ ...p, [k]: val }));
  const bad = (k: string) => (errores.includes(k) ? " invalid" : "");

  const input = (k: string, opts: { type?: string; w?: number; ph?: string } = {}) => (
    <input
      className={`inline-input${bad(k)}${v(k) === "" ? " vacio" : ""}`}
      type={opts.type ?? "text"}
      style={opts.w ? { width: opts.w } : undefined}
      placeholder={opts.ph}
      maxLength={opts.type === "date" ? undefined : 150}
      value={v(k)}
      onChange={(e) => set(k, e.target.value)}
      aria-label={k}
    />
  );

  const radio = (k: string, val: "SI" | "NO", label: string) => (
    <label className="radio-opt">
      <input type="radio" name={k} checked={v(k) === val} onChange={() => set(k, val)} />
      <span>{label}</span>
    </label>
  );

  const validar = (): string[] => {
    const e: string[] = [];
    for (const [k] of REQUERIDOS) if (!v(k).trim()) e.push(k);
    if (v("dni").trim() && !/^[A-Za-z0-9-]{5,15}$/.test(v("dni").trim())) e.push("dni");
    PARQ.forEach((_, i) => !v(`parq${i + 1}`) && e.push(`parq${i + 1}`));
    if (!v("autorizaDatos")) e.push("autorizaDatos");
    if (!firma) e.push("firma");
    if (!acepta) e.push("acepta");
    return e;
  };

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (honeypot.trim() !== "") return; // bot detectado
    const e = validar();
    setErrores(e);
    if (e.length > 0) {
      requestAnimationFrame(() =>
        document.querySelector(".invalid, .group-invalid")?.scrollIntoView({ behavior: "smooth", block: "center" })
      );
      return;
    }
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const datos: Record<string, string> = {};
      for (const [k, val] of Object.entries(f)) datos[k] = val.trim();
      datos.aceptaContrato = "SI";
      datos.nombreCompleto = nombreCompleto;
      datos.anexoNombre = (f.anexoNombre ?? nombreCompleto).trim();
      datos.anexoDni = (f.anexoDni ?? v("dni")).trim();
      await contratosApi.submit(datos, firma!);
      setEnviado(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error("Error al enviar el contrato:", err);
      setErrorEnvio("No se ha podido enviar el contrato. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className={embedded ? undefined : "container"}>
        <div className="card confirmation" role="status">
          <img src={logo} alt="Logo IJ" />
          <h2>¡Contrato firmado!</h2>
          <p>Hemos recibido tu contrato firmado correctamente. Iker se pondrá en contacto contigo en breve.</p>
          {embedded && (
            <button type="button" className="btn" onClick={() => onSigned?.()}>
              Volver al cuestionario
            </button>
          )}
        </div>
      </div>
    );
  }

  const nombreCompleto = [v("nombre"), v("primerApellido"), v("segundoApellido")]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(" ");

  const fechaLarga =v("fecha")
    ? new Date(`${v("fecha")}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className={embedded ? undefined : "container"}>
      <div className="btn-row" style={{ justifyContent: "flex-start", flexWrap: "wrap", marginTop: embedded ? 0 : 20, marginBottom: 16 }}>
        {embedded ? (
          <button type="button" className="btn secondary" onClick={onClose}>
            Cerrar y volver al cuestionario
          </button>
        ) : (
          <Link className="btn secondary" to={base}>
            Volver al cuestionario
          </Link>
        )}
      </div>

      <form className="card contrato" onSubmit={enviar} noValidate>
        <input type="text" className="honeypot" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

        <h2 className="contrato-title">Contrato de prestación de servicios de entrenamiento personal</h2>
        <p className="contrato-sub">Reacondicionamiento Físico y Salud</p>

        <p>
          En {input("lugar", { w: 200, ph: "Localidad" })}, a {input("fecha", { type: "date" })}
          {fechaLarga && <span className="help"> ({fechaLarga})</span>}.
        </p>

        <h3>Reunidos</h3>
        <h4>De una parte — El Entrenador</h4>
        <table className="policy-table">
          <tbody>
            <tr><th>Nombre y apellidos</th><td>Iker Jauregui Tejido</td></tr>
            <tr><th>DNI</th><td>16076482B</td></tr>
            <tr><th>Denominación comercial</th><td>Iker Jauregui · Reacondicionamiento Físico y Salud</td></tr>
            <tr><th>Domicilio profesional</th><td>C/ Mateo Bidaurrazaga Alkatea, 3 — 48150 Sondika (Bizkaia)</td></tr>
          </tbody>
        </table>
        <p>En adelante, el “Entrenador”.</p>

        <h4>De otra parte — El Cliente</h4>
        <div className="contrato-grid">
          <label>Nombre {input("nombre")}</label>
          <label>Primer apellido {input("primerApellido")}</label>
          <label>Segundo apellido {input("segundoApellido")}</label>
          <label>DNI {input("dni")}</label>
        </div>
        <p>
          En adelante, el “Cliente”. Entrenador y Cliente serán referidos conjuntamente como las “Partes”, quienes se
          reconocen mutuamente la capacidad legal necesaria para suscribir el presente Contrato.
        </p>

        <h3>Exponen</h3>
        <p>
          I. Que el Entrenador es profesional de la actividad física y la salud, y cuenta con la formación y experiencia
          necesarias para prestar un servicio de entrenamiento personalizado de alta calidad, adaptado a las necesidades
          y objetivos que en cada momento manifieste el Cliente.
        </p>
        <p>II. Que el Cliente está interesado en contratar los servicios del Entrenador en los términos que se recogen en este documento.</p>
        <p>
          En virtud de cuanto antecede, las Partes acuerdan celebrar el presente Contrato de Prestación de Servicios de
          Entrenamiento Personal (el “Contrato”), que se regirá por las siguientes
        </p>

        <h3>Cláusulas</h3>

        <h4>01 Objeto</h4>
        <p>
          El Cliente encarga al Entrenador, que acepta, la prestación de los servicios descritos en la Cláusula Segunda
          (los “Servicios”), durante el plazo acordado entre las Partes.
        </p>

        <h4>02 Servicios</h4>
        <p>Los Servicios se prestarán en todo caso atendiendo a las necesidades, estado de salud y objetivos del Cliente, y comprenden:</p>
        <ul>
          <li>Valoración inicial de la condición física y asesoramiento relacionado con el cuidado personal.</li>
          <li>Diseño y actualización periódica de programas de entrenamiento personalizados.</li>
          <li>Seguimiento presencial del entrenamiento y corrección técnica de la ejecución de los ejercicios.</li>
          <li>Seguimiento de hábitos posturales, de descanso y de hábitos nutricionales generales, con propuesta de mejoras cuando resulte necesario.</li>
          <li>En su caso, entrenamiento y seguimiento en modalidad online, conforme a las tarifas del Anexo 1.</li>
        </ul>
        <p>El asesoramiento en materia de hábitos tiene carácter general y no sustituye el diagnóstico, tratamiento o pauta dietética de un profesional sanitario.</p>

        <h4>03 Sesiones de entrenamiento</h4>
        <p>
          Cada sesión de entrenamiento personal tendrá una duración de entre 45 y 60 minutos, pudiendo prolongarse cuando
          así lo requieran circunstancias derivadas de la propia práctica deportiva o ajenas al control razonable de las Partes.
        </p>
        <ul>
          <li><strong>Modificación por el Cliente:</strong> el Cliente podrá modificar el día y la hora de una sesión concertada comunicándolo con la mayor antelación posible y, en todo caso, con un mínimo de 24 horas. La modificación quedará sujeta a la disponibilidad del Entrenador.</li>
          <li><strong>Cancelación tardía o inasistencia:</strong> las sesiones no canceladas con la antelación indicada, o a las que el Cliente no asista, se considerarán realizadas a efectos de facturación, salvo causa de fuerza mayor debidamente justificada.</li>
          <li><strong>Cancelación por el Entrenador:</strong> si el Entrenador no pudiera asistir a una sesión concertada, ésta se reprogramará de mutuo acuerdo. De no ser posible, el Cliente tendrá derecho al reembolso del importe correspondiente a dicha sesión.</li>
        </ul>

        <h4>04 Honorarios y forma de pago</h4>
        <p>
          Los honorarios por los Servicios son los detallados en la tabla de tarifas que se adjunta como Anexo 1. El
          Entrenador podrá actualizar dichas tarifas notificándolo al Cliente con un mínimo de treinta (30) días de
          antelación a su aplicación; en tal caso, el Cliente podrá resolver el Contrato sin penalización alguna antes de
          la entrada en vigor de las nuevas tarifas.
        </p>
        <p>
          El pago es mensual y por adelantado. El Cliente abonará, dentro de los cinco (5) primeros días de cada mes de
          vigencia del Contrato, el importe correspondiente a las sesiones programadas para dicho mes, mediante efectivo,
          transferencia bancaria, Bizum o cualquier otro medio que el Entrenador habilite. El Entrenador emitirá la
          correspondiente factura o justificante de pago.
        </p>

        <h4>05 Obligaciones del Entrenador</h4>
        <p>Sin perjuicio de las restantes disposiciones del Contrato, el Entrenador se obliga a:</p>
        <ul>
          <li>Prestar los Servicios con la diligencia y profesionalidad propias de su actividad.</li>
          <li>Aportar el material necesario para el entrenamiento cuando el Cliente no disponga de él.</li>
          <li>Respetar, sin perjuicio de lo dispuesto en la Cláusula Tercera, el horario concertado para cada sesión.</li>
          <li>Emplear cuantos medios razonables estén a su alcance para la consecución de los objetivos del Cliente.</li>
          <li>Tratar los datos personales del Cliente con estricta confidencialidad, conforme a la Política de Protección de Datos que se entrega junto a este Contrato.</li>
        </ul>
        <p className="callout">
          <strong>Obligación de medios.</strong> La obligación del Entrenador es de medios y no de resultado. Los
          resultados dependen, entre otros factores, de la constancia, los hábitos y la condición individual del Cliente.
        </p>

        <h4>06 Obligaciones del Cliente</h4>
        <p>Por su parte, el Cliente se obliga a:</p>
        <ul>
          <li>Abonar puntualmente los Servicios conforme a lo dispuesto en este Contrato.</li>
          <li>Presentarse a cada sesión con la puntualidad y antelación necesarias.</li>
          <li>Realizar el entrenamiento propuesto con la dedicación adecuada y seguir las recomendaciones del Entrenador sobre hábitos de vida.</li>
          <li>Ejecutar los ejercicios prescritos antes y durante la sesión, así como los que deba realizar de forma autónoma los días sin entrenamiento supervisado.</li>
          <li>Cumplimentar con veracidad los formularios de valoración, incluido el cuestionario PAR-Q, e informar de inmediato de cualquier cambio en su estado de salud, lesión o medicación.</li>
          <li>Entregar firmado el documento de consentimiento informado y asunción de riesgos que se adjunta como Anexo 2.</li>
        </ul>

        <h4>07 Resolución del contrato</h4>
        <p>
          Cualquiera de las Partes podrá resolver el Contrato en caso de incumplimiento grave de las obligaciones de la
          otra, previa notificación por escrito. Asimismo, el Entrenador podrá suspender o resolver los Servicios si, a su
          criterio profesional, la continuidad del entrenamiento supusiera un riesgo para la salud del Cliente,
          reembolsando en tal caso las sesiones abonadas y no disfrutadas.
        </p>

        <h4>08 Protección de datos</h4>
        <p>
          Los datos personales del Cliente serán tratados por el Entrenador, como responsable del tratamiento, para la
          gestión de la relación contractual y la prestación de los Servicios, conforme al RGPD y a la LOPDGDD. La
          información completa sobre el tratamiento y el ejercicio de derechos se recoge en la{" "}
          {/* Embebido: nueva pestaña para no perder lo rellenado en el contrato */}
          <Link
            to={`${base}/politica-proteccion-datos`}
            {...(embedded ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            Política de Protección de Datos
          </Link>
          , que el Cliente declara haber recibido.
        </p>

        <h4>09 Notificaciones</h4>
        <p>Todas las comunicaciones relativas a este Contrato se dirigirán a las siguientes direcciones, o a cualquier otra que una Parte haya notificado debidamente a la otra:</p>
        <ul>
          <li><strong>Al Entrenador:</strong> iker.jau@gmail.com · 628 454 455</li>
          <li><strong>Al Cliente:</strong> correo electrónico y teléfono indicados en el encabezamiento.</li>
        </ul>

        <h4>10 Ley aplicable y jurisdicción</h4>
        <p>
          El presente Contrato se rige por la legislación española. Para cualquier controversia relativa a su validez,
          interpretación o cumplimiento, las Partes se someten a los Juzgados y Tribunales de Bilbao, salvo que la
          normativa aplicable, en particular la de protección de consumidores y usuarios, establezca un fuero distinto,
          en cuyo caso será éste el competente.
        </p>

        <hr />

        <h3>Anexo 1 · Tarifas del servicio</h3>
        <p className="help">Importes con IVA incluido. Los precios acordados los confirmará tu entrenador.</p>
        <img className="tarifas-img" src={tarifas} alt="Tarifas de Iker Jauregui" />
        <p className="callout">
          <strong>Condiciones de los bonos.</strong> Los bonos son personales e intransferibles, se abonan por adelantado. Las
          sesiones no consumidas dentro del plazo de validez caducarán, salvo causa justificada.
        </p>

        <hr />

        <h3>Anexo 2 · Consentimiento informado y asunción de riesgos</h3>
        <p>
          Con la intención de participar en el programa de actividad
          física dirigido por el Entrenador Iker Jauregui Tejido, declaro que:
        </p>
        <ul>
          <li><strong>Información recibida:</strong> se me han explicado, y he comprendido, la naturaleza de los entrenamientos y de las pruebas de valoración que, en su caso, se realicen, así como sus posibles riesgos y complicaciones. Las dudas planteadas han sido resueltas con claridad y a mi satisfacción.</li>
          <li><strong>Conocimiento del riesgo:</strong> conozco que la práctica de actividad física conlleva riesgos inherentes, incluido el de lesión, y acepto las responsabilidades derivadas de mi participación y del uso de las instalaciones y el equipamiento.</li>
          <li><strong>Veracidad de la información:</strong> he facilitado información veraz y completa sobre mi estado de salud y me comprometo a comunicar cualquier cambio relevante. Soy responsable de las consecuencias derivadas de omitir o falsear dicha información.</li>
          <li><strong>Adecuación del programa:</strong> he tenido la oportunidad de exponer mis necesidades específicas y acepto las condiciones de participación en el programa.</li>
          <li><strong>Exoneración:</strong> eximo al Entrenador de responsabilidad por las lesiones o accidentes derivados de los riesgos propios de la actividad física, sin perjuicio de la responsabilidad que legalmente le corresponda en caso de dolo o negligencia.</li>
          <li><strong>Confidencialidad:</strong> los resultados de las pruebas realizadas serán tratados con carácter confidencial. Sólo podrán utilizarse con fines científicos o divulgativos, de forma anonimizada, previa autorización expresa y por escrito.</li>
        </ul>
        <div className={`radio-row${errores.includes("autorizaDatos") ? " group-invalid" : ""}`}>
          <span>Autorizo el uso anonimizado de los resultados de mis pruebas con fines científicos o divulgativos.</span>
          <span className={`radio-set${v("autorizaDatos") === "" ? " vacio" : ""}`}>{radio("autorizaDatos", "SI", "SÍ")}{radio("autorizaDatos", "NO", "NO")}</span>
        </div>

        <hr />

        <h3>Anexo 3 · Cuestionario PAR-Q</h3>
        <p className="contrato-sub">Aptitud para la práctica de ejercicio físico</p>
        <p className="help">Fuente: PAR-Q, British Columbia Ministry of Health / Canadian Society for Exercise Physiology. Adaptado por LA County PH Nutrition Program.</p>
        <p>
          La actividad física regular es saludable y segura para la mayoría de las personas; sin embargo, algunas deben
          consultar a su médico antes de iniciar un programa de acondicionamiento físico. Si tiene entre 15 y 69 años,
          este cuestionario le indicará si necesita consejo médico previo. Si tiene más de 69 años y no está habituado a
          la actividad física, consulte con su médico.
        </p>
        <p>Lea cada pregunta con atención y responda con sinceridad marcando SÍ o NO.</p>
        {PARQ.map((q, i) => (
          <div key={i} className={`radio-row${errores.includes(`parq${i + 1}`) ? " group-invalid" : ""}`}>
            <span><strong>{i + 1}.</strong> {q}</span>
            <span className={`radio-set${v(`parq${i + 1}`) === "" ? " vacio" : ""}`}>{radio(`parq${i + 1}`, "SI", "SÍ")}{radio(`parq${i + 1}`, "NO", "NO")}</span>
          </div>
        ))}
        <p className="callout">
          <strong>Si ha contestado SÍ a una o más preguntas.</strong> Hable con su médico ANTES de aumentar su actividad
          física o de realizar una evaluación, e infórmele de las preguntas respondidas afirmativamente. Podrá realizar
          las actividades que desee comenzando de forma progresiva, o limitarse a aquellas que resulten seguras para
          usted, siguiendo siempre su consejo.
        </p>
        <p className="callout">
          <strong>Si ha contestado NO a todas las preguntas.</strong> Puede estar razonablemente seguro de que puede
          comenzar a ser más activo, empezando lentamente y aumentando de forma gradual, y realizar una valoración de su
          condición física. Se recomienda medir la presión arterial: si supera 144/94 mmHg, consulte a su médico antes de
          aumentar su actividad.
        </p>
        <p>
          <strong>Posponga el inicio de la actividad</strong> si no se encuentra bien por una enfermedad temporal
          (resfriado, gripe, fiebre) o si está o puede estar embarazada; en este último caso, consulte antes con su médico.
        </p>
        <p>
          <strong>Nota:</strong> si su salud cambia y alguna respuesta pasa a ser SÍ, informe a su entrenador o médico.
          Esta autorización es válida un máximo de 12 meses y queda sin efecto si su situación cambia respecto a
          cualquiera de las siete preguntas.
        </p>
        <p className="callout">
          <em>“He leído, comprendido y completado este cuestionario. Todas las preguntas han sido contestadas con sinceridad y a mi completa satisfacción.”</em>
        </p>

        <hr />

        <h3>Firma</h3>
        <p>
          Y en prueba de conformidad, las Partes firman el presente Contrato, así como los Anexos 1, 2 y 3, en el lugar y
          fecha indicados en el encabezamiento. El Entrenador, Iker Jauregui Tejido, contrafirmará el contrato.
        </p>
        <p><strong>Firma del Cliente:</strong> {nombreCompleto || "(nombre)"}</p>
        <div className={errores.includes("firma") ? "group-invalid" : ""}>
          <SignaturePad onChange={setFirma} />
          <p className="help">Dibuja tu firma con el dedo o el ratón dentro del recuadro.</p>
        </div>

        <label className={`consent${errores.includes("acepta") ? " group-invalid" : ""}`}>
          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
          <span>
            He leído y acepto el contrato y sus Anexos 1, 2 y 3, y declaro que los datos facilitados son veraces. Mi firma
            manuscrita incluida arriba se aplica a todo el documento.
          </span>
        </label>

        {errores.length > 0 && (
          <p className="error-text" style={{ textAlign: "center" }}>
            Revisa los campos marcados en rojo
            {errores.some((k) => REQUERIDOS.some(([r]) => r === k)) && (
              <>: {REQUERIDOS.filter(([k]) => errores.includes(k)).map(([, l]) => l).join(", ")}</>
            )}
            . Debes responder todo el cuestionario PAR-Q, firmar y aceptar el contrato.
          </p>
        )}
        {errorEnvio && <p className="error-text" style={{ textAlign: "center" }}>{errorEnvio}</p>}

        <div className="btn-row">
          <button className="btn" type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Firmar y enviar contrato"}
          </button>
        </div>
      </form>
    </div>
  );
}
