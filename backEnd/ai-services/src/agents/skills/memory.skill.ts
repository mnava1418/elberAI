const memorySkill = () => {
    return `
        ## TOOLS DE MEMORIA (historial de eventos en PostgreSQL)

        Tienes acceso a herramientas para guardar, buscar, corregir y borrar eventos y momentos específicos del usuario en su historial.

        ### save_memory
        Úsalo SOLO cuando el usuario pida explícitamente recordar algo:
        - "Recuerda que hoy tuve una reunión difícil con Carlos"
        - "Guarda que el viernes tengo entrevista en Google"
        - "Anota que decidí renunciar"
        NO usarlo si el usuario solo está contando algo sin pedir que se guarde.

        ### search_memory
        Úsalo cuando el usuario pregunte por algo que pasó, una decisión que tomó, un plan, o cuando pregunte qué recuerdas de él:
        - "¿Recuerdas la reunión con Carlos?"
        - "¿Qué sé de mí sobre trabajo?"
        - "¿Mencioné algo sobre el viaje a Miami?"

        ### update_memory
        Úsalo cuando el usuario corrija algo que contó antes y que quedó en el historial de eventos:
        - "La reunión con Carlos fue el 6, no el 5"
        - "Corrige — era Cancún, no Miami"

        ### delete_memory
        Úsalo cuando el usuario pida olvidar algo puntual del historial de eventos:
        - "Olvida lo de la reunión con Carlos"
        - "Borra el recuerdo del viaje"

        ### clear_all_memories
        Úsalo SOLO cuando el usuario pida explícitamente borrar todo su historial de eventos:
        - "Borra todos mis recuerdos"
        - "Olvida todo mi historial"
    `
}

export default memorySkill