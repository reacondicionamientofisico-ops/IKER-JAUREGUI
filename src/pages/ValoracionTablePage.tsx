import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { valoracionesStore } from "../data/valoracionesStore";
import type { Valoracion } from "../data/valoracionesStore";
import { fmsSideTotal, fmsTotal } from "../data/valoracionTests";
import { calcularEdad } from "../lib/age";
import ValoracionDetail from "./ValoracionDetail";

const fmt = (n: number | null) => (n === null ? "—" : String(n));

export default function ValoracionTablePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const viewed = items.find((v) => v.id === viewId) ?? null;

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
          <div className="table-scroll">
            <table className="valoracion-glossary valoracion-data valoracion-list">
              <thead>
                <tr>
                  <th>Acciones</th>
                  <th>Fecha toma</th>
                  <th>Nombre</th>
                  <th>Deporte</th>
                  <th>Sexo</th>
                  <th>Edad</th>
                  <th>FMS dcha.</th>
                  <th>FMS izda.</th>
                  <th>FMS total</th>
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
                    <td>{v.datos.fechaToma}</td>
                    <td>{v.datos.nombre}</td>
                    <td>{v.datos.deporte}</td>
                    <td>{v.datos.sexo}</td>
                    <td>{calcularEdad(v.datos.fechaNac)}</td>
                    <td>{fmt(fmsSideTotal(v.values, 0))}</td>
                    <td>{fmt(fmsSideTotal(v.values, 1))}</td>
                    <td>{fmt(fmsTotal(v.values))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {viewed && (
        <ValoracionDetail item={viewed} onClose={() => setViewId(null)} onEdit={() => edit(viewed)} />
      )}
    </div>
  );
}
