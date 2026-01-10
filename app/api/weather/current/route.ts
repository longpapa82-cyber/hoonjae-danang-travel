import { NextRequest, NextResponse } from 'next/server';
import {
  CurrentWeather,
  OpenWeatherMapCurrentResponse,
  mapWeatherCode,
  WEATHER_ICONS,
  WEATHER_CONDITION_KO,
} from '@/types/weather';

/**
 * Server-side Memory Cache
 * TTL: 5분 (현재 날씨는 자주 변경될 수 있음)
 */
interface CacheEntry {
  data: CurrentWeather;
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * GET /api/weather/current
 * 다낭의 현재 날씨 정보를 반환
 *
 * @returns CurrentWeather 객체 또는 에러
 */
export async function GET(request: NextRequest) {
  try {
    const now = Date.now();

    // 캐시 확인
    if (cache && (now - cache.timestamp) < CACHE_TTL) {
      console.log('[Weather API] ✅ Cache HIT - Current weather');
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
      console.error('[Weather API] 🔍 Available env keys:', Object.keys(process.env).filter(k => k.includes('WEATHER') || k.includes('DANANG') || k.includes('VERCEL_ENV')));
      return NextResponse.json(
        {
          success: false,
          error: 'Weather API key not configured',
          message: 'OPENWEATHERMAP_API_KEY 환경 변수가 설정되지 않았습니다.',
          debug: {
            env: process.env.VERCEL_ENV,
            hasPublicLat: !!process.env.NEXT_PUBLIC_DANANG_LAT,
            hasPublicLon: !!process.env.NEXT_PUBLIC_DANANG_LON,
            allWeatherKeys: Object.keys(process.env).filter(k => k.includes('WEATHER')),
          },
        },
        { status: 500 }
      );
    }

    // OpenWeatherMap API 호출
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.append('lat', lat);
    url.searchParams.append('lon', lon);
    url.searchParams.append('appid', apiKey);
    url.searchParams.append('units', 'metric'); // 섭씨
    url.searchParams.append('lang', 'kr'); // 한국어

    console.log('[Weather API] 🌐 Fetching current weather from OpenWeatherMap...');

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Next.js 캐시: 5분
    });

    if (!response.ok) {
      console.error(`[Weather API] ❌ API error: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch weather data',
          message: `OpenWeatherMap API 오류: ${response.statusText}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const apiData: OpenWeatherMapCurrentResponse = await response.json();

    // 데이터 변환
    const weatherId = apiData.weather[0]?.id || 0;
    const conditionCode = mapWeatherCode(weatherId);

    const currentWeather: CurrentWeather = {
      temp: Math.round(apiData.main.temp),
      feelsLike: Math.round(apiData.main.feels_like),
      condition: apiData.weather[0]?.description || WEATHER_CONDITION_KO[conditionCode],
      conditionCode,
      icon: WEATHER_ICONS[conditionCode],
      humidity: apiData.main.humidity,
      windSpeed: Math.round(apiData.wind.speed * 10) / 10, // 소수점 1자리
      updatedAt: new Date(apiData.dt * 1000),
    };

    // 캐시 저장
    cache = {
      data: currentWeather,
      timestamp: now,
    };

    console.log('[Weather API] ✅ Current weather fetched successfully');
    console.log(`[Weather API] 📊 ${currentWeather.temp}°C, ${currentWeather.condition}`);

    return NextResponse.json({
      success: true,
      data: currentWeather,
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
