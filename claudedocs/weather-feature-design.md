# 날씨 정보 기능 설계 - 다낭 여행 트래커

**작성일**: 2026-01-10
**설계 목적**: 베트남 다낭 여행 앱에 실시간 날씨 정보 통합
**설계 방법론**: SuperClaude /sc:design

---

## 📋 목차

1. [요구사항 분석](#요구사항-분석)
2. [API 선택 및 근거](#api-선택-및-근거)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [데이터 구조 설계](#데이터-구조-설계)
5. [UI/UX 설계](#uiux-설계)
6. [캐싱 전략](#캐싱-전략)
7. [에러 핸들링](#에러-핸들링)
8. [접근성 설계](#접근성-설계)
9. [성능 최적화](#성능-최적화)
10. [구현 로드맵](#구현-로드맵)

---

## 요구사항 분석

### 기능 요구사항

| 우선순위 | 요구사항 | 상세 설명 |
|---------|---------|---------|
| **P0** | 실시간 날씨 정보 | 다낭 현지의 현재 온도, 날씨 상태, 체감온도 |
| **P0** | 일별 날씨 예보 | 여행 기간(1.15-1.19) 동안의 5일 예보 |
| **P1** | 일정 통합 날씨 | 각 일정별 예상 날씨 표시 |
| **P1** | 시간별 예보 | 당일 3시간 단위 날씨 변화 |
| **P2** | 날씨 알림 | 악천후 시 알림 (선택사항) |
| **P2** | 강수 확률 | 우산 필요 여부 판단 |

### 비기능 요구사항

| 항목 | 목표 | 현재 상태 |
|------|------|----------|
| **성능** | Lighthouse Performance 78+ 유지 | 78/100 |
| **접근성** | Lighthouse Accessibility 95+ 유지 | 95/100 |
| **모바일 우선** | 375px-430px 최적화 | ✅ 적용 중 |
| **오프라인** | 마지막 데이터 캐싱 | 미구현 |
| **응답 시간** | API 호출 < 2초 | - |
| **데이터 사용량** | 1일 < 1MB | - |

---

## API 선택 및 근거

### 후보 API 비교

| API | 무료 한도 | 응답 속도 | 데이터 품질 | 한국어 지원 | 추천도 |
|-----|----------|----------|------------|------------|--------|
| **OpenWeatherMap** | 60 calls/min, 1000 calls/day | 중간 | 높음 | ✅ | ⭐⭐⭐⭐⭐ |
| WeatherAPI.com | 1M calls/month | 빠름 | 중간 | ✅ | ⭐⭐⭐⭐ |
| Visual Crossing | 1000 calls/day | 느림 | 매우 높음 | ❌ | ⭐⭐⭐ |
| AccuWeather | 50 calls/day | 빠름 | 높음 | ✅ | ⭐⭐⭐ |

### 최종 선택: OpenWeatherMap

**선택 근거:**

1. **무료 한도 충분성**
   - 1일 1000회 ≈ 사용자 100명 × 하루 10회 호출
   - 여행 기간(5일) 동안 충분한 여유

2. **한국어 지원**
   - 날씨 상태 한국어 제공 ("맑음", "흐림", "비" 등)
   - 사용자 경험 향상

3. **풍부한 데이터**
   - 5일/3시간 단위 예보
   - UV Index, 체감온도, 습도 등 제공

4. **Next.js 통합성**
   - API Routes에서 안전하게 호출 가능
   - 환경 변수로 API 키 보호

5. **커뮤니티 지원**
   - 방대한 문서 및 사례
   - React/Next.js 예제 풍부

**API 엔드포인트:**

```typescript
// 현재 날씨
GET https://api.openweathermap.org/data/2.5/weather
  ?lat=16.0544&lon=108.2022&appid={API_KEY}&units=metric&lang=kr

// 5일 예보 (3시간 단위)
GET https://api.openweathermap.org/data/2.5/forecast
  ?lat=16.0544&lon=108.2022&appid={API_KEY}&units=metric&lang=kr
```

**다낭 좌표:**
- 위도: 16.0544
- 경도: 108.2022

---

## 시스템 아키텍처

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  HomePage    │  │  MapPage     │  │SchedulePage  │      │
│  │              │  │              │  │              │      │
│  │ WeatherCard  │  │ WeatherCard  │  │ DayWeather   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │ useWeather()    │  Custom Hook          │
│                  │ - fetch data    │                       │
│                  │ - cache control │                       │
│                  │ - error handle  │                       │
│                  └────────┬────────┘                       │
└───────────────────────────┼────────────────────────────────┘
                            │ fetch('/api/weather')
┌───────────────────────────▼────────────────────────────────┐
│               Next.js API Routes (Server)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/weather/current                                 │  │
│  │  - Fetch from OpenWeatherMap                          │  │
│  │  - Transform data                                     │  │
│  │  - Cache in memory (5min TTL)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/weather/forecast                                │  │
│  │  - Fetch 5-day forecast                               │  │
│  │  - Group by day                                       │  │
│  │  - Cache in memory (30min TTL)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼────────────────────────────────┐
│              OpenWeatherMap API                             │
│  - Current Weather API                                      │
│  - 5 Day / 3 Hour Forecast API                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  LocalStorage (Client)                       │
│  - Last successful weather data                             │
│  - Timestamp for cache invalidation                         │
│  - Fallback for offline mode                                │
└─────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

1. **초기 로드** (페이지 방문)
   ```
   Component → useWeather() → localStorage 확인
   └─ 캐시 유효? → Yes: 캐시 사용 → UI 렌더
                → No: API 호출 → 캐시 저장 → UI 렌더
   ```

2. **주기적 업데이트** (5분마다)
   ```
   setInterval(5min) → API 호출 → 캐시 갱신 → UI 업데이트
   ```

3. **오프라인 모드**
   ```
   API 실패 → localStorage fallback → 마지막 데이터 + 경고 표시
   ```

---

## 데이터 구조 설계

### TypeScript 타입 정의

```typescript
// types/weather.ts

/**
 * OpenWeatherMap API 응답 타입 (현재 날씨)
 */
export interface OpenWeatherCurrentResponse {
  weather: Array<{
    id: number;
    main: string;        // "Clear", "Rain", etc.
    description: string; // "맑은 하늘"
    icon: string;        // "01d"
  }>;
  main: {
    temp: number;        // 온도 (°C)
    feels_like: number;  // 체감온도 (°C)
    temp_min: number;
    temp_max: number;
    pressure: number;    // 기압 (hPa)
    humidity: number;    // 습도 (%)
  };
  wind: {
    speed: number;       // 풍속 (m/s)
    deg: number;         // 풍향 (도)
  };
  clouds: {
    all: number;         // 구름양 (%)
  };
  dt: number;            // Unix timestamp
  sys: {
    sunrise: number;
    sunset: number;
  };
  timezone: number;      // UTC 오프셋 (초)
  name: string;          // "Da Nang"
}

/**
 * OpenWeatherMap API 응답 타입 (예보)
 */
export interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: { all: number };
    wind: { speed: number };
    pop: number;         // 강수 확률 (0-1)
    dt_txt: string;      // "2026-01-15 12:00:00"
  }>;
  city: {
    name: string;
    country: string;
    timezone: number;
  };
}

/**
 * 앱에서 사용할 정규화된 날씨 데이터
 */
export interface WeatherData {
  current: {
    temp: number;              // 온도 (°C)
    feelsLike: number;         // 체감온도
    condition: string;         // "맑음", "흐림", "비"
    conditionCode: string;     // "Clear", "Rain"
    icon: string;              // "01d"
    humidity: number;          // 습도 (%)
    windSpeed: number;         // 풍속 (m/s)
    pressure: number;          // 기압 (hPa)
    sunrise: Date;
    sunset: Date;
    updatedAt: Date;
  };
  forecast: DailyForecast[];
  hourly?: HourlyForecast[];   // 당일 시간별 (선택)
}

export interface DailyForecast {
  date: string;                // "2026-01-15"
  dayOfWeek: string;           // "목"
  temp: {
    min: number;
    max: number;
    avg: number;
  };
  condition: string;           // "맑음"
  conditionCode: string;       // "Clear"
  icon: string;                // "01d"
  precipitation: number;       // 강수 확률 (0-100)
  humidity: number;
  windSpeed: number;
}

export interface HourlyForecast {
  time: string;                // "09:00"
  temp: number;
  condition: string;
  icon: string;
  precipitation: number;
}

/**
 * 캐시 데이터 구조
 */
export interface WeatherCache {
  data: WeatherData;
  timestamp: number;           // Unix timestamp
  expiresAt: number;
}
```

### 날씨 아이콘 매핑

```typescript
// lib/weatherIcons.ts

export const WEATHER_ICONS = {
  // OpenWeatherMap icon code → Emoji
  '01d': '☀️',  // 맑음 (낮)
  '01n': '🌙',  // 맑음 (밤)
  '02d': '⛅',  // 구름 조금 (낮)
  '02n': '☁️',  // 구름 조금 (밤)
  '03d': '☁️',  // 구름 많음
  '03n': '☁️',
  '04d': '☁️',  // 흐림
  '04n': '☁️',
  '09d': '🌧️', // 소나기
  '09n': '🌧️',
  '10d': '🌦️', // 비
  '10n': '🌧️',
  '11d': '⛈️',  // 뇌우
  '11n': '⛈️',
  '13d': '🌨️',  // 눈
  '13n': '🌨️',
  '50d': '🌫️',  // 안개
  '50n': '🌫️',
} as const;

export const getWeatherEmoji = (iconCode: string): string => {
  return WEATHER_ICONS[iconCode as keyof typeof WEATHER_ICONS] || '☀️';
};

export const getWeatherColor = (condition: string): string => {
  const colors = {
    Clear: 'bg-yellow-100 text-yellow-800',
    Clouds: 'bg-gray-100 text-gray-800',
    Rain: 'bg-blue-100 text-blue-800',
    Thunderstorm: 'bg-purple-100 text-purple-800',
    Snow: 'bg-cyan-100 text-cyan-800',
    Mist: 'bg-gray-200 text-gray-600',
  };
  return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};
```

---

## UI/UX 설계

### 1. 홈페이지 날씨 카드

**위치**: HomePage 상단 (CurrentLocationCard 위)

**디자인 스펙:**

```tsx
<WeatherCard>
  ┌─────────────────────────────────────────┐
  │  🌤️ 다낭 현재 날씨                       │
  │  ────────────────────────────────────   │
  │                                         │
  │  ☀️ 맑음                28°C            │
  │     체감 30°C                            │
  │                                         │
  │  습도 75% · 바람 2.5m/s                  │
  │                                         │
  │  ⏰ 마지막 업데이트: 2분 전               │
  └─────────────────────────────────────────┘
</WeatherCard>
```

**Tailwind CSS 클래스:**
- 카드: `bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900`
- 온도: `text-4xl font-bold`
- 아이콘: `text-6xl` (emoji)

### 2. 5일 예보 카드

**위치**: HomePage or SchedulePage

**레이아웃: 가로 스크롤 (모바일 최적화)**

```tsx
<ForecastStrip>
  ┌─────┬─────┬─────┬─────┬─────┐
  │ 목  │ 금  │ 토  │ 일  │ 월  │
  │ 1/15│ 1/16│ 1/17│ 1/18│ 1/19│
  │     │     │     │     │     │
  │ ☀️  │ ⛅  │ 🌧️ │ ☁️  │ ☀️  │
  │     │     │     │     │     │
  │ 28° │ 27° │ 24° │ 25° │ 29° │
  │ 22° │ 21° │ 20° │ 21° │ 23° │
  │     │     │     │     │     │
  │ 💧5%│ 10% │ 60% │ 30% │ 5%  │
  └─────┴─────┴─────┴─────┴─────┘
  ← 스와이프 가능 →
</ForecastStrip>
```

**특징:**
- `overflow-x-auto` 가로 스크롤
- 각 날짜 카드: 최소 너비 `min-w-[100px]`
- 터치 제스처 최적화
- 스크롤 스냅: `snap-x snap-mandatory`

### 3. 일정별 날씨 통합

**위치**: SchedulePage의 각 DayTimeline

```tsx
<DayTimeline>
  ┌──────────────────────────────────────┐
  │  📅 1일차 / 01.15(목)   ☀️ 맑음 28°  │
  │  ────────────────────────────────    │
  │  13:00  집에서 출발                  │
  │  15:00  공항 미팅                    │
  │  ...                                 │
  └──────────────────────────────────────┘
</DayTimeline>
```

### 4. 상세 날씨 Bottom Sheet (선택사항)

**트리거**: WeatherCard 클릭

```tsx
<WeatherDetailSheet>
  ┌──────────────────────────────────────┐
  │  🌤️ 다낭 상세 날씨                    │
  │  ────────────────────────────────────│
  │                                      │
  │  📊 현재 상태                         │
  │  온도: 28°C (체감 30°C)               │
  │  습도: 75%                            │
  │  풍속: 2.5 m/s 남동풍                │
  │  기압: 1013 hPa                      │
  │                                      │
  │  🌅 일출/일몰                         │
  │  일출: 06:15                          │
  │  일몰: 17:45                          │
  │                                      │
  │  ⏰ 오늘의 시간별 날씨                 │
  │  09:00  ☀️ 26°                      │
  │  12:00  ☀️ 28°                      │
  │  15:00  ⛅ 29°                      │
  │  18:00  🌙 27°                      │
  │                                      │
  └──────────────────────────────────────┘
</WeatherDetailSheet>
```

### 5. 반응형 디자인

| 화면 크기 | 레이아웃 조정 |
|----------|------------|
| **모바일** (< 640px) | - 카드 전체 너비<br>- 예보 가로 스크롤<br>- 3개 카드까지 표시 |
| **태블릿** (640-1024px) | - 2열 그리드<br>- 5개 카드 모두 표시 |
| **데스크톱** (> 1024px) | - 3열 그리드<br>- 상세 정보 펼침 |

---

## 캐싱 전략

### 3단계 캐싱 시스템

#### 1. 서버 메모리 캐시 (API Routes)

```typescript
// app/api/weather/cache.ts

interface CacheEntry {
  data: any;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

// 사용 예
// Current weather: 5분 TTL
// Forecast: 30분 TTL
```

#### 2. 클라이언트 메모리 캐시 (React Hook)

```typescript
// hooks/useWeather.tsx

import { useCallback, useEffect, useState } from 'react';

const weatherCache: Record<string, WeatherCache> = {};

export function useWeather(location: 'danang') {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWeather = useCallback(async () => {
    // 1. 메모리 캐시 확인 (5분)
    const cached = weatherCache[location];
    if (cached && Date.now() < cached.expiresAt) {
      setWeather(cached.data);
      setLoading(false);
      return;
    }

    try {
      // 2. API 호출
      const response = await fetch('/api/weather/current');
      const data = await response.json();

      // 3. 메모리 캐시 저장
      weatherCache[location] = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000, // 5분
      };

      // 4. LocalStorage 저장 (오프라인 대비)
      localStorage.setItem('weather_last', JSON.stringify({
        data,
        timestamp: Date.now(),
      }));

      setWeather(data);
    } catch (err) {
      // 5. 오류 시 LocalStorage fallback
      const fallback = localStorage.getItem('weather_last');
      if (fallback) {
        const { data } = JSON.parse(fallback);
        setWeather(data);
        setError(new Error('Using cached data'));
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchWeather();

    // 5분마다 자동 갱신
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, loading, error, refetch: fetchWeather };
}
```

#### 3. LocalStorage 영구 캐시 (오프라인)

```typescript
// lib/weatherStorage.ts

export const WEATHER_STORAGE_KEY = 'weather_danang_cache';

export interface StoredWeather {
  data: WeatherData;
  timestamp: number;
}

export function saveWeatherToStorage(data: WeatherData): void {
  try {
    const stored: StoredWeather = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to save weather to storage:', error);
  }
}

export function getWeatherFromStorage(): WeatherData | null {
  try {
    const item = localStorage.getItem(WEATHER_STORAGE_KEY);
    if (!item) return null;

    const stored: StoredWeather = JSON.parse(item);

    // 24시간 이상 경과 시 무효화
    if (Date.now() - stored.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(WEATHER_STORAGE_KEY);
      return null;
    }

    return stored.data;
  } catch (error) {
    console.error('Failed to load weather from storage:', error);
    return null;
  }
}
```

### 캐시 정책 요약

| 캐시 레벨 | TTL | 목적 |
|----------|-----|------|
| **서버 메모리** | 현재: 5분<br>예보: 30분 | API 호출 최소화 |
| **클라이언트 메모리** | 5분 | 즉시 응답 |
| **LocalStorage** | 24시간 | 오프라인 대비 |

**예상 API 호출량:**
- 사용자 1명: 12회/시간 × 5일 = 600회 (여행 기간)
- 여유분: 1000회/일 - 600회 = 400회 (66% 여유)

---

## 에러 핸들링

### 에러 분류 및 대응

```typescript
// lib/weatherErrors.ts

export class WeatherError extends Error {
  constructor(
    message: string,
    public code: WeatherErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'WeatherError';
  }
}

export enum WeatherErrorCode {
  // API 에러
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_NETWORK = 'API_NETWORK',
  API_TIMEOUT = 'API_TIMEOUT',

  // 데이터 에러
  DATA_PARSE_ERROR = 'DATA_PARSE_ERROR',
  DATA_INVALID = 'DATA_INVALID',

  // 캐시 에러
  CACHE_READ_ERROR = 'CACHE_READ_ERROR',
  CACHE_WRITE_ERROR = 'CACHE_WRITE_ERROR',
}

export function handleWeatherError(error: unknown): {
  message: string;
  action: string;
  useFallback: boolean;
} {
  if (error instanceof WeatherError) {
    switch (error.code) {
      case WeatherErrorCode.API_RATE_LIMIT:
        return {
          message: '날씨 정보 요청이 일시적으로 제한되었습니다',
          action: '잠시 후 다시 시도해주세요',
          useFallback: true,
        };

      case WeatherErrorCode.API_NETWORK:
        return {
          message: '네트워크 연결을 확인할 수 없습니다',
          action: '인터넷 연결을 확인해주세요',
          useFallback: true,
        };

      case WeatherErrorCode.API_TIMEOUT:
        return {
          message: '날씨 정보 요청 시간이 초과되었습니다',
          action: '다시 시도',
          useFallback: true,
        };

      default:
        return {
          message: '날씨 정보를 불러올 수 없습니다',
          action: '새로고침',
          useFallback: true,
        };
    }
  }

  return {
    message: '알 수 없는 오류가 발생했습니다',
    action: '다시 시도',
    useFallback: true,
  };
}
```

### 에러 UI 컴포넌트

```tsx
// components/WeatherErrorCard.tsx

interface WeatherErrorCardProps {
  error: Error;
  onRetry: () => void;
  lastData?: WeatherData | null;
}

export function WeatherErrorCard({ error, onRetry, lastData }: WeatherErrorCardProps) {
  const { message, action, useFallback } = handleWeatherError(error);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-1">
            {message}
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            {action}
          </p>

          {useFallback && lastData && (
            <div className="mb-3 p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500 mb-2">
                마지막 업데이트: {formatDistance(lastData.current.updatedAt, new Date())} 전
              </p>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{getWeatherEmoji(lastData.current.icon)}</span>
                <div>
                  <p className="font-semibold">{lastData.current.temp}°C</p>
                  <p className="text-sm text-gray-600">{lastData.current.condition}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onRetry}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 접근성 설계

### WCAG 2.1 Level AA 준수

#### 1. 시맨틱 HTML

```tsx
<article
  role="region"
  aria-labelledby="weather-heading"
  aria-live="polite"  // 날씨 업데이트 시 스크린리더 알림
>
  <h2 id="weather-heading">다낭 현재 날씨</h2>
  {/* ... */}
</article>
```

#### 2. 색상 대비

- **텍스트**: 최소 4.5:1 대비율
- **아이콘**: 최소 3:1 대비율
- **다크모드**: 별도 색상 팔레트

```tsx
// 색상 대비 검증
const colors = {
  light: {
    bg: '#ffffff',
    text: '#1f2937',  // 대비율 15.3:1
    secondary: '#6b7280',  // 대비율 4.6:1
  },
  dark: {
    bg: '#1f2937',
    text: '#f9fafb',  // 대비율 14.8:1
    secondary: '#d1d5db',  // 대비율 7.5:1
  },
};
```

#### 3. 키보드 네비게이션

```tsx
<button
  onClick={onRefresh}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRefresh();
    }
  }}
  aria-label="날씨 정보 새로고침"
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
>
  🔄 새로고침
</button>
```

#### 4. 스크린리더 지원

```tsx
// 온도 읽기
<span aria-label={`현재 온도 섭씨 ${temp}도`}>
  {temp}°C
</span>

// 습도 읽기
<span aria-label={`습도 ${humidity} 퍼센트`}>
  💧 {humidity}%
</span>

// 날씨 상태 아이콘
<span role="img" aria-label={`날씨 상태 ${condition}`}>
  {getWeatherEmoji(icon)}
</span>
```

#### 5. 터치 타겟 크기

- **최소 크기**: 44×44px (WCAG 2.5.5)
- **버튼 패딩**: `py-3 px-4` (Tailwind)

```tsx
<button className="min-w-[44px] min-h-[44px] p-3">
  🔄
</button>
```

---

## 성능 최적화

### Lighthouse 목표 유지 전략

| 메트릭 | 현재 | 목표 | 전략 |
|--------|------|------|------|
| **Performance** | 78/100 | 78+ | - 날씨 API 캐싱<br>- 이미지 없음 (emoji 사용)<br>- Code splitting |
| **Accessibility** | 95/100 | 95+ | - ARIA 적용<br>- 키보드 네비게이션<br>- 색상 대비 |
| **Best Practices** | 96/100 | 96+ | - HTTPS only<br>- 에러 핸들링 |
| **SEO** | 100/100 | 100 | - 메타 태그 유지 |

### 최적화 기법

#### 1. Code Splitting

```tsx
// 동적 import로 WeatherCard 로드
const WeatherCard = dynamic(() => import('@/components/WeatherCard'), {
  loading: () => <WeatherCardSkeleton />,
  ssr: false, // 클라이언트 전용
});
```

#### 2. React.memo 적용

```tsx
export const WeatherCard = memo(function WeatherCard({ weather }: Props) {
  // ...
}, (prevProps, nextProps) => {
  // 온도가 같으면 리렌더링 스킵
  return prevProps.weather.current.temp === nextProps.weather.current.temp;
});
```

#### 3. 로딩 스켈레톤

```tsx
export function WeatherCardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 rounded-2xl p-6">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-16 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}
```

#### 4. 데이터 압축

```typescript
// API 응답 압축 (gzip)
export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

// Next.js는 자동으로 gzip 압축
```

#### 5. 이미지 최적화

- **아이콘**: Emoji 사용 (0 KB)
- **배경**: CSS Gradient (0 KB)
- **차트**: SVG (인라인, < 5 KB)

---

## 구현 로드맵

### Phase 1: 기초 인프라 (2-3시간)

**목표**: API 연동 및 데이터 구조 구축

- [ ] OpenWeatherMap API 키 발급
- [ ] 환경 변수 설정 (`.env.local`)
- [ ] TypeScript 타입 정의 (`types/weather.ts`)
- [ ] API Routes 구현
  - [ ] `/api/weather/current`
  - [ ] `/api/weather/forecast`
- [ ] 서버 캐싱 로직 구현
- [ ] 단위 테스트 (API 호출 모킹)

**검증:**
```bash
curl http://localhost:3000/api/weather/current
# Expected: JSON with weather data
```

### Phase 2: React Hook 및 클라이언트 로직 (2-3시간)

**목표**: 재사용 가능한 데이터 레이어

- [ ] `useWeather()` 커스텀 훅 구현
- [ ] 클라이언트 캐싱 로직
- [ ] LocalStorage 연동
- [ ] 에러 핸들링
- [ ] 로딩 상태 관리

**검증:**
```tsx
function TestComponent() {
  const { weather, loading, error } = useWeather('danang');
  return <div>{loading ? 'Loading...' : weather?.current.temp}</div>;
}
```

### Phase 3: UI 컴포넌트 구현 (3-4시간)

**목표**: 사용자 인터페이스 완성

- [ ] `WeatherCard` 컴포넌트
  - [ ] 현재 날씨 표시
  - [ ] 아이콘 및 스타일링
  - [ ] 다크모드 지원
- [ ] `ForecastStrip` 컴포넌트
  - [ ] 5일 예보 카드
  - [ ] 가로 스크롤
  - [ ] 스냅 애니메이션
- [ ] `WeatherErrorCard` 컴포넌트
- [ ] `WeatherCardSkeleton` 로딩 UI

**검증:**
```tsx
// Storybook 또는 독립 페이지에서 시각적 확인
```

### Phase 4: 페이지 통합 (1-2시간)

**목표**: 기존 페이지에 날씨 정보 추가

- [ ] HomePage에 WeatherCard 추가
- [ ] SchedulePage에 DayTimeline 날씨 통합
- [ ] MapPage에 날씨 오버레이 (선택사항)
- [ ] 레이아웃 조정 및 반응형 검증

**검증:**
```
✅ 모바일 (375px): 카드 정상 표시
✅ 태블릿 (768px): 2열 그리드
✅ 데스크톱 (1024px): 3열 그리드
```

### Phase 5: 접근성 및 성능 최적화 (2-3시간)

**목표**: WCAG 준수 및 성능 유지

- [ ] ARIA 레이블 추가
- [ ] 키보드 네비게이션 테스트
- [ ] 색상 대비 검증 (contrast checker)
- [ ] Lighthouse 재측정
  - [ ] Performance: 78+
  - [ ] Accessibility: 95+
- [ ] React.memo 적용
- [ ] Code splitting 확인

**검증:**
```bash
npx playwright test tests/accessibility-keyboard.spec.ts
npm run build && npm run start
# Lighthouse 측정
```

### Phase 6: 테스트 및 배포 (1-2시간)

**목표**: 프로덕션 준비

- [ ] 단위 테스트 작성
  - [ ] `useWeather` 훅 테스트
  - [ ] API route 테스트
- [ ] E2E 테스트 (Playwright)
  - [ ] 날씨 카드 표시
  - [ ] 새로고침 동작
  - [ ] 오프라인 모드
- [ ] 에러 시나리오 테스트
- [ ] Git 커밋 및 Vercel 배포
- [ ] 프로덕션 검증

**검증:**
```bash
npm run test
npm run test:e2e
git push origin main
# Vercel 자동 배포 확인
```

---

## 예상 리소스 및 제약사항

### 개발 시간 추정

| Phase | 작업 | 예상 시간 |
|-------|------|----------|
| 1 | API 인프라 | 2-3시간 |
| 2 | React Hook | 2-3시간 |
| 3 | UI 컴포넌트 | 3-4시간 |
| 4 | 페이지 통합 | 1-2시간 |
| 5 | 최적화 | 2-3시간 |
| 6 | 테스트/배포 | 1-2시간 |
| **합계** | | **11-17시간** |

### API 사용량 예측

**OpenWeatherMap 무료 한도:**
- 1,000 calls/day
- 60 calls/minute

**예상 사용량 (5일 여행):**
- 사용자 1명: 12 calls/hour × 24 hours = 288 calls/day
- 여유분: 1,000 - 288 = 712 calls/day (71% 여유)

**권장사항:**
- 초기에는 무료 플랜 사용
- 사용자 증가 시 Startup 플랜($40/월) 고려

### 기술 제약사항

| 제약 | 내용 | 대응책 |
|------|------|--------|
| **Next.js API Routes** | Edge Runtime 제한 | Node.js Runtime 사용 |
| **CORS** | 브라우저 직접 호출 불가 | API Routes 프록시 |
| **API 키 노출** | 클라이언트에서 보안 | 환경 변수 + 서버 호출만 |
| **오프라인** | 네트워크 단절 시 | LocalStorage fallback |

---

## 보안 고려사항

### 1. API 키 보호

```bash
# .env.local (Git에 커밋하지 않음)
OPENWEATHERMAP_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=https://hoonjae-danang-travel.vercel.app
```

**.gitignore에 추가:**
```
.env*.local
```

**Vercel 환경 변수 설정:**
```
Settings → Environment Variables
→ OPENWEATHERMAP_API_KEY = [API 키]
```

### 2. Rate Limiting

```typescript
// lib/rateLimiter.ts

const requests = new Map<string, number[]>();

export function checkRateLimit(ip: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = requests.get(ip) || [];

  // 윈도우 외 요청 제거
  const validRequests = timestamps.filter(t => now - t < windowMs);

  if (validRequests.length >= limit) {
    return false; // 제한 초과
  }

  validRequests.push(now);
  requests.set(ip, validRequests);
  return true;
}
```

### 3. Input Validation

```typescript
// API route에서 검증
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // 좌표 검증
  if (!lat || !lon ||
      parseFloat(lat) < -90 || parseFloat(lat) > 90 ||
      parseFloat(lon) < -180 || parseFloat(lon) > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinates' },
      { status: 400 }
    );
  }

  // ...
}
```

---

## 모니터링 및 로깅

### 1. API 호출 로깅

```typescript
// lib/logger.ts

export function logWeatherRequest(params: {
  endpoint: string;
  success: boolean;
  duration: number;
  cached: boolean;
}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'weather_api',
    ...params,
  }));
}

// Usage
const startTime = Date.now();
const data = await fetchWeather();
logWeatherRequest({
  endpoint: '/api/weather/current',
  success: true,
  duration: Date.now() - startTime,
  cached: false,
});
```

### 2. 에러 추적

```typescript
// Vercel Analytics 통합
import { track } from '@vercel/analytics';

track('weather_error', {
  code: error.code,
  message: error.message,
  recoverable: error.recoverable,
});
```

### 3. 성능 모니터링

```typescript
// Web Vitals 추적
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);

  if (metric.name === 'FCP' && metric.value > 3000) {
    console.warn('FCP is slow:', metric.value);
  }
}
```

---

## 향후 확장 가능성

### Phase 7+: 추가 기능 (선택사항)

1. **날씨 알림**
   - 악천후 시 Push Notification
   - 비 예보 시 우산 알림

2. **날씨 기반 추천**
   - 날씨에 따른 실내/실외 일정 제안
   - 옷차림 추천

3. **다국어 지원**
   - 영어, 베트남어 날씨 정보
   - i18n 통합

4. **고급 시각화**
   - Chart.js로 기온 그래프
   - 강수 확률 차트

5. **위젯**
   - PWA 홈 화면 위젯
   - 날씨 요약 뱃지

---

## 결론

### 설계 요약

이 설계는 다음 원칙을 따릅니다:

1. **사용자 우선**: 모바일 친화적 UI/UX
2. **성능 유지**: Lighthouse 점수 유지 (78/100)
3. **접근성**: WCAG 2.1 Level AA 준수
4. **확장성**: 모듈화된 구조로 향후 확장 용이
5. **안정성**: 3단계 캐싱 + 오프라인 대비
6. **보안**: API 키 보호 + Rate Limiting

### 다음 단계

1. **사용자 승인**: 설계 검토 및 피드백
2. **Phase 1 시작**: API 인프라 구축
3. **점진적 배포**: Phase별 테스트 및 검증
4. **프로덕션 릴리스**: 최종 테스트 후 배포

---

**문서 버전**: 1.0
**최종 업데이트**: 2026-01-10
**작성자**: Claude Code (SuperClaude /sc:design)
