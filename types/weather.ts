/**
 * Weather Feature Type Definitions
 * OpenWeatherMap API 응답 데이터 구조
 */

/**
 * 날씨 상태 코드 타입
 * OpenWeatherMap Condition Codes: https://openweathermap.org/weather-conditions
 */
export type WeatherConditionCode =
  | 'clear'           // 맑음 (800)
  | 'few-clouds'      // 구름 조금 (801)
  | 'clouds'          // 흐림 (802-804)
  | 'rain'            // 비 (500-531)
  | 'drizzle'         // 이슬비 (300-321)
  | 'thunderstorm'    // 천둥번개 (200-232)
  | 'snow'            // 눈 (600-622)
  | 'mist'            // 안개 (701-781)
  | 'unknown';        // 알 수 없음

/**
 * 현재 날씨 정보
 */
export interface CurrentWeather {
  /** 현재 온도 (섭씨) */
  temp: number;
  /** 체감 온도 (섭씨) */
  feelsLike: number;
  /** 날씨 상태 (한국어) */
  condition: string;
  /** 날씨 상태 코드 */
  conditionCode: WeatherConditionCode;
  /** 날씨 아이콘 이모지 */
  icon: string;
  /** 습도 (%) */
  humidity: number;
  /** 풍속 (m/s) */
  windSpeed: number;
  /** 강수 확률 (%) - forecast에서만 사용 */
  precipitation?: number;
  /** 데이터 업데이트 시각 */
  updatedAt: Date;
}

/**
 * 일별 예보 정보
 */
export interface DailyForecast {
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 요일 (월, 화, 수...) */
  dayOfWeek: string;
  /** 최고 온도 (섭씨) */
  tempMax: number;
  /** 최저 온도 (섭씨) */
  tempMin: number;
  /** 날씨 상태 (한국어) */
  condition: string;
  /** 날씨 상태 코드 */
  conditionCode: WeatherConditionCode;
  /** 날씨 아이콘 이모지 */
  icon: string;
  /** 강수 확률 (%) */
  precipitation: number;
  /** 습도 (%) */
  humidity: number;
  /** 풍속 (m/s) */
  windSpeed: number;
}

/**
 * 통합 날씨 데이터
 */
export interface WeatherData {
  /** 현재 날씨 */
  current: CurrentWeather;
  /** 5일 예보 */
  forecast: DailyForecast[];
}

/**
 * 날씨 API 에러 정보
 */
export interface WeatherError {
  /** 에러 메시지 */
  message: string;
  /** HTTP 상태 코드 */
  statusCode?: number;
  /** 에러 발생 시각 */
  timestamp: Date;
}

/**
 * OpenWeatherMap API 응답 타입 (Current Weather)
 * https://openweathermap.org/current
 */
export interface OpenWeatherMapCurrentResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

/**
 * OpenWeatherMap API 응답 타입 (5 Day Forecast)
 * https://openweathermap.org/forecast5
 */
export interface OpenWeatherMapForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number; // Probability of precipitation
    rain?: {
      '3h': number;
    };
    snow?: {
      '3h': number;
    };
    sys: {
      pod: string; // Part of day (d = day, n = night)
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

/**
 * 캐시된 날씨 데이터
 */
export interface CachedWeatherData {
  /** 날씨 데이터 */
  data: WeatherData;
  /** 캐시 저장 시각 */
  cachedAt: Date;
  /** TTL (밀리초) */
  ttl: number;
}

/**
 * 날씨 아이콘 맵핑
 */
export const WEATHER_ICONS: Record<WeatherConditionCode, string> = {
  'clear': '☀️',
  'few-clouds': '🌤️',
  'clouds': '☁️',
  'rain': '🌧️',
  'drizzle': '🌦️',
  'thunderstorm': '⛈️',
  'snow': '🌨️',
  'mist': '🌫️',
  'unknown': '❓',
};

/**
 * OpenWeatherMap 날씨 코드를 내부 상태 코드로 변환
 */
export function mapWeatherCode(weatherId: number): WeatherConditionCode {
  if (weatherId === 800) return 'clear';
  if (weatherId === 801) return 'few-clouds';
  if (weatherId >= 802 && weatherId <= 804) return 'clouds';
  if (weatherId >= 500 && weatherId <= 531) return 'rain';
  if (weatherId >= 300 && weatherId <= 321) return 'drizzle';
  if (weatherId >= 200 && weatherId <= 232) return 'thunderstorm';
  if (weatherId >= 600 && weatherId <= 622) return 'snow';
  if (weatherId >= 701 && weatherId <= 781) return 'mist';
  return 'unknown';
}

/**
 * 날씨 상태 코드의 한국어 번역
 */
export const WEATHER_CONDITION_KO: Record<WeatherConditionCode, string> = {
  'clear': '맑음',
  'few-clouds': '구름 조금',
  'clouds': '흐림',
  'rain': '비',
  'drizzle': '이슬비',
  'thunderstorm': '천둥번개',
  'snow': '눈',
  'mist': '안개',
  'unknown': '알 수 없음',
};
