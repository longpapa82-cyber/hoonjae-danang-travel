'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Clock, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { routeService, RouteInfo } from '@/lib/services/RouteService';
import { travelData } from '@/lib/travelData';

export function RouteInfoCard() {
  const travelStatus = useTravelStatus();
  const { isLoaded, loadError } = useGoogleMaps();

  // 여행 중일 때만 위치 추적 자동 시작
  const shouldTrackLocation = travelStatus?.status === 'IN_PROGRESS';
  const { position } = useLocation({ autoStart: shouldTrackLocation });

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재 활동의 목적지 좌표 (현재 활동에 location이 없으면 다음 활동 찾기)
  const destination = useMemo(() => {
    if (!travelStatus || travelStatus.status !== 'IN_PROGRESS') return null;

    // 현재 활동에 location이 있으면 사용
    if (travelStatus.currentActivity?.location) {
      return {
        lat: travelStatus.currentActivity.location.latitude,
        lng: travelStatus.currentActivity.location.longitude,
      };
    }

    // 현재 활동에 location이 없으면 다음 활동 찾기
    const currentDay = travelData.days.find(day => day.day === travelStatus.currentDay);
    if (!currentDay) return null;

    const currentActivityIndex = currentDay.activities.findIndex(
      a => a.id === travelStatus.currentActivity?.id
    );

    // 같은 날의 다음 활동 중 location이 있는 것 찾기
    for (let i = currentActivityIndex + 1; i < currentDay.activities.length; i++) {
      const activity = currentDay.activities[i];
      if (activity.location) {
        return {
          lat: activity.location.latitude,
          lng: activity.location.longitude,
        };
      }
    }

    return null;
  }, [travelStatus]);

  // 두 좌표 간 직선 거리 계산 (km)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 경로 계산 (여행 중일 때만)
  useEffect(() => {
    // 여행 상태가 없거나, 여행 중이 아니면 실행 안 함
    if (!travelStatus || travelStatus.status !== 'IN_PROGRESS') {
      console.log('RouteInfoCard: 경로 계산 건너뛰기 - 여행 전 또는 완료');
      return;
    }

    if (!position || !isLoaded || !travelStatus.currentActivity || !destination) {
      return;
    }

    // 거리 체크: 현재 위치와 목적지가 100km 이상 떨어져 있으면 경로 계산하지 않음
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      destination.lat,
      destination.lng
    );

    if (distance > 100) {
      console.log(
        `RouteInfoCard: 경로 계산 건너뛰기 - 거리가 너무 멀음 (${distance.toFixed(0)}km)`
      );
      setIsCalculating(false);
      setRouteInfo(null);
      setError(null);
      return;
    }

    console.log(`RouteInfoCard: 경로 계산 시작 - 거리 ${distance.toFixed(1)}km`);

    const calculateRoute = async () => {
      setIsCalculating(true);
      setError(null);

      try {
        const route = await routeService.calculateRoute(position, destination, {
          departureTime: new Date(),
          trafficModel: 'best_guess',
        });
        setRouteInfo(route);
      } catch (err: any) {
        console.error('Route calculation failed:', err);

        // ZERO_RESULTS 에러는 일반적으로 목적지가 너무 멀 때 발생
        if (err.message?.includes('ZERO_RESULTS')) {
          // 여행지에 도착하면 작동할 것이라는 안내 메시지
          setError(null); // 에러로 표시하지 않고 안내 메시지만 표시
        } else {
          setError('경로 계산에 실패했습니다. 잠시 후 다시 시도됩니다.');
        }
      } finally {
        setIsCalculating(false);
      }
    };

    calculateRoute();

    // 30초마다 경로 재계산 (실시간 교통 정보 반영)
    const interval = setInterval(calculateRoute, 30000);
    return () => clearInterval(interval);
  }, [position, isLoaded, travelStatus, destination]);

  // API 키 누락 에러
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 rounded-2xl p-6 shadow-lg border border-yellow-200"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Google Maps API 키가 필요합니다
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              실시간 경로 안내를 위해 Google Maps API 키를 설정해주세요.
            </p>
            <a
              href="https://console.cloud.google.com/google/maps-apis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-blue-600 underline"
            >
              API 키 발급받기 →
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  // 로딩 에러
  if (loadError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 rounded-2xl p-6 shadow-lg border border-red-200"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-gray-800">
              지도 로딩 실패
            </h3>
            <p className="text-sm text-gray-600">
              {loadError.message}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 위치 정보 없음
  if (!position) {
    return null;
  }

  // 여행 전이면 표시하지 않음
  if (travelStatus?.status === 'BEFORE_TRIP') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-2xl p-6 shadow-lg border border-blue-200"
      >
        <div className="flex items-center gap-3">
          <Navigation className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              실시간 경로 안내
            </h3>
            <p className="text-sm text-gray-600">
              여행이 시작되면 현재 위치에서 다음 목적지까지의 실시간 경로와 소요시간을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 현재 활동 없음
  if (!travelStatus?.currentActivity) {
    return null;
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
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-800">
            경로 안내
          </h3>
        </div>

        {isCalculating && (
          <Loader className="w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 경로 정보 */}
      {routeInfo && (
        <div className="space-y-4">
          {/* 목적지 */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              다음 목적지
            </p>
            <p className="font-bold text-lg text-gray-800">
              {travelStatus.currentActivity.title}
            </p>
          </div>

          {/* 거리 & 소요시간 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 거리 */}
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-sm text-gray-600">
                  거리
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {routeService.formatDistance(routeInfo.distance)}
              </p>
            </div>

            {/* 소요시간 */}
            <div className="bg-success/10 rounded-xl p-4 border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-success" />
                <p className="text-sm text-gray-600">
                  소요시간
                </p>
              </div>
              <p className="text-2xl font-bold text-success">
                {routeService.formatDuration(
                  routeInfo.durationInTraffic || routeInfo.duration
                )}
              </p>
            </div>
          </div>

          {/* 교통 상황 */}
          {routeInfo.durationInTraffic &&
            routeInfo.durationInTraffic > routeInfo.duration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-warning/10 rounded-xl p-3 border border-warning/20"
              >
                <p className="text-sm text-warning font-medium">
                  ⚠️ 교통 혼잡: 평소보다{' '}
                  {routeService.formatDuration(
                    routeInfo.durationInTraffic - routeInfo.duration
                  )}{' '}
                  지연
                </p>
              </motion.div>
            )}

          {/* 업데이트 시간 */}
          <p className="text-xs text-gray-400 text-center">
            30초마다 자동 업데이트
          </p>
        </div>
      )}

      {/* 로딩 중 */}
      {!routeInfo && !error && isCalculating && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              경로 계산 중...
            </p>
          </div>
        </div>
      )}

      {/* 경로 정보 없음 (너무 먼 거리 등) */}
      {!routeInfo && !error && !isCalculating && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 text-center">
            여행지에 도착하면 실시간 경로 안내가 시작됩니다
          </p>
          <p className="text-xs text-blue-600 text-center mt-1">
            현재 위치에서 목적지까지 자동차 경로를 계산할 수 없습니다
          </p>
        </div>
      )}
    </motion.div>
  );
}
