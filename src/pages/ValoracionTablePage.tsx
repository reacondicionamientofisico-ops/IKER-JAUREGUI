import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { valoracionesStore } from "../data/valoracionesStore";
import type { Valoracion } from "../data/valoracionesStore";
import {
  EQUILIBRIO_DIRECCIONES,
  FMS_TESTS,
  ROM_ROWS,
  fmsResult,
  fmsSideTotal,
  fmsTotal,
  planchaNivel,
} from "../data/valoracionTests";
import { calcularEdad } from "../lib/age";
import ValoracionDetail from "./ValoracionDetail";

const fmt = (n: number | null | undefined | string) =>
  n === null || n === undefined || n === "" ? "—" : String(n);

interface Column {
  group: string;
  label: string;
  cell: (v: Valoracion) => string;
}

const COLUMNS: Column[] = [
  { group: "Datos", label: "Fecha toma", cell: (v) => fmt(v.datos.fechaToma) },
  { group: "Datos", label: "Nombre", cell: (v) => fmt(v.datos.nombre) },
  { group: "Datos", label: "Deporte", cell: (v) => fmt(v.datos.deporte) },
  { group: "Datos", label: "Sexo", cell: (v) => fmt(v.datos.sexo) },
  { group: "Datos", label: "Fecha nac.", cell: (v) => fmt(v.datos.fechaNac) },
  { group: "Datos", label: "Edad", cell: (v) => fmt(calcularEdad(v.datos.fechaNac)) },
  ...FMS_TESTS.flatMap((t): Column[] => [
    {
      group: "1. FMS",
      label: t.labels.length === 2 ? `${t.title} · dcha.` : `${t.title} · puntuación`,
      cell: (v) => fmt(v.values[`fms.${t.key}.0`]),
    },
    ...(t.labels.length === 2
      ? [{ group: "1. FMS", label: `${t.title} · izda.`, cell: (v: Valoracion) => fmt(v.values[`fms.${t.key}.1`]) }]
      : []),
    { group: "1. FMS", label: `${t.title} · resultado`, cell: (v) => fmt(fmsResult(t, v.values)) },
    { group: "1. FMS", label: `${t.title} · comentarios`, cell: (v) => fmt(v.values[`fms.${t.key}.c`]) },
  ]),
  { group: "1. FMS", label: "FMS dcha.", cell: (v) => fmt(fmsSideTotal(v.values, 0)) },
  { group: "1. FMS", label: "FMS izda.", cell: (v) => fmt(fmsSideTotal(v.values, 1)) },
  { group: "1. FMS", label: "FMS total", cell: (v) => fmt(fmsTotal(v.values)) },
  ...ROM_ROWS.map((r): Column => ({
    group: "2. Goniometría",
    label: `${r.segmento} · ${r.movimiento} (°)`,
    cell: (v) => fmt(v.values[`rom.${r.key}`]),
  })),
  ...(["Derecha", "Izquierda"] as const).flatMap((lado) =>
    EQUILIBRIO_DIRECCIONES.map((d, i): Column => ({
      group: "3. Equilibrio",
      label: `${d} · ${lado} apoyada`,
      cell: (v) => fmt(v.values[`eq.${lado}.${i}`]),
    }))
  ),
  { group: "4. Sit and stand", label: "Evaluación", cell: (v) => fmt(v.values["sitstand"]) },
  { group: "5. Zona media", label: "Plancha (s)", cell: (v) => fmt(v.values["zonaMedia.plancha"]) },
  {
    group: "5. Zona media",
    label: "Nivel de plancha",
    cell: (v) =>
      fmt(
        planchaNivel(
          v.datos.sexo,
          Number(calcularEdad(v.datos.fechaNac)),
          Number(v.values["zonaMedia.plancha"] ?? "")
        )
      ),
  },
  { group: "5. Zona media", label: "Perímetro ombligo (cm)", cell: (v) => fmt(v.values["zonaMedia.perimetro"]) },
];

// Cabecera superior: grupos consecutivos con su colSpan.
const GROUPS = COLUMNS.reduce<{ name: string; span: number }[]>((acc, c) => {
  const last = acc[acc.length - 1];
  if (last && last.name === c.group) last.span++;
  else acc.push({ name: c.group, span: 1 });
  return acc;
}, []);

export default function ValoracionTablePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const viewed = items.find((v) => v.id === viewId) ?? null;

  // Barra de desplazamiento superior sincronizada con la tabla.
  const topRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const table = body.querySelector("table");
    const update = () => setScrollWidth(body.scrollWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(body);
    if (table) ro.observe(table);
    return () => ro.disconnect();
  }, [items, loading]);

  const syncing = useRef(false);
  const sync = (from: "top" | "body") => () => {
    if (syncing.current) {
      syncing.current = false;
      return;
    }
    const src = from === "top" ? topRef.current : bodyRef.current;
    const dst = from === "top" ? bodyRef.current : topRef.current;
    if (src && dst && dst.scrollLeft !== src.scrollLeft) {
      syncing.current = true;
      dst.scrollLeft = src.scrollLeft;
    }
  };

  useEffect(() => {
    let cancelado = false;
    valoracionesStore
      .list()
      .then((list) => {
        if (!cancelado) setItems(list);
      })
      .catch(() => {
        if (!cancelado) setError("No se han podido cargar las valoraciones.");
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const edit = (v: Valoracion) => navigate(`/valoracion/editar/${v.id}`);

  const remove = async (v: Valoracion) => {
    if (!window.confirm(`¿Eliminar la valoración de ${v.datos.nombre}?`)) return;
    try {
      await valoracionesStore.remove(v.id);
      setItems((prev) => prev.filter((x) => x.id !== v.id));
      setViewId(null);
    } catch {
      setError("No se ha podido eliminar la valoración.");
    }
  };

  return (
    <div className="container container-wide valoracion">
      <div className="card">
        <h2 className="section-title">Valoraciones registradas</h2>
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p>Cargando...</p>
        ) : items.length === 0 ? (
          <p>Todavía no hay valoraciones registradas.</p>
        ) : (
          <>
          <div className="table-scroll-top" ref={topRef} onScroll={sync("top")} aria-hidden="true">
            <div style={{ width: scrollWidth, height: 1 }} />
          </div>
          <div className="table-scroll" ref={bodyRef} onScroll={sync("body")}>
            <table className="valoracion-glossary valoracion-data valoracion-list">
              <thead>
                <tr>
                  <th rowSpan={2}>Acciones</th>
                  {GROUPS.map((g) => (
                    <th key={g.name} colSpan={g.span} className="group-head">
                      {g.name}
                    </th>
                  ))}
                </tr>
                <tr>
                  {COLUMNS.map((c, i) => (
                    <th key={i}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v.id} className="row-clickable" onClick={() => setViewId(v.id)}>
                    <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="btn-icon" title="Ver" aria-label="Ver" onClick={() => setViewId(v.id)}>
                        👁
                      </button>
                      <button type="button" className="btn-icon" title="Editar" aria-label="Editar" onClick={() => edit(v)}>
                        ✎
                      </button>
                      <button type="button" className="btn-icon danger" title="Borrar" aria-label="Borrar" onClick={() => remove(v)}>
                        🗑
                      </button>
                    </td>
                    {COLUMNS.map((c, i) => (
                      <td key={i}>{c.cell(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
      {viewed && (
        <ValoracionDetail item={viewed} onClose={() => setViewId(null)} onEdit={() => edit(viewed)} />
      )}
    </div>
  );
}
