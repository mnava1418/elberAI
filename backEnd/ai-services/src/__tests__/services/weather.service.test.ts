import axios, { AxiosError } from 'axios'
import { fetchWeatherByCoordinates, normalizeWeatherResponse, geocodeLocation } from '../../services/weather.service'
import { OneCallApiResponse } from '../../models/weather.model'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

jest.mock('../../config/index.config', () => ({
  weather: { api_key: 'test-api-key' },
}))

// ─── Fixtures ────────────────────────────────────────────────────────────────

const BASE_UNIX = 1700000000 // 2023-11-14 22:13:20 UTC
const TZ = 'America/Mexico_City'

function makeOneCallResponse(overrides: Partial<OneCallApiResponse> = {}): OneCallApiResponse {
  return {
    lat: 19.4326,
    lon: -99.1332,
    timezone: TZ,
    timezone_offset: -21600,
    current: {
      dt: BASE_UNIX,
      sunrise: BASE_UNIX - 43200,
      sunset: BASE_UNIX + 7200,
      temp: 22.5,
      feels_like: 21.0,
      pressure: 1013,
      humidity: 60,
      dew_point: 14.0,
      uvi: 3.5,
      clouds: 20,
      visibility: 10000,
      wind_speed: 3.5,
      wind_deg: 90,
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    },
    hourly: Array.from({ length: 15 }, (_, i) => ({
      dt: BASE_UNIX + i * 3600,
      temp: 20 + i,
      feels_like: 19 + i,
      pressure: 1013,
      humidity: 55,
      dew_point: 12,
      uvi: 1,
      clouds: 10,
      visibility: 10000,
      wind_speed: 2,
      wind_deg: 180,
      pop: 0.1,
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    })),
    daily: Array.from({ length: 8 }, (_, i) => ({
      dt: BASE_UNIX + i * 86400,
      sunrise: BASE_UNIX + i * 86400 - 21600,
      sunset: BASE_UNIX + i * 86400 + 21600,
      moonrise: BASE_UNIX,
      moonset: BASE_UNIX,
      moon_phase: 0.5,
      summary: `Día ${i + 1} despejado`,
      temp: { day: 25, min: 15, max: 28, night: 16, eve: 22, morn: 18 },
      feels_like: { day: 24, night: 15, eve: 21, morn: 17 },
      pressure: 1013,
      humidity: 50,
      dew_point: 10,
      wind_speed: 4,
      wind_deg: 270,
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      clouds: 5,
      pop: 0.05,
      uvi: 5,
    })),
    ...overrides,
  }
}

function makeAxiosError(status: number): AxiosError {
  const err = new Error('Request failed') as AxiosError
  err.isAxiosError = true
  err.response = { status, data: { message: 'error' }, headers: {}, config: {} as any, statusText: '' }
  return err
}

// ─── fetchWeatherByCoordinates ────────────────────────────────────────────────

describe('fetchWeatherByCoordinates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(mockedAxios.isAxiosError as unknown as jest.Mock).mockReturnValue(true)
  })

  it('returns API data on success', async () => {
    const data = makeOneCallResponse()
    mockedAxios.get = jest.fn().mockResolvedValue({ data })

    const result = await fetchWeatherByCoordinates(19.4326, -99.1332)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/3.0/onecall',
      expect.objectContaining({
        params: expect.objectContaining({
          lat: 19.4326,
          lon: -99.1332,
          appid: 'test-api-key',
          units: 'metric',
          exclude: 'minutely,alerts',
        }),
      })
    )
    expect(result).toEqual(data)
  })

  it('throws when API key is not configured', async () => {
    jest.resetModules()
    jest.doMock('../../config/index.config', () => ({ weather: { api_key: undefined } }))

    const { fetchWeatherByCoordinates: fn } = await import('../../services/weather.service')
    await expect(fn(0, 0)).rejects.toThrow('OPENWEATHER_API_KEY is not configured')
  })

  it.each([
    [400, 'Bad request: invalid or missing coordinates'],
    [401, 'Unauthorized: invalid OpenWeather API key'],
    [404, 'Weather data not found for the given coordinates'],
    [429, 'Rate limit exceeded: too many requests to OpenWeather API'],
    [500, 'OpenWeather server error, please try again later'],
    [503, 'OpenWeather server error, please try again later'],
  ])('throws WeatherServiceError on HTTP %i', async (status, expectedMessage) => {
    mockedAxios.get = jest.fn().mockRejectedValue(makeAxiosError(status))

    await expect(fetchWeatherByCoordinates(0, 0)).rejects.toThrow(expectedMessage)
  })

  it('throws WeatherServiceError on unexpected axios error', async () => {
    const err = makeAxiosError(0)
    err.response = undefined
    mockedAxios.get = jest.fn().mockRejectedValue(err)

    await expect(fetchWeatherByCoordinates(0, 0)).rejects.toThrow('Unexpected error fetching weather data')
  })

  it('throws WeatherServiceError on non-axios error', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('network failure'))
    ;(mockedAxios.isAxiosError as unknown as jest.Mock).mockReturnValue(false)

    await expect(fetchWeatherByCoordinates(0, 0)).rejects.toThrow('An unexpected error occurred')
  })
})

