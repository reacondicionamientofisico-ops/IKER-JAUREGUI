import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import ValoracionPage from "./pages/ValoracionPage";
import ValoracionTablePage from "./pages/ValoracionTablePage";

// Versión publicada: solo Valoración, sin Supabase ni páginas de clientes.
export default function AppValoracion() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/valoracion" element={<ValoracionPage key="nuevo" />} />
        <Route path="/valoracion/tabla" element={<ValoracionTablePage />} />
        <Route path="/valoracion/editar/:id" element={<ValoracionPage key="editar" />} />
        <Route path="*" element={<Navigate to="/valoracion" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
