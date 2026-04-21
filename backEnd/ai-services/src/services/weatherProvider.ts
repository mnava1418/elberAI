import axios, { AxiosError } from 'axios';
import { weather } from '../config/index.config';

const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

export interface CurrentWeather {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: WeatherCondition[];
    rain?: { '1h': number };
    snow?: { '1h': number };
}

export interface DailyWeather {
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    summary: string;
    temp: {
        day: number;
        min: number;
        max: number;
        night: number;
        eve: number;
        morn: number;
    };
    feels_like: {
        day: number;
        night: number;
        eve: number;
        morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: WeatherCondition[];
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;
    uvi: number;
}

export interface HourlyWeather {
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: WeatherCondition[];
    pop: number;
    rain?: { '1h': number };
    snow?: { '1h': number };
}

export interface WeatherAlert {
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
}

export interface WeatherCondition {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface OneCallApiResponse {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number;
    current: CurrentWeather;
    hourly?: HourlyWeather[];
    daily: DailyWeather[];
    alerts?: WeatherAlert[];
}

export class WeatherServiceError extends Error {
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
