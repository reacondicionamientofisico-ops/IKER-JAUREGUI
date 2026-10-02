import { useEffect, useMemo, useState } from "react";
import { clientesApi } from "../data/clientesApi";
import type { Cliente, ClienteValue } from "../types";
import { useNavigate, useParams } from "react-router-dom";
import ChoiceButtons from "../components/ChoiceButtons";
import { valoracionesStore } from "../data/valoracionesStore";
import type { Valoracion } from "../data/valoracionesStore";
import {
  EQUILIBRIO_DIRECCIONES,
  PERIMETRO_LIMITE,
  ROM_ROWS,
  SIT_STAND_OPTIONS,
  planchaNivel,
  romIndex,
  FMS_SIDE_RISK,
  FMS_TESTS,
  FMS_TOTAL_RISK,
  fmsSideTotal,
  fmsTotal,
  SCORE_GLOSSARY,
  SCORE_MAX,
  img,
  parseScore,
} from "../data/valoracionTests";
import { calcularEdad } from "../lib/age";

const SCORE_OPTIONS = Array.from({ length: SCORE_MAX + 1 }, (_, i) => String(i));

const today = () => new Date().toISOString().slice(0, 10);

const LEGACY = "__legacy";

const str = (v: ClienteValue): string => (typeof v === "string" ? v.trim() : "");

const nombreCompleto = (c: Cliente): string =>
  [c.values.nombre, c.values.primerApellido, c.values.segundoApellido].map(str).filter(Boolean).join(" ");

// La ficha del cliente guarda "Varón"/"Mujer"; la valoración usa "V"/"M".
const sexoCorto = (v: ClienteValue): string => (str(v) === "Varón" ? "V" : str(v) === "Mujer" ? "M" : "");

// Tests activos en el formulario (definidos en valoracionTests.ts).
const ACTIVE_TESTS = FMS_TESTS;

function Images({ files }: { files: string[] }) {
  return (
    <div className="valoracion-images">
      {files.map((f) => (
        <img key={f} src={img(f)} alt="" loading="lazy" />
      ))}
    </div>
  );
}

