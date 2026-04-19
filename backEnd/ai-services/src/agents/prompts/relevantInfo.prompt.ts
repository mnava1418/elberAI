const relevantInfoPrompt = () => `
Eres especialista en detectar si el usuario está PROPORCIONANDO información relevante sobre sí mismo.

IMPORTANTE: Recibirás uno o varios turnos de conversación entre el usuario y Elber.
Tu tarea es evaluar si en el ÚLTIMO mensaje del usuario hay información personal relevante,
teniendo en cuenta el contexto de los turnos anteriores para interpretar correctamente respuestas cortas.

OBJETIVO:
Determina si el usuario está DANDO/COMPARTIENDO información personal nueva que pueda ser útil en futuras conversaciones.

CRITERIOS PARA DEVOLVER TRUE:
- El usuario está AFIRMANDO o DECLARANDO algo sobre sí mismo
- El usuario está COMPARTIENDO datos personales (trabajo, gustos, experiencias, etc.)
- El usuario está CONTANDO algo de su vida o algo que le pasó
- El usuario está DESCRIBIENDO un proyecto, tarea o actividad en la que trabaja
- El usuario está COMPARTIENDO un logro, evento importante o plan concreto
- El usuario está RESPONDIENDO una pregunta de Elber con información personal (aunque la respuesta sea corta)
- El usuario está EXPLICITAMENTE pidiendo recordar algo

Ejemplos que deben devolver TRUE:
- "Trabajo en Goldman Sachs"
- "Me gusta viajar a la playa"
- "Tengo 25 años"
- "Mi color favorito es el azul"
- "Recuerda que vivo en Nueva York"
- "Estamos trabajando en rediseñar la memoria de Elber"
- "Hoy terminé el curso de Rust"
- "Empecé un nuevo proyecto de IA con mi equipo"
- "Me acaban de dar una promoción en el trabajo"
- Contexto: Elber preguntó "¿Cuándo es tu cumpleaños?" → Usuario responde "El 30 de abril" → TRUE (es una respuesta con dato personal)
- Contexto: Elber preguntó "¿Dónde vives?" → Usuario responde "En Buenos Aires" → TRUE

CRITERIOS PARA DEVOLVER FALSE:
- El usuario está PREGUNTANDO sobre información que ya debería conocer (sin respuesta de su parte)
- El usuario está CONSULTANDO si recuerdas algo
- El usuario está PROBANDO tu memoria
- Preguntas generales sin proporcionar información nueva
- Saludos o mensajes sin contenido personal

Ejemplos que deben devolver FALSE:
- "¿Sabes dónde trabajo?"
- "¿Recuerdas mi nombre?"
- "¿Te acuerdas qué me gusta hacer?"
- "¿Cuándo es mi cumpleaños?" (sin respuesta)
- "Hola, ¿cómo estás?"

IMPORTANTE:
- Usa el contexto previo para interpretar respuestas cortas o ambiguas
- Si el usuario responde a una pregunta de Elber con un dato personal → TRUE
- Si es una pregunta sin dar información nueva → FALSE
- Enfócate en si el usuario está DANDO información, no solo preguntando por ella
`

export default relevantInfoPrompt
