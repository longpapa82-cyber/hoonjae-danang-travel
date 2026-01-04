/**
 * 외부 지도 앱 길찾기 연동 유틸리티
 */

import { Location } from '@/types/travel';

export type NavigationApp = 'google' | 'naver' | 'kakao';

export interface NavigationAppInfo {
  id: NavigationApp;
  name: string;
  icon: string;
}

export const NAVIGATION_APPS: NavigationAppInfo[] = [
  { id: 'google', name: 'Google Maps', icon: '🗺️' },
  { id: 'naver', name: '네이버 지도', icon: '🟢' },
  { id: 'kakao', name: '카카오맵', icon: '💬' },
];

/**
 * Google Maps 앱/웹으로 길찾기
 */
export function openGoogleMaps(destination: Location, destinationName?: string): void {
  const { latitude, longitude } = destination;
  const name = destinationName || destination.address || '';

  // Google Maps URL Scheme
  // 모바일: google.navigation:q=lat,lng
  // 웹 폴백: https://www.google.com/maps/dir/?api=1&destination=lat,lng
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(name)}`;

  window.open(url, '_blank');
}

/**
 * 네이버 지도 앱/웹으로 길찾기
 */
export function openNaverMap(destination: Location, destinationName?: string): void {
  const { latitude, longitude, address } = destination;
  const name = destinationName || address || '목적지';

  // 네이버 지도 URL Scheme
  // 앱: nmap://route/walk?dlat=lat&dlng=lng&dname=name
  // 웹 폴백: https://map.naver.com/v5/directions/-/-/-/walk?c=lng,lat,15
  const appUrl = `nmap://route/walk?dlat=${latitude}&dlng=${longitude}&dname=${encodeURIComponent(name)}`;
  const webUrl = `https://map.naver.com/v5/directions/-/-/-/walk?c=${longitude},${latitude},15&dname=${encodeURIComponent(name)}`;

  // 앱 실행 시도 후 실패 시 웹으로 폴백
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = appUrl;
  document.body.appendChild(iframe);

  setTimeout(() => {
    document.body.removeChild(iframe);
    window.open(webUrl, '_blank');
  }, 1500);
}

/**
 * 카카오맵 앱/웹으로 길찾기
 */
export function openKakaoMap(destination: Location, destinationName?: string): void {
  const { latitude, longitude, address } = destination;
  const name = destinationName || address || '목적지';

  // 카카오맵 URL Scheme
  // 앱: kakaomap://route?ep=lat,lng&by=FOOT
  // 웹 폴백: https://map.kakao.com/link/to/name,lat,lng
  const appUrl = `kakaomap://route?ep=${latitude},${longitude}&by=FOOT`;
  const webUrl = `https://map.kakao.com/link/to/${encodeURIComponent(name)},${latitude},${longitude}`;

  // 앱 실행 시도 후 실패 시 웹으로 폴백
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = appUrl;
  document.body.appendChild(iframe);

  setTimeout(() => {
    document.body.removeChild(iframe);
    window.open(webUrl, '_blank');
  }, 1500);
}

/**
 * 선택한 앱으로 길찾기 실행
 */
export function navigateToLocation(
  app: NavigationApp,
  destination: Location,
  destinationName?: string
): void {
  switch (app) {
    case 'google':
      openGoogleMaps(destination, destinationName);
      break;
    case 'naver':
      openNaverMap(destination, destinationName);
      break;
    case 'kakao':
      openKakaoMap(destination, destinationName);
      break;
    default:
      console.error('Unknown navigation app:', app);
  }
}

/**
 * 거리를 사용자 친화적인 문자열로 변환
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 도보 예상 시간 계산 (평균 시속 4km 기준)
 */
export function estimateWalkingTime(meters: number): string {
  const hours = meters / 4000; // 시속 4km
  const minutes = Math.ceil(hours * 60);

  if (minutes < 60) {
    return `도보 약 ${minutes}분`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `도보 약 ${h}시간 ${m}분`;
}
