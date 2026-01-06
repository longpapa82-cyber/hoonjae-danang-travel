/**
 * Notification 관리 서비스
 * - 알림 권한 요청 및 관리
 * - 여행 관련 알림 발송
 * - 알림 설정 저장
 */

export type NotificationType = 'arrival' | 'approaching' | 'schedule' | 'reminder';

export interface NotificationOptions {
  title: string;
  body: string;
  type: NotificationType;
  icon?: string;
  badge?: string;
  requireInteraction?: boolean;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private enabled: boolean = true;

  private constructor() {
    // 브라우저 환경에서만 초기화
    if (typeof window !== 'undefined') {
      this.checkPermission();
      this.loadSettings();
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 알림 권한 확인
   */
  private checkPermission(): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다.');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return 'denied';
    }
  }

  /**
   * 알림 발송
   */
  async send(options: NotificationOptions): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    if (!this.enabled) {
      console.log('알림이 비활성화되어 있습니다.');
      return;
    }

    // 권한이 없으면 자동으로 요청
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('알림 권한이 거부되었습니다.');
        return;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192.png',
        badge: options.badge || '/icons/icon-192.png',
        tag: `travel-${options.type}`,
        requireInteraction: options.requireInteraction || false,
        data: options.data,
      });

      // 클릭 이벤트 처리
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 자동 닫기 (5초)
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('알림 발송 실패:', error);
    }
  }

  /**
   * 도착 알림
   */
  async sendArrivalNotification(locationName: string): Promise<void> {
    await this.send({
      title: '🎉 도착했습니다!',
      body: `${locationName}에 도착했습니다. 즐거운 시간 보내세요!`,
      type: 'arrival',
      requireInteraction: true,
    });
  }

  /**
   * 접근 중 알림 (500m)
   */
  async sendApproachingNotification(
    locationName: string,
    distanceInMeters: number
  ): Promise<void> {
    const distance = distanceInMeters < 1000
      ? `${Math.round(distanceInMeters)}m`
      : `${(distanceInMeters / 1000).toFixed(1)}km`;

    await this.send({
      title: '📍 곧 도착합니다!',
      body: `${locationName}까지 약 ${distance} 남았습니다. 준비하세요!`,
      type: 'approaching',
    });
  }

  /**
   * 일정 알림
   */
  async sendScheduleNotification(
    activityName: string,
    timeInMinutes: number
  ): Promise<void> {
    await this.send({
      title: '⏰ 일정 알림',
      body: `${activityName}까지 ${timeInMinutes}분 남았습니다!`,
      type: 'schedule',
    });
  }

  /**
   * 맞춤 알림
   */
  async sendCustomNotification(title: string, body: string): Promise<void> {
    await this.send({
      title,
      body,
      type: 'reminder',
    });
  }

  /**
   * 알림 활성화/비활성화
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.saveSettings();
  }

  /**
   * 알림 활성화 상태 확인
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 권한 상태 확인
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * 권한 있는지 확인
   */
  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  /**
   * 설정 저장
   */
  private saveSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('notification_enabled', JSON.stringify(this.enabled));
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
    }
  }

  /**
   * 설정 불러오기
   */
  private loadSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('notification_enabled');
      if (saved !== null) {
        this.enabled = JSON.parse(saved);
      }
    } catch (error) {
      console.error('알림 설정 불러오기 실패:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
export default NotificationService;
