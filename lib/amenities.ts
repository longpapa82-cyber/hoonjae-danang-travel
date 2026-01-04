/**
 * 다낭 윈덤솔레일 호텔 주변 편의시설 정보
 * 호텔 위치: 16.0583, 108.2226 (Pham Van Dong St.)
 */

import { Amenity, AmenityCategory } from '@/types/amenity';
import { Location } from '@/types/travel';

export const AMENITIES: Amenity[] = [
  // ============ 24시간 편의점 ============
  {
    id: 'convenience-1',
    name: 'ONE STOP',
    nameKo: '원스톱 24시간 편의점',
    category: 'CONVENIENCE_STORE',
    location: {
      latitude: 16.0590,
      longitude: 108.2235,
      address: 'Pham Van Dong St., An Hai, Son Tra, Da Nang',
    },
    openingHours: '24시간',
    description: '24시간 편의점 & 스낵, 음료, 간단한 식사용품',
  },
  {
    id: 'convenience-2',
    name: 'An Mart & Coffee 24/7',
    nameKo: '안마트 & 커피',
    category: 'CONVENIENCE_STORE',
    location: {
      latitude: 16.0575,
      longitude: 108.2240,
      address: 'An Hai, Son Tra, Da Nang',
    },
    openingHours: '24시간',
    description: '작은 마트 + 커피, 음료까지 OK',
  },
  {
    id: 'convenience-3',
    name: 'Sontra mini Mart 24h',
    nameKo: '손트라 미니마트',
    category: 'CONVENIENCE_STORE',
    location: {
      latitude: 16.0595,
      longitude: 108.2220,
      address: 'Son Tra, Da Nang',
    },
    openingHours: '24시간',
    description: '24시간 영업 편의점, 현지 주민들도 자주 이용',
  },
  {
    id: 'convenience-4',
    name: 'Oh! Mart Đà Nẵng',
    nameKo: '오 마트 다낭',
    category: 'CONVENIENCE_STORE',
    location: {
      latitude: 16.0568,
      longitude: 108.2215,
      address: 'Son Tra, Da Nang',
    },
    openingHours: '24시간',
    description: '간단 쇼핑용으로 좋은 24시간 편의점',
  },
  {
    id: 'convenience-5',
    name: 'MUOI Tap Hoa',
    nameKo: '무오이 편의점',
    category: 'CONVENIENCE_STORE',
    location: {
      latitude: 16.0600,
      longitude: 108.2250,
      address: 'An Hai, Son Tra, Da Nang',
    },
    openingHours: '06:00-23:00',
    description: '지역 편의점형 마켓',
  },
  {
    id: 'convenience-6',
    name: 'Hữu Nghị Mart',
    nameKo: '후우응이 마트',
    category: 'CONVENIENCE_STORE',
    location: {
      latitude: 16.0555,
      longitude: 108.2195,
      address: '186 Trần Bạch Đằng, Da Nang',
    },
    openingHours: '07:00-22:00',
    description: '지역 주민들도 이용하는 편의점',
  },
  {
    id: 'convenience-7',
    name: 'K-Mart',
    nameKo: 'K마트 (한국 슈퍼)',
    category: 'CONVENIENCE_STORE',
    location: {
      latitude: 16.0580,
      longitude: 108.2228,
      address: 'B1-2-3 Pham Van Dong, An Hai Bac, Son Tra, Da Nang',
    },
    openingHours: '24시간',
    description: '호텔 바로 근처, 한국 수입 상품 전문',
  },

  // ============ 대형마트 ============
  {
    id: 'supermarket-1',
    name: 'Lotte Mart Supermarket',
    nameKo: '롯데마트',
    category: 'SUPERMARKET',
    location: {
      latitude: 16.0472,
      longitude: 108.2200,
      address: '06 Nai Nam, Hoa Cuong Bac, Hai Chau, Da Nang',
    },
    openingHours: '08:00-22:00',
    phone: '+84 236 3611 999',
    description: '다낭 대표 대형마트, 식료품·생활용품·기념품 쇼핑 가능',
  },
  {
    id: 'supermarket-2',
    name: 'GO! Đà Nẵng',
    nameKo: 'GO 다낭',
    category: 'SUPERMARKET',
    location: {
      latitude: 16.0450,
      longitude: 108.2180,
      address: 'Hai Chau, Da Nang',
    },
    openingHours: '08:00-22:00',
    description: '대형마트 & 백화점형 쇼핑',
  },
  {
    id: 'supermarket-3',
    name: 'Winmart - Vincom Plaza',
    nameKo: '윈마트 빈컴플라자',
    category: 'SUPERMARKET',
    location: {
      latitude: 16.0710,
      longitude: 108.2250,
      address: 'Vincom Plaza, Da Nang',
    },
    openingHours: '08:00-22:00',
    description: 'Vincom Plaza 안에 있는 슈퍼마켓',
  },
  {
    id: 'supermarket-4',
    name: 'MM Mega Market Đà Nẵng',
    nameKo: 'MM 메가마켓',
    category: 'SUPERMARKET',
    location: {
      latitude: 16.0320,
      longitude: 108.2150,
      address: 'Hai Chau, Da Nang',
    },
    openingHours: '07:00-22:00',
    description: '신선식품·식료품 중심 대형 슈퍼',
  },
  {
    id: 'supermarket-5',
    name: 'Co.opmart Da Nang',
    nameKo: '코옵마트 다낭',
    category: 'SUPERMARKET',
    location: {
      latitude: 16.0650,
      longitude: 108.2100,
      address: '478 Điện Biên Phủ, Thanh Khê, Da Nang',
    },
    openingHours: '08:00-22:00',
    phone: '+84 236 3711 999',
    description: '현지인들도 자주 가는 대형 슈퍼마켓',
  },
  {
    id: 'supermarket-6',
    name: 'JOLY MART Yên Bái',
    nameKo: '졸리마트 옌바이',
    category: 'SUPERMARKET',
    location: {
      latitude: 16.0480,
      longitude: 108.2120,
      address: 'Yên Bái, Hai Chau, Da Nang',
    },
    openingHours: '07:00-21:00',
    description: '지역 슈퍼마켓',
  },
];

/**
 * 카테고리별로 편의시설 필터링
 */
export function getAmenitiesByCategory(category: AmenityCategory): Amenity[] {
  return AMENITIES.filter((amenity) => amenity.category === category);
}

/**
 * Haversine formula를 사용하여 두 GPS 좌표 간 거리 계산 (미터 단위)
 */
export function calculateDistance(
  loc1: Location,
  loc2: Location
): number {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (loc1.latitude * Math.PI) / 180;
  const φ2 = (loc2.latitude * Math.PI) / 180;
  const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터 단위
}

/**
 * 편의시설 목록에 호텔로부터의 거리 추가 및 거리순 정렬
 */
export function sortAmenitiesByDistance(
  amenities: Amenity[],
  referenceLocation: Location
): Amenity[] {
  return amenities
    .map((amenity) => ({
      ...amenity,
      distance: calculateDistance(referenceLocation, amenity.location),
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * 카테고리 정보
 */
export const AMENITY_CATEGORIES = [
  {
    key: 'CONVENIENCE_STORE' as AmenityCategory,
    label: '24시간 편의점',
    icon: '🏪',
  },
  {
    key: 'SUPERMARKET' as AmenityCategory,
    label: '대형마트',
    icon: '🛒',
  },
];
