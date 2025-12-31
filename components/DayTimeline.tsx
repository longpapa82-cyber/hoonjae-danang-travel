'use client';

import { TravelDay } from '@/types/travel';
import { ActivityCard } from './ActivityCard';
import { getActivityStatus, calculateDayProgress } from '@/lib/progressCalculator';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useCheckins } from '@/hooks/useCheckins';
import { motion } from 'framer-motion';
import { Calendar, Utensils } from 'lucide-react';
import { useState, useMemo } from 'react';

interface DayTimelineProps {
  day: TravelDay;
  isCurrentDay: boolean;
}

export function DayTimeline({ day, isCurrentDay }: DayTimelineProps) {
  const currentTime = useCurrentTime();
  const { isCheckedIn, isHydrated } = useCheckins();
  const [isExpanded, setIsExpanded] = useState(isCurrentDay);

  // 체크인을 반영한 진행률 계산
  const dayProgress = useMemo(() => {
    if (!currentTime || !isHydrated) {
      return calculateDayProgress(day.activities, day.date, currentTime || new Date());
    }

    const completedCount = day.activities.filter(activity => {
      const activityStatus = getActivityStatus(activity, day.date, currentTime);
      const isTimeCompleted = activityStatus === 'COMPLETED';
      const isManuallyCheckedIn = isCheckedIn(activity.id);
      return isTimeCompleted || isManuallyCheckedIn;
    }).length;

    return Math.round((completedCount / day.activities.length) * 100);
  }, [day, currentTime, isHydrated, isCheckedIn]);

  if (!currentTime) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-6 rounded-2xl border-2 overflow-hidden ${
        isCurrentDay
          ? 'border-primary bg-primary/5 shadow-xl'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* 날짜 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-gray-50:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className={`w-5 h-5 flex-shrink-0 ${isCurrentDay ? 'text-primary' : 'text-gray-500'}`} />
            <div className="min-w-0 flex-1">
              <h2 className="text-base md:text-lg font-bold text-gray-800 leading-tight">
                {day.day}일차 - {day.date} ({day.dayOfWeek})
              </h2>
              {day.meals.length > 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-600 truncate">
                  <Utensils className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{day.meals.map(meal => `${meal.type}: ${meal.menu}`).join(' | ')}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs text-gray-500">진행률</div>
              <div className="text-xl font-bold text-primary">{dayProgress}%</div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 text-sm"
            >
              ▼
            </motion.div>
          </div>
        </div>
      </button>

      {/* 활동 목록 */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {day.activities.map((activity, index) => {
              const status = getActivityStatus(activity, day.date, currentTime);
              return (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  status={status}
                  index={index}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
