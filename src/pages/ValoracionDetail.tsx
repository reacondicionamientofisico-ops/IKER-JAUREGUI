import { useEffect } from "react";
import type { Valoracion } from "../data/valoracionesStore";
import {
  EQUILIBRIO_DIRECCIONES,
  FMS_SIDE_RISK,
  FMS_TESTS,
  FMS_TOTAL_RISK,
  PERIMETRO_LIMITE,
  ROM_ROWS,
  fmsResult,
  fmsSideTotal,
  fmsTotal,
  planchaNivel,
  romIndex,
} from "../data/valoracionTests";
import { calcularEdad } from "../lib/age";

const dash = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === "" ? "—" : String(v);
const fmt = (n: number) => String(Number(n.toFixed(1)));

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <p style={{ margin: "4px 0" }}>
      <strong>{label}:</strong> {dash(value)}
    </p>
  );
}

const TABS = [
  { key: "datos", label: "Datos" },
  { key: "fms", label: "1. FMS" },
  { key: "rom", label: "2. Goniometría" },
  { key: "eq", label: "3. Equilibrio" },
  { key: "sit", label: "4. Sit and stand" },
  { key: "zona", label: "5. Zona media" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// Contenido de una valoración con pestañas internas (reutilizable dentro de la ficha).
export function ValoracionContent({ item, onEdit }: { item: Valoracion; onEdit: () => void }) {
  const { datos, values: s } = item;
  const edad = calcularEdad(datos.fechaNac);
  const uid = item.id;
  const go = (key: TabKey) =>
    document.getElementById(`val-${uid}-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const totals: [string, number | null, number][] = [
    ["Puntuación total derecha", fmsSideTotal(s, 0), FMS_SIDE_RISK],
    ["Puntuación total izquierda", fmsSideTotal(s, 1), FMS_SIDE_RISK],
    ["Resultado total", fmsTotal(s), FMS_TOTAL_RISK],
  ];
  const romFilled = ROM_ROWS.filter((r) => (s[`rom.${r.key}`] ?? "") !== "");
  const nivel = planchaNivel(datos.sexo, Number(edad), Number(s["zonaMedia.plancha"] ?? ""));
  const limite = datos.sexo === "M" || datos.sexo === "V" ? PERIMETRO_LIMITE[datos.sexo] : null;
  const per = Number(s["zonaMedia.perimetro"]);

  return (
    <div className="valoracion">
      <div className="valoracion-head">
        <div>
          <strong>Valoración del {dash(datos.fechaToma)}</strong>
          <p className="help" style={{ margin: 0 }}>
            Registrada el {new Date(item.createdAt).toLocaleString("es-ES")}
          </p>
        </div>
        <button type="button" className="btn-icon" title="Editar" aria-label="Editar" onClick={onEdit}>
          ✎
        </button>
      </div>
      <nav className="inner-tabs inner-tabs-sticky" aria-label="Apartados de la valoración">
        {TABS.map((t) => (
          <button key={t.key} type="button" className="inner-tab" onClick={() => go(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>
      <section id={`val-${uid}-datos`} className="inner-panel val-section">
        <h3 className="val-section-title">Datos</h3>
        <div>
            <Row label="Deporte" value={datos.deporte} />
            <Row label="Sexo" value={datos.sexo} />
            <Row label="Fecha de nacimiento" value={datos.fechaNac} />
            <Row label="Edad" value={edad} />
            <Row label="Fecha de la toma" value={datos.fechaToma} />
        </div>
      </section>
      <section id={`val-${uid}-fms`} className="inner-panel val-section">
        <h3 className="val-section-title">1. FMS</h3>
        <div>
            <div className="table-scroll">
              <table className="valoracion-glossary valoracion-data">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Dcha. / Puntuación</th>
                    <th>Izda.</th>
                    <th>Resultado</th>
                    <th>Comentarios</th>
                  </tr>
                </thead>
                <tbody>
                  {FMS_TESTS.map((t) => (
                    <tr key={t.key}>
                      <td>{t.title}</td>
                      <td>{dash(s[`fms.${t.key}.0`])}</td>
                      <td>{t.labels.length === 2 ? dash(s[`fms.${t.key}.1`]) : "—"}</td>
                      <td>{dash(fmsResult(t, s))}</td>
                      <td style={{ whiteSpace: "normal" }}>{dash(s[`fms.${t.key}.c`])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totals.map(([label, v, limit]) => (
              <p key={label} className={v !== null && v < limit ? "error-text" : undefined} style={{ margin: "4px 0" }}>
                <strong>{label}:</strong> {dash(v)}
                {v !== null && v < limit ? ` (menos de ${limit}: riesgo alto de lesión)` : ""}
              </p>
            ))}
        </div>
      </section>
      <section id={`val-${uid}-rom`} className="inner-panel val-section">
        <h3 className="val-section-title">2. Goniometría</h3>
        <div>
            {romFilled.length === 0 ? (
              <p className="help">Sin mediciones.</p>
            ) : (
              <div className="table-scroll">
                <table className="valoracion-glossary valoracion-data">
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
                    {romFilled.map((r) => {
                      const idx = romIndex(r, s);
                      return (
                        <tr key={r.key}>
                          <td>{r.segmento}</td>
                          <td style={{ whiteSpace: "normal" }}>{r.movimiento}</td>
                          <td>{r.normal}°</td>
                          <td>{s[`rom.${r.key}`]}°</td>
                          <td>{idx === null ? "—" : `${fmt(idx)} %`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </section>
      <section id={`val-${uid}-eq`} className="inner-panel val-section">
        <h3 className="val-section-title">3. Equilibrio</h3>
        <div>
            <div className="table-scroll">
              <table className="valoracion-glossary valoracion-data">
                <thead>
                  <tr>
                    <th>Dirección</th>
                    <th>Derecha apoyada</th>
                    <th>Izquierda apoyada</th>
                  </tr>
                </thead>
                <tbody>
                  {EQUILIBRIO_DIRECCIONES.map((d, i) => (
                    <tr key={d}>
                      <td>{d}</td>
                      <td>{dash(s[`eq.Derecha.${i}`])}</td>
                      <td>{dash(s[`eq.Izquierda.${i}`])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </section>
      <section id={`val-${uid}-sit`} className="inner-panel val-section">
        <h3 className="val-section-title">4. Sit and stand</h3>
        <div>
            <Row label="Evaluación" value={s["sitstand"]} />
        </div>
      </section>
      <section id={`val-${uid}-zona`} className="inner-panel val-section">
        <h3 className="val-section-title">5. Zona media</h3>
        <div>
            <Row label="Plancha (segundos)" value={s["zonaMedia.plancha"]} />
            <Row label="Nivel de plancha" value={nivel} />
            <p style={{ margin: "4px 0" }} className={limite !== null && per >= limite ? "error-text" : undefined}>
              <strong>Perímetro ombligo:</strong>{" "}
              {dash(s["zonaMedia.perimetro"] ? `${s["zonaMedia.perimetro"]} cm` : "")}
              {limite !== null && per >= limite ? " (por encima de la referencia)" : ""}
            </p>
        </div>
      </section>
    </div>
  );
}

export default function ValoracionDetail({
  item,
  onClose,
  onEdit,
}: {
  item: Valoracion;
  onClose: () => void;
  onEdit: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal valoracion" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <h2>{dash(item.datos.nombre)}</h2>
        <ValoracionContent item={item} onEdit={onEdit} />
      </div>
    </div>
  );
}
