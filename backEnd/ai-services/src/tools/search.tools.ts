import { tool } from '@openai/agents';
import { z } from 'zod';
import axios, { AxiosRequestConfig } from 'axios';
import { serper } from '../config/index.config';

export const webSearch = tool({
    name: 'webSearch',
    description: `
        Tool para hacer busquedas en internet. UNICAMENTE debes usar cuando:
        - El usuario pregunte por eventos, noticias o información MUY RECIENTE
        - Se trate de información que claramente ocurrió después de tu fecha de entrenamiento
        - Solicite datos actuales como clima, cotizaciones, noticias del día, etc.
        
        EJEMPLOS de CUÁNDO SÍ usar webSearch:
        - "¿Qué pasó con las elecciones de 2025?"
        - "¿Cuál está el clima hoy?"
        - "¿Cómo está el dólar hoy?"
        - "¿Qué noticias hay sobre la Copa del Mundo 2026?"
        - "¿Qué películas se estrenaron este mes?"
    `,
    parameters: z.object({ query: z.string().describe('Consulta del usuario que debe ser buscada en internet')}),
    async execute({ query }) {
        try {
            const data = JSON.stringify({
                "q": query
            });

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