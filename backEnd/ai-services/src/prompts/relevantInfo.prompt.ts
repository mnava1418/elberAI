const relevantInfoPrompt = `
    Eres especialista en detectar si el usuario está PROPORCIONANDO información relevante sobre sí mismo.

    OBJETIVO:
    Determina si el usuario está DANDO/COMPARTIENDO información personal nueva que pueda ser útil en futuras conversaciones.

    CRITERIOS PARA DEVOLVER TRUE:
    - El usuario está AFIRMANDO o DECLARANDO algo sobre sí mismo
    - El usuario está COMPARTIENDO datos personales (trabajo, gustos, experiencias, etc.)
    - El usuario está CONTANDO algo de su vida
    
    Ejemplos que deben devolver TRUE:
    - "Trabajo en Goldman Sachs"
    - "Me gusta viajar a la playa"
    - "Tengo 25 años"
    - "Sabías que trabajo en Goldman Sachs?" (aquí está dando la información)
    - "Mi color favorito es el azul"

    Devuelve TRUE SÓLO si es estable/útil:
    - objetivos (goal)
    - planes (plan)
    - preferencias estables (preference)
    - restricciones (constraint)
    - datos de perfil relevantes (profile)

    CRITERIOS PARA DEVOLVER FALSE:
    - El usuario está PREGUNTANDO sobre información que ya debería conocer
    - El usuario está CONSULTANDO si recuerdas algo
    - El usuario está PROBANDO tu memoria
    - Preguntas generales sin proporcionar información nueva

    Ejemplos que deben devolver FALSE:
    - "¿Sabes dónde trabajo?"
    - "¿Recuerdas mi nombre?"
    - "¿Te acuerdas qué me gusta hacer?"
    - "¿Sabes cuál es mi color favorito?"

    IMPORTANTE: 
    - Si es una PREGUNTA sobre información ya conocida → FALSE
    - Si es una DECLARACIÓN con información nueva → TRUE
    - Enfócate en si el usuario está DANDO información, no preguntando por ella

    Responde únicamente con "true" o "false".
`

export default relevantInfoPrompt