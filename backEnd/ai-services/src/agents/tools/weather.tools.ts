import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import { UserContext } from '../../models/elber.model';
import { fetchWeatherByCoordinates, normalizeWeatherResponse, geocodeLocation as geocodeLocationService } from '../../services/weather.service';

export const getWeather = tool({
    name: 'getWeather',
    description: `
        Obtiene el clima actual, pronóstico por hora (12h) y pronóstico diario (7 días).

        **Cuándo llamarlo:**
        - Si el usuario NO menciona ninguna ciudad → llama con lat: null, lon: null (usa ubicación del usuario)
        - Si el usuario menciona cualquier nombre de ciudad o lugar → OBLIGATORIO llamar geocodeLocation primero, luego pasar el lat/lon retornado aquí. Esto aplica incluso si la ciudad mencionada es la misma que la ubicación actual del usuario.

        Ejemplos:
        - "¿Cómo está el clima?" → getWeather({ lat: null, lon: null })
        - "¿Cómo está el clima en Madrid?" → geocodeLocation("Madrid") → getWeather({ lat, lon })
        - "¿Cuál será el día más frío en Ciudad de México?" → geocodeLocation("Ciudad de México") → getWeather({ lat, lon })
        - "Pronóstico para Monterrey" → geocodeLocation("Monterrey") → getWeather({ lat, lon })
    `,
    parameters: z.object({
        lat: z.number().nullable().describe('Latitud. Null para usar la ubicación actual del usuario'),
        lon: z.number().nullable().describe('Longitud. Null para usar la ubicación actual del usuario')
    }),
    async execute({ lat, lon }, runContext?: RunContext<UserContext>) {
        try {
            const userContext = runContext?.context;
            const resolvedLat = lat ?? userContext?.location.lat;
            const resolvedLon = lon ?? userContext?.location.lon;

            if (resolvedLat === undefined || resolvedLon === undefined) {
                return 'No tengo una ubicación disponible. Dime el nombre de la ciudad.';
            }

            const raw = await fetchWeatherByCoordinates(resolvedLat, resolvedLon);
            const response = normalizeWeatherResponse(raw);
            return response;
        } catch (error) {
            return 'No pude obtener el clima. Intenta de nuevo.';
        }
    }
})

export const geocodeLocation = tool({
    name: 'geocodeLocation',
    description: `
        Convierte el nombre de una ciudad o ubicación a coordenadas geográficas (lat, lon).
        Usar ANTES de getWeather cuando el usuario mencione una ciudad por nombre.

        Ejemplos:
        - "¿Va a llover en Monterrey?" → geocodeLocation("Monterrey") → getWeather({ lat, lon })
        - "Clima en París" → geocodeLocation("París") → getWeather({ lat, lon })
    `,
    parameters: z.object({
        location: z.string().describe('Nombre de la ciudad o ubicación')
    }),
    async execute({ location }, _runContext?: RunContext<UserContext>) {
        try {
            return await geocodeLocationService(location);
        } catch (error) {
            return `No encontré la ubicación "${location}". Verifica el nombre e intenta de nuevo.`;
        }
    }
})
