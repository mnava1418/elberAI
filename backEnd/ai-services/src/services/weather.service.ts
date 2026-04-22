import axios, { AxiosError } from 'axios';
import { weather } from '../config/index.config';
import { OneCallApiResponse } from '../models/weather.model';

const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

class WeatherServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number
    ) {
        super(message);
        this.name = 'WeatherServiceError';
    }
}

export async function fetchWeatherByCoordinates(
    lat: number,
    lon: number
): Promise<OneCallApiResponse> {
    const apiKey = weather.api_key;

    if (!apiKey) {
        throw new WeatherServiceError('OPENWEATHER_API_KEY is not configured');
    }

    try {
        const response = await axios.get<OneCallApiResponse>(ONECALL_URL, {
            params: {
                lat,
                lon,
                appid: apiKey,
                units: 'metric',
                exclude: 'minutely,alerts'
            },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ message?: string; cod?: number }>;
            const status = axiosError.response?.status;

            console.error(`[weatherProvider] HTTP ${status} error for coordinates (${lat}, ${lon}):`, axiosError.response?.data);

            if (status === 400) {
                throw new WeatherServiceError('Bad request: invalid or missing coordinates', 400);
            }
            if (status === 401) {
                throw new WeatherServiceError('Unauthorized: invalid OpenWeather API key', 401);
            }
            if (status === 404) {
                throw new WeatherServiceError('Weather data not found for the given coordinates', 404);
            }
            if (status === 429) {
                throw new WeatherServiceError('Rate limit exceeded: too many requests to OpenWeather API', 429);
            }
            if (status && status >= 500) {
                throw new WeatherServiceError('OpenWeather server error, please try again later', status);
            }

            throw new WeatherServiceError(`Unexpected error fetching weather data: ${axiosError.message}`);
        }

        console.error(`[weatherProvider] Unexpected error for coordinates (${lat}, ${lon}):`, error);
        throw new WeatherServiceError('An unexpected error occurred while fetching weather data');
    }
}
