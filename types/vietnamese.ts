// 베트남어 표현 기능 타입 정의

// 베트남어 카테고리
export type VietnameseCategory =
  | 'greetings'      // 인사
  | 'restaurant'     // 식당
  | 'shopping'       // 쇼핑
  | 'transportation' // 교통
  | 'emergency'      // 긴급상황
  | 'accommodation'  // 숙소
  | 'directions'     // 길찾기
  | 'numbers'        // 숫자
  | 'basic';         // 기본 표현

// 베트남어 표현
export interface VietnamesePhrase {
  id: string;
  category: VietnameseCategory;
  korean: string;           // 한국어
  vietnamese: string;       // 베트남어
  pronunciation: string;    // 한글 발음
  romanization?: string;    // 로마자 표기 (선택)
  context?: string;         // 사용 상황 설명
  isFavorite?: boolean;     // 즐겨찾기 여부 (localStorage)
}

// 카테고리 정보
export interface CategoryInfo {
  id: VietnameseCategory;
  label: string;
  iconName: string;         // lucide-react 아이콘 이름
  color: string;            // Tailwind 색상
  description: string;
}

// 즐겨찾기 저장 구조
export interface FavoritesStorage {
  phraseIds: string[];      // 즐겨찾기한 표현 ID 목록
  updatedAt: string;        // 마지막 업데이트 시간
}
