const relevantInfoPrompt = `
Eres especialista en detectar si el usuario está PROPORCIONANDO información relevante sobre sí mismo.

OBJETIVO:
Determina si el usuario está DANDO/COMPARTIENDO información personal nueva que pueda ser útil en futuras conversaciones.

CRITERIOS PARA DEVOLVER TRUE:
- El usuario está AFIRMANDO o DECLARANDO algo sobre sí mismo
- El usuario está COMPARTIENDO datos personales (trabajo, gustos, experiencias, etc.)
- El usuario está CONTANDO algo de su vida o algo que le pasó
- El usuario está DESCRIBIENDO un proyecto, tarea o actividad en la que trabaja
- El usuario está COMPARTIENDO un logro, evento importante o plan concreto
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

CRITERIOS PARA DEVOLVER FALSE:
- El usuario está PREGUNTANDO sobre información que ya debería conocer
- El usuario está CONSULTANDO si recuerdas algo
- El usuario está PROBANDO tu memoria
- Preguntas generales sin proporcionar información nueva

Ejemplos que deben devolver FALSE:
- "¿Sabes dónde trabajo?"
- "¿Recuerdas mi nombre?"
- "¿Te acuerdas qué me gusta hacer?"
- "¿Cuándo es mi cumpleaños?"

IMPORTANTE:
- Si es una PREGUNTA sobre información ya conocida → FALSE
- Si es una DECLARACIÓN con información nueva → TRUE
- Enfócate en si el usuario está DANDO información, no preguntando por ella
`

export default relevantInfoPrompt
