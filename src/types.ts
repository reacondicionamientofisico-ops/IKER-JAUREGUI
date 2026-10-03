export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "tel"
  | "email"
  | "select"
  | "multiselect"
  | "file";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  required?: boolean;
  allowOther?: boolean;
  placeholder?: string;
  groupStart?: string;
  computed?: boolean;
  /** Se muestra solo si se cumplen todas las condiciones. */
  showIf?: FieldCondition[];
}

export interface FieldCondition {
  key: string;
  equals?: string;
  atLeast?: number;
}

export interface SectionDef {
  key: string;
  title: string;
  note?: string;
  fields: FieldDef[];
}

export type ClienteValue = string | string[] | undefined;

export interface Cliente {
  id: string;
  createdAt: string;
  estado: "activo" | "baja";
  values: Record<string, ClienteValue>;
}
