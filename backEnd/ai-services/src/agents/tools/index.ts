import { webSearch } from './search.tools'
import { getWeather, geocodeLocation } from './weather.tools'
import { recordMemory, updateMemory, forgetMemory, resetMemory } from './memory.tools'

const searchTools: Record<string, any> = {
    webSearch
}

const weatherTools: Record<string, any> = {
    getWeather,
    geocodeLocation,
}

const memoryTools: Record<string, any> = {
    recordMemory,
    updateMemory,
    forgetMemory,
    resetMemory,
}

const toolRegistry: Record<string, any> = {
    ...searchTools,
    ...weatherTools,
    ...memoryTools,
};

export default toolRegistry