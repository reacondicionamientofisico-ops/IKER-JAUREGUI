// Enlace público del cuestionario: única ruta accesible sin login.
export const PUBLIC_FORM_PATH = "/cuestionario";

// Abre WhatsApp con un mensaje listo que incluye el enlace del cuestionario;
// el destinatario se elige dentro de WhatsApp.
export function WhatsAppFormButton({ className = "btn secondary" }: { className?: string }) {
  const url = `${window.location.origin}${PUBLIC_FORM_PATH}`;
  const text =
    "Hola, soy Iker de Reacondicionamiento Físico y Salud IJ. " +
    `Antes de empezar a entrenar, por favor rellena este cuestionario inicial: ${url}`;
  return (
    <a
      className={className}
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Enviar por WhatsApp
    </a>
  );
}

// Abre el cuestionario público en una pestaña nueva.
export default function CopyFormLinkButton({ className = "btn secondary" }: { className?: string }) {
  return (
    <a className={className} href={PUBLIC_FORM_PATH} target="_blank" rel="noopener noreferrer">
      Formulario de inscripción
    </a>
  );
}
