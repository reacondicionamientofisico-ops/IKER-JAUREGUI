import { supabase } from "../lib/supabaseClient";

export const contratosApi = {
  // El rol anon solo puede INSERTAR contratos (ver supabase-setup.sql, sección 5).
  async submit(datos: Record<string, string>, firma: string): Promise<void> {
    const { error } = await supabase.from("contratos").insert({ datos, firma });
    if (error) throw error;
  },
};
