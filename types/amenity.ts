/**
 * 편의시설 관련 타입 정의
 */

import { Location } from './travel';

export type AmenityCategory = 'CONVENIENCE_STORE' | 'SUPERMARKET' | 'CAFE' | 'HOTEL_FACILITY';

export type CafeSubType = 'SPECIALTY' | 'CHAIN' | 'BRUNCH' | 'ROASTERY';

export interface HotelFacilityInfo {
  floor: number | string; // 1, 4, "최상층"
  building?: string; // "Tower A", "Main Building"
  zone?: string; // "로비 구역", "수영장 구역"
  features?: string[]; // ["수영장", "바", "전망 좋음"]
}

export interface Amenity {
  id: string;
  name: string;
  nameKo: string; // 한글 이름
  category: AmenityCategory;
  subType?: CafeSubType; // 카페인 경우 세부 분류
  location?: Location; // 호텔 내부 시설은 GPS 불필요하므로 optional
  openingHours: string; // "24시간" 또는 "08:00-23:00"
  phone?: string;
  description?: string;
  distance?: number; // 호텔로부터 거리 (미터) - 런타임 계산
  hotelFacility?: HotelFacilityInfo; // 호텔 내부 시설인 경우
}

export interface AmenityCategoryInfo {
  key: AmenityCategory;
  label: string;
  labelShort: string; // 모바일용 축약 레이블
  icon: string;
  color?: string; // 마커 색상
}
