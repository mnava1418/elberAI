import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import { UserContext } from '../../models/elber.model';
import {
    saveMemoryEntry,
    searchMemoryEntries,
    updateMemoryEntry,
    deleteMemoryEntry,
    clearAllMemoryEntries,
} from '../../services/memory.service';

export const saveMemory = tool({
    name: 'save_memory',
    description: `
        Guarda un evento o momento específico en el historial del usuario en PostgreSQL.

        **Usar SOLO cuando el usuario pida explícitamente recordar algo:**
        - "Recuerda que hoy tuve una reunión difícil con Carlos"
        - "Guarda que el viernes tengo entrevista en Google"
        - "No olvides que fui al médico y me dijeron que tengo presión alta"
        - "Anota que decidí renunciar"

        NO usar si el usuario solo está contando algo sin pedir que se guarde.
        NO usar para información permanente como preferencias, trabajo o datos personales — eso va en update_profile.

        Redactar el recuerdo en tercera persona, conciso, una sola oración.
    `,
    parameters: z.object({
        memory: z
            .string()
            .describe('El evento o momento a guardar, redactado en tercera persona. Ejemplo: "El usuario tuvo una reunión difícil con su socio Carlos el 5 de mayo sobre el presupuesto."'),
    }),
    async execute({ memory }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await saveMemoryEntry(userId, memory);
        } catch (error) {
            return `Error al guardar el recuerdo: ${error}`;
        }
    },
});

export const searchMemory = tool({
    name: 'search_memory',
    description: `
        Busca en el historial de eventos y momentos específicos del usuario guardados en PostgreSQL.

        **Usar cuando el usuario pregunta por algo que pasó, una decisión que tomó,
        un plan, o cuando pregunta qué recuerdas de él:**
        - "¿Recuerdas la reunión con Carlos?"
        - "¿Qué sé de mí sobre trabajo?"
        - "¿Mencioné algo sobre el viaje a Miami?"
        - "¿Qué recuerdas de la semana pasada?"

        NO busca en el perfil fijo del usuario — ese ya está disponible en el contexto.
    `,
    parameters: z.object({
        query: z.string().describe('Lo que se quiere buscar en el historial de recuerdos.'),
    }),
    async execute({ query }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await searchMemoryEntries(userId, query);
        } catch (error) {
            return `Error al buscar recuerdos: ${error}`;
        }
    },
});

export const updateMemory = tool({
    name: 'update_memory',
    description: `
        Corrige un evento o recuerdo específico guardado en PostgreSQL.

        **Usar cuando el usuario corrija algo que dijo anteriormente:**
        - "La reunión con Carlos fue el 6 de mayo, no el 5"
        - "Esa decisión la tomé el martes, no el lunes"
        - "Corrige — el viaje era a Cancún, no a Miami"

        Para corregir información permanente del usuario como trabajo, preferencias o datos
        personales, usar edit_profile_info en su lugar.
    `,
    parameters: z.object({
        original: z
            .string()
            .describe('Descripción de lo que se quiere corregir. Ejemplo: "reunión con Carlos el 5 de mayo".'),
        correction: z
            .string()
            .describe('La versión correcta del recuerdo, en tercera persona. Ejemplo: "El usuario tuvo una reunión con su socio Carlos el 6 de mayo sobre el presupuesto."'),
    }),
    async execute({ original, correction }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await updateMemoryEntry(userId, original, correction);
        } catch (error) {
            return `Error al actualizar el recuerdo: ${error}`;
        }
    },
});

export const deleteMemory = tool({
    name: 'delete_memory',
    description: `
        Borra un evento o recuerdo específico de PostgreSQL.

        **Usar cuando el usuario pida olvidar algo puntual:**
        - "Olvida lo de la reunión con Carlos"
        - "Borra el recuerdo del viaje a Miami"
        - "No recuerdes esa decisión que te conté"

        No afecta el perfil fijo del usuario. Para borrar datos del perfil
        permanente usar forget_profile_info.
    `,
    parameters: z.object({
        description: z
            .string()
            .describe('Descripción de lo que se quiere olvidar. Ejemplo: "el viaje a Miami".'),
    }),
    async execute({ description }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await deleteMemoryEntry(userId, description);
        } catch (error) {
            return `Error al borrar el recuerdo: ${error}`;
        }
    },
});

export const clearAllMemories = tool({
    name: 'clear_all_memories',
    description: `
        Borra todos los eventos y recuerdos del usuario guardados en PostgreSQL.
        Esta acción es irreversible. No afecta el perfil fijo del MD file.

        **Usar SOLO cuando el usuario pida explícitamente borrar todo su historial:**
        - "Borra todos mis recuerdos"
        - "Olvida todo mi historial"
        - "Elimina toda tu memoria sobre lo que me ha pasado"

        Para borrar un recuerdo puntual usar delete_memory en su lugar.
    `,
    parameters: z.object({}),
    async execute({}, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await clearAllMemoryEntries(userId);
        } catch (error) {
            return `Error al borrar el historial: ${error}`;
        }
    },
});
