/**
 * 다낭 윈덤솔레일 호텔 주변 편의시설 정보
 * 호텔 위치: 16.0583, 108.2226 (Pham Van Dong St.)
 */

import { Amenity, AmenityCategory, CafeSubType } from '@/types/amenity';
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

  // ============ 카페 (스페셜티 & 체인점) ============
  {
    id: 'cafe-1',
    name: 'XLIII Specialty Coffee',
    nameKo: '43 스페셜티 커피',
    category: 'CAFE',
    subType: 'SPECIALTY',
    location: {
      latitude: 16.0480106,
      longitude: 108.2460812,
      address: 'Lot 422 Ngo Thi Si, My An, Ngu Hanh Son, Da Nang',
    },
    openingHours: '07:00-21:30',
    description: '43 Factory Coffee Roaster 본점, 자체 로스팅 스페셜티 커피',
  },
  {
    id: 'cafe-2',
    name: 'Puna Specialty Coffee & Eatery',
    nameKo: '푸나 스페셜티 커피',
    category: 'CAFE',
    subType: 'SPECIALTY',
    location: {
      latitude: 16.0485, // TODO: 정확한 좌표 확인 필요 (132 Lê Quang Đạo)
      longitude: 108.2465,
      address: '132 Lê Quang Đạo, Bắc Mỹ An, Ngũ Hành Sơn, Da Nang',
    },
    openingHours: '07:00-22:00',
    description: '스페셜티 커피 & 브런치 카페',
  },
  {
    id: 'cafe-3',
    name: 'Zi Coffee & Roastery',
    nameKo: 'Z! 커피 로스터리',
    category: 'CAFE',
    subType: 'ROASTERY',
    location: {
      latitude: 16.0490, // TODO: 정확한 좌표 확인 필요 (109 Hoàng Kế Viêm)
      longitude: 108.2470,
      address: '109 Hoàng Kế Viêm, Bắc Mỹ Phú, Ngũ Hành Sơn, Da Nang',
    },
    openingHours: '07:00-22:00',
    description: '자체 로스팅 커피 & 호스텔',
  },
  {
    id: 'cafe-4',
    name: 'Roost Coffee Roasters',
    nameKo: '루스트 커피 로스터스',
    category: 'CAFE',
    subType: 'ROASTERY',
    location: {
      latitude: 16.0475, // TODO: 정확한 좌표 확인 필요 (57 Bà Huyện Thanh Quan)
      longitude: 108.2455,
      address: '57 Bà Huyện Thanh Quan, Bắc Mỹ An, Ngũ Hành Sơn, Da Nang',
    },
    openingHours: '07:00-21:30',
    description: '자가 농장 보유, 로스팅 전문 카페',
  },
  {
    id: 'cafe-5',
    name: 'SIX ON SIX CAFE',
    nameKo: '식스 온 식스 카페',
    category: 'CAFE',
    subType: 'BRUNCH',
    location: {
      latitude: 16.0478, // TODO: 정확한 좌표 확인 필요 (64 Bà Huyện Thanh Quan)
      longitude: 108.2458,
      address: '64 Bà Huyện Thanh Quan, Phường Mỹ An, Ngũ Hành Sơn, Da Nang',
    },
    openingHours: '07:30-22:00',
    phone: '+84 946 114 967',
    description: '100% 아라비카 스페셜티 커피 & 브런치',
  },
  {
    id: 'cafe-6',
    name: 'Passion Café',
    nameKo: '패션 카페',
    category: 'CAFE',
    subType: 'SPECIALTY',
    location: {
      latitude: 16.0470, // TODO: 정확한 주소 및 좌표 확인 필요
      longitude: 108.2200,
      address: 'Da Nang City Center',
    },
    openingHours: '08:00-22:00',
    description: '조용한 분위기의 스페셜티 카페',
  },
  {
    id: 'cafe-7',
    name: 'The Cups Coffee Roastery',
    nameKo: '더 컵스 커피 로스터리',
    category: 'CAFE',
    subType: 'ROASTERY',
    location: {
      latitude: 16.0470, // TODO: 정확한 좌표 확인 필요 (Lô B20, 22 Đường 2 Tháng 9)
      longitude: 108.2215,
      address: 'Lô B20, 22 Đường 2 Tháng 9, Hòa Thuận Đông, Hải Châu, Da Nang',
    },
    openingHours: '07:00-23:00',
    description: '다낭 로컬 커피 체인, 용다리 & 한강 근처',
  },

  // Starbucks 5개 지점
  {
    id: 'cafe-8',
    name: 'Starbucks Bach Dang',
    nameKo: '스타벅스 바흐당',
    category: 'CAFE',
    subType: 'CHAIN',
    location: {
      latitude: 16.0700, // TODO: 정확한 좌표 확인 필요 (50 Bach Dang)
      longitude: 108.2240,
      address: '50 Bach Dang, Hoa Thuan Dong, Hai Chau, Da Nang (Hilton Complex)',
    },
    openingHours: '07:00-22:00',
    description: '힐튼 다낭 호텔 내 위치, 2018년 다낭 첫 오픈',
  },
  {
    id: 'cafe-9',
    name: 'Starbucks Vincom Ngo Quyen',
    nameKo: '스타벅스 빈컴 응오꾸옌',
    category: 'CAFE',
    subType: 'CHAIN',
    location: {
      latitude: 16.071857,
      longitude: 108.23042,
      address: '910A Ngo Quyen, Son Tra, Da Nang (Vincom Center L1)',
    },
    openingHours: '07:00-22:00',
    description: 'Vincom Plaza 내 위치, 쇼핑 중 방문하기 좋음',
  },
  {
    id: 'cafe-10',
    name: 'Starbucks Trần Hưng Đạo',
    nameKo: '스타벅스 쩐훙다오',
    category: 'CAFE',
    subType: 'CHAIN',
    location: {
      latitude: 16.0705, // TODO: 정확한 좌표 확인 필요 (218 Trần Hưng Đạo)
      longitude: 108.2255,
      address: '218 Trần Hưng Đạo, Quận Sơn Trà, Da Nang',
    },
    openingHours: '07:00-22:00',
    description: '2023년 11월 오픈',
  },
  {
    id: 'cafe-11',
    name: 'Starbucks Nesta Hotel',
    nameKo: '스타벅스 네스타 호텔',
    category: 'CAFE',
    subType: 'CHAIN',
    location: {
      latitude: 16.040422,
      longitude: 108.25163,
      address: '268 Vo Nguyen Giap, Ngu Hanh Son, Da Nang (Nesta Hotel)',
    },
    openingHours: '07:00-22:00',
    description: '미케 비치 뷰, 2023년 7월 오픈',
  },
  {
    id: 'cafe-12',
    name: 'Starbucks Lotte Đà Nẵng',
    nameKo: '스타벅스 롯데 다낭',
    category: 'CAFE',
    subType: 'CHAIN',
    location: {
      latitude: 16.03423,
      longitude: 108.22931,
      address: '6 Nai Nam, Hoa Cuong Bac, Hai Chau, Da Nang (Lotte Mart 2F)',
    },
    openingHours: '08:00-22:00',
    description: '롯데마트 2층, 쇼핑과 함께',
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
    color: '#10B981', // green
  },
  {
    key: 'SUPERMARKET' as AmenityCategory,
    label: '대형마트',
    icon: '🛒',
    color: '#3B82F6', // blue
  },
  {
    key: 'CAFE' as AmenityCategory,
    label: '카페',
    icon: '☕',
    color: '#F59E0B', // orange
  },
];
