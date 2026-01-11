'use client';

/**
 * Activity Card Skeleton Loader
 *
 * 2025-2026 트렌드: Shimmer Effect
 * 로딩 상태를 부드럽게 표현
 */
export function ActivitySkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="일정 로딩 중">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
        >
          {/* Shimmer 애니메이션 */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-gray-700/30 to-transparent" />

          {/* 시간 & 상태 배지 */}
          <div className="flex items-start justify-between mb-3">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>

          {/* 제목 */}
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />

          {/* 설명 */}
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* 이미지 */}
          <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      ))}
      <span className="sr-only">일정 정보를 불러오는 중입니다...</span>
    </div>
  );
}
