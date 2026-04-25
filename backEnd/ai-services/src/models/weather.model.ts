interface CurrentWeather {
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

interface DailyWeather {
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

interface HourlyWeather {
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

interface WeatherAlert {
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
}

interface WeatherCondition {
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

export interface NormalizedCurrentWeather {
    time: string;
    sunrise: string;
    sunset: string;
    temp: number;
    feels_like: number;
    humidity: number;
    uvi: number;
    visibility_km: number;
    wind_speed: number;
    wind_direction: string;
    wind_gust?: number;
    condition: string;
    description: string;
    rain_1h?: number;
    snow_1h?: number;
}

export interface NormalizedHourlyWeather {
    time: string;
    temp: number;
    feels_like: number;
    humidity: number;
    pop_percent: number;
    wind_speed: number;
    wind_direction: string;
    condition: string;
    description: string;
    rain_1h?: number;
    snow_1h?: number;
}

export interface NormalizedDailyWeather {
    date: string;
    summary: string;
    temp_min: number;
    temp_max: number;
    temp_day: number;
    feels_like_day: number;
    humidity: number;
    pop_percent: number;
    wind_speed: number;
    wind_direction: string;
    condition: string;
    description: string;
    sunrise: string;
    sunset: string;
    uvi: number;
    rain?: number;
    snow?: number;
}

export interface NormalizedWeatherResponse {
    timezone: string;
    current: NormalizedCurrentWeather;
    hourly: NormalizedHourlyWeather[];
    daily: NormalizedDailyWeather[];
}

export interface GeocodingResult {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}