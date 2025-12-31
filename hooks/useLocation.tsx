'use client';

import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationPosition } from '@/lib/services/LocationService';

interface UseLocationOptions {
  autoStart?: boolean; // 자동으로 추적 시작
  batterySaver?: boolean; // 배터리 절약 모드
}

interface UseLocationReturn {
  position: LocationPosition | null;
  error: GeolocationPositionError | null;
  isTracking: boolean;
  permission: PermissionState;
  startTracking: () => void;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
  enableBatterySaver: () => void;
  enableHighAccuracy: () => void;
}

/**
 * GPS 위치 추적 Hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { position, startTracking } = useLocation({ autoStart: true });
 *
 *   if (position) {
 *     console.log(position.latitude, position.longitude);
 *   }
 * }
 * ```
 */
export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const { autoStart = false, batterySaver = false } = options;

  const [position, setPosition] = useState<LocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permission, setPermission] = useState<PermissionState>('prompt');

  // 권한 확인
  const checkPermission = useCallback(async () => {
    const state = await locationService.checkPermission();
    setPermission(state);
    return state;
  }, []);

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await locationService.requestPermission();
      await checkPermission();
      return granted;
    } catch (err) {
      console.error('Permission request failed:', err);
      return false;
    }
  }, [checkPermission]);

  // 추적 시작
  const startTracking = useCallback(() => {
    if (isTracking) return;

    locationService.startWatching();
    setIsTracking(true);
  }, [isTracking]);

  // 추적 중지
  const stopTracking = useCallback(() => {
    locationService.stopWatching();
    setIsTracking(false);
  }, []);

  // 배터리 절약 모드
  const enableBatterySaver = useCallback(() => {
    locationService.enableBatterySaver();
  }, []);

  // 고정밀 모드
  const enableHighAccuracy = useCallback(() => {
    locationService.enableHighAccuracy();
  }, []);

  // 초기 설정
  useEffect(() => {
    // 테스트 모드 확인 (localStorage에 testDate가 있으면 테스트 모드)
    const testDateStr = typeof window !== 'undefined' ? localStorage.getItem('testDate') : null;

    if (testDateStr && autoStart) {
      // 테스트 모드: 다낭 근처의 시뮬레이션 위치 제공
      // 호텔(Wyndham Soleil Danang) 근처 위치
      const testPosition: LocationPosition = {
        latitude: 16.0583,
        longitude: 108.2226,
        accuracy: 10,
        timestamp: Date.now(),
      };

      setPosition(testPosition);
      setPermission('granted');
      setIsTracking(true);
      console.log('테스트 모드: 시뮬레이션 위치 사용 (다낭 호텔)', testPosition);

      // 테스트 모드에서는 실제 GPS 추적하지 않음
      return;
    }

    // 실제 위치 추적 모드
    // 권한 확인
    checkPermission();

    // 배터리 절약 모드 설정
    if (batterySaver) {
      enableBatterySaver();
    }

    // 자동 시작
    if (autoStart) {
      checkPermission().then((state) => {
        if (state === 'granted') {
          startTracking();
        }
      });
    }

    // 마지막 위치 가져오기
    const lastPos = locationService.getLastPosition();
    if (lastPos) {
      setPosition(lastPos);
    }

    // 위치 업데이트 구독
    const unsubscribe = locationService.subscribe((pos) => {
      setPosition(pos);
      setError(null);
    });

    // 에러 구독
    const unsubscribeError = locationService.subscribeError((err) => {
      setError(err);
      console.error('Location error:', err);
    });

    // 클린업
    return () => {
      unsubscribe();
      unsubscribeError();
    };
  }, [autoStart, batterySaver, checkPermission, enableBatterySaver, startTracking]);

  return {
    position,
    error,
    isTracking,
    permission,
    startTracking,
    stopTracking,
    requestPermission,
    enableBatterySaver,
    enableHighAccuracy,
  };
}
