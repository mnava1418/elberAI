const memorySkill = () => {
    return `
        ## TOOLS DE MEMORIA (lo que sabes del usuario)

        Tu conocimiento sobre el usuario ya está en la sección "LO QUE SABES DE..." de tu contexto.
        Para responder preguntas sobre él ("¿qué sabes de mí?", "¿qué me preocupa?", "¿cómo se
        llama mi hermana?") responde DIRECTO desde ahí — NO uses ninguna tool para consultar.

        Usa estas tools solo para ESCRIBIR en la memoria:

        ### record_memory
        Cuando el usuario te pida recordar algo, o comparta un dato personal nuevo que valga la pena
        guardar a largo plazo (familia, amigos, trabajo, preferencias, preocupaciones). Para eventos
        o momentos puntuales, guárdalos en la sección "Bitácora de eventos" con la fecha.
        Antes de guardar, revisa la memoria que ya tienes en contexto para no duplicar.

        ### update_memory
        Cuando el usuario corrija o actualice un dato que ya está en su memoria:
        - "Me equivoqué, mi cumpleaños es el 30 de abril"
        - "Ya no trabajo en X, ahora en Y"
        Identifica el texto exacto del dato en tu contexto y reemplázalo.

        ### forget_memory
        SOLO cuando el usuario pida explícitamente olvidar un dato puntual:
        - "Olvida dónde trabajo"
        - "Borra lo que sabes de mi pareja"

        ### reset_memory
        SOLO cuando el usuario pida explícitamente borrar TODO:
        - "Olvida todo lo que sabes de mí"
        - "Quiero empezar de cero"
    `
}

export default memorySkill
