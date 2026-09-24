import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import FormPage from "./pages/FormPage";
import TablePage from "./pages/TablePage";
import LoginPage from "./pages/LoginPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import { AuthProvider, useAuth } from "./lib/auth";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

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
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/clientes"
          element={
            <RequireAuth>
              <TablePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/formulario" replace />} />
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
