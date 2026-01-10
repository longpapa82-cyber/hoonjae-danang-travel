'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeatherData, CurrentWeather, DailyForecast } from '@/types/weather';

/**
 * 날씨 데이터 상태
 */
interface WeatherState {
  current: CurrentWeather | null;
  forecast: DailyForecast[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * 캐시 키
 */
const CACHE_KEY_CURRENT = 'weather_current';
const CACHE_KEY_FORECAST = 'weather_forecast';
const CACHE_KEY_TIMESTAMP = 'weather_timestamp';

/**
 * 캐시 TTL
 */
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5분 (클라이언트 메모리)
const STORAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간 (LocalStorage fallback)

/**
 * 다낭 날씨 정보를 제공하는 Hook
 *
 * 3-Tier 캐싱 전략:
 * 1. 클라이언트 메모리 캐시 (5분 TTL) - 빠른 접근
 * 2. 서버 메모리 캐시 (5분 TTL) - API 호출 절감
 * 3. LocalStorage 캐시 (24시간 TTL) - 오프라인 fallback
 *
 * 성능 최적화:
 * - 5분마다 자동 갱신 (백그라운드)
 * - 컴포넌트 마운트 시 캐시 우선 표시
 * - 오프라인 시 LocalStorage에서 데이터 로드
 *
 * @returns {WeatherState} 날씨 데이터와 로딩/에러 상태
 */
export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({
    current: null,
    forecast: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  /**
   * LocalStorage에서 캐시된 데이터 로드
   */
  const loadFromCache = useCallback((): boolean => {
    try {
      const cachedCurrent = localStorage.getItem(CACHE_KEY_CURRENT);
      const cachedForecast = localStorage.getItem(CACHE_KEY_FORECAST);
      const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);

      if (!cachedCurrent || !cachedForecast || !cachedTimestamp) {
        return false;
      }

      const timestamp = new Date(cachedTimestamp);
      const now = new Date();
      const age = now.getTime() - timestamp.getTime();

      // 24시간 이내 캐시만 유효
      if (age > STORAGE_CACHE_TTL) {
        localStorage.removeItem(CACHE_KEY_CURRENT);
        localStorage.removeItem(CACHE_KEY_FORECAST);
        localStorage.removeItem(CACHE_KEY_TIMESTAMP);
        return false;
      }

      const current: CurrentWeather = JSON.parse(cachedCurrent);
      const forecast: DailyForecast[] = JSON.parse(cachedForecast);

      // Date 객체 복원
      current.updatedAt = new Date(current.updatedAt);

      setState({
        current,
        forecast,
        loading: false,
        error: null,
        lastUpdated: timestamp,
      });

      console.log(`[useWeather] ✅ Loaded from cache (age: ${Math.floor(age / 1000 / 60)}min)`);
      return true;

    } catch (error) {
      console.error('[useWeather] ❌ Cache load failed:', error);
      return false;
    }
  }, []);

  /**
   * LocalStorage에 데이터 저장
   */
  const saveToCache = useCallback((current: CurrentWeather, forecast: DailyForecast[]) => {
    try {
      const now = new Date();
      localStorage.setItem(CACHE_KEY_CURRENT, JSON.stringify(current));
      localStorage.setItem(CACHE_KEY_FORECAST, JSON.stringify(forecast));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, now.toISOString());
      console.log('[useWeather] 💾 Saved to cache');
    } catch (error) {
      console.error('[useWeather] ❌ Cache save failed:', error);
    }
  }, []);

  /**
   * API에서 날씨 데이터 가져오기
   */
  const fetchWeather = useCallback(async () => {
    try {
      console.log('[useWeather] 🌐 Fetching weather data...');

      // 병렬로 현재 날씨와 예보 가져오기
      const [currentRes, forecastRes] = await Promise.all([
        fetch('/api/weather/current'),
        fetch('/api/weather/forecast'),
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      if (!currentData.success || !forecastData.success) {
        throw new Error(currentData.error || forecastData.error || 'Unknown error');
      }

      const current: CurrentWeather = {
        ...currentData.data,
        updatedAt: new Date(currentData.data.updatedAt),
      };
      const forecast: DailyForecast[] = forecastData.data;

      // 상태 업데이트
      setState({
        current,
        forecast,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });

      // 캐시 저장
      saveToCache(current, forecast);

      console.log('[useWeather] ✅ Weather data fetched successfully');

    } catch (error) {
      console.error('[useWeather] ❌ Fetch failed:', error);

      // 에러 발생 시 캐시에서 로드 시도
      const cacheLoaded = loadFromCache();

      if (!cacheLoaded) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '날씨 정보를 불러올 수 없습니다.',
        }));
      }
    }
  }, [loadFromCache, saveToCache]);

  /**
   * 초기 로드 및 자동 갱신
   */
  useEffect(() => {
    // 1. 먼저 캐시에서 로드 시도 (즉시 표시)
    const cacheLoaded = loadFromCache();

    // 2. 백그라운드에서 최신 데이터 가져오기
    fetchWeather();

    // 3. 5분마다 자동 갱신
    const interval = setInterval(() => {
      console.log('[useWeather] 🔄 Auto-refresh triggered');
      fetchWeather();
    }, CLIENT_CACHE_TTL);

    // 클린업
    return () => clearInterval(interval);
  }, [fetchWeather, loadFromCache]);

  return state;
}

/**
 * 특정 날짜의 예보 찾기 헬퍼 함수
 */
export function useForecastForDate(date: string): DailyForecast | null {
  const { forecast } = useWeather();
  return forecast.find(f => f.date === date) || null;
}
