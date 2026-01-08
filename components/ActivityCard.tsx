'use client';

import { Activity, ActivityStatus } from '@/types/travel';
import { StatusBadge } from './StatusBadge';
import { ImageModal } from './ImageModal';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Clock, DollarSign, Maximize2 } from 'lucide-react';
import { useState } from 'react';

interface ActivityCardProps {
  activity: Activity;
  status: ActivityStatus;
  index: number;
}

export function ActivityCard({ activity, status, index }: ActivityCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';

  return (
    <motion.article
      data-testid={`activity-${activity.id}`}
      data-status={status.toLowerCase()}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      aria-label={`${activity.time} - ${activity.title}`}
      aria-describedby={`activity-${activity.id}-description`}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isInProgress
          ? 'border-warning bg-warning/5 shadow-lg scale-105'
          : isCompleted
          ? 'border-success/30 bg-success/5 opacity-70'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* 상태 표시 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            {activity.time}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* 제목 */}
      <h3 className={`text-base sm:text-lg font-bold mb-2 leading-tight ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
        {activity.title}
      </h3>

      {/* 설명 */}
      {activity.description && (
        <p id={`activity-${activity.id}-description`} className="text-sm text-gray-600 mb-2 flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{activity.description}</span>
        </p>
      )}

      {/* 팁 정보 */}
      {activity.tip && (
        <p className="text-sm text-warning font-medium mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          {activity.tip}
        </p>
      )}

      {/* 이미지 */}
      {activity.imageUrl && (
        <>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="mt-3 rounded-lg overflow-hidden relative group cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setIsModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsModalOpen(true);
              }
            }}
            aria-label={`${activity.title} 이미지 크게 보기`}
          >
            <Image
              src={activity.imageUrl}
              alt={activity.title}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </div>
          </motion.button>

          <ImageModal
            imageUrl={activity.imageUrl}
            title={activity.title}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </>
      )}
    </motion.article>
  );
}
