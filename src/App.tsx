import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import MainToolbar from "./components/MainToolbar";
import ValoracionMenu from "./components/ValoracionMenu";
import ValoracionTabs from "./components/ValoracionTabs";
import FormPage from "./pages/FormPage";
import TablePage from "./pages/TablePage";
import ValoracionPage from "./pages/ValoracionPage";
import ValoracionTablePage from "./pages/ValoracionTablePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContratoPage from "./pages/ContratoPage";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider, useAuth } from "./lib/auth";

function Layout() {
  const { pathname } = useLocation();
  const stickyRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();
  const enValoracion = pathname.startsWith("/valoracion") && !!session;
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
        {enValoracion && (
          <div className={`container valoracion valoracion-toolbar${esTabla ? " container-wide" : ""}`}>
            <MainToolbar current="valoraciones" />
          </div>
        )}
        {enValoracion && (
          <div className={`container valoracion sticky-sub sub-row${esTabla ? " container-wide" : ""}`}>
            {!esTabla && <ValoracionMenu />}
            <ValoracionTabs />
          </div>
        )}
      </div>
      <Routes>
        {/* Rutas públicas: login y enlace del cuestionario que se envía a los usuarios */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cuestionario" element={<FormPage publico />} />
        <Route
          path="/cuestionario/politica-proteccion-datos"
          element={<PrivacyPolicyPage />}
        />

        <Route path="/cuestionario/contrato" element={<ContratoPage />} />

        {/* Rutas internas: requieren sesión */}
        <Route path="/" element={<Navigate to="/clientes" replace />} />
        <Route path="/formulario" element={<RequireAuth><FormPage /></RequireAuth>} />
        <Route
          path="/formulario/politica-proteccion-datos"
          element={<RequireAuth><PrivacyPolicyPage /></RequireAuth>}
        />
        <Route path="/formulario/contrato" element={<RequireAuth><ContratoPage /></RequireAuth>} />
        <Route path="/valoracion" element={<RequireAuth><ValoracionPage key="nuevo" /></RequireAuth>} />
        <Route path="/valoracion/tabla" element={<RequireAuth><ValoracionTablePage /></RequireAuth>} />
        <Route
          path="/valoracion/editar/:id"
          element={<RequireAuth><ValoracionPage key="editar" /></RequireAuth>}
        />
        <Route path="/clientes" element={<RequireAuth><TablePage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
