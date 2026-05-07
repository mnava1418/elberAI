import { updateProfile, editProfileInfo, forgetProfileInfo, resetProfile } from './profile.tools';
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

const userProfileTools: Record<string, any> = {
    updateProfile,
    editProfileInfo,
    forgetProfileInfo,
    resetProfile,
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
    ...userProfileTools,
    ...memoryTools,
};

export default toolRegistry