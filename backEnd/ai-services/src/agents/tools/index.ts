import { updateProfile, editProfileInfo, forgetProfileInfo, resetProfile } from './profile.tools';
import { webSearch } from './search.tools'
import { getWeather, geocodeLocation } from './weather.tools'

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

const toolRegistry: Record<string, any> = {
    ...searchTools,
    ...weatherTools,
    ...userProfileTools
};

export default toolRegistry