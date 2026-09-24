import type { SectionDef } from "../types";

const opts = (values: string[]): { value: string; label: string }[] =>
  values.map((v) => ({ value: v, label: v }));

export const SECTIONS: SectionDef[] = [
  {
    key: "ficha",
    title: "Ficha usuario",
    fields: [
      {
        key: "nombre",
        label: "Nombre y apellidos",
        type: "text",
      },
      {
        key: "telefono",
        label: "Teléfono de contacto (con prefijo)",
        type: "tel",
      },
      {
        key: "email",
        label: "Email de contacto",
        type: "email",
      },
      {
        key: "foto",
        label: "Foto",
        type: "file",
        help: "Sube una foto tuya desde tu ordenador (opcional).",
      },
      {
        key: "sexo",
        label: "Sexo",
        type: "select",
        options: opts(["Varón", "Mujer"]),
      },
      {
        key: "edad",
        label: "Edad",
        type: "number",
        min: 10,
        max: 100,
      },
      {
        key: "localidad",
        label: "Localidad donde vives",
        type: "text",
      },
      {
        key: "dni",
        label: "DNI o Pasaporte",
        type: "text",
      },
      {
        key: "altura",
        label: "Altura (cm)",
        type: "number",
        min: 150,
        max: 210,
      },
      {
        key: "peso",
        label: "Peso (kg)",
        type: "number",
        min: 50,
        max: 120,
      },
      {
        key: "deportePrincipal",
        label: "Deporte principal",
        type: "text",
        placeholder: "Ej: Fútbol, Baloncesto, Béisbol...",
      },
      {
        key: "profesion",
        label: "Profesión",
        type: "text",
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
        key: "objetivos",
        label: "Explica detalladamente tus objetivos a corto, medio y largo plazo",
        type: "textarea",
      },
      {
        key: "objetivosEspecificos",
        label: "Objetivos específicos",
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
        key: "historialSalud",
        label:
          "Lesiones / operaciones / dolores / enfermedades / patologías / alergias / tabaquismo / hipertensión / antecedentes familiares / hipercolesterolemia / alteración de la glucemia en ayunas / otro factor de riesgo",
        type: "textarea",
      },
      {
        key: "frecuenciaCardiaca",
        label: "Frecuencia cardíaca en reposo (pulsaciones/min)",
        type: "number",
        min: 0,
        max: 200,
        help: "Tómate las pulsaciones en reposo, sin moverte y sin distracciones durante 60 segundos y apunta el resultado. Lo puedes hacer en el cuello o muñecas, pero sin usar el dedo pulgar.",
      },
      {
        key: "estadoAnimico",
        label:
          "¿Te sientes bien anímicamente, a nivel de autorrealización, competencias, pleno/a?",
        type: "select",
        options: opts(["Muy bien", "Bien", "Normal", "Bajo", "Muy bajo"]),
        help: "Preguntamos esto porque es importante a nivel de salud.",
      },
      {
        key: "ejercicioConcreto",
        label:
          "¿Quieres hacer algún ejercicio en algún día de la semana en concreto? ¿Y grupo muscular?",
        type: "textarea",
      },
      {
        key: "grupoMuscularPrioridad",
        label: "¿A qué grupo muscular quieres darle prioridad?",
        type: "text",
      },
      {
        key: "horaLevantarAcostar",
        label: "Hora en la que te levantas y te acuestas",
        type: "text",
        placeholder: "Ej: 07:00 - 23:30",
      },
      {
        key: "horaEntrenar",
        label: "Hora en la que sueles entrenar",
        type: "time",
      },
    ],
  },
  {
    key: "intenciones",
    title: "Intenciones",
    fields: [
      {
        key: "circuloSocial",
        label:
          "¿Consideras que tienes un círculo social (amistades/pareja/familia) que te enriquece como persona y te hace sentir completo/a?",
        type: "select",
        options: opts(["Muy bueno", "Bueno", "Normal", "Flojo", "Muy flojo"]),
        help: "Preguntamos esto porque es importante a nivel de salud.",
      },
      {
        key: "experienciaPrevia",
        label:
          "¿Alguna vez has hecho actividad física? ¿Cuál? ¿Cuándo? ¿Durante cuánto tiempo?",
        type: "textarea",
      },
      {
        key: "diasDisponibles",
        label:
          "¿Cuántos días a la semana tienes disponibles para entrenar y qué días de la semana?",
        type: "textarea",
      },
      {
        key: "diasDeseados",
        label:
          "¿Cuántos días a la semana quieres entrenar? Frecuencia de entrenamiento ideal y duración ideal estimada por sesión",
        type: "textarea",
      },
      {
        key: "diasDeportePrincipal",
        label:
          "¿Cuántos días a la semana empleas en tu deporte principal? (especifica si es en el gimnasio)",
        type: "textarea",
      },
      {
        key: "tipoActividadFisica",
        label: "¿Qué tipo de actividad física te gusta realizar?",
        type: "textarea",
      },
      {
        key: "material",
        label:
          "Gimnasio donde entrenas o máquinas/material de entrenamiento del que dispones (texto aquí o envíanos fotos/vídeo por Telegram)",
        type: "textarea",
      },
      {
        key: "accesorios",
        label:
          "¿Tienes accesorios de entrenamiento? (ej: straps o agarraderas, cinturón...)",
        type: "textarea",
      },
      {
        key: "rutinaActual",
        label:
          "Explica detalladamente qué rutina has venido utilizando en los últimos meses (días de descanso incluidos) y qué ejercicios te gustaría mantener o en cuáles te gustaría progresar más",
        type: "textarea",
      },
    ],
  },
  {
    key: "dietetico",
    title: "Cuestionario dietético",
    fields: [
      {
        key: "numComidas",
        label: "¿Cuántas comidas haces al día? ¿A qué horas del día haces cada comida?",
        type: "textarea",
      },
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
        key: "etapaActual",
        label: "Etapa actual",
        type: "select",
        options: opts(["Volumen", "Definición", "Mantenimiento", "No lo sé"]),
      },
      {
        key: "tiempoEnEtapa",
        label: "¿Cuánto tiempo llevas en esa etapa?",
        type: "text",
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
];

export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);
