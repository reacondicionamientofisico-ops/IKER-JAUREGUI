import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import FormPage from "./pages/FormPage";
import TablePage from "./pages/TablePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

function Layout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/formulario" replace />} />
        <Route path="/formulario" element={<FormPage />} />
        <Route
          path="/formulario/politica-proteccion-datos"
          element={<PrivacyPolicyPage />}
        />
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
