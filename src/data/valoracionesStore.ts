// Almacén local (solo este navegador). Aislado aquí para poder sustituirlo
// por un backend sin tocar las páginas.
export interface DatosBasicos {
  clienteId?: string;
  nombre: string;
  deporte: string;
  sexo: string;
  fechaNac: string;
  fechaToma: string;
}

export interface Valoracion {
  id: string;
  createdAt: string;
  datos: DatosBasicos;
  values: Record<string, string>;
}

const KEY = "ij.valoraciones.v1";

function read(): Valoracion[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Valoracion[]) : [];
  } catch {
    return [];
  }
}

function write(items: Valoracion[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const valoracionesStore = {
  list(): Valoracion[] {
    return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  add(datos: DatosBasicos, values: Record<string, string>): void {
    write([
      ...read(),
      { id: crypto.randomUUID(), createdAt: new Date().toISOString(), datos, values },
    ]);
  },
  get(id: string): Valoracion | undefined {
    return read().find((v) => v.id === id);
  },
  update(id: string, datos: DatosBasicos, values: Record<string, string>): void {
    write(read().map((v) => (v.id === id ? { ...v, datos, values } : v)));
  },
  remove(id: string): void {
    write(read().filter((v) => v.id !== id));
  },
};
