'use client';

/**
 * Weather Card Skeleton Loader
 *
 * 2025-2026 트렌드: Shimmer Effect
 * 날씨 정보 로딩 상태 표시
 */
export function WeatherSkeleton() {
  return (
    <div
      className="relative bg-gradient-to-br from-blue-50 to-sky-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 overflow-hidden"
      role="status"
      aria-label="날씨 정보 로딩 중"
    >
      {/* Shimmer 애니메이션 */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 dark:via-gray-700/30 to-transparent" />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* 현재 날씨 */}
      <div className="flex items-start justify-between mb-6">
        {/* 온도 및 아이콘 */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div>
            <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* 날씨 상태 */}
        <div className="text-right">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
        <div className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      </div>

      {/* 5일 예보 */}
      <div>
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-white/50 dark:bg-gray-700/50 rounded-xl p-3 min-w-[90px]"
            >
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse mx-auto" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full mb-2 animate-pulse mx-auto" />
              <div className="h-5 w-10 bg-gray-200 dark:bg-gray-600 rounded mb-1 animate-pulse mx-auto" />
              <div className="h-4 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">날씨 정보를 불러오는 중입니다...</span>
    </div>
  );
}
