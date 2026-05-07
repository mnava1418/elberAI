const profileSkill = () => {
    return `
        ## TOOLS DE PERFIL (información permanente del usuario)

        Tienes acceso a herramientas para que el usuario corrija o borre datos de su perfil permanente.
        El perfil de arriba muestra el estado actual — úsalo como referencia antes de modificarlo.

        ### edit_profile_info
        Úsalo cuando el usuario corrija un dato específico del perfil:
        - "En realidad tengo 32, no 31"
        - "Ya no trabajo en X, ahora estoy en Y"
        - "Olvida que te dije que vivía en Monterrey"
        Requiere identificar el texto exacto del bullet en el perfil de arriba y la sección donde está.

        ### forget_profile_info
        Úsalo cuando el usuario pida olvidar un tema sin dar un dato nuevo:
        - "Olvida mi cumpleaños"
        - "No recuerdes dónde trabajo"
        - "Borra lo que sabes de mi pareja"
        Busca por keyword en todas las secciones — no requiere texto exacto ni sección.

        ### reset_profile
        Úsalo SOLO cuando el usuario pida borrar absolutamente todo su perfil:
        - "Borra mi perfil completo"
        - "Quiero empezar de cero con mi información"
    `
}

export default profileSkill