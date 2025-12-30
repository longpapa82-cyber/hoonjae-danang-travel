/**
 * Geofencing 서비스
 * - 목적지 주변 자동 감지
 * - 도착 시 자동 체크인
 * - 알림 및 햅틱 피드백
 */

import { Activity } from '@/types/travel';
import LocationService, { LocationPosition } from './LocationService';

export interface Geofence {
  id: string;
  activity: Activity;
  latitude: number;
  longitude: number;
  radius: number; // 미터
  isActive: boolean;
  enteredAt?: number; // 진입 시간 (timestamp)
}

export type GeofenceEnterCallback = (geofence: Geofence) => void;
export type GeofenceExitCallback = (geofence: Geofence) => void;

class GeofenceService {
  private static instance: GeofenceService;
  private geofences: Map<string, Geofence> = new Map();
  private enterCallbacks: Set<GeofenceEnterCallback> = new Set();
  private exitCallbacks: Set<GeofenceExitCallback> = new Set();
  private activeGeofences: Set<string> = new Set(); // 현재 진입한 울타리
  private locationService: LocationService;

  private constructor() {
    this.locationService = LocationService.getInstance();

    // 위치 업데이트 시 geofence 체크
    this.locationService.subscribe((position) => {
      this.checkGeofences(position);
    });
  }

  static getInstance(): GeofenceService {
    if (!GeofenceService.instance) {
      GeofenceService.instance = new GeofenceService();
    }
    return GeofenceService.instance;
  }

  /**
   * Geofence 생성
   */
  createGeofence(
    activity: Activity,
    latitude: number,
    longitude: number,
    radius: number = 100 // 기본 100m
  ): Geofence {
    const geofence: Geofence = {
      id: activity.id,
      activity,
      latitude,
      longitude,
      radius,
      isActive: true,
    };

    this.geofences.set(geofence.id, geofence);
    return geofence;
  }

  /**
   * Geofence 제거
   */
  removeGeofence(id: string): void {
    this.geofences.delete(id);
    this.activeGeofences.delete(id);
  }

  /**
   * 모든 Geofence 제거
   */
  clearGeofences(): void {
    this.geofences.clear();
    this.activeGeofences.clear();
  }

  /**
   * Geofence 활성화/비활성화
   */
  setGeofenceActive(id: string, active: boolean): void {
    const geofence = this.geofences.get(id);
    if (geofence) {
      geofence.isActive = active;
    }
  }

  /**
   * 진입 이벤트 구독
   */
  onEnter(callback: GeofenceEnterCallback): () => void {
    this.enterCallbacks.add(callback);
    return () => {
      this.enterCallbacks.delete(callback);
    };
  }

  /**
   * 이탈 이벤트 구독
   */
  onExit(callback: GeofenceExitCallback): () => void {
    this.exitCallbacks.add(callback);
    return () => {
      this.exitCallbacks.delete(callback);
    };
  }

  /**
   * 특정 geofence 내부에 있는지 확인
   */
  isInsideGeofence(geofenceId: string, position?: LocationPosition): boolean {
    const geofence = this.geofences.get(geofenceId);
    if (!geofence || !geofence.isActive) return false;

    const currentPosition = position || this.locationService.getLastPosition();
    if (!currentPosition) return false;

    const distance = LocationService.calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      geofence.latitude,
      geofence.longitude
    );

    return distance <= geofence.radius;
  }

  /**
   * 가장 가까운 활성 geofence 찾기
   */
  findNearestGeofence(position?: LocationPosition): {
    geofence: Geofence;
    distance: number;
  } | null {
    const currentPosition = position || this.locationService.getLastPosition();
    if (!currentPosition) return null;

    let nearest: { geofence: Geofence; distance: number } | null = null;

    this.geofences.forEach((geofence) => {
      if (!geofence.isActive) return;

      const distance = LocationService.calculateDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (!nearest || distance < nearest.distance) {
        nearest = { geofence, distance };
      }
    });

    return nearest;
  }

  /**
   * 자동 체크인
   */
  autoCheckIn(activity: Activity): void {
    console.log(`✅ 자동 체크인: ${activity.title}`);

    // 햅틱 피드백
    this.playHapticFeedback('success');

    // 알림 발송
    this.sendNotification(`${activity.title}에 도착했습니다!`);

    // TODO: 실제 체크인 로직 연동
  }

  /**
   * 알림 발송
   */
  private sendNotification(message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('다낭 여행 트래커', {
        body: message,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'geofence-arrival',
        requireInteraction: false,
      });
    }
  }

  /**
   * 햅틱 피드백
   */
  private playHapticFeedback(type: 'success' | 'warning' | 'error'): void {
    if ('vibrate' in navigator) {
      const patterns = {
        success: [50, 100, 50], // 짧-짧
        warning: [100, 50, 100, 50, 100], // 중-중-중
        error: [200], // 길게
      };

      navigator.vibrate(patterns[type]);
    }
  }

  /**
   * Geofence 체크 (내부 메서드)
   */
  private checkGeofences(position: LocationPosition): void {
    this.geofences.forEach((geofence) => {
      if (!geofence.isActive) return;

      const distance = LocationService.calculateDistance(
        position.latitude,
        position.longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radius;
      const wasInside = this.activeGeofences.has(geofence.id);

      // 진입 감지
      if (isInside && !wasInside) {
        geofence.enteredAt = Date.now();
        this.activeGeofences.add(geofence.id);
        this.notifyEnter(geofence);

        // 자동 체크인
        this.autoCheckIn(geofence.activity);
      }

      // 이탈 감지
      else if (!isInside && wasInside) {
        this.activeGeofences.delete(geofence.id);
        this.notifyExit(geofence);
      }
    });
  }

  /**
   * 진입 이벤트 발행
   */
  private notifyEnter(geofence: Geofence): void {
    this.enterCallbacks.forEach((callback) => {
      try {
        callback(geofence);
      } catch (error) {
        console.error('Error in geofence enter callback:', error);
      }
    });
  }

  /**
   * 이탈 이벤트 발행
   */
  private notifyExit(geofence: Geofence): void {
    this.exitCallbacks.forEach((callback) => {
      try {
        callback(geofence);
      } catch (error) {
        console.error('Error in geofence exit callback:', error);
      }
    });
  }

  /**
   * 현재 활성 geofences 가져오기
   */
  getActiveGeofences(): Geofence[] {
    return Array.from(this.geofences.values()).filter((g) => g.isActive);
  }

  /**
   * 현재 진입한 geofences 가져오기
   */
  getCurrentlyInside(): Geofence[] {
    return Array.from(this.activeGeofences)
      .map((id) => this.geofences.get(id))
      .filter((g): g is Geofence => g !== undefined);
  }
}

// Export singleton instance
export const geofenceService = GeofenceService.getInstance();
export default GeofenceService;
