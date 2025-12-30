/**
 * GPS 위치 추적 서비스
 * - 실시간 위치 추적
 * - 배터리 효율 최적화 (Polarsteps 방식: 4%/일)
 * - 백그라운드 추적 지원
 */

export interface LocationConfig {
  enableHighAccuracy: boolean; // GPS 사용 (정확도 우선)
  maximumAge: number; // 캐시된 위치 최대 허용 시간 (ms)
  timeout: number; // 위치 요청 타임아웃 (ms)
  distanceFilter: number; // 최소 이동 거리 (m)
  batterySaver: boolean; // 배터리 절약 모드
}

export interface LocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number; // 정확도 (미터)
  timestamp: number;
  speed?: number; // 속도 (m/s)
  heading?: number; // 방향 (도)
}

export type LocationCallback = (position: LocationPosition) => void;
export type LocationErrorCallback = (error: GeolocationPositionError) => void;

class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private config: LocationConfig;
  private subscribers: Set<LocationCallback> = new Set();
  private errorSubscribers: Set<LocationErrorCallback> = new Set();
  private lastPosition: LocationPosition | null = null;

  private constructor() {
    // 기본 설정 (배터리 효율 최적화)
    this.config = {
      enableHighAccuracy: true,
      maximumAge: 5000, // 5초
      timeout: 10000, // 10초
      distanceFilter: 10, // 10m 이동 시 업데이트
      batterySaver: false,
    };
  }

  /**
   * 싱글톤 인스턴스
   */
  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * 위치 권한 확인
   */
  async checkPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch (error) {
      console.warn('Permission API not supported:', error);
      return 'prompt';
    }
  }

  /**
   * 위치 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    try {
      const position = await this.getCurrentPosition();
      return !!position;
    } catch (error) {
      console.error('Permission denied:', error);
      return false;
    }
  }

  /**
   * 현재 위치 한 번만 가져오기
   */
  getCurrentPosition(): Promise<LocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = this.parsePosition(position);
          this.lastPosition = loc;
          resolve(loc);
        },
        (error) => {
          reject(error);
        },
        this.getGeolocationOptions()
      );
    });
  }

  /**
   * 실시간 위치 추적 시작
   */
  startWatching(): void {
    if (this.watchId !== null) {
      console.warn('Already watching position');
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = this.parsePosition(position);

        // 거리 필터링 (불필요한 업데이트 방지)
        if (this.shouldUpdatePosition(newPosition)) {
          this.lastPosition = newPosition;
          this.notifySubscribers(newPosition);
        }
      },
      (error) => {
        this.notifyErrorSubscribers(error);
      },
      this.getGeolocationOptions()
    );
  }

  /**
   * 위치 추적 중지
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * 위치 업데이트 구독
   */
  subscribe(callback: LocationCallback): () => void {
    this.subscribers.add(callback);

    // 마지막 위치가 있으면 즉시 전달
    if (this.lastPosition) {
      callback(this.lastPosition);
    }

    // 구독 해제 함수 반환
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * 에러 구독
   */
  subscribeError(callback: LocationErrorCallback): () => void {
    this.errorSubscribers.add(callback);
    return () => {
      this.errorSubscribers.delete(callback);
    };
  }

  /**
   * 배터리 절약 모드 활성화
   */
  enableBatterySaver(): void {
    this.config.batterySaver = true;
    this.config.enableHighAccuracy = false;
    this.config.maximumAge = 30000; // 30초
    this.config.distanceFilter = 50; // 50m

    // 추적 중이면 재시작
    if (this.watchId !== null) {
      this.stopWatching();
      this.startWatching();
    }
  }

  /**
   * 고정밀 모드 활성화
   */
  enableHighAccuracy(): void {
    this.config.batterySaver = false;
    this.config.enableHighAccuracy = true;
    this.config.maximumAge = 5000; // 5초
    this.config.distanceFilter = 10; // 10m

    // 추적 중이면 재시작
    if (this.watchId !== null) {
      this.stopWatching();
      this.startWatching();
    }
  }

  /**
   * 마지막 알려진 위치
   */
  getLastPosition(): LocationPosition | null {
    return this.lastPosition;
  }

  /**
   * 두 위치 간 거리 계산 (Haversine formula)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // 지구 반경 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터 단위 거리
  }

  // === Private Methods ===

  private parsePosition(position: GeolocationPosition): LocationPosition {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      speed: position.coords.speed ?? undefined,
      heading: position.coords.heading ?? undefined,
    };
  }

  private getGeolocationOptions(): PositionOptions {
    return {
      enableHighAccuracy: this.config.enableHighAccuracy,
      maximumAge: this.config.maximumAge,
      timeout: this.config.timeout,
    };
  }

  private shouldUpdatePosition(newPosition: LocationPosition): boolean {
    if (!this.lastPosition) return true;

    const distance = LocationService.calculateDistance(
      this.lastPosition.latitude,
      this.lastPosition.longitude,
      newPosition.latitude,
      newPosition.longitude
    );

    return distance >= this.config.distanceFilter;
  }

  private notifySubscribers(position: LocationPosition): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(position);
      } catch (error) {
        console.error('Error in location subscriber:', error);
      }
    });
  }

  private notifyErrorSubscribers(error: GeolocationPositionError): void {
    this.errorSubscribers.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error subscriber:', err);
      }
    });
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();
export default LocationService;
