import type { ClienteValue, FieldDef, SectionDef } from "../types";

const opts = (values: string[]): { value: string; label: string }[] =>
  values.map((v) => ({ value: v, label: v }));

const range = (min: number, max: number): number[] =>
  Array.from({ length: max - min + 1 }, (_, i) => min + i);

export const SECTIONS: SectionDef[] = [
  {
    key: "ficha",
    title: "General",
    fields: [
      {
        key: "nombre",
        label: "Nombre",
        type: "text",
      },
      {
        key: "primerApellido",
        label: "Primer apellido",
        type: "text",
      },
      {
        key: "segundoApellido",
        label: "Segundo apellido",
        type: "text",
      },
      {
        key: "sexo",
        label: "Sexo",
        type: "select",
        options: opts(["Varón", "Mujer"]),
      },
      {
        key: "fechaNacimiento",
        label: "Fecha de nacimiento",
        type: "date",
      },
      {
        key: "edad",
        label: "Edad",
        type: "number",
        computed: true,
        help: "Se calcula automáticamente a partir de la fecha de nacimiento.",
      },
      {
        key: "localidad",
        label: "Localidad donde vives",
        type: "select",
        options: opts([
          "Leioa",
          "Getxo",
          "Erandio",
          "Sondika",
          "Zamudio",
          "Derio",
          "Lezama",
          "Urduliz",
          "Berango",
        ]),
        allowOther: true,
      },
      {
        key: "dni",
        label: "DNI o Pasaporte (número completo CON letra)",
        type: "text",
      },
      {
        key: "foto",
        label: "Foto (opcional)",
        type: "file",
        help: "Sube una foto tuya desde tu ordenador (opcional).",
      },
      {
        key: "telefono",
        label: "Teléfono de contacto (con prefijo)",
        type: "tel",
        groupStart: "Contacto",
      },
      {
        key: "email",
        label: "Email de contacto",
        type: "email",
      },
    ],
  },
  {
    key: "situacion",
    title: "Situación actual",
    fields: [
      {
        key: "altura",
        label: "Altura (cm)",
        type: "select",
        options: opts(range(150, 210).map(String)),
      },
      {
        key: "peso",
        label: "Peso (kg)",
        type: "select",
        options: opts(range(50, 120).map(String)),
      },
      {
        key: "deportePrincipal",
        label: "Deporte principal",
        type: "text",
        placeholder: "Ej: Fútbol, Baloncesto, Béisbol...",
      },
      {
        key: "diasDeportePrincipal",
        label: "¿Cuántos días a la semana empleas en tu deporte principal?",
        type: "select",
        options: opts(range(1, 7).map(String)),
      },
      {
        key: "diasGimnasio",
        label: "¿Cuántos días a la semana dedicas al gimnasio?",
        type: "select",
        options: opts(range(1, 7).map(String)),
      },
      {
        key: "pasosDia",
        label:
          "Estilo de vida / actividad diaria (¿sabes la cantidad de pasos que haces al día?)",
        type: "select",
        options: opts(["< 1000", "1000", "2000", "3000", "5000", "8000", "10000+"]),
        allowOther: true,
      },
      {
        key: "horasSueno",
        label: "Horas de sueño diarias (¿son seguidas o hay parones?)",
        type: "select",
        options: opts(["2","3","4","5","6","7","8","9","10","11","12"]),
        allowOther: true,
      },
      {
        key: "historialSalud",
        label:
          "Lesiones / operaciones / dolores / enfermedades / patologías / alergias / tabaquismo / hipertensión / antecedentes familiares / hipercolesterolemia / alteración de la glucemia en ayunas / otro factor de riesgo",
        type: "textarea",
      },
      {
        key: "frecuenciaCardiaca",
        label: "Frecuencia cardíaca en reposo (pulsaciones/min)",
        type: "select",
        options: opts(range(50, 220).map(String)),
        help: "Tómate las pulsaciones en reposo, sin moverte y sin distracciones durante 60 segundos y apunta el resultado. Lo puedes hacer en el cuello o muñecas, pero sin usar el dedo pulgar.",
      },
    ],
  },
  {
    key: "intenciones",
    title: "Intenciones",
    fields: [
      {
        key: "objetivosEspecificos",
        label: "Objetivos específicos (puedes elegir más de uno)",
        type: "multiselect",
        options: opts([
          "Perder peso",
          "Ganar fuerza",
          "Mejorar condición física",
          "Ganar masa muscular",
          "Tonificar",
          "Mejorar salud general",
          "Rendimiento deportivo",
        ]),
      },
      {
        key: "ejercicioConcreto",
        label: "¿Qué parte de tu cuerpo querrías proteger o fortalecer?",
        type: "select",
        options: opts(["Espalda", "Cuello", "Rodilla", "Cadera", "Tobillo"]),
        allowOther: true,
      },
      {
        key: "grupoMuscularPrioridad",
        label: "¿A qué grupo muscular quieres darle prioridad?",
        type: "select",
        options: opts([
          "Pecho",
          "Espalda (dorsales)",
          "Espalda alta / trapecio",
          "Zona lumbar",
          "Hombros (deltoides)",
          "Bíceps",
          "Tríceps",
          "Antebrazos",
          "Abdomen / core",
          "Oblicuos",
          "Glúteos",
          "Cuádriceps",
          "Isquiotibiales",
          "Aductores",
          "Abductores",
          "Gemelos / sóleo",
          "Cuerpo completo",
        ]),
      },
    ],
  },
  {
    key: "dietetico",
    title: "Cuestionario dietético",
    note: "(rellena este apartado únicamente si quieres unos consejos nutricionales)",
    fields: [
      {
        key: "quierePautas",
        label: "¿Quieres recibir unas pautas nutricionales?",
        type: "select",
        options: opts(["Sí", "No"]),
      },
      {
        key: "numComidas",
        label: "¿Cuántas comidas haces al día?",
        type: "select",
        options: opts(range(1, 5).map(String)),
      },
      ...range(1, 5).map(
        (n): FieldDef => ({
          key: `horaComida${n}`,
          label: `Comida ${n}: ¿a qué hora la haces?`,
          type: "time",
          showIf: [{ key: "numComidas", atLeast: n }],
        })
      ),
      {
        key: "cambiarNumComidas",
        label:
          "¿Estarías dispuesto a cambiar tu número de comidas diarias? (di cuántas)",
        type: "text",
      },
      {
        key: "alimentosHabituales",
        label:
          "Escribe detalladamente los alimentos que sueles incluir en tus desayunos, comidas, meriendas y cenas (cuanto más te explayes, mejor)",
        type: "textarea",
      },
      {
        key: "alimentosMantener",
        label:
          "¿Qué alimentos te gustaría mantener o consumir con mayor frecuencia?",
        type: "textarea",
      },
      {
        key: "alimentosIncluir",
        label: "¿Hay algún alimento que no consumes y que te gustaría incluir?",
        type: "textarea",
      },
      {
        key: "alimentosExcluir",
        label: "¿Qué alimentos NO te gustaría que estuviesen incluidos?",
        type: "textarea",
      },
      {
        key: "bebidas",
        label:
          "¿Qué tipo de bebidas sueles beber habitualmente? ¿Qué cantidad de agua bebes al día aproximadamente?",
        type: "textarea",
      },
      {
        key: "macronutrientes",
        label:
          "¿Sabes contar macronutrientes o llevar un seguimiento de la comida? ¿Cuál es el reparto (cantidad) de macronutrientes que has seguido y las kcal que vienes consumiendo?",
        type: "textarea",
      },
      {
        key: "consumoSal",
        label: "¿Consideras que comes mucha, poca o cantidad normal de sal al día?",
        type: "select",
        options: opts(["Mucha", "Poca", "Normal"]),
      },
      {
        key: "suplementos",
        label: "¿Tomas suplementos? ¿Tienes en mente tomarlos? ¿Cuáles?",
        type: "textarea",
      },
      {
        key: "saltarDesayuno",
        label: "¿Sería complicado para ti saltarte el desayuno?",
        type: "select",
        options: opts(["Sí", "No", "No lo he probado"]),
      },
      {
        key: "alergiasAlimentarias",
        label: "¿Tienes alergia a algún alimento o bebida? ¿Cuál y con qué condiciones?",
        type: "textarea",
      },
    ],
  },
  {
    key: "cierre",
    title: "Aceptación condiciones",
    fields: [
      {
        key: "observaciones",
        label: "Observaciones",
        type: "textarea",
      },
    ],
  },
];

// Todo el cuestionario dietético depende de querer recibir pautas.
for (const section of SECTIONS) {
  if (section.key !== "dietetico") continue;
  for (const field of section.fields) {
    if (field.key === "quierePautas") continue;
    field.showIf = [{ key: "quierePautas", equals: "Sí" }, ...(field.showIf ?? [])];
  }
}

export const isFieldVisible = (
  field: FieldDef,
  values: Record<string, ClienteValue>
): boolean =>
  (field.showIf ?? []).every((c) => {
    const v = values[c.key];
    if (c.equals !== undefined) return v === c.equals;
    if (c.atLeast !== undefined) return Number(v) >= c.atLeast;
    return true;
  });

export const ALL_FIELDS =SECTIONS.flatMap((s) => s.fields);
