import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import { UserContext } from '../../models/elber.model';
import {
    recordMemoryFact,
    editMemoryFact,
    forgetMemoryFacts,
    resetMemoryData,
} from '../../services/userMemory.service';

const SECTION_ENUM = z.enum([
    'Identidad',
    'Familia y relaciones',
    'Amistades',
    'Trabajo y estudios',
    'Preferencias e intereses',
    'Rutinas y hábitos',
    'Metas y proyectos',
    'Preocupaciones',
    'Bitácora de eventos',
]);

export const recordMemory = tool({
    name: 'record_memory',
    description: `
        Agrega un dato nuevo a la memoria persistente del usuario, en la sección que corresponda.

        **Usar cuando el usuario comparta algo que valga la pena recordar a largo plazo:**
        - Identidad: nombre, edad, cumpleaños, ciudad, idiomas
        - Familia y relaciones: pareja, hijos, familia cercana, mascotas
        - Amistades: amigos importantes y detalles sobre ellos
        - Trabajo y estudios: empresa, puesto, carrera, proyectos laborales
        - Preferencias e intereses: gustos, hobbies, comida, música, deportes
        - Rutinas y hábitos: horarios, ejercicio, rutinas diarias
        - Metas y proyectos: objetivos y planes a los que está comprometido
        - Preocupaciones: lo que le inquieta o estresa
        - Bitácora de eventos: momentos o eventos destacados, SIEMPRE con la fecha (ej: "2026-05-30: tuvo una entrevista en Google")

        Redacta el dato en tercera persona, conciso, una sola oración.
        Antes de agregar, revisa la memoria del usuario que ya tienes en contexto para NO duplicar.
        No usar para datos triviales o de una sola conversación que no aporten a conocer al usuario.
    `,
    parameters: z.object({
        section: SECTION_ENUM.describe('La sección donde agregar la información'),
        info: z.string().describe('La información a agregar, en tercera persona. Para "Bitácora de eventos", inicia con la fecha en formato YYYY-MM-DD.'),
    }),
    async execute({ section, info }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await recordMemoryFact(userId, section, info);
        } catch (error) {
            return `Error al guardar en la memoria: ${error}`;
        }
    },
});

export const updateMemory = tool({
    name: 'update_memory',
    description: `
        Corrige o reemplaza un dato que ya está en la memoria del usuario.

        **Usar cuando el usuario corrija o actualice algo que dijo antes:**
        - "Me equivoqué, mi cumpleaños es el 30 de abril, no el 2 de mayo"
        - "Ya no trabajo en X, ahora estoy en Y"
        - "Ya no vivo en Madrid"

        Pasos:
        1. Identifica en la memoria (que tienes en contexto) el texto EXACTO del dato a cambiar.
        2. Pásalo en old_info (sin el "- " inicial).
        3. Pon el texto corregido en new_info.

        No usar para agregar datos nuevos — para eso usa record_memory.
    `,
    parameters: z.object({
        section: SECTION_ENUM.describe('La sección donde está el dato a corregir'),
        old_info: z.string().describe('El texto actual del dato a reemplazar (sin el "- " inicial)'),
        new_info: z.string().describe('El nuevo texto corregido, en tercera persona'),
    }),
    async execute({ section, old_info, new_info }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await editMemoryFact(userId, section, old_info, new_info);
        } catch (error: any) {
            if (error.code === 'ENOENT') return 'La memoria aún no existe.';
            return `Error al actualizar la memoria: ${error}`;
        }
    },
});

export const forgetMemory = tool({
    name: 'forget_memory',
    description: `
        Borra de la memoria todos los datos relacionados con una palabra clave o tema,
        buscando en todas las secciones.

        **Usar SOLO cuando el usuario pida explícitamente olvidar algo:**
        - "Olvida mi cumpleaños"
        - "No recuerdes dónde trabajo"
        - "Borra lo que sabes de mi pareja"

        Pasa el término más específico posible para no borrar datos no relacionados.
        No usar por iniciativa propia — solo cuando el usuario lo pida.
    `,
    parameters: z.object({
        keyword: z.string().describe('Palabra clave o tema a olvidar. Se eliminarán todos los datos que la contengan (sin distinguir mayúsculas).'),
    }),
    async execute({ keyword }, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await forgetMemoryFacts(userId, keyword);
        } catch (error: any) {
            if (error.code === 'ENOENT') return 'La memoria aún no existe.';
            return `Error al olvidar la información: ${error}`;
        }
    },
});

export const resetMemory = tool({
    name: 'reset_memory',
    description: `
        Borra TODA la memoria del usuario y la deja en blanco. Acción irreversible.

        **Usar SOLO cuando el usuario pida explícitamente olvidar todo:**
        - "Olvida todo lo que sabes de mí"
        - "Borra toda tu memoria sobre mí"
        - "Quiero empezar de cero"

        Para borrar datos puntuales usa forget_memory en su lugar.
    `,
    parameters: z.object({}),
    async execute({}, runContext?: RunContext<UserContext>) {
        const userId = runContext?.context?.userId;
        if (!userId) return 'No se pudo identificar al usuario.';

        try {
            return await resetMemoryData(userId);
        } catch (error) {
            return `Error al borrar la memoria: ${error}`;
        }
    },
});
