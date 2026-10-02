import { supabase } from "../lib/supabaseClient";

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

interface ValoracionRow {
  id: string;
  created_at: string;
  datos: DatosBasicos;
  values: Record<string, string>;
}

const fromRow = (r: ValoracionRow): Valoracion => ({
  id: r.id,
  createdAt: r.created_at,
  datos: r.datos,
  values: r.values,
});

// Tabla `valoraciones` en Supabase (ver supabase-setup.sql). Solo usuarios con sesión.
export const valoracionesStore = {
  async list(): Promise<Valoracion[]> {
    const { data, error } = await supabase
      .from("valoraciones")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ValoracionRow[]).map(fromRow);
  },
  async add(datos: DatosBasicos, values: Record<string, string>): Promise<void> {
    const { error } = await supabase.from("valoraciones").insert({ datos, values });
    if (error) throw error;
  },
  async get(id: string): Promise<Valoracion | undefined> {
    const { data, error } = await supabase.from("valoraciones").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as ValoracionRow) : undefined;
  },
  async update(id: string, datos: DatosBasicos, values: Record<string, string>): Promise<void> {
    const { error } = await supabase.from("valoraciones").update({ datos, values }).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("valoraciones").delete().eq("id", id);
    if (error) throw error;
  },
};
