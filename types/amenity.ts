/**
 * 편의시설 관련 타입 정의
 */

import { Location } from './travel';

export type AmenityCategory = 'CONVENIENCE_STORE' | 'SUPERMARKET';

export interface Amenity {
  id: string;
  name: string;
  nameKo: string; // 한글 이름
  category: AmenityCategory;
  location: Location;
  openingHours: string; // "24시간" 또는 "08:00-23:00"
  phone?: string;
  description?: string;
  distance?: number; // 호텔로부터 거리 (미터) - 런타임 계산
}

export interface AmenityCategoryInfo {
  key: AmenityCategory;
  label: string;
  icon: string;
}
