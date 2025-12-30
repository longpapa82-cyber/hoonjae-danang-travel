'use client';

import { motion } from 'framer-motion';
import { Map, MapPin, Navigation, Target } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { CurrentLocationCard } from '@/components/CurrentLocationCard';
import { RouteInfoCard } from '@/components/RouteInfoCard';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';

export function MapPage() {
  const { isTracking, startTracking, stopTracking, permission } = useLocation({ autoStart: false });
  const travelStatus = useTravelStatus();

  const handleLocationToggle = async () => {
    if (isTracking) {
      stopTracking();
    } else {
      if (permission !== 'granted') {
        // 권한 요청은 LocationPermissionModal에서 처리
        alert('위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.');
        return;
      }
      startTracking();
    }
  };

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 mb-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">여행 지도</h1>
              <p className="text-sm text-blue-100">실시간 위치 및 경로 안내</p>
            </div>
          </div>

          {/* 위치 추적 토글 버튼 */}
          {travelStatus?.status === 'IN_PROGRESS' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLocationToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isTracking
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-600 text-white border-2 border-white'
              }`}
            >
              <Target className={`w-4 h-4 ${isTracking ? 'animate-pulse' : ''}`} />
              <span className="text-sm">{isTracking ? '추적 중' : '위치 추적'}</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* 현재 위치 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <CurrentLocationCard />
      </motion.div>

      {/* 경로 안내 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <RouteInfoCard />
      </motion.div>

      {/* 지도 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MapView />
      </motion.div>
    </div>
  );
}
