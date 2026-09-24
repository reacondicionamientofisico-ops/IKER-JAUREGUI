import { ALL_FIELDS } from "./fields";
import type { Cliente, FieldDef } from "../types";

function escapeCsv(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function valueToString(v: unknown, field: FieldDef): string {
  if (field.type === "file") return v ? "Sí" : "No";
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return v.join(" | ");
  return String(v);
}

export function clientesToCsv(clientes: Cliente[]): string {
  const headers = ["Fecha", "Estado", ...ALL_FIELDS.map((f) => f.label)];
  const rows = clientes.map((c) => [
    new Date(c.createdAt).toLocaleString("es-ES"),
    c.estado,
    ...ALL_FIELDS.map((f) => valueToString(c.values[f.key], f)),
  ]);
  const lines = [headers, ...rows].map((row) =>
    row.map((cell) => escapeCsv(String(cell))).join(";")
  );
  return "﻿" + lines.join("\n");
}

export function downloadCsv(clientes: Cliente[]): void {
  const csv = clientesToCsv(clientes);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clientes-ij-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