// Al editar, primero se carga la valoración y luego se monta el formulario con sus datos.
export default function ValoracionPage() {
  const { id } = useParams();
  const [existing, setExisting] = useState<Valoracion | undefined>();
  const [cargando, setCargando] = useState(!!id);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    valoracionesStore
      .get(id)
      .then((v) => {
        if (cancelado) return;
        if (v) setExisting(v);
        else setErrorCarga("No se ha encontrado la valoración.");
      })
      .catch(() => {
        if (!cancelado) setErrorCarga("No se ha podido cargar la valoración.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  if (cargando) return <div className="container valoracion"><div className="card"><p>Cargando...</p></div></div>;
  if (errorCarga) return <div className="container valoracion"><div className="card"><p className="error-text">{errorCarga}</p></div></div>;
  return <ValoracionForm key={existing?.id ?? "nuevo"} existing={existing} />;
}

function ValoracionForm({ existing }: { existing?: Valoracion }) {
  const [saving, setSaving] = useState(false);
  const [datos, setDatos] = useState(
    existing?.datos ?? { nombre: "", deporte: "", sexo: "", fechaNac: "", fechaToma: today() }
  );
  const [s, setS] = useState<Record<string, string>>(existing?.values ?? {});

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesError, setClientesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    clientesApi
      .list()
      .then((list) => {
        if (!cancelado) setClientes(list.filter((c) => c.estado === "activo" && nombreCompleto(c) !== ""));
      })
      .catch(() => {
        if (!cancelado) setClientesError("No se han podido cargar los usuarios inscritos.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const clientesOrdenados = useMemo(
    () => [...clientes].sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b), "es")),
    [clientes]
  );

  // Valoraciones antiguas no guardan el vínculo: se intenta casar por nombre.
  const selectedId =
    datos.clienteId ?? clientes.find((c) => nombreCompleto(c) === datos.nombre)?.id ?? (datos.nombre ? LEGACY : "");

  const elegirCliente = (clienteId: string) => {
    const c = clientes.find((x) => x.id === clienteId);
    if (!c) {
      setDatos((p) => ({ ...p, clienteId: undefined, nombre: "", deporte: "", sexo: "", fechaNac: "" }));
      return;
    }
    setDatos((p) => ({
      ...p,
      clienteId: c.id,
      nombre: nombreCompleto(c),
      deporte: str(c.values.deportePrincipal),
      sexo: sexoCorto(c.values.sexo),
      fechaNac: str(c.values.fechaNacimiento),
    }));
  };

  // /valoracion?cliente=<id> (botón de la ficha del usuario) preselecciona al usuario.
  const preseleccion = new URLSearchParams(location.search).get("cliente");
  useEffect(() => {
    if (!existing && preseleccion && clientes.some((c) => c.id === preseleccion)) elegirCliente(preseleccion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientes, preseleccion]);

  const save = async () => {
    if (datos.nombre.trim() === "") {
      setError("Selecciona un usuario.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const limpio = { ...datos, nombre: datos.nombre.trim() };
      if (existing) await valoracionesStore.update(existing.id, limpio, s);
      else await valoracionesStore.add(limpio, s);
      navigate("/valoracion/tabla");
    } catch {
      setError("No se ha podido guardar la valoración. Revisa la conexión y que hayas iniciado sesión.");
      setSaving(false);
    }
  };

  const edad = calcularEdad(datos.fechaNac);
  const set = (k: string, v: string) => setS((p) => ({ ...p, [k]: v }));
  const setDato = (k: keyof typeof datos, v: string) => setDatos((p) => ({ ...p, [k]: v }));

  const setScore = (k: string, raw: string) => {
    if (raw !== "" && parseScore(raw) === null) return; // solo enteros 0..3
    set(k, raw);
  };

  const setNumber = (k: string, raw: string) => {
    if (raw !== "" && !(Number(raw) >= 0 && Number(raw) <= 100000)) return;
    set(k, raw);
  };
  const numInput = (id: string, key: string, max?: number, step = 1) => (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      min={0}
      max={max}
      step={step}
      value={s[key] ?? ""}
      onChange={(e) => setNumber(key, e.target.value)}
    />
  );
  const fmt = (n: number) => String(Number(n.toFixed(1)));
  const planchaSeg = s["zonaMedia.plancha"] ?? "";
  const nivelPlancha = planchaNivel(datos.sexo, Number(edad), Number(planchaSeg));
  const perimetro = Number(s["zonaMedia.perimetro"]);
  const limitePerimetro = datos.sexo === "M" || datos.sexo === "V" ? PERIMETRO_LIMITE[datos.sexo] : null;

  return (
    <div className="container valoracion">
      <div className="card" id="sec-datos">
        <h2 className="section-title">
          {existing ? `Editar valoración · ${existing.datos.nombre}` : "Valoración condición física inicial"}
        </h2>
        <p className="help">
          Esta hoja permite realizar una valoración global de la condición física mediante 5 tests
          complementarios. Una vez llevado a cabo cada test, solo hay que rellenar las puntuaciones:
          el resto se calcula automáticamente.
        </p>

        <div className="field">
          <label htmlFor="v-toma">Fecha valoración</label>
          <input id="v-toma" type="date" value={datos.fechaToma} onChange={(e) => setDato("fechaToma", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="v-nombre">Nombre</label>
          <select
            id="v-nombre"
            value={selectedId}
            onChange={(e) => e.target.value !== LEGACY && elegirCliente(e.target.value)}
          >
            <option value="">Selecciona un usuario...</option>
            {selectedId === LEGACY && <option value={LEGACY}>{datos.nombre} (sin vincular)</option>}
            {clientesOrdenados.map((c) => (
              <option key={c.id} value={c.id}>
                {nombreCompleto(c)}
              </option>
            ))}
          </select>
          {clientesError && <p className="error-text">{clientesError}</p>}
          <p className="help">Deporte, sexo y fecha de nacimiento se toman de la ficha del usuario.</p>
        </div>
        <div className="field">
          <label htmlFor="v-deporte">Deporte</label>
          <input id="v-deporte" type="text" value={datos.deporte} readOnly disabled />
        </div>
        <div className="field">
          <label htmlFor="v-sexo">Sexo</label>
          <input id="v-sexo" type="text" value={datos.sexo} readOnly disabled />
        </div>
        <div className="field">
          <label htmlFor="v-nac">Fecha de nacimiento</label>
          <input id="v-nac" type="date" value={datos.fechaNac} readOnly disabled />
        </div>
        <div className="field">
          <label htmlFor="v-edad">Edad</label>
          <input id="v-edad" type="number" value={edad} readOnly disabled />
        </div>
      </div>

      <div className="card" id="sec-fms">
        <h2 className="section-title">Tests valoración física a través de FMS (Functional Movement Screen) (Cook, 2010)</h2>
        <p className="help">Escala de puntuación común a todos los tests.</p>
        <table className="valoracion-glossary">
          <thead>
            <tr>
              <th>Puntuación</th>
              <th>Significado</th>
            </tr>
          </thead>
          <tbody>
            {SCORE_GLOSSARY.map((g) => (
              <tr key={g.score}>
                <td>{g.score}</td>
                <td>{g.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Images files={["fms-leyenda.png"]} />
      </div>

      {ACTIVE_TESTS.map((t) => {
        return (
          <div className="card" key={t.key}>
            <h3 className="subsection-title">{t.title}</h3>
            <Images files={t.images} />
            {t.puntos && (
              <div className="valoracion-puntos">
                <strong>Puntos a valorar:</strong>
                <ul>
                  {t.puntos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {t.labels.map((label, i) => (
              <div className="field" key={label}>
                <label>{label}</label>
                <ChoiceButtons
                  label={label}
                  options={SCORE_OPTIONS}
                  value={s[`fms.${t.key}.${i}`] ?? ""}
                  onChange={(v) => setScore(`fms.${t.key}.${i}`, v)}
                />
              </div>
            ))}
            <div className="field">
              <label htmlFor={`fms-${t.key}-c`}>Comentarios</label>
              <textarea id={`fms-${t.key}-c`} value={s[`fms.${t.key}.c`] ?? ""} onChange={(e) => set(`fms.${t.key}.c`, e.target.value)} />
            </div>
          </div>
        );
      })}

      <div className="card">
        <h3 className="subsection-title">Totales FMS</h3>
        {(
          [
            ["Puntuación total derecha", fmsSideTotal(s, 0), FMS_SIDE_RISK, "riesgo alto de lesión homolateral. Corregir posibles descompensaciones"],
            ["Puntuación total izquierda", fmsSideTotal(s, 1), FMS_SIDE_RISK, "riesgo alto de lesión homolateral. Corregir posibles descompensaciones"],
            ["Resultado total", fmsTotal(s), FMS_TOTAL_RISK, "riesgo alto de lesión. Corregir patrones más débiles"],
          ] as const
        ).map(([label, value, limit, msg]) => (
          <div className="field" key={label}>
            <label>{label}</label>
            <input type="text" readOnly disabled value={value === null ? "" : String(value)} />
            <p className={value !== null && value < limit ? "error-text" : "help"}>
              {value !== null && value < limit ? `Menos de ${limit}: ${msg}.` : `Si < ${limit}: ${msg}.`}
            </p>
          </div>
        ))}
      </div>

      <div className="card" id="sec-goniometria">
        <h2 className="section-title">2. Goniometría segmentos</h2>
        <p className="help">Grados de ROM del movimiento. Índice = medido / normal × 100.</p>
        <div className="table-scroll">
          <table className="valoracion-glossary valoracion-rom">
            <thead>
              <tr>
                <th>Segmento</th>
                <th>Movimiento</th>
                <th>Normal</th>
                <th>Medido</th>
                <th>Índice</th>
              </tr>
            </thead>
            <tbody>
              {ROM_ROWS.map((row, i) => {
                const idx = romIndex(row, s);
                return (
                  <tr key={row.key}>
                    <td>{i === 0 || ROM_ROWS[i - 1].segmento !== row.segmento ? row.segmento : ""}</td>
                    <td>{row.movimiento}</td>
                    <td>{row.normal}°</td>
                    <td>{numInput(`rom-${i}`, `rom.${row.key}`, 360)}</td>
                    <td>{idx === null ? "" : `${fmt(idx)} %`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" id="sec-equilibrio">
        <h2 className="section-title">3. Equilibrio</h2>
        <p className="help">Star Excursion Balance Test. Anota el valor alcanzado en cada dirección.</p>
        <Images files={["equilibrio-a.png", "equilibrio-b.jpg"]} />
        {["Derecha", "Izquierda"].map((lado) => (
          <div key={lado}>
            <h3 className="subsection-title">{lado} apoyada</h3>
            {EQUILIBRIO_DIRECCIONES.map((d, i) => (
              <div className="field" key={d}>
                <label htmlFor={`eq-${lado}-${i}`}>{d}</label>
                {numInput(`eq-${lado}-${i}`, `eq.${lado}.${i}`, 100)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card" id="sec-sitstand">
        <h2 className="section-title">4. Sit and stand</h2>
        <Images files={["sitstand-a.jpg", "sitstand-b.png"]} />
        <div className="field">
          <label htmlFor="sitstand">Sit &amp; stand</label>
          <select id="sitstand" value={s["sitstand"] ?? ""} onChange={(e) => set("sitstand", e.target.value)}>
            <option value="">Selecciona...</option>
            {SIT_STAND_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" id="sec-zona">
        <h2 className="section-title">5. Zona media</h2>
        <Images files={["plancha-a.png", "plancha-b.png"]} />
        <div className="field">
          <label htmlFor="plancha">Resistencia (tiempo) en plancha, en segundos</label>
          {numInput("plancha", "zonaMedia.plancha", undefined)}
          <p className="help">
            {planchaSeg === ""
              ? "Nivel según edad y sexo (tabla de referencia)."
              : nivelPlancha
                ? `Nivel: ${nivelPlancha}`
                : "Indica sexo y fecha de nacimiento (mínimo 16 años) para calcular el nivel."}
          </p>
        </div>
        <div className="field">
          <label htmlFor="perimetro">Perímetro ombligo (cm)</label>
          {numInput("perimetro", "zonaMedia.perimetro", 300, 0.1)}
          <p className={limitePerimetro !== null && perimetro >= limitePerimetro ? "error-text" : "help"}>
            Referencia: &lt;88 cm M; &lt;102 cm V.
            {limitePerimetro !== null && perimetro >= limitePerimetro ? " Valor por encima de la referencia." : ""}
          </p>
        </div>
      </div>
      <div className="card">
        {error && (
          <p className="error-text" style={{ textAlign: "center" }}>
            {error}
          </p>
        )}
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => void save()} disabled={saving}>
            {saving ? "Guardando..." : existing ? "Guardar cambios" : "Guardar valoración"}
          </button>
        </div>
      </div>
    </div>
  );
}
