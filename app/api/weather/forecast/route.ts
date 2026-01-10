import { NextRequest, NextResponse } from 'next/server';
import {
  DailyForecast,
  OpenWeatherMapForecastResponse,
  mapWeatherCode,
  WEATHER_ICONS,
  WEATHER_CONDITION_KO,
} from '@/types/weather';

/**
 * Server-side Memory Cache
 * TTL: 30분 (예보 데이터는 자주 변경되지 않음)
 */
interface CacheEntry {
  data: DailyForecast[];
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30분

/**
 * 요일 변환 헬퍼
 */
function getDayOfWeek(dateString: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

/**
 * 날짜별로 예보 데이터를 그룹화하고 일 최고/최저 계산
 */
function processForecastData(apiData: OpenWeatherMapForecastResponse): DailyForecast[] {
  const dailyMap = new Map<string, {
    temps: number[];
    conditions: Array<{ id: number; desc: string; count: number }>;
    precipitation: number[];
    humidity: number[];
    windSpeed: number[];
  }>();

  // 3시간 단위 데이터를 날짜별로 그룹화
  apiData.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        temps: [],
        conditions: [],
        precipitation: [],
        humidity: [],
        windSpeed: [],
      });
    }

    const dayData = dailyMap.get(date)!;
    dayData.temps.push(item.main.temp);
    dayData.precipitation.push(item.pop * 100); // 0-1 → 0-100%
    dayData.humidity.push(item.main.humidity);
    dayData.windSpeed.push(item.wind.speed);

    // 날씨 상태 카운팅 (가장 빈번한 상태 선택)
    const existingCondition = dayData.conditions.find(c => c.id === item.weather[0].id);
    if (existingCondition) {
      existingCondition.count++;
    } else {
      dayData.conditions.push({
        id: item.weather[0].id,
        desc: item.weather[0].description,
        count: 1,
      });
    }
  });

  // 일별 예보로 변환
  const forecasts: DailyForecast[] = [];

  dailyMap.forEach((dayData, date) => {
    // 가장 빈번한 날씨 상태 선택
    const mostFrequentCondition = dayData.conditions.sort((a, b) => b.count - a.count)[0];
    const conditionCode = mapWeatherCode(mostFrequentCondition.id);

    forecasts.push({
      date,
      dayOfWeek: getDayOfWeek(date),
      tempMax: Math.round(Math.max(...dayData.temps)),
      tempMin: Math.round(Math.min(...dayData.temps)),
      condition: mostFrequentCondition.desc || WEATHER_CONDITION_KO[conditionCode],
      conditionCode,
      icon: WEATHER_ICONS[conditionCode],
      precipitation: Math.round(Math.max(...dayData.precipitation)),
      humidity: Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length),
      windSpeed: Math.round((dayData.windSpeed.reduce((a, b) => a + b, 0) / dayData.windSpeed.length) * 10) / 10,
    });
  });

  // 날짜순 정렬 및 최대 5일만 반환
  return forecasts
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
}

/**
 * GET /api/weather/forecast
 * 다낭의 5일 일기예보 정보를 반환
 *
 * @returns DailyForecast[] 배열 또는 에러
 */
export async function GET(request: NextRequest) {
  try {
    const now = Date.now();

    // 캐시 확인
    if (cache && (now - cache.timestamp) < CACHE_TTL) {
      console.log('[Weather API] ✅ Cache HIT - Forecast');
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true,
        cacheAge: Math.floor((now - cache.timestamp) / 1000), // 초 단위
      });
    }

    // 환경 변수 확인
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const lat = process.env.NEXT_PUBLIC_DANANG_LAT || '16.0544';
    const lon = process.env.NEXT_PUBLIC_DANANG_LON || '108.2022';

    if (!apiKey) {
      console.error('[Weather API] ❌ API key not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Weather API key not configured',
          message: 'OPENWEATHERMAP_API_KEY 환경 변수가 설정되지 않았습니다.',
        },
        { status: 500 }
      );
    }

    // OpenWeatherMap API 호출
    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.append('lat', lat);
    url.searchParams.append('lon', lon);
    url.searchParams.append('appid', apiKey);
    url.searchParams.append('units', 'metric'); // 섭씨
    url.searchParams.append('lang', 'kr'); // 한국어

    console.log('[Weather API] 🌐 Fetching 5-day forecast from OpenWeatherMap...');

    const response = await fetch(url.toString(), {
      next: { revalidate: 1800 }, // Next.js 캐시: 30분
    });

    if (!response.ok) {
      console.error(`[Weather API] ❌ API error: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch forecast data',
          message: `OpenWeatherMap API 오류: ${response.statusText}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const apiData: OpenWeatherMapForecastResponse = await response.json();

    // 데이터 변환
    const forecastData = processForecastData(apiData);

    // 캐시 저장
    cache = {
      data: forecastData,
      timestamp: now,
    };

    console.log('[Weather API] ✅ Forecast fetched successfully');
    console.log(`[Weather API] 📊 ${forecastData.length} days forecast`);

    return NextResponse.json({
      success: true,
      data: forecastData,
      cached: false,
    });

  } catch (error) {
    console.error('[Weather API] ❌ Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
