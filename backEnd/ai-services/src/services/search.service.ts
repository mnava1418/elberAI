import axios, { AxiosRequestConfig } from 'axios';
import { serper } from '../config/index.config';

const timezoneToCountry: Record<string, string> = {
    'America/Mexico_City': 'mx',
    'America/New_York': 'us',
}

const timeRelatedTerms = ['hora', 'horario', 'cuándo', 'cuando', 'tiempo', 'fecha', 'schedule', 'próximo']

export const searchWeb = async (query: string, timezone: string): Promise<any> => {
    const countryCode = timezoneToCountry[timezone] || 'us'

    const includesTime = timeRelatedTerms.some(term => query.toLowerCase().includes(term))

    let searchQuery = query
    if (includesTime) {
        searchQuery = `${query} hora local ${timezone.split('/')[1]?.replace('_', ' ')}`
    }

    const searchParams = {
        "q": searchQuery,
        "gl": countryCode,
        "hl": "es"
    }

    const config: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: serper.searchURL,
        headers: {
            'X-API-KEY': serper.secret,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(searchParams)
    }

    const response = await axios.request(config);

    if (response.data.organic) {
        return response.data.organic
    }

    return 'No tengo la información. Sigo aprendiendo'
}
