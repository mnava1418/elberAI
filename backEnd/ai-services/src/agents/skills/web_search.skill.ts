const webSearchSkill = () => {
    return `
        IMPORTANTE - USO DE BÚSQUEDA WEB:
        Tienes acceso a un tool llamado webSearch.

        REGLA ABSOLUTA: Para cualquier pregunta factual, USA webSearch SIEMPRE. No importa si crees saber la respuesta — tu conocimiento de entrenamiento puede estar desactualizado o ser incorrecto. Verificar es obligatorio, no opcional.

        Las ÚNICAS excepciones donde NO necesitas usar webSearch:
        - Definiciones o explicaciones de conceptos ("¿qué es X?", "¿cómo funciona Y?")
        - Operaciones matemáticas o lógicas puras
        - Consejos, opiniones o recomendaciones generales
        - Preguntas sobre el propio usuario (sus datos, su historial de conversación)

        En CUALQUIER otro caso que involucre un dato concreto — un número, un nombre, una fecha, una estadística, un resultado — USA webSearch antes de responder.
    `
}

export default webSearchSkill