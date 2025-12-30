/**
 * Google Maps Routes API 서비스
 * - 현재 위치에서 목적지까지 경로 계산
 * - 실시간 교통 정보 반영 ETA
 * - 대체 경로 제안
 */

import { LocationPosition } from './LocationService';

export interface RouteInfo {
  distance: number; // 미터
  duration: number; // 초
  durationInTraffic?: number; // 초 (교통 상황 반영)
  polyline: string; // Encoded polyline
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
}

export interface RouteOptions {
  departureTime?: Date;
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  avoidFerries?: boolean;
  trafficModel?: 'best_guess' | 'pessimistic' | 'optimistic';
}

class RouteService {
  private static instance: RouteService;
  private directionsService: google.maps.DirectionsService | null = null;

  private constructor() {}

  static getInstance(): RouteService {
    if (!RouteService.instance) {
      RouteService.instance = new RouteService();
    }
    return RouteService.instance;
  }

  /**
   * Google Maps API 초기화
   */
  initialize(google: typeof window.google): void {
    if (!this.directionsService && google?.maps) {
      this.directionsService = new google.maps.DirectionsService();
    }
  }

  /**
   * 경로 계산
   */
  async calculateRoute(
    origin: LocationPosition | { lat: number; lng: number },
    destination: { lat: number; lng: number },
    options: RouteOptions = {}
  ): Promise<RouteInfo> {
    if (!this.directionsService) {
      throw new Error('RouteService not initialized. Call initialize() first.');
    }

    const originLatLng =
      'latitude' in origin
        ? { lat: origin.latitude, lng: origin.longitude }
        : origin;

    const request: google.maps.DirectionsRequest = {
      origin: originLatLng,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: options.departureTime
        ? {
            departureTime: options.departureTime,
            trafficModel:
              options.trafficModel === 'pessimistic'
                ? google.maps.TrafficModel.PESSIMISTIC
                : options.trafficModel === 'optimistic'
                ? google.maps.TrafficModel.OPTIMISTIC
                : google.maps.TrafficModel.BEST_GUESS,
          }
        : undefined,
      avoidHighways: options.avoidHighways,
      avoidTolls: options.avoidTolls,
      avoidFerries: options.avoidFerries,
    };

    return new Promise((resolve, reject) => {
      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const leg = route.legs[0];

          const routeInfo: RouteInfo = {
            distance: leg.distance?.value || 0,
            duration: leg.duration?.value || 0,
            durationInTraffic: leg.duration_in_traffic?.value,
            polyline: route.overview_polyline,
            steps: leg.steps.map((step) => ({
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
            })),
          };

          resolve(routeInfo);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  }

  /**
   * 여러 경로 옵션 계산 (대체 경로)
   */
  async calculateAlternativeRoutes(
    origin: LocationPosition | { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteInfo[]> {
    if (!this.directionsService) {
      throw new Error('RouteService not initialized');
    }

    const originLatLng =
      'latitude' in origin
        ? { lat: origin.latitude, lng: origin.longitude }
        : origin;

    const request: google.maps.DirectionsRequest = {
      origin: originLatLng,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel.BEST_GUESS,
      },
    };

    return new Promise((resolve, reject) => {
      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const routes = result.routes.map((route) => {
            const leg = route.legs[0];
            return {
              distance: leg.distance?.value || 0,
              duration: leg.duration?.value || 0,
              durationInTraffic: leg.duration_in_traffic?.value,
              polyline: route.overview_polyline,
              steps: leg.steps.map((step) => ({
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
              })),
            };
          });

          resolve(routes);
        } else {
          reject(new Error(`Alternative routes request failed: ${status}`));
        }
      });
    });
  }

  /**
   * ETA 계산 (교통 상황 반영)
   */
  async calculateETA(
    origin: LocationPosition,
    destination: { lat: number; lng: number }
  ): Promise<Date> {
    const route = await this.calculateRoute(origin, destination, {
      departureTime: new Date(),
      trafficModel: 'best_guess',
    });

    const durationSeconds = route.durationInTraffic || route.duration;
    const eta = new Date(Date.now() + durationSeconds * 1000);

    return eta;
  }

  /**
   * 거리 및 소요시간 텍스트 포맷
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  }
}

// Export singleton instance
export const routeService = RouteService.getInstance();
export default RouteService;
