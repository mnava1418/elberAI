import { webSearch } from './search.tools'
import { getWeather, geocodeLocation } from './weather.tools'

const toolRegistry: Record<string, any> = {
    webSearch,
    getWeather,
    geocodeLocation
};

export default toolRegistry