import { supabase, FOTOS_BUCKET } from "../lib/supabaseClient";
import type { Cliente, ClienteValue } from "../types";

interface ClienteRow {
  id: string;
  created_at: string;
  estado: Cliente["estado"];
  values: Record<string, ClienteValue>;
}

function fromRow(row: ClienteRow): Cliente {
  return {
    id: row.id,
    createdAt: row.created_at,
    // Datos antiguos pueden tener valores de estado obsoletos (p. ej. "nuevo")
    // que no encajan con las únicas dos opciones válidas del selector.
    estado: row.estado === "baja" ? "baja" : "activo",
    values: row.values,
  };
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const [meta, base64] = dataUrl.split(",");
  const mimeMatch = /data:(.*);base64/.exec(meta);
  const mime = mimeMatch?.[1] ?? "image/jpeg";
  const ext = mime.split("/")[1] ?? "jpg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: mime }), ext };
}

async function uploadFotoIfNeeded(
  values: Record<string, ClienteValue>
): Promise<Record<string, ClienteValue>> {
  const foto = values["foto"];
  if (typeof foto !== "string" || !foto.startsWith("data:")) return values;

  const { blob, ext } = dataUrlToBlob(foto);
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(FOTOS_BUCKET).upload(path, blob, {
    contentType: blob.type,
    upsert: false,
  });
  if (error) throw error;

  return { ...values, foto: path };
}

export const clientesApi = {
  async list(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ClienteRow[]).map(fromRow);
  },

  async submit(values: Record<string, ClienteValue>): Promise<void> {
    const finalValues = await uploadFotoIfNeeded(values);
    const { error } = await supabase
      .from("clientes")
      .insert({ estado: "activo", values: finalValues });
    if (error) throw error;
  },

  async create(
    values: Record<string, ClienteValue>,
    estado: Cliente["estado"] = "activo"
  ): Promise<void> {
    const finalValues = await uploadFotoIfNeeded(values);
    const { error } = await supabase
      .from("clientes")
      .insert({ estado, values: finalValues });
    if (error) throw error;
  },

  async update(
    id: string,
    values: Record<string, ClienteValue>,
    estado?: Cliente["estado"]
  ): Promise<void> {
    const finalValues = await uploadFotoIfNeeded(values);
    const { error } = await supabase
      .from("clientes")
      .update(estado ? { values: finalValues, estado } : { values: finalValues })
      .eq("id", id);
    if (error) throw error;
  },

  async updateEstado(id: string, estado: Cliente["estado"]): Promise<void> {
    const { error } = await supabase.from("clientes").update({ estado }).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw error;
  },

  async fotoUrl(path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(FOTOS_BUCKET)
      .createSignedUrl(path, 60 * 60);
    if (error) return null;
    return data.signedUrl;
  },
};
