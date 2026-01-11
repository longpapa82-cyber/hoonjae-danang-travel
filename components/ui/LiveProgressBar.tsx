'use client';

import { motion } from 'framer-motion';
import { TravelDay } from '@/types/travel';
import { useMemo } from 'react';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useCheckins } from '@/hooks/useCheckins';
import { getActivityStatus } from '@/lib/progressCalculator';

interface LiveProgressBarProps {
  days: TravelDay[];
  currentDay?: number;
}

/**
 * Live Progress Bar (United Airlines Virtual Gate 스타일)
 *
 * 2025-2026 트렌드: Real-time Progress Visualization
 * - 일별 진행률 실시간 표시
 * - 그라데이션 프로그레스 바
 * - 라이브 업데이트 표시
 *
 * 사용 예시:
 * <LiveProgressBar days={travelData.days} currentDay={2} />
 */
export function LiveProgressBar({ days, currentDay }: LiveProgressBarProps) {
  const currentTime = useCurrentTime();
  const { isCheckedIn, isHydrated } = useCheckins();

  // 일별 진행률 계산
  const dayProgress = useMemo(() => {
    if (!currentTime || !isHydrated) {
      return days.map(day => ({
        day: day.day,
        label: `${day.day}일차`,
        completed: 0,
        total: day.activities.length,
        progress: 0,
      }));
    }

    return days.map(day => {
      const completedCount = day.activities.filter(activity => {
        const activityStatus = getActivityStatus(activity, day.date, currentTime);
        const isTimeCompleted = activityStatus === 'COMPLETED';
        const isManuallyCheckedIn = isCheckedIn(activity.id);
        return isTimeCompleted || isManuallyCheckedIn;
      }).length;

      const progress = Math.round((completedCount / day.activities.length) * 100);

      return {
        day: day.day,
        label: `${day.day}일차`,
        completed: completedCount,
        total: day.activities.length,
        progress,
      };
    });
  }, [days, currentTime, isHydrated, isCheckedIn]);

  // 전체 진행률
  const totalProgress = useMemo(() => {
    const totalActivities = dayProgress.reduce((sum, d) => sum + d.total, 0);
    const totalCompleted = dayProgress.reduce((sum, d) => sum + d.completed, 0);
    return totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;
  }, [dayProgress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
    >
      {/* 진행률 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          여행 진행 상황
        </h3>
        <motion.span
          key={totalProgress}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-primary"
        >
          {totalProgress}%
        </motion.span>
      </div>

      {/* 그룹별 진행 바 */}
      <div className="space-y-4">
        {dayProgress.map((day, index) => {
          const isActive = currentDay === day.day;

          return (
            <div key={day.day} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {day.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {day.completed}/{day.total}
                </span>
              </div>

              {/* 프로그레스 바 */}
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <motion.div
                  className={`h-full ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-blue-400 to-purple-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${day.progress}%` }}
                  transition={{
                    duration: 1,
                    ease: 'easeOut',
                    delay: index * 0.1
                  }}
                />

                {/* 라이브 펄스 효과 (현재 진행 중인 날) */}
                {isActive && day.progress < 100 && (
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 w-1 bg-white"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 실시간 업데이트 표시 */}
      {currentDay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <span>실시간 업데이트 중</span>
        </motion.div>
      )}
    </motion.div>
  );
}