// ─── normalizeWeatherResponse ─────────────────────────────────────────────────

describe('normalizeWeatherResponse', () => {
  it('passes timezone through', () => {
    const result = normalizeWeatherResponse(makeOneCallResponse())
    expect(result.timezone).toBe(TZ)
  })

  describe('current weather', () => {
    it('maps numeric fields correctly', () => {
      const raw = makeOneCallResponse()
      const { current } = normalizeWeatherResponse(raw)

      expect(current.temp).toBe(22.5)
      expect(current.feels_like).toBe(21.0)
      expect(current.humidity).toBe(60)
      expect(current.uvi).toBe(3.5)
      expect(current.wind_speed).toBe(3.5)
    })

    it('converts visibility from meters to km', () => {
      const raw = makeOneCallResponse()
      raw.current.visibility = 10000
      const { current } = normalizeWeatherResponse(raw)
      expect(current.visibility_km).toBe(10)
    })

    it('rounds visibility to one decimal', () => {
      const raw = makeOneCallResponse()
      raw.current.visibility = 8500
      const { current } = normalizeWeatherResponse(raw)
      expect(current.visibility_km).toBe(8.5)
    })

    it('maps condition and description from weather array', () => {
      const { current } = normalizeWeatherResponse(makeOneCallResponse())
      expect(current.condition).toBe('Clear')
      expect(current.description).toBe('clear sky')
    })

    it('returns empty strings when weather array is empty', () => {
      const raw = makeOneCallResponse()
      raw.current.weather = []
      const { current } = normalizeWeatherResponse(raw)
      expect(current.condition).toBe('')
      expect(current.description).toBe('')
    })

    it('includes wind_gust when present', () => {
      const raw = makeOneCallResponse()
      raw.current.wind_gust = 8.2
      const { current } = normalizeWeatherResponse(raw)
      expect(current.wind_gust).toBe(8.2)
    })

    it('omits wind_gust when absent', () => {
      const { current } = normalizeWeatherResponse(makeOneCallResponse())
      expect(current).not.toHaveProperty('wind_gust')
    })

    it('includes rain_1h when present', () => {
      const raw = makeOneCallResponse()
      raw.current.rain = { '1h': 2.5 }
      const { current } = normalizeWeatherResponse(raw)
      expect(current.rain_1h).toBe(2.5)
    })

    it('omits rain_1h when absent', () => {
      const { current } = normalizeWeatherResponse(makeOneCallResponse())
      expect(current).not.toHaveProperty('rain_1h')
    })

    it('includes snow_1h when present', () => {
      const raw = makeOneCallResponse()
      raw.current.snow = { '1h': 1.0 }
      const { current } = normalizeWeatherResponse(raw)
      expect(current.snow_1h).toBe(1.0)
    })

    it('returns formatted time strings', () => {
      const { current } = normalizeWeatherResponse(makeOneCallResponse())
      expect(typeof current.time).toBe('string')
      expect(typeof current.sunrise).toBe('string')
      expect(typeof current.sunset).toBe('string')
      expect(current.time.length).toBeGreaterThan(0)
    })
  })

  describe('wind direction (degreesToCardinal)', () => {
    const cases: [number, string][] = [
      [0, 'N'],
      [90, 'E'],
      [180, 'S'],
      [270, 'W'],
      [45, 'NE'],
      [135, 'SE'],
      [225, 'SW'],
      [315, 'NW'],
      [360, 'N'],
    ]

    it.each(cases)('%i° → %s', (deg, expected) => {
      const raw = makeOneCallResponse()
      raw.current.wind_deg = deg
      const { current } = normalizeWeatherResponse(raw)
      expect(current.wind_direction).toBe(expected)
    })
  })

  describe('hourly weather', () => {
    it('returns at most 12 entries', () => {
      const raw = makeOneCallResponse() // has 15 hourly entries
      const { hourly } = normalizeWeatherResponse(raw)
      expect(hourly).toHaveLength(12)
    })

    it('converts pop to percent', () => {
      const raw = makeOneCallResponse()
      raw.hourly![0].pop = 0.35
      const { hourly } = normalizeWeatherResponse(raw)
      expect(hourly[0].pop_percent).toBe(35)
    })

    it('rounds pop_percent', () => {
      const raw = makeOneCallResponse()
      raw.hourly![0].pop = 0.456
      const { hourly } = normalizeWeatherResponse(raw)
      expect(hourly[0].pop_percent).toBe(46)
    })

    it('maps numeric fields correctly', () => {
      const raw = makeOneCallResponse()
      raw.hourly![0].temp = 18.5
      raw.hourly![0].humidity = 75
      const { hourly } = normalizeWeatherResponse(raw)
      expect(hourly[0].temp).toBe(18.5)
      expect(hourly[0].humidity).toBe(75)
    })

    it('returns empty array when hourly is missing', () => {
      const raw = makeOneCallResponse({ hourly: undefined })
      const { hourly } = normalizeWeatherResponse(raw)
      expect(hourly).toEqual([])
    })

    it('includes rain_1h when present', () => {
      const raw = makeOneCallResponse()
      raw.hourly![0].rain = { '1h': 1.2 }
      const { hourly } = normalizeWeatherResponse(raw)
      expect(hourly[0].rain_1h).toBe(1.2)
    })

    it('omits rain_1h when absent', () => {
      const { hourly } = normalizeWeatherResponse(makeOneCallResponse())
      expect(hourly[0]).not.toHaveProperty('rain_1h')
    })
  })

  describe('daily weather', () => {
    it('returns at most 7 entries', () => {
      const raw = makeOneCallResponse() // has 8 daily entries
      const { daily } = normalizeWeatherResponse(raw)
      expect(daily).toHaveLength(7)
    })

    it('maps temp fields correctly', () => {
      const { daily } = normalizeWeatherResponse(makeOneCallResponse())
      expect(daily[0].temp_min).toBe(15)
      expect(daily[0].temp_max).toBe(28)
      expect(daily[0].temp_day).toBe(25)
      expect(daily[0].feels_like_day).toBe(24)
    })

    it('converts pop to percent', () => {
      const raw = makeOneCallResponse()
      raw.daily[0].pop = 0.8
      const { daily } = normalizeWeatherResponse(raw)
      expect(daily[0].pop_percent).toBe(80)
    })

    it('includes summary', () => {
      const { daily } = normalizeWeatherResponse(makeOneCallResponse())
      expect(daily[0].summary).toBe('Día 1 despejado')
    })

    it('includes rain when present', () => {
      const raw = makeOneCallResponse()
      raw.daily[0].rain = 5.0
      const { daily } = normalizeWeatherResponse(raw)
      expect(daily[0].rain).toBe(5.0)
    })

    it('omits rain when absent', () => {
      const { daily } = normalizeWeatherResponse(makeOneCallResponse())
      expect(daily[0]).not.toHaveProperty('rain')
    })

    it('includes snow when present', () => {
      const raw = makeOneCallResponse()
      raw.daily[0].snow = 3.0
      const { daily } = normalizeWeatherResponse(raw)
      expect(daily[0].snow).toBe(3.0)
    })

    it('returns formatted date strings', () => {
      const { daily } = normalizeWeatherResponse(makeOneCallResponse())
      expect(typeof daily[0].date).toBe('string')
      expect(typeof daily[0].sunrise).toBe('string')
      expect(typeof daily[0].sunset).toBe('string')
    })
  })
})

