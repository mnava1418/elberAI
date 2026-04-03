import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import axios, { AxiosRequestConfig } from 'axios';
import { serper } from '../config/index.config';
import { UserContext } from '../models/elber.model';

export const webSearch = tool({
    name: 'webSearch',
    description: `
        Tool para hacer busquedas en internet. Debes usar cuando:
        - El usuario pregunte por eventos, noticias o información reciente
        - Se trate de información que claramente ocurrió después de tu fecha de entrenamiento
        - Solicite datos actuales como clima, cotizaciones, noticias del día, etc.
        - El usuario pregunte QUIÉN ocupa actualmente un cargo, posición o puesto (presidente, CEO, director, campeón, etc.)
        - El usuario pregunte por el ESTADO ACTUAL de algo que puede cambiar (precios, rankings, resultados)
        
        EJEMPLOS de CUÁNDO SÍ usar webSearch:
        - "¿Qué pasó con las elecciones de 2025?"
        - "¿Cuál está el clima hoy?"
        - "¿Cómo está el dólar hoy?"
        - "¿Qué noticias hay sobre la Copa del Mundo 2026?"
        - "¿Qué películas se estrenaron este mes?"
        - "¿Quién es el presidente actual de Estados Unidos?"
        - "¿Quién es el presidente de México?"
        - "¿Quién es el director de la OMS?"
        - "¿Quién ganó el campeonato más reciente?"
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