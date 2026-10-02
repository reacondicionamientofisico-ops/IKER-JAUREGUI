const BASE = `${import.meta.env.BASE_URL}valoracion/`;
export const img = (name: string) => `${BASE}${name}`;

export const SCORE_MAX = 3;

export const SCORE_GLOSSARY = [
  { score: 3, meaning: "Ejecución perfecta, sin limitaciones visibles" },
  {
    score: 2,
    meaning:
      "Ejecución adecuada, pero con limitaciones o compensaciones en el movimiento",
  },
  { score: 1, meaning: "Ejecución deficiente. Restricción o compensación importante." },
  {
    score: 0,
    meaning:
      "DOLOR. Si existe dolor en cualquier test, se evalúa como 0. Ir a fisioterapeuta y establecer pautas de recuperación.",
  },
];

export function meaningOf(score: number | null): string {
  return score === null ? "" : (SCORE_GLOSSARY.find((g) => g.score === score)?.meaning ?? "");
}

/* ---------- 1. FMS ---------- */

export interface FmsTest {
  key: string;
  title: string;
  images: string[];
  /** "Puntos a valorar" que figuran en la hoja original. */
  puntos?: string[];
  /** Bilateral: [derecha, izquierda]. Unilateral: un único label. */
  labels: [string, string] | [string];
}

export const FMS_TESTS: FmsTest[] = [
  {
    key: "hombros",
    title: "1. Movilidad hombros",
    images: ["fms1-a.png", "fms1-b.png"],
    labels: ["Mano derecha arriba, mano izquierda abajo", "Mano izquierda arriba, mano derecha abajo"],
  },
  {
    key: "caderaSupino",
    title: "2. Flexión cadera tendido supino",
    images: ["fms2-a.png", "fms2-b.png"],
    labels: ["Derecha", "Izquierda"],
  },
  {
    key: "sentadilla",
    title: "3. Sentadilla Overhead",
    images: ["fms3-a.png", "fms3-b.png"],
    puntos: [
      "Torso paralelo a pantorrillas o más recto.",
      "Rodillas en línea sagital con puntera de pies.",
      "Cadera por debajo de rodillas.",
      "Palo paralelo al suelo.",
      "No hace guiño glúteo (butt wink).",
      "No genu valgo (rodillas adentro).",
      "Mantiene equilibrio.",
    ],
    labels: ["Puntuación"],
  },
  {
    key: "paso",
    title: "4. Paso obstáculo",
    images: ["fms4-a.png", "fms4-b.png"],
    puntos: [
      "Caderas, rodillas, tobillos alineados en plano sagital.",
      "Zona lumbar fija y curvatura natural.",
      "Palo paralelo al suelo todo el tiempo.",
      "No toca obstáculo.",
      "Mantiene equilibrio.",
    ],
    labels: ["Derecha levantada", "Izquierda levantada"],
  },
  {
    key: "zancada",
    title: "5. Zancada en línea",
    images: ["fms5-a.png", "fms5-b.png"],
    puntos: [
      "Palo contacto con cabeza, columna torácica y sacro en todo momento.",
      "Tronco vertical.",
      "Palo vertical.",
      "Rodilla atrasada toca suelo justo detrás de talón adelantado.",
      "Pies alineados.",
    ],
    labels: ["Derecha adelantada", "Izquierda adelantada"],
  },
  {
    key: "tronco",
    title: "6. Estabilidad del tronco fondos suelo",
    images: ["fms6-a.png", "fms6-b.png"],
    labels: ["Puntuación"],
  },
  {
    key: "rotacion",
    title: "7. Estabilidad con rotación",
    images: ["fms7-a.png", "fms7-b.png"],
    puntos: [
      "Columna vertebral alineada sin hiperextensión ni cifosis.",
      "Estirar completamente piernas y brazos (del mismo lado y lados opuestos).",
      "Rodilla toca codo en punto medio (del mismo lado y lados opuestos).",
    ],
    labels: ["Medidas brazo derecho adelantado", "Medidas brazo izquierdo adelantado"],
  },
];

export const FMS_SIDE_RISK = 7;
export const FMS_TOTAL_RISK = 14;

export function parseScore(raw: string | undefined): number | null {
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= SCORE_MAX ? n : null;
}

const val = (s: Record<string, string>, t: FmsTest, side: 0 | 1) =>
  parseScore(s[`fms.${t.key}.${side}`]);

/** Resultado del test: mínimo de los dos lados (o la puntuación única). null si incompleto. */
export function fmsResult(t: FmsTest, s: Record<string, string>): number | null {
  const a = val(s, t, 0);
  if (t.labels.length === 1) return a;
  const b = val(s, t, 1);
  return a === null || b === null ? null : Math.min(a, b);
}

/** Puntuación total de un lado; los tests unilaterales cuentan la mitad en cada lado. */
export function fmsSideTotal(s: Record<string, string>, side: 0 | 1): number | null {
  let sum = 0;
  for (const t of FMS_TESTS) {
    const v = val(s, t, t.labels.length === 1 ? 0 : side);
    if (v === null) return null;
    sum += t.labels.length === 1 ? v / 2 : v;
  }
  return sum;
}

export function fmsTotal(s: Record<string, string>): number | null {
  let sum = 0;
  for (const t of FMS_TESTS) {
    const r = fmsResult(t, s);
    if (r === null) return null;
    sum += r;
  }
  return sum;
}

/* ---------- 2. Goniometría ---------- */

export interface RomRow {
  key: string;
  segmento: string;
  movimiento: string;
  normal: number;
}

type Sides = [string, string];
const LR: Sides = ["derecha", "izquierda"];
const LR_M: Sides = ["derecho", "izquierdo"];

const ROM_DEF: [string, [string, number][], Sides][] = [
  [
    "HOMBRO",
    [
      ["Flexión", 170],
      ["Extensión", 80],
      ["Abducción", 180],
      ["Rotación interna", 90],
      ["Rotación externa", 10],
      ["Extensión horizontal", 30],
    ],
    LR,
  ],
  [
    "CADERA",
    [
      ["Aductores de cadera", 120],
      ["Flexión de cadera con rodilla en flexión", 125],
      ["Rotadores externos de cadera", 45],
      ["Flexión de cadera con la rodilla flexionada fija decúbito prono", 30],
    ],
    LR,
  ],
  ["RODILLA", [["Flexión de rodilla con la cadera fija decúbito prono", 120]], LR],
  ["TOBILLO", [["Elongación de los flexores plantares", 90]], LR_M],
];

export const ROM_ROWS: RomRow[] = ROM_DEF.flatMap(([segmento, movs, sides]) =>
  movs.flatMap(([mov, normal]) =>
    sides.map((side, i) => ({
      key: `${segmento}.${mov}.${i}`,
      segmento,
      movimiento: `${mov} (${side})`,
      normal,
    }))
  )
);

/** Índice = medido / normal × 100. null si no hay medida válida. */
export function romIndex(row: RomRow, s: Record<string, string>): number | null {
  const raw = s[`rom.${row.key}`];
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? (n / row.normal) * 100 : null;
}

/* ---------- 3. Equilibrio (Star Excursion) ---------- */

export const EQUILIBRIO_DIRECCIONES = [
  "1. Anterior",
  "2. Anteromedial",
  "3. Medial",
  "4. Posteromedial",
  "5. Posterior",
  "6. Posterolateral",
  "7. Lateral",
  "8. Anterolateral",
];

/* ---------- 4/5. Sit & stand, zona media ---------- */

export const SIT_STAND_OPTIONS = ["Muy bien", "Bien", "Regular", "Mal"];

/** Perímetro de ombligo de referencia (cm): por debajo = normal. */
export const PERIMETRO_LIMITE = { M: 88, V: 102 } as const;

/* ---------- Plancha: tabla de referencia (segundos) ---------- */

export const PLANCHA_NIVELES = ["Excelente", "Muy bien", "Bien", "Pobre", "Muy pobre"] as const;

/** [edad máxima, mínimos de: excelente (>), muy bien, bien, pobre]. Por debajo de "pobre" = muy pobre. */
const PLANCHA_V: [number, number[]][] = [
  [25, [120, 75, 45, 30]],
  [35, [120, 75, 45, 30]],
  [45, [100, 60, 35, 25]],
  [55, [90, 55, 30, 22]],
  [65, [60, 40, 25, 15]],
  [Infinity, [45, 35, 20, 10]],
];
const PLANCHA_M: [number, number[]][] = [
  [25, [100, 60, 35, 25]],
  [35, [100, 60, 35, 25]],
  [45, [90, 55, 30, 22]],
  [55, [70, 50, 25, 15]],
  [65, [55, 35, 20, 10]],
  [Infinity, [45, 30, 15, 10]],
];

/** null si faltan sexo/edad/tiempo o la edad es < 16 (fuera de la tabla). */
export function planchaNivel(sexo: string, edad: number, segundos: number): string | null {
  const tabla = sexo === "V" ? PLANCHA_V : sexo === "M" ? PLANCHA_M : null;
  if (!tabla || !Number.isFinite(edad) || edad < 16 || !Number.isFinite(segundos) || segundos < 0)
    return null;
  const t = tabla.find(([max]) => edad <= max)![1];
  if (segundos > t[0]) return PLANCHA_NIVELES[0];
  const i = t.findIndex((min, k) => k > 0 && segundos >= min);
  return PLANCHA_NIVELES[i === -1 ? 4 : i];
}
