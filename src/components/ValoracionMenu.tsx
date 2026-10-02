import { useEffect, useState } from "react";

const ITEMS = [
  { id: "sec-datos", label: "Datos" },
  { id: "sec-fms", label: "1. FMS" },
  { id: "sec-goniometria", label: "2. Goniometría" },
  { id: "sec-equilibrio", label: "3. Equilibrio" },
  { id: "sec-sitstand", label: "4. Sit & stand" },
  { id: "sec-zona", label: "5. Zona media" },
];

const stickyH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sticky-h")) || 0;

export default function ValoracionMenu() {
  const [active, setActive] = useState(ITEMS[0].id);

  useEffect(() => {
    const onScroll = () => {
      let current = ITEMS[0].id;
      for (const { id } of ITEMS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= stickyH() + 40) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="valoracion-menu" aria-label="Apartados de la valoración">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          type="button"
          className={active === it.id ? "active" : ""}
          aria-current={active === it.id ? "true" : undefined}
          onClick={() => go(it.id)}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}