// ─── geocodeLocation ──────────────────────────────────────────────────────────

describe('geocodeLocation', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns geocoding result on success', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: [{ name: 'Monterrey', lat: 25.6866, lon: -100.3161, country: 'MX', state: 'Nuevo León' }],
    })

    const result = await geocodeLocation('Monterrey')

    expect(result).toEqual({ name: 'Monterrey', lat: 25.6866, lon: -100.3161, country: 'MX', state: 'Nuevo León' })
  })

  it('includes state when present', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: [{ name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'ES', state: 'Community of Madrid' }],
    })

    const result = await geocodeLocation('Madrid')
    expect(result.state).toBe('Community of Madrid')
  })

  it('omits state when absent', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: [{ name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' }],
    })

    const result = await geocodeLocation('Tokyo')
    expect(result).not.toHaveProperty('state')
  })

  it('calls the geocoding API with correct params', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: [{ name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' }],
    })

    await geocodeLocation('Paris')

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://api.openweathermap.org/geo/1.0/direct',
      expect.objectContaining({
        params: expect.objectContaining({ q: 'Paris', limit: 1, appid: 'test-api-key' }),
      })
    )
  })

  it('throws when location is not found (empty array)', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({ data: [] })
    await expect(geocodeLocation('XYZ_NOT_REAL')).rejects.toThrow('Location not found: XYZ_NOT_REAL')
  })

  it('throws when API key is not configured', async () => {
    jest.resetModules()
    jest.doMock('../../config/index.config', () => ({ weather: { api_key: undefined } }))

    const { geocodeLocation: fn } = await import('../../services/weather.service')
    await expect(fn('any')).rejects.toThrow('OPENWEATHER_API_KEY is not configured')
  })

  it('propagates axios errors', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('Network Error'))
    await expect(geocodeLocation('Madrid')).rejects.toThrow('Network Error')
  })
})
