import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import { UserContext } from '../../models/elber.model';
import {
    loadProfile,
    clearProfileCache,
    addProfileEntry,
    editProfileEntry,
    forgetProfileEntries,
    resetProfileData,
} from '../../services/profile.service';

export { loadProfile, clearProfileCache };

const SECTION_ENUM = z.enum([
    'Datos Personales',
    'Trabajo',
    'Familia y Relaciones',
    'Proyectos Activos',
    'Preferencias',
    'Hábitos y Rutina',
    'Metas',
]);

export const updateProfile = tool({
    name: 'update_profile',
    description: `
        Actualiza el perfil persistente del usuario agregando información nueva en una sección específica.

        **Usar cuando el usuario comparta información personal relevante, por ejemplo:**
        - Datos Personales: nombre, edad, ciudad, ocupación, idiomas
        - Trabajo: empresa, cargo, proyectos laborales, horarios, industria
        - Familia y Relaciones: pareja, hijos, mascotas, amigos importantes
        - Proyectos Activos: proyectos personales o profesionales en curso
        - Preferencias: gustos, hobbies, comida favorita, estilo de vida, intereses
        - Hábitos y Rutina: horario de sueño, ejercicio, rutinas diarias
        - Metas: objetivos a corto o largo plazo, aspiraciones, planes futuros

        La información se guarda en tercera persona y persiste entre sesiones.
        No usar para datos temporales o de una sola conversación.
    `,
    parameters: z.object({
        section: SECTION_ENUM.describe('La sección del perfil donde agregar la información'),
        info: z.string().describe('La información a agregar, redactada en tercera persona'),
    }),
    async execute({ section, info }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await addProfileEntry(userId, section, info);
        } catch (error) {
            return `Error al actualizar el perfil: ${error}`;
        }
    },
});

export const editProfileInfo = tool({
    name: 'edit_profile_info',
    description: `
        Corrige o elimina un dato específico del perfil del usuario.

        **Usar cuando el usuario:**
        - Corrija información que dio antes ("en realidad tengo 32, no 31")
        - Pida borrar un dato puntual ("olvida que te dije que trabajo en X")
        - Actualice un dato que cambió ("me cambié de empresa", "ya no vivo en Madrid")

        Pasos para usarlo:
        1. Leer el perfil actual para identificar el texto exacto del bullet a modificar
        2. Pasar ese texto en old_info
        3. Si es corrección: pasar el nuevo texto en new_info
        4. Si es borrado: pasar null en new_info

        No usar para agregar información nueva — para eso usar update_profile.
    `,
    parameters: z.object({
        section: SECTION_ENUM.describe('La sección del perfil donde está el dato a modificar'),
        old_info: z
            .string()
            .describe('El texto actual del bullet a reemplazar o eliminar (sin el "- " inicial)'),
        new_info: z
            .string()
            .nullable()
            .describe('El nuevo texto para reemplazar old_info. Pasar null para eliminar el bullet.'),
    }),
    async execute({ section, old_info, new_info }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await editProfileEntry(userId, section, old_info, new_info);
        } catch (error: any) {
            if (error.code === 'ENOENT') return 'El perfil aún no existe.';
            return `Error al editar el perfil: ${error}`;
        }
    },
});

export const forgetProfileInfo = tool({
    name: 'forget_profile_info',
    description: `
        Elimina del perfil cualquier bullet que contenga una palabra clave o tema,
        buscando en todas las secciones sin necesitar el texto exacto.

        **Usar cuando el usuario pida olvidar un dato de forma genérica:**
        - "Olvida mi cumpleaños"
        - "No recuerdes dónde trabajo"
        - "Borra lo que sabes de mi pareja"
        - "Olvida todo lo relacionado con ese proyecto"

        Diferencia con edit_profile_info:
        - edit_profile_info requiere el texto exacto del bullet y la sección
        - forget_profile_info busca por keyword en todas las secciones y elimina todo lo que coincida

        Pasar el término más específico posible para evitar borrar bullets no relacionados.
    `,
    parameters: z.object({
        keyword: z
            .string()
            .describe('Palabra clave o tema a buscar en el perfil. Se eliminarán todos los bullets que la contengan (búsqueda case-insensitive).'),
    }),
    async execute({ keyword }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await forgetProfileEntries(userId, keyword);
        } catch (error: any) {
            if (error.code === 'ENOENT') return 'El perfil aún no existe.';
            return `Error al olvidar la información: ${error}`;
        }
    },
});

export const resetProfile = tool({
    name: 'reset_profile',
    description: `
        Borra todo el perfil del usuario y lo deja vacío.

        **Usar únicamente cuando el usuario pida explícitamente olvidar todo:**
        - "Olvida todo lo que sabes de mí"
        - "Borra mi perfil completo"
        - "Quiero empezar de cero"
        - "Elimina toda mi información personal"

        No usar para borrar datos puntuales — para eso usar forget_profile_info o edit_profile_info.
    `,
    parameters: z.object({}),
    async execute({}, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await resetProfileData(userId);
        } catch (error) {
            return `Error al resetear el perfil: ${error}`;
        }
    },
});
