/**
 * ETA (Estimated Time of Arrival) 계산 유틸리티
 * - 현재 위치에서 목적지까지 예상 도착 시간 계산
 * - 이동 수단별 속도 고려
 * - 실시간 업데이트
 */

import { Activity, Location } from '@/types/travel';
import LocationService from './services/LocationService';

export type TransportMode = 'WALKING' | 'DRIVING' | 'TRANSIT' | 'BICYCLING';

// 이동 수단별 평균 속도 (km/h)
const AVERAGE_SPEEDS: Record<TransportMode, number> = {
  WALKING: 4,      // 도보: 4km/h
  DRIVING: 30,     // 차량: 30km/h (도심 교통 고려)
  TRANSIT: 25,     // 대중교통: 25km/h
  BICYCLING: 15,   // 자전거: 15km/h
};

export interface ETAResult {
  distanceInMeters: number;
  distanceInKm: number;
  distanceText: string;
  durationInMinutes: number;
  durationText: string;
  estimatedArrivalTime: Date;
  transportMode: TransportMode;
}

/**
 * 두 지점 간 거리 계산 (미터)
 */
export function calculateDistance(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  return LocationService.calculateDistance(
    from.latitude,
    from.longitude,
    to.latitude,
    to.longitude
  );
}

/**
 * 거리를 텍스트로 변환
 */
export function formatDistance(distanceInMeters: number): string {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  }
}

/**
 * 시간을 텍스트로 변환
 */
export function formatDuration(durationInMinutes: number): string {
  if (durationInMinutes < 60) {
    return `약 ${Math.round(durationInMinutes)}분`;
  } else {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.round(durationInMinutes % 60);
    if (minutes === 0) {
      return `약 ${hours}시간`;
    }
    return `약 ${hours}시간 ${minutes}분`;
  }
}

/**
 * ETA 계산
 */
export function calculateETA(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  transportMode: TransportMode = 'WALKING'
): ETAResult {
  const distanceInMeters = calculateDistance(from, to);
  const distanceInKm = distanceInMeters / 1000;

  // 평균 속도로 소요 시간 계산
  const averageSpeed = AVERAGE_SPEEDS[transportMode];
  const durationInHours = distanceInKm / averageSpeed;
  const durationInMinutes = durationInHours * 60;

  // 예상 도착 시간
  const estimatedArrivalTime = new Date(Date.now() + durationInMinutes * 60 * 1000);

  return {
    distanceInMeters,
    distanceInKm,
    distanceText: formatDistance(distanceInMeters),
    durationInMinutes,
    durationText: formatDuration(durationInMinutes),
    estimatedArrivalTime,
    transportMode,
  };
}

/**
 * 현재 위치에서 Activity까지 ETA 계산
 */
export function calculateETAToActivity(
  currentPosition: { latitude: number; longitude: number },
  activity: Activity,
  transportMode: TransportMode = 'WALKING'
): ETAResult | null {
  if (!activity.location) {
    return null;
  }

  return calculateETA(
    currentPosition,
    {
      latitude: activity.location.latitude,
      longitude: activity.location.longitude,
    },
    transportMode
  );
}

/**
 * 현재 위치에서 Location까지 ETA 계산
 */
export function calculateETAToLocation(
  currentPosition: { latitude: number; longitude: number },
  location: Location,
  transportMode: TransportMode = 'WALKING'
): ETAResult {
  return calculateETA(
    currentPosition,
    {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    transportMode
  );
}

/**
 * 최적 출발 시간 계산
 * @param targetTime 목표 도착 시간
 * @param location 목적지 위치
 * @param currentPosition 현재 위치
 * @param transportMode 이동 수단
 * @param bufferMinutes 여유 시간 (분)
 */
export function calculateOptimalDepartureTime(
  targetTime: Date,
  location: Location,
  currentPosition: { latitude: number; longitude: number },
  transportMode: TransportMode = 'WALKING',
  bufferMinutes: number = 10
): {
  departureTime: Date;
  eta: ETAResult;
  timeUntilDeparture: number; // 분
  shouldLeaveNow: boolean;
} {
  const eta = calculateETAToLocation(currentPosition, location, transportMode);

  // 출발 시간 = 목표 시간 - 이동 시간 - 여유 시간
  const departureTime = new Date(
    targetTime.getTime() - (eta.durationInMinutes + bufferMinutes) * 60 * 1000
  );

  const timeUntilDeparture = (departureTime.getTime() - Date.now()) / 60000;

  return {
    departureTime,
    eta,
    timeUntilDeparture,
    shouldLeaveNow: timeUntilDeparture <= 0,
  };
}
