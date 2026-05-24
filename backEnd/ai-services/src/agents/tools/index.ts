import { webSearch } from './search.tools'
import { getWeather, geocodeLocation } from './weather.tools'
import { saveMemory, searchMemory, updateMemory, deleteMemory, clearAllMemories } from './memory.tools'

const searchTools: Record<string, any> = {
    webSearch
}

const weatherTools: Record<string, any> = {
    getWeather,
    geocodeLocation,
}

const memoryTools: Record<string, any> = {
    saveMemory,
    searchMemory,
    updateMemory,
    deleteMemory,
    clearAllMemories,
}

const toolRegistry: Record<string, any> = {
    ...searchTools,
    ...weatherTools,
    ...memoryTools,
};

export default toolRegistry