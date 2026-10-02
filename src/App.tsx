import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ValoracionMenu from "./components/ValoracionMenu";
import FormPage from "./pages/FormPage";
import TablePage from "./pages/TablePage";
import ValoracionPage from "./pages/ValoracionPage";
import ValoracionTablePage from "./pages/ValoracionTablePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

function Layout() {
  const { pathname } = useLocation();
  const stickyRef = useRef<HTMLDivElement>(null);
  const enValoracion = pathname.startsWith("/valoracion");
  const esTabla = pathname.startsWith("/valoracion/tabla");

  // Publica la altura de la cabecera fija para que el scroll a secciones no quede tapado.
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty("--sticky-h", `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className="sticky-top" ref={stickyRef}>
        <Header />
        {enValoracion && !esTabla && (
          <div className="container valoracion sticky-sub">
            <ValoracionMenu />
          </div>
        )}
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/valoracion" replace />} />
        <Route path="/formulario" element={<FormPage />} />
        <Route
          path="/formulario/politica-proteccion-datos"
          element={<PrivacyPolicyPage />}
        />
        <Route path="/cuestionario" element={<FormPage publico />} />
        <Route
          path="/cuestionario/politica-proteccion-datos"
          element={<PrivacyPolicyPage />}
        />
        <Route path="/valoracion" element={<ValoracionPage key="nuevo" />} />
        <Route path="/valoracion/tabla" element={<ValoracionTablePage />} />
        <Route path="/valoracion/editar/:id" element={<ValoracionPage key="editar" />} />
        <Route path="/clientes" element={<TablePage />} />
        <Route path="*" element={<Navigate to="/formulario" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
