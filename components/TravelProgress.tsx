'use client';

import { useTravelStatus } from '@/hooks/useTravelStatus';
import { useCheckins } from '@/hooks/useCheckins';
import { CountdownTimer } from './CountdownTimer';
import { ProgressRing } from './ProgressRing';
import { DayTimeline } from './DayTimeline';
import { LoadingSkeleton } from './LoadingSkeleton';
import { travelData } from '@/lib/travelData';
import { motion } from 'framer-motion';
import { Plane, MapPin, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';
import { getActivityStatus } from '@/lib/progressCalculator';
import { useCurrentTime } from '@/hooks/useCurrentTime';

export function TravelProgress() {
  const travelStatus = useTravelStatus();
  const { isCheckedIn, getCheckinCount, isHydrated } = useCheckins();
  const currentTime = useCurrentTime();

  // 체크인 데이터를 반영한 진행률 계산
  const enhancedProgress = useMemo(() => {
    if (!travelStatus || !currentTime || !isHydrated) return travelStatus;

    // 모든 활동 수집
    const allActivities = travelData.days.flatMap(day =>
      day.activities.map(activity => ({
        ...activity,
        date: day.date
      }))
    );

    // 완료된 활동 계산 (시간 기반 또는 체크인)
    const completedCount = allActivities.filter(activity => {
      const activityStatus = getActivityStatus(activity, activity.date, currentTime);
      const isTimeCompleted = activityStatus === 'COMPLETED';
      const isManuallyCheckedIn = isCheckedIn(activity.id);
      return isTimeCompleted || isManuallyCheckedIn;
    }).length;

    // 진행률 계산
    const progressPercentage = Math.round((completedCount / allActivities.length) * 100);

    return {
      ...travelStatus,
      completedActivities: completedCount,
      totalActivities: allActivities.length,
      progressPercentage
    };
  }, [travelStatus, currentTime, isHydrated, isCheckedIn]);

  if (!enhancedProgress) {
    return <LoadingSkeleton />;
  }

  const { status, currentDay, currentActivity, completedActivities, totalActivities, progressPercentage, timeUntilStart } = enhancedProgress;

  return (
    <div data-testid="travel-progress" className="space-y-8">
      {/* 여행 전 */}
      {status === 'BEFORE_TRIP' && timeUntilStart && (
        <motion.div
          data-testid="countdown-timer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <Plane className="w-16 h-16 text-primary animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            여행 시작까지
          </h2>
          <CountdownTimer
            days={timeUntilStart.days}
            hours={timeUntilStart.hours}
            minutes={timeUntilStart.minutes}
            seconds={timeUntilStart.seconds}
          />
          <p className="mt-8 text-lg text-gray-600">
            곧 멋진 다낭 여행이 시작됩니다! 🌴
          </p>
        </motion.div>
      )}

      {/* 여행 중 */}
      {status === 'IN_PROGRESS' && (
        <motion.div
          data-testid="progress-status"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <MapPin className="w-16 h-16 text-warning animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            여행 진행 중
          </h2>
          <ProgressRing progress={progressPercentage} className="mx-auto mb-6" data-testid="progress-ring" />
          <div className="text-lg text-gray-600">
            <p className="mb-2">
              {completedActivities} / {totalActivities} 활동 완료
            </p>
            {currentDay && (
              <p className="font-semibold text-primary">
                현재: {currentDay}일차
              </p>
            )}
            {currentActivity && (
              <p data-testid="current-activity" className="mt-4 text-xl font-bold text-warning">
                지금: {currentActivity.title}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* 여행 완료 */}
      {status === 'COMPLETED' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            여행이 완료되었습니다!
          </h2>
          <ProgressRing progress={100} className="mx-auto mb-6" />
          <p className="text-lg text-gray-600">
            총 {totalActivities}개의 활동을 모두 완료했습니다 🎉
          </p>
        </motion.div>
      )}

      {/* 일정 타임라인 */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {status === 'BEFORE_TRIP' ? '여행 일정' : status === 'COMPLETED' ? '여행 기록' : '일정 상세'}
        </h3>
        {travelData.days.map((day) => (
          <DayTimeline
            key={day.day}
            day={day}
            isCurrentDay={currentDay === day.day}
          />
        ))}
      </div>
    </div>
  );
}
