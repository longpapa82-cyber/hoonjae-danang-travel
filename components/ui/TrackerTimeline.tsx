'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Circle, MapPin } from 'lucide-react';
import { Activity } from '@/types/travel';
import { ActivityStatus } from '@/types/travel';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';

interface TrackerTimelineProps {
  activities: Array<Activity & { date: string; status: ActivityStatus }>;
  currentActivityId?: string;
}

/**
 * Tracker Timeline (Package Tracker 스타일)
 *
 * 2025-2026 트렌드: Delivery Tracker UX Pattern
 * - 수직 타임라인 레이아웃
 * - 상태별 컬러 구분 (완료/진행/대기)
 * - 진행 중 활동 애니메이션
 * - 실시간 상태 업데이트
 *
 * 사용 예시:
 * <TrackerTimeline
 *   activities={activitiesWithStatus}
 *   currentActivityId="2-3"
 * />
 */
export function TrackerTimeline({ activities, currentActivityId }: TrackerTimelineProps) {
  return (
    <div className="relative py-4">
      {/* 수직 연결선 (그라데이션) */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-gray-200 dark:to-gray-700" />

      {/* 활동 목록 */}
      <div className="space-y-6">
        {activities.map((activity, index) => {
          const isCurrent = activity.id === currentActivityId;
          const isCompleted = activity.status === 'COMPLETED';
          const isInProgress = activity.status === 'IN_PROGRESS';
          const isPending = activity.status === 'UPCOMING';

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="relative flex gap-4"
            >
              {/* 상태 아이콘 */}
              <div
                className={cn(
                  'relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-green-500 shadow-lg shadow-green-500/50',
                  isInProgress && 'bg-blue-500 shadow-lg shadow-blue-500/50',
                  isPending && 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                {/* 펄스 효과 (진행 중) */}
                {isInProgress && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}

                {/* 아이콘 */}
                {isCompleted && <Check className="w-6 h-6 text-white relative z-10" />}
                {isInProgress && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="relative z-10"
                  >
                    <Clock className="w-6 h-6 text-white" />
                  </motion.div>
                )}
                {isPending && <Circle className="w-6 h-6 text-gray-500 dark:text-gray-400 relative z-10" />}
              </div>

              {/* 활동 정보 카드 */}
              <motion.div
                className={cn(
                  'flex-1 rounded-xl p-4 transition-all duration-300',
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-lg'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md'
                )}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={cn(
                          'font-semibold truncate',
                          isCurrent
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-800 dark:text-white'
                        )}
                      >
                        {activity.title}
                      </h4>
                      {isCurrent && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full whitespace-nowrap"
                        >
                          진행 중
                        </motion.span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.time}
                    </p>

                    {activity.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {activity.description}
                      </p>
                    )}

                    {activity.location && activity.location.address && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{activity.location.address}</span>
                      </div>
                    )}
                  </div>

                  <StatusBadge status={activity.status} />
                </div>

                {/* 실시간 진행 표시 (IN_PROGRESS인 경우) */}
                {isInProgress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <motion.div
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                      <span className="font-medium">현재 이 활동을 진행하고 있습니다</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* 타임라인 종료 표시 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: activities.length * 0.05 + 0.3 }}
        className="relative flex gap-4 mt-6"
      >
        <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
          <Check className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 flex items-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            모든 일정 완료
          </span>
        </div>
      </motion.div>
    </div>
  );
}
