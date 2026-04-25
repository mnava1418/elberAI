import axios, { AxiosError } from 'axios';
import { weather } from '../config/index.config';
import {
    OneCallApiResponse,
    NormalizedWeatherResponse,
    NormalizedCurrentWeather,
    NormalizedHourlyWeather,
    NormalizedDailyWeather,
    GeocodingResult
} from '../models/weather.model';

const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const GEOCODING_URL = 'http://api.openweathermap.org/geo/1.0/direct';

interface GeocodingRawResult {
    name: string;
    local_names?: Record<string, string>;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}

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

const CARDINAL_DIRECTIONS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

function degreesToCardinal(deg: number): string {
    return CARDINAL_DIRECTIONS[Math.round(deg / 22.5) % 16];
}

function unixToTime(unix: number, timezone: string): string {
    return new Intl.DateTimeFormat('es-MX', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(new Date(unix * 1000));
}

function unixToDateTime(unix: number, timezone: string): string {
    return new Intl.DateTimeFormat('es-MX', {
        timeZone: timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(new Date(unix * 1000));
}

function unixToDate(unix: number, timezone: string): string {
    return new Intl.DateTimeFormat('es-MX', {
        timeZone: timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    }).format(new Date(unix * 1000));
}

function normalizeCurrentWeather(c: OneCallApiResponse['current'], tz: string): NormalizedCurrentWeather {
    return {
        time: unixToDateTime(c.dt, tz),
        sunrise: unixToTime(c.sunrise, tz),
        sunset: unixToTime(c.sunset, tz),
        temp: c.temp,
        feels_like: c.feels_like,
        humidity: c.humidity,
        uvi: c.uvi,
        visibility_km: Math.round(c.visibility / 100) / 10,
        wind_speed: c.wind_speed,
        wind_direction: degreesToCardinal(c.wind_deg),
        ...(c.wind_gust !== undefined && { wind_gust: c.wind_gust }),
        condition: c.weather[0]?.main ?? '',
        description: c.weather[0]?.description ?? '',
        ...(c.rain?.['1h'] !== undefined && { rain_1h: c.rain['1h'] }),
        ...(c.snow?.['1h'] !== undefined && { snow_1h: c.snow['1h'] }),
    };
}

function normalizeHourlyWeather(h: NonNullable<OneCallApiResponse['hourly']>[number], tz: string): NormalizedHourlyWeather {
    return {
        time: unixToTime(h.dt, tz),
        temp: h.temp,
        feels_like: h.feels_like,
        humidity: h.humidity,
        pop_percent: Math.round(h.pop * 100),
        wind_speed: h.wind_speed,
        wind_direction: degreesToCardinal(h.wind_deg),
        condition: h.weather[0]?.main ?? '',
        description: h.weather[0]?.description ?? '',
        ...(h.rain?.['1h'] !== undefined && { rain_1h: h.rain['1h'] }),
        ...(h.snow?.['1h'] !== undefined && { snow_1h: h.snow['1h'] }),
    };
}

function normalizeDailyWeather(d: OneCallApiResponse['daily'][number], tz: string): NormalizedDailyWeather {
    return {
        date: unixToDate(d.dt, tz),
        summary: d.summary,
        temp_min: d.temp.min,
        temp_max: d.temp.max,
        temp_day: d.temp.day,
        feels_like_day: d.feels_like.day,
        humidity: d.humidity,
        pop_percent: Math.round(d.pop * 100),
        wind_speed: d.wind_speed,
        wind_direction: degreesToCardinal(d.wind_deg),
        condition: d.weather[0]?.main ?? '',
        description: d.weather[0]?.description ?? '',
        sunrise: unixToTime(d.sunrise, tz),
        sunset: unixToTime(d.sunset, tz),
        uvi: d.uvi,
        ...(d.rain !== undefined && { rain: d.rain }),
        ...(d.snow !== undefined && { snow: d.snow }),
    };
}

export function normalizeWeatherResponse(data: OneCallApiResponse): NormalizedWeatherResponse {
    const { timezone, current, hourly, daily } = data;

    return {
        timezone,
        current: normalizeCurrentWeather(current, timezone),
        hourly: (hourly ?? []).slice(0, 12).map(h => normalizeHourlyWeather(h, timezone)),
        daily: daily.slice(0, 7).map(d => normalizeDailyWeather(d, timezone))
    };
}

export async function geocodeLocation(query: string): Promise<GeocodingResult> {
    const apiKey = weather.api_key;

    if (!apiKey) {
        throw new WeatherServiceError('OPENWEATHER_API_KEY is not configured');
    }

    const response = await axios.get<GeocodingRawResult[]>(GEOCODING_URL, {
        params: { q: query, limit: 1, appid: apiKey }
    });

    if (!response.data || response.data.length === 0) {
        throw new WeatherServiceError(`Location not found: ${query}`, 404);
    }

    const { name, lat, lon, country, state } = response.data[0];

    return { name, lat, lon, country, ...(state && { state }) };
}
