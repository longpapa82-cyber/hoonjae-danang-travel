'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Utensils, CheckCircle2, Circle, Check } from 'lucide-react';
import { travelData } from '@/lib/travelData';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { getActivityStatus } from '@/lib/progressCalculator';
import { useCheckins } from '@/hooks/useCheckins';

export function SchedulePage() {
  const travelStatus = useTravelStatus();
  const currentTime = useCurrentTime();
  const { isCheckedIn, toggleCheckin, isHydrated } = useCheckins();

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 mb-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6" />
          <h1 className="text-2xl font-bold">{travelData.title}</h1>
        </div>
        <p className="text-blue-100">
          {new Date(travelData.startDate).toLocaleDateString('ko-KR')} ~{' '}
          {new Date(travelData.endDate).toLocaleDateString('ko-KR')}
        </p>
      </motion.div>

      {/* 일정 리스트 */}
      <div className="space-y-4">
        {travelData.days.map((day, dayIndex) => {
          const isCurrentDay = travelStatus?.currentDay === day.day;

          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 ${
                isCurrentDay
                  ? 'border-primary'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* 일차 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {day.day}일차
                    </h2>
                    {isCurrentDay && (
                      <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                        진행중
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {day.date} ({day.dayOfWeek})
                  </p>
                </div>
              </div>

              {/* 활동 리스트 */}
              <div className="space-y-3">
                {day.activities.map((activity, actIndex) => {
                  const isCurrent =
                    isCurrentDay &&
                    travelStatus?.currentActivity?.id === activity.id;

                  // 활동 상태 계산
                  const activityStatus = currentTime
                    ? getActivityStatus(activity, day.date, currentTime)
                    : 'UPCOMING';

                  const isCompleted = activityStatus === 'COMPLETED';
                  const isInProgress = activityStatus === 'IN_PROGRESS';

                  const isManuallyCheckedIn = isHydrated && isCheckedIn(activity.id);

                  return (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-xl transition-all ${
                        isInProgress
                          ? 'bg-primary/10 border-2 border-primary shadow-lg scale-[1.02]'
                          : isCompleted || isManuallyCheckedIn
                          ? 'bg-gray-100 dark:bg-gray-700/30 opacity-60'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* 상태 아이콘 */}
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted || isManuallyCheckedIn ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : isInProgress ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <Circle className="w-5 h-5 text-primary fill-primary" />
                            </motion.div>
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-sm font-semibold ${
                                isCompleted || isManuallyCheckedIn
                                  ? 'text-green-600 line-through'
                                  : isInProgress
                                  ? 'text-primary'
                                  : 'text-gray-500'
                              }`}
                            >
                              {activity.time}
                            </span>
                            {isInProgress && (
                              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full animate-pulse">
                                진행중
                              </span>
                            )}
                            {(isCompleted || isManuallyCheckedIn) && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                완료
                              </span>
                            )}
                          </div>
                          <h3
                            className={`font-semibold mb-1 ${
                              isCompleted || isManuallyCheckedIn
                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                : isInProgress
                                ? 'text-primary dark:text-blue-400'
                                : 'text-gray-800 dark:text-gray-100'
                            }`}
                          >
                            {activity.title}
                          </h3>
                          {activity.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.description}
                            </p>
                          )}
                          {activity.tip && (
                            <p className="text-xs text-warning mt-1">
                              💡 {activity.tip}
                            </p>
                          )}
                          {activity.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{activity.location.address}</span>
                            </div>
                          )}

                          {/* 수동 체크인 버튼 */}
                          {isHydrated && !isCompleted && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleCheckin(activity.id)}
                              className={`mt-2 w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                isManuallyCheckedIn
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                            >
                              {isManuallyCheckedIn ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>체크인 완료</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="w-4 h-4" />
                                  <span>체크인</span>
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 식사 정보 */}
              {day.meals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      식사
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {day.meals.map((meal, mealIndex) => (
                      <span
                        key={mealIndex}
                        className="px-3 py-1 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-sm text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        {meal.type}: {meal.menu}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
