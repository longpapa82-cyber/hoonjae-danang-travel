'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Clock, TrendingUp, AlertCircle, Loader, Train, Bus, ArrowRight, MapPin } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { routeService, RouteInfo } from '@/lib/services/RouteService';
import { travelData } from '@/lib/travelData';
import { combineDateAndTime, KOREA_TIMEZONE } from '@/lib/timeUtils';

export function RouteInfoCard() {
  const travelStatus = useTravelStatus();
  const { isLoaded, loadError } = useGoogleMaps();

  // 여행 중일 때만 위치 추적 자동 시작
  const shouldTrackLocation = travelStatus?.status === 'IN_PROGRESS';
  const { position } = useLocation({ autoStart: shouldTrackLocation });

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 다음 목적지 찾기 (현재 활동 또는 다음 예정 활동)
  const { destination, nextActivity } = useMemo(() => {
    if (!travelStatus || travelStatus.status !== 'IN_PROGRESS') {
      return { destination: null, nextActivity: null };
    }

    // 현재 활동이 있고 location이 있으면 사용
    if (travelStatus.currentActivity?.location) {
      return {
        destination: {
          lat: travelStatus.currentActivity.location.latitude,
          lng: travelStatus.currentActivity.location.longitude,
        },
        nextActivity: travelStatus.currentActivity
      };
    }

    // 현재 활동이 없거나 location이 없으면 다음 활동 찾기
    // 전체 일정에서 다음 예정 활동 찾기
    for (const day of travelData.days) {
      for (const activity of day.activities) {
        const activityStartTime = combineDateAndTime(day.date, activity.time, KOREA_TIMEZONE);
        const now = new Date();

        // 아직 시작하지 않은 활동 중 location이 있는 첫 번째 활동
        if (now < activityStartTime && activity.location) {
          return {
            destination: {
              lat: activity.location.latitude,
              lng: activity.location.longitude,
            },
            nextActivity: activity
          };
        }
      }
    }

    return { destination: null, nextActivity: null };
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
    console.log('🗺️ RouteInfoCard useEffect', {
      status: travelStatus?.status,
      hasPosition: !!position,
      position,
      isLoaded,
      hasNextActivity: !!nextActivity,
      nextActivity: nextActivity?.title,
      hasDestination: !!destination,
      destination
    });

    // 여행 상태가 없거나, 여행 중이 아니면 실행 안 함
    if (!travelStatus || travelStatus.status !== 'IN_PROGRESS') {
      console.log('RouteInfoCard: 경로 계산 건너뛰기 - 여행 전 또는 완료', travelStatus?.status);
      return;
    }

    if (!position || !isLoaded || !nextActivity || !destination) {
      console.log('RouteInfoCard: 경로 계산 건너뛰기 - 필수 조건 미충족', {
        position: !!position,
        isLoaded,
        nextActivity: !!nextActivity,
        destination: !!destination
      });
      return;
    }

    // 거리 체크: 현재 위치와 목적지가 100km 이상 떨어져 있으면 경로 계산하지 않음
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      destination.lat,
      destination.lng
    );

    console.log(`📏 거리 계산: ${distance.toFixed(1)}km`, {
      from: `${position.latitude}, ${position.longitude}`,
      to: `${destination.lat}, ${destination.lng}`
    });

    if (distance > 100) {
      console.log(
        `RouteInfoCard: 경로 계산 건너뛰기 - 거리가 너무 멀음 (${distance.toFixed(0)}km)`
      );
      setIsCalculating(false);
      setRouteInfo(null);
      setError(null);
      return;
    }

    console.log(`🛣️ RouteInfoCard: 경로 계산 시작 - 거리 ${distance.toFixed(1)}km`);

    const calculateRoute = async () => {
      setIsCalculating(true);
      setError(null);

      try {
        // 한국 좌표인 경우 주소 문자열로 변환 시도
        const isKorea = position.latitude > 33 && position.latitude < 39;

        let originParam: any = position;
        let destinationParam: any = destination;

        if (isKorea && nextActivity?.location?.address) {
          // 한국인 경우 주소 문자열 사용
          console.log('🏠 한국 주소 사용:', nextActivity.location.address);
          destinationParam = nextActivity.location.address;
        }

        // DRIVING 모드로 먼저 시도
        console.log('🚗 DRIVING 모드로 경로 계산 시도');
        let route = await routeService.calculateRoute(originParam, destinationParam, {
          departureTime: new Date(),
          trafficModel: 'best_guess',
        });

        // DRIVING이 실패하면 TRANSIT 시도
        if (route === null && isKorea) {
          console.warn('⚠️ DRIVING 실패 → TRANSIT 모드로 재시도');

          // TRANSIT은 좌표만 사용 (주소는 TRANSIT에서 문제가 될 수 있음)
          const transitOrigin = { lat: position.latitude, lng: position.longitude };
          const transitDestination = { lat: destination.lat, lng: destination.lng };

          // RouteService에 TRANSIT 모드를 직접 호출할 수 없으므로,
          // Google Maps Directions API를 직접 호출
          if (window.google?.maps) {
            const directionsService = new google.maps.DirectionsService();

            await new Promise<void>((resolve, reject) => {
              directionsService.route(
                {
                  origin: transitOrigin,
                  destination: transitDestination,
                  travelMode: google.maps.TravelMode.TRANSIT,
                  region: 'KR',
                },
                (result, status) => {
                  console.log('[RouteInfoCard] TRANSIT API 응답:', status);

                  if (status === google.maps.DirectionsStatus.OK && result) {
                    const leg = result.routes[0].legs[0];
                    route = {
                      distance: leg.distance?.value || 0,
                      duration: leg.duration?.value || 0,
                      durationInTraffic: leg.duration?.value, // TRANSIT은 실시간 교통 없음
                      polyline: result.routes[0].overview_polyline,
                      steps: leg.steps.map((step) => {
                        const baseStep: any = {
                          instruction: step.instructions,
                          distance: step.distance?.value || 0,
                          duration: step.duration?.value || 0,
                          startLocation: {
                            lat: step.start_location.lat(),
                            lng: step.start_location.lng(),
                          },
                          endLocation: {
                            lat: step.end_location.lat(),
                            lng: step.end_location.lng(),
                          },
                          travel_mode: step.travel_mode,
                        };

                        // TRANSIT 세부 정보 추가
                        if (step.transit) {
                          baseStep.transit = {
                            line: {
                              name: step.transit.line.name || '',
                              short_name: step.transit.line.short_name,
                              vehicle: step.transit.line.vehicle?.type || 'BUS',
                              color: step.transit.line.color,
                            },
                            departure_stop: {
                              name: step.transit.departure_stop.name,
                              location: {
                                lat: step.transit.departure_stop.location.lat(),
                                lng: step.transit.departure_stop.location.lng(),
                              },
                            },
                            arrival_stop: {
                              name: step.transit.arrival_stop.name,
                              location: {
                                lat: step.transit.arrival_stop.location.lat(),
                                lng: step.transit.arrival_stop.location.lng(),
                              },
                            },
                            num_stops: step.transit.num_stops || 0,
                          };
                        }

                        return baseStep;
                      }),
                      travelMode: 'TRANSIT', // 대중교통 모드 표시
                    };
                    console.log('✅ TRANSIT 경로 계산 성공', {
                      steps: route.steps.length,
                      transitSteps: route.steps.filter((s: any) => s.transit).length
                    });
                    resolve();
                  } else {
                    console.warn('⚠️ TRANSIT도 실패:', status);
                    resolve(); // 에러가 아니라 경로 없음
                  }
                }
              );
            });
          }
        }

        // 최종 결과 설정
        if (route === null) {
          console.warn('⚠️ 모든 교통수단으로 경로를 찾을 수 없습니다');
          setRouteInfo(null);
          setError(null);
        } else {
          console.log('📍 RouteInfo 설정:', {
            distance: route.distance,
            duration: route.duration,
            travelMode: route.travelMode,
            hasSteps: route.steps.length
          });
          setRouteInfo(route);
        }
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

    // 60초마다 경로 재계산 (실시간 교통 정보 반영) - 떨림 방지를 위해 간격 증가
    const interval = setInterval(calculateRoute, 60000);
    return () => clearInterval(interval);
  }, [position, isLoaded, travelStatus, destination, nextActivity]);

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
              className="text-sm text-primary hover:text-blue-600 underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 py-0.5"
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

  // 위치 정보 없음 또는 여행 전
  if (!position || travelStatus?.status === 'BEFORE_TRIP') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-3">
          <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
              실시간 경로 안내
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              여행이 시작되면 현재 위치에서 다음 목적지까지의 실시간 경로와 소요시간을 확인할 수 있습니다.
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
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary dark:text-blue-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
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
      {routeInfo && nextActivity && (
        <div className="space-y-4">
          {/* 목적지 */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {travelStatus?.currentActivity ? '현재 목적지' : '다음 목적지'}
            </p>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
              {nextActivity.title}
            </p>
          </div>

          {/* 거리 & 소요시간 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 거리 */}
            <div className="bg-primary/10 dark:bg-blue-500/20 rounded-xl p-4 border border-primary/20 dark:border-blue-400/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary dark:text-blue-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  거리
                </p>
              </div>
              <p className="text-2xl font-bold text-primary dark:text-blue-400">
                {routeService.formatDistance(routeInfo.distance)}
              </p>
            </div>

            {/* 소요시간 */}
            <div className="bg-success/10 dark:bg-green-500/20 rounded-xl p-4 border border-success/20 dark:border-green-400/30">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-success dark:text-green-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  소요시간
                </p>
              </div>
              <p className="text-2xl font-bold text-success dark:text-green-400">
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

          {/* 대중교통 안내 */}
          {routeInfo.travelMode === 'TRANSIT' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800 space-y-3"
            >
              {/* 대중교통 헤더 */}
              <div className="flex items-center gap-2">
                <Train className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  대중교통 경로 (버스/지하철)
                </p>
              </div>

              {/* 대중교통 상세 경로 */}
              <div className="space-y-2">
                {routeInfo.steps.filter((step: any) => step.transit).map((step: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-900"
                  >
                    {/* 노선 정보 */}
                    <div className="flex items-center gap-2 mb-2">
                      <Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: step.transit.line.color || '#3B82F6' }}
                      >
                        {step.transit.line.short_name || step.transit.line.name}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {step.transit.num_stops}개 정거장
                      </span>
                    </div>

                    {/* 승차/하차 정보 */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">승차: </span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">
                            {step.transit.departure_stop.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">하차: </span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">
                            {step.transit.arrival_stop.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 소요 시간 */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      약 {routeService.formatDuration(step.duration)}
                    </div>
                  </div>
                ))}

                {/* 도보 구간 안내 */}
                {routeInfo.steps.some((step: any) => step.travel_mode === 'WALKING') && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    <span>도보 이동 구간 포함</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 업데이트 시간 */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            60초마다 자동 업데이트
          </p>
        </div>
      )}

      {/* 첫 로딩 중 (routeInfo가 없을 때만) */}
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
