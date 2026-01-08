'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Navigation as NavigationIcon, AlertCircle } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { travelData } from '@/lib/travelData';
import { Activity } from '@/types/travel';
import { calculateETAToActivity, formatDistance, formatDuration, TransportMode } from '@/lib/etaCalculator';

export function NextActivityCard() {
  const travelStatus = useTravelStatus();
  const { position } = useLocation({ autoStart: travelStatus?.status === 'IN_PROGRESS' });
  const [transportMode, setTransportMode] = useState<TransportMode>('WALKING');

  // 다음 일정 찾기
  const nextActivity = useMemo((): Activity | null => {
    if (!travelStatus || travelStatus.status !== 'IN_PROGRESS') return null;

    const currentDay = travelData.days.find(day => day.day === travelStatus.currentDay);
    if (!currentDay) return null;

    const currentActivityIndex = currentDay.activities.findIndex(
      a => a.id === travelStatus.currentActivity?.id
    );

    // 현재 일정 다음부터 위치가 있는 일정 찾기
    for (let i = currentActivityIndex + 1; i < currentDay.activities.length; i++) {
      const activity = currentDay.activities[i];
      if (activity.location) {
        return activity;
      }
    }

    return null;
  }, [travelStatus]);

  // ETA 계산
  const etaInfo = useMemo(() => {
    if (!nextActivity || !position) return null;

    return calculateETAToActivity(
      { latitude: position.latitude, longitude: position.longitude },
      nextActivity,
      transportMode
    );
  }, [nextActivity, position, transportMode]);

  // 여행 중이 아니거나 다음 일정이 없으면 표시하지 않음
  if (travelStatus?.status !== 'IN_PROGRESS' || !nextActivity) {
    return null;
  }

  // 위치 추적 중이 아니면 안내 메시지 표시
  if (!position) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold mb-1">다음 일정 안내</h3>
            <p className="text-sm text-white/90 mb-2">
              위치 추적을 시작하면 예상 도착 시간을 확인할 수 있습니다.
            </p>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm font-medium">{nextActivity.title}</p>
              {nextActivity.time && (
                <p className="text-xs text-white/80 mt-1">예정 시간: {nextActivity.time}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <NavigationIcon className="w-5 h-5" />
          <h3 className="text-lg font-bold">다음 일정</h3>
        </div>

        {/* 이동 수단 선택 */}
        <div className="flex gap-1 bg-white/20 rounded-lg p-1">
          <button
            onClick={() => setTransportMode('WALKING')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 ${
              transportMode === 'WALKING'
                ? 'bg-white text-blue-600'
                : 'text-white/80 hover:text-white'
            }`}
            aria-label="도보 이동 수단 선택"
            aria-pressed={transportMode === 'WALKING'}
          >
            🚶 도보
          </button>
          <button
            onClick={() => setTransportMode('DRIVING')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 ${
              transportMode === 'DRIVING'
                ? 'bg-white text-blue-600'
                : 'text-white/80 hover:text-white'
            }`}
            aria-label="차량 이동 수단 선택"
            aria-pressed={transportMode === 'DRIVING'}
          >
            🚗 차량
          </button>
        </div>
      </div>

      {/* 일정 정보 */}
      <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
        <h4 className="text-xl font-bold mb-2">{nextActivity.title}</h4>
        {nextActivity.description && (
          <p className="text-sm text-white/80 mb-2">{nextActivity.description}</p>
        )}
        {nextActivity.time && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>예정 시간: {nextActivity.time}</span>
          </div>
        )}
      </div>

      {/* ETA 정보 */}
      {etaInfo && (
        <div className="grid grid-cols-2 gap-3">
          {/* 거리 */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs text-white/80">거리</span>
            </div>
            <p className="text-2xl font-bold">{etaInfo.distanceText}</p>
          </div>

          {/* 예상 소요 시간 */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs text-white/80">소요 시간</span>
            </div>
            <p className="text-2xl font-bold">{etaInfo.durationText}</p>
          </div>
        </div>
      )}

      {/* 예상 도착 시간 */}
      {etaInfo && (
        <div className="mt-3 bg-white/10 backdrop-blur rounded-xl p-3 text-center">
          <p className="text-sm text-white/80 mb-1">예상 도착 시간</p>
          <p className="text-xl font-bold">
            {etaInfo.estimatedArrivalTime.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      )}
    </motion.div>
  );
}
