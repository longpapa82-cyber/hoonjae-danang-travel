'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { geofenceService } from '@/lib/services/GeofenceService';
import { useEffect, useMemo } from 'react';
import LocationService from '@/lib/services/LocationService';

export function CurrentLocationCard() {
  const { position, isTracking, permission, startTracking, requestPermission } = useLocation({
    autoStart: false,
    batterySaver: false,
  });
  const travelStatus = useTravelStatus();

  // 추적 시작 핸들러 (권한 체크 포함)
  const handleStartTracking = async () => {
    if (permission === 'prompt' || permission === 'denied') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    startTracking();
  };

  // 다음 목적지까지의 거리 계산 (여행 중일 때만)
  const distanceToNext = useMemo(() => {
    // 여행 전이거나 완료되면 거리 계산 안 함
    if (travelStatus?.status !== 'IN_PROGRESS') return null;

    if (!position || !travelStatus?.currentActivity?.location) return null;

    const distance = LocationService.calculateDistance(
      position.latitude,
      position.longitude,
      travelStatus.currentActivity.location.latitude,
      travelStatus.currentActivity.location.longitude
    );

    return Math.round(distance); // 미터
  }, [position, travelStatus]);

  // Geofence 설정 (여행 중일 때만)
  useEffect(() => {
    // 여행 전이거나 완료되면 Geofence 설정 안 함
    if (travelStatus?.status !== 'IN_PROGRESS') return;

    if (travelStatus?.currentActivity?.location) {
      geofenceService.createGeofence(
        travelStatus.currentActivity,
        travelStatus.currentActivity.location.latitude,
        travelStatus.currentActivity.location.longitude,
        100 // 100m 반경
      );
    }
  }, [travelStatus?.currentActivity, travelStatus?.status]);

  // 권한이 거부되면 안내 메시지 표시
  if (permission === 'denied') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 rounded-2xl p-6 shadow-lg border border-yellow-200"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              위치 권한이 필요합니다
            </h3>
            <p className="text-sm text-gray-600">
              브라우저 설정에서 위치 권한을 허용해주세요.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-800">
            현재 위치
          </h3>
        </div>

        {/* 추적 상태 */}
        {isTracking ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>추적 중</span>
          </div>
        ) : (
          <button
            onClick={handleStartTracking}
            className="text-sm text-primary hover:text-blue-600 font-medium"
          >
            추적 시작
          </button>
        )}
      </div>

      {/* 위치 정보 */}
      {position ? (
        <div className="space-y-3">
          {/* 좌표 */}
          <div className="text-sm text-gray-600">
            <div>위도: {position.latitude.toFixed(6)}</div>
            <div>경도: {position.longitude.toFixed(6)}</div>
            <div>정확도: ±{Math.round(position.accuracy)}m</div>
          </div>

          {/* 다음 목적지까지 거리 */}
          {distanceToNext !== null && travelStatus?.currentActivity && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-primary/10 rounded-xl p-4 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <Navigation className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">
                    다음 목적지
                  </div>
                  <div className="font-bold text-gray-800">
                    {travelStatus.currentActivity.title}
                  </div>
                  <div className="text-sm text-primary font-semibold mt-1">
                    {distanceToNext >= 1000
                      ? `${(distanceToNext / 1000).toFixed(1)} km`
                      : `${distanceToNext} m`}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            {isTracking ? (
              <>
                <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  위치를 가져오는 중...
                </p>
              </>
            ) : (
              <>
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  위치 추적이 시작되지 않았습니다
                </p>
                <button
                  onClick={handleStartTracking}
                  className="text-sm text-primary hover:text-blue-600 font-medium underline"
                >
                  추적 시작하기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
