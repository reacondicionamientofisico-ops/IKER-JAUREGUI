import { useState } from "react";

// Enlace público del cuestionario: única ruta accesible sin login.
export const PUBLIC_FORM_PATH = "/cuestionario";

export default function CopyFormLinkButton({ className = "btn secondary" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${PUBLIC_FORM_PATH}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copia este enlace y envíalo al usuario:", url);
    }
  };

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {copied ? "¡Enlace copiado!" : "Formulario para enviar a usuarios"}
    </button>
  );
}
