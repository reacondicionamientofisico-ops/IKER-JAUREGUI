import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// VITE_ONLY_VALORACION=true → build público solo con Valoración (sin Supabase)
const App =
  import.meta.env.VITE_ONLY_VALORACION === 'true'
    ? (await import('./AppValoracion.tsx')).default
    : (await import('./App.tsx')).default

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
