import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import axios, { AxiosRequestConfig } from 'axios';
import { serper } from '../../config/index.config';
import { UserContext } from '../../models/elber.model';

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
            const userContext = runContext?.context
            const userTimezone = userContext?.timeZone || 'America/New_York'
            
            const timezoneToCountry: Record<string, string> = {
                'America/Mexico_City': 'mx',
                'America/New_York': 'us',
            }
            
            const countryCode = timezoneToCountry[userTimezone] || 'us'
            
            // Detectar si la consulta es sobre eventos/horarios
            const timeRelatedTerms = ['hora', 'horario', 'cuándo', 'cuando', 'tiempo', 'fecha', 'schedule', 'próximo']
            const includesTime = timeRelatedTerms.some(term => query.toLowerCase().includes(term))
            
            // Preparar query optimizado
            let searchQuery = query
            if (includesTime) {
                searchQuery = `${query} hora local ${userTimezone.split('/')[1]?.replace('_', ' ')}`
            }

            const searchParams = {
                "q": searchQuery,
                "gl": countryCode,
                "hl": "es"
            }

            const data = JSON.stringify(searchParams)

            const config: AxiosRequestConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: serper.searchURL,
                headers: {
                    'X-API-KEY': serper.secret, 
                    'Content-Type': 'application/json'
                },
                data: data
            }

            const response = await axios.request(config);
            
            if (response.data.organic) {
                return response.data.organic
            }

            return 'No tengo la información. Sigo aprendiendo'
        } catch (error) {
            console.error(error)
            return 'Hubo un error al buscar la información'
        }
    }
})