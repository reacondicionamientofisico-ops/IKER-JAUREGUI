import type { Cliente } from "../types";

const STORAGE_KEY = "ij-clientes";

function readAll(): Cliente[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Cliente[];
  } catch {
    return [];
  }
}

function writeAll(clientes: Cliente[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

export const clientesStorage = {
  list(): Cliente[] {
    return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  get(id: string): Cliente | undefined {
    return readAll().find((c) => c.id === id);
  },
  add(cliente: Cliente): void {
    const all = readAll();
    all.push(cliente);
    writeAll(all);
  },
  update(id: string, patch: Partial<Cliente>): void {
    const all = readAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return;
    all[idx] = { ...all[idx], ...patch };
    writeAll(all);
  },
  remove(id: string): void {
    writeAll(readAll().filter((c) => c.id !== id));
  },
};
