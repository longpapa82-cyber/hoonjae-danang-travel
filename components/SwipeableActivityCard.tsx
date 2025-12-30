'use client';

import { motion, PanInfo } from 'framer-motion';
import { Activity, ActivityStatus } from '@/types/travel';
import { StatusBadge } from './StatusBadge';
import { MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface SwipeableActivityCardProps {
  activity: Activity;
  status: ActivityStatus;
  onSwipeLeft?: () => void; // 다음 활동
  onSwipeRight?: () => void; // 이전 활동
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
}

export function SwipeableActivityCard({
  activity,
  status,
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft = true,
  canSwipeRight = true,
}: SwipeableActivityCardProps) {
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;

    if (info.offset.x > swipeThreshold && canSwipeRight && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -swipeThreshold && canSwipeLeft && onSwipeLeft) {
      onSwipeLeft();
    }

    setDragDirection(null);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 20) {
      setDragDirection(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <div className="relative h-[500px] flex items-center justify-center px-4">
      {/* 좌우 힌트 */}
      {canSwipeRight && (
        <motion.div
          animate={{ opacity: dragDirection === 'right' ? 1 : 0.3 }}
          className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <ChevronLeft className="w-8 h-8 text-primary" />
        </motion.div>
      )}

      {canSwipeLeft && (
        <motion.div
          animate={{ opacity: dragDirection === 'left' ? 1 : 0.3 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <ChevronRight className="w-8 h-8 text-primary" />
        </motion.div>
      )}

      {/* 스와이프 가능한 카드 */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
        className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden cursor-grab ${
          isInProgress
            ? 'border-4 border-warning'
            : isCompleted
            ? 'border-2 border-success/50 opacity-80'
            : 'border-2 border-gray-200'
        } bg-white`}
      >
        {/* 이미지 */}
        {activity.imageUrl && (
          <div className="relative h-64 w-full">
            <Image
              src={activity.imageUrl}
              alt={activity.title}
              fill
              className="object-cover"
              priority
            />
            {/* 상태 배지 (이미지 위) */}
            <div className="absolute top-4 right-4">
              <StatusBadge status={status} />
            </div>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="p-6">
          {/* 시간 */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">{activity.time}</span>
          </div>

          {/* 제목 */}
          <h3
            className={`text-2xl font-bold mb-3 ${
              isCompleted
                ? 'line-through text-gray-500'
                : 'text-gray-800'
            }`}
          >
            {activity.title}
          </h3>

          {/* 설명 */}
          {activity.description && (
            <div className="flex items-start gap-2 text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <p className="text-sm">{activity.description}</p>
            </div>
          )}

          {/* 팁 */}
          {activity.tip && (
            <div className="mt-4 bg-warning/10 border border-warning/20 rounded-lg p-3">
              <p className="text-sm text-warning font-medium">{activity.tip}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
