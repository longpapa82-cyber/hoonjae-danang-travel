/**
 * 다낭 여행 주요 장소 GPS 좌표
 */

import { Location } from '@/types/travel';

export const LOCATIONS: Record<string, Location> = {
  // 공항
  INCHEON_AIRPORT: {
    latitude: 37.4602,
    longitude: 126.4407,
    address: '인천국제공항 제2터미널',
  },
  DANANG_AIRPORT: {
    latitude: 16.0439,
    longitude: 108.1995,
    address: 'Da Nang International Airport',
  },

  // 2일차 - 호이안 & 마블마운틴
  MARBLE_MOUNTAINS: {
    latitude: 16.0054,
    longitude: 108.2644,
    address: 'Marble Mountains (Ngũ Hành Sơn)',
  },
  HOI_AN_ANCIENT_TOWN: {
    latitude: 15.8801,
    longitude: 108.3380,
    address: 'Hoi An Ancient Town',
  },
  JAPANESE_BRIDGE: {
    latitude: 15.8786,
    longitude: 108.3272,
    address: 'Japanese Covered Bridge',
  },
  PHUN_HUNG_HOUSE: {
    latitude: 15.8792,
    longitude: 108.3276,
    address: 'The Old House of Phun Hung',
  },
  CANTONESE_HALL: {
    latitude: 15.8789,
    longitude: 108.3290,
    address: 'Cantonese Assembly Hall (Quảng Đông Hội Quán)',
  },

  // 3일차 - 바나힐스
  BA_NA_HILLS: {
    latitude: 15.9961,
    longitude: 107.9953,
    address: 'Bà Nà Hills',
  },
  MY_KHE_BEACH: {
    latitude: 16.0397,
    longitude: 108.2493,
    address: 'My Khe Beach',
  },

  // 4일차 - 다낭 시내
  DANANG_CATHEDRAL: {
    latitude: 16.0678,
    longitude: 108.2208,
    address: 'Da Nang Cathedral (Nhà thờ Chính tòa Đà Nẵng)',
  },
  SUNTRA_MARINA: {
    latitude: 16.1044,
    longitude: 108.2471,
    address: 'Sun Tra Marina',
  },
  LINH_UNG_PAGODA: {
    latitude: 16.1050,
    longitude: 108.2707,
    address: 'Linh Ứng Pagoda',
  },
  LOVE_BRIDGE: {
    latitude: 16.0819,
    longitude: 108.2372,
    address: 'Cầu Tình Yêu (Love Bridge)',
  },
  HAN_MARKET: {
    latitude: 16.0693,
    longitude: 108.2247,
    address: 'Chợ Hàn (Han Market)',
  },

  // 호텔
  DANANG_HOTEL: {
    latitude: 16.0583,
    longitude: 108.2226,
    address: '다낭 윈덤솔레일 (Wyndham Soleil Danang)',
  },
};

/**
 * 활동 ID로 위치 가져오기
 */
export function getLocationByActivityTitle(title: string): Location | undefined {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('마블') || titleLower.includes('오행산')) {
    return LOCATIONS.MARBLE_MOUNTAINS;
  }
  if (titleLower.includes('호이안')) {
    return LOCATIONS.HOI_AN_ANCIENT_TOWN;
  }
  if (titleLower.includes('일본') && titleLower.includes('교')) {
    return LOCATIONS.JAPANESE_BRIDGE;
  }
  if (titleLower.includes('풍흥')) {
    return LOCATIONS.PHUN_HUNG_HOUSE;
  }
  if (titleLower.includes('광조')) {
    return LOCATIONS.CANTONESE_HALL;
  }
  if (titleLower.includes('바나힐스')) {
    return LOCATIONS.BA_NA_HILLS;
  }
  if (titleLower.includes('미케비치')) {
    return LOCATIONS.MY_KHE_BEACH;
  }
  if (titleLower.includes('대성당')) {
    return LOCATIONS.DANANG_CATHEDRAL;
  }
  if (titleLower.includes('선짜') || titleLower.includes('마리나')) {
    return LOCATIONS.SUNTRA_MARINA;
  }
  if (titleLower.includes('영흥사') || titleLower.includes('린엄사')) {
    return LOCATIONS.LINH_UNG_PAGODA;
  }
  if (titleLower.includes('사랑의 부두')) {
    return LOCATIONS.LOVE_BRIDGE;
  }
  if (titleLower.includes('야시장') || titleLower.includes('한시장')) {
    return LOCATIONS.HAN_MARKET;
  }
  if (titleLower.includes('공항') && titleLower.includes('인천')) {
    return LOCATIONS.INCHEON_AIRPORT;
  }
  if (titleLower.includes('공항') || titleLower.includes('다낭 도착')) {
    return LOCATIONS.DANANG_AIRPORT;
  }
  if (titleLower.includes('호텔') || titleLower.includes('조식') || titleLower.includes('휴식')) {
    return LOCATIONS.DANANG_HOTEL;
  }

  return undefined;
}
