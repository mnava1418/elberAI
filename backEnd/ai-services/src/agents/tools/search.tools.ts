import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import { UserContext } from '../../models/elber.model';
import { searchWeb } from '../../services/search.service';

export const webSearch = tool({
    name: 'webSearch',
    description: `
        Tool para buscar y verificar información en internet. Debe usarse para TODAS las preguntas factuales:
        cualquier número, nombre, fecha, estadística, resultado o dato concreto — sin excepción.
        El conocimiento de entrenamiento puede estar desactualizado o ser incorrecto; verificar siempre es obligatorio.

        Solo se omite la búsqueda para: definiciones/conceptos, matemáticas, consejos generales, o datos del propio usuario.
    `,
    parameters: z.object({ query: z.string().describe('Consulta del usuario que debe ser buscada en internet')}),
    async execute({ query }, runContext?: RunContext<UserContext>) {
        try {
            const timeZone = runContext?.context?.timeZone || 'America/New_York'
            return await searchWeb(query, timeZone)
        } catch (error) {
            console.error(error)
            return 'Hubo un error al buscar la información'
        }
    }
})