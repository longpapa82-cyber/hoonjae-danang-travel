'use client';

import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, RefreshCw, AlertCircle } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { GlassCard } from '@/components/ui/GlassCard';
import { WeatherSkeleton } from '@/components/ui/WeatherSkeleton';

/**
 * 다낭 현재 날씨 카드 컴포넌트
 *
 * 기능:
 * - 현재 온도, 체감 온도
 * - 날씨 상태 (아이콘 + 텍스트)
 * - 습도, 풍속
 * - 5일 예보 미리보기 (가로 스크롤)
 * - 로딩/에러 상태
 *
 * 접근성:
 * - ARIA labels
 * - 키보드 네비게이션
 * - 의미론적 HTML
 */
export function WeatherCard() {
  const { current, forecast, loading, error, lastUpdated } = useWeather();

  // 로딩 상태 - Skeleton Loader 사용
  if (loading && !current) {
    return <WeatherSkeleton />;
  }

  // 에러 상태
  if (error && !current) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 rounded-2xl p-6 shadow-lg border border-red-200"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              날씨 정보를 불러올 수 없습니다
            </h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 날씨 데이터가 없으면 표시 안 함
  if (!current) return null;

  return (
    <GlassCard
      variant="default"
      blur="xl"
      animated={true}
      className="p-6 bg-gradient-to-br from-blue-50/80 to-sky-50/80 dark:from-blue-900/30 dark:to-sky-900/30"
    >
      <div role="region" aria-label="다낭 날씨 정보">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800">다낭 날씨</h2>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-500">
            {new Date(lastUpdated).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })} 업데이트
          </p>
        )}
      </div>

      {/* 현재 날씨 */}
      <div className="flex items-start justify-between mb-6">
        {/* 온도 및 아이콘 */}
        <div className="flex items-center gap-4">
          <div className="text-6xl" aria-hidden="true">
            {current.icon}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-gray-800">
                {current.temp}
              </span>
              <span className="text-2xl text-gray-600">°C</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              체감 {current.feelsLike}°C
            </p>
          </div>
        </div>

        {/* 날씨 상태 */}
        <div className="text-right">
          <p className="text-xl font-semibold text-gray-800 mb-1">
            {current.condition}
          </p>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 습도 */}
        <div className="flex items-center gap-2 bg-white/50 rounded-xl p-3">
          <Droplets className="w-4 h-4 text-blue-500" aria-hidden="true" />
          <div>
            <p className="text-xs text-gray-600">습도</p>
            <p className="text-sm font-semibold text-gray-800">
              {current.humidity}%
            </p>
          </div>
        </div>

        {/* 풍속 */}
        <div className="flex items-center gap-2 bg-white/50 rounded-xl p-3">
          <Wind className="w-4 h-4 text-blue-500" aria-hidden="true" />
          <div>
            <p className="text-xs text-gray-600">풍속</p>
            <p className="text-sm font-semibold text-gray-800">
              {current.windSpeed} m/s
            </p>
          </div>
        </div>
      </div>

      {/* 5일 예보 미리보기 */}
      {forecast.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            주간 예보
          </h3>
          <div
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            role="list"
            aria-label="5일 날씨 예보"
          >
            {forecast.slice(0, 5).map((day) => {
              // 날짜를 "MM/DD" 형식으로 변환
              const dateObj = new Date(day.date);
              const monthDay = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

              return (
              <div
                key={day.date}
                className="flex-shrink-0 bg-white/50 rounded-xl p-3 min-w-[90px]"
                role="listitem"
              >
                {/* 날짜 */}
                <p className="text-xs text-gray-500 text-center mb-1">
                  {monthDay}
                </p>

                {/* 요일 */}
                <p className="text-xs font-semibold text-gray-700 text-center mb-2">
                  {day.dayOfWeek}요일
                </p>

                {/* 날씨 아이콘 */}
                <div className="text-3xl text-center mb-2" aria-hidden="true">
                  {day.icon}
                </div>

                {/* 온도 */}
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800">
                    {day.tempMax}°
                  </p>
                  <p className="text-xs text-gray-600">
                    {day.tempMin}°
                  </p>
                </div>

                {/* 강수 확률 */}
                {day.precipitation > 0 && (
                  <p className="text-xs text-blue-600 text-center mt-1">
                    💧 {day.precipitation}%
                  </p>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </GlassCard>
  );
}
