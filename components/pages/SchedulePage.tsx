'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Utensils, CheckCircle2, Circle, Check } from 'lucide-react';
import { travelData } from '@/lib/travelData';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { DayTimeline } from '@/components/DayTimeline';

export function SchedulePage() {
  const travelStatus = useTravelStatus();

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

      {/* 일정 리스트 (DayTimeline 사용) */}
      <div className="space-y-4">
        {travelData.days.map((day, dayIndex) => {
          const isCurrentDay = travelStatus?.currentDay === day.day;

          return (
            <motion.div
              key={day.day}
              data-testid={`day-${day.day}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
            >
              <DayTimeline day={day} isCurrentDay={Boolean(isCurrentDay)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
