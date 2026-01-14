import { CategoryInfo, VietnamesePhrase } from '@/types/vietnamese';

// 카테고리 정보
export const VIETNAMESE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'greetings',
    label: '인사',
    iconName: 'Smile',
    color: 'blue',
    description: '인사 및 기본 예의 표현'
  },
  {
    id: 'restaurant',
    label: '식당',
    iconName: 'UtensilsCrossed',
    color: 'orange',
    description: '음식 주문 및 식당 이용'
  },
  {
    id: 'shopping',
    label: '쇼핑',
    iconName: 'ShoppingBag',
    color: 'purple',
    description: '가격 문의 및 구매'
  },
  {
    id: 'transportation',
    label: '교통',
    iconName: 'Car',
    color: 'green',
    description: '택시, 그랩 등 교통수단'
  },
  {
    id: 'emergency',
    label: '긴급상황',
    iconName: 'AlertTriangle',
    color: 'red',
    description: '도움 요청 및 응급 상황'
  },
  {
    id: 'accommodation',
    label: '숙소',
    iconName: 'Hotel',
    color: 'indigo',
    description: '호텔 체크인/아웃'
  },
  {
    id: 'directions',
    label: '길찾기',
    iconName: 'Navigation',
    color: 'teal',
    description: '방향 및 위치 문의'
  },
  {
    id: 'numbers',
    label: '숫자',
    iconName: 'Hash',
    color: 'gray',
    description: '숫자 읽기'
  },
  {
    id: 'basic',
    label: '기본 표현',
    iconName: 'MessageCircle',
    color: 'pink',
    description: '자주 쓰는 기본 문장'
  }
];

// 베트남어 표현 데이터
export const VIETNAMESE_PHRASES: VietnamesePhrase[] = [
  // 인사 (greetings)
  {
    id: 'greet-1',
    category: 'greetings',
    korean: '안녕하세요',
    vietnamese: 'Xin chào',
    pronunciation: '신 짜오',
    context: '아침/점심/저녁 구분 없이 사용'
  },
  {
    id: 'greet-2',
    category: 'greetings',
    korean: '감사합니다',
    vietnamese: 'Cảm ơn',
    pronunciation: '깜언',
  },
  {
    id: 'greet-3',
    category: 'greetings',
    korean: '정말 감사합니다',
    vietnamese: 'Cảm ơn rất nhiều',
    pronunciation: '깜언 잗 니에우',
  },
  {
    id: 'greet-4',
    category: 'greetings',
    korean: '천만에요',
    vietnamese: 'Không có gì',
    pronunciation: '콩 꼬 지',
  },
  {
    id: 'greet-5',
    category: 'greetings',
    korean: '죄송합니다',
    vietnamese: 'Xin lỗi',
    pronunciation: '신 로이',
  },
  {
    id: 'greet-6',
    category: 'greetings',
    korean: '안녕히 가세요',
    vietnamese: 'Tạm biệt',
    pronunciation: '땀 비엣',
  },

  // 식당 (restaurant)
  {
    id: 'rest-1',
    category: 'restaurant',
    korean: '메뉴판 주세요',
    vietnamese: 'Cho tôi xem thực đơn',
    pronunciation: '쪼 또이 쎔 턱 던',
  },
  {
    id: 'rest-2',
    category: 'restaurant',
    korean: '이것 주세요',
    vietnamese: 'Cho tôi cái này',
    pronunciation: '쪼 또이 까이 나이',
  },
  {
    id: 'rest-3',
    category: 'restaurant',
    korean: '물 주세요',
    vietnamese: 'Cho tôi nước',
    pronunciation: '쪼 또이 늑',
  },
  {
    id: 'rest-4',
    category: 'restaurant',
    korean: '맛있어요',
    vietnamese: 'Ngon',
    pronunciation: '응온',
  },
  {
    id: 'rest-5',
    category: 'restaurant',
    korean: '계산서 주세요',
    vietnamese: 'Tính tiền',
    pronunciation: '띤 띠엔',
  },
  {
    id: 'rest-6',
    category: 'restaurant',
    korean: '얼마예요?',
    vietnamese: 'Bao nhiêu tiền?',
    pronunciation: '바오 니에우 띠엔?',
  },
  {
    id: 'rest-7',
    category: 'restaurant',
    korean: '맵지 않게 해주세요',
    vietnamese: 'Không cay',
    pronunciation: '콩 까이',
  },

  // 쇼핑 (shopping)
  {
    id: 'shop-1',
    category: 'shopping',
    korean: '이거 얼마예요?',
    vietnamese: 'Cái này bao nhiêu tiền?',
    pronunciation: '까이 나이 바오 니에우 띠엔?',
  },
  {
    id: 'shop-2',
    category: 'shopping',
    korean: '너무 비싸요',
    vietnamese: 'Đắt quá',
    pronunciation: '닫 꽈',
  },
  {
    id: 'shop-3',
    category: 'shopping',
    korean: '깎아주세요',
    vietnamese: 'Giảm giá đi',
    pronunciation: '잠 자 디',
  },
  {
    id: 'shop-4',
    category: 'shopping',
    korean: '살게요',
    vietnamese: 'Tôi mua',
    pronunciation: '또이 무아',
  },
  {
    id: 'shop-5',
    category: 'shopping',
    korean: '안 살게요',
    vietnamese: 'Tôi không mua',
    pronunciation: '또이 콩 무아',
  },
  {
    id: 'shop-6',
    category: 'shopping',
    korean: '다른 색 있어요?',
    vietnamese: 'Có màu khác không?',
    pronunciation: '꼬 마우 칵 콩?',
  },

  // 교통 (transportation)
  {
    id: 'trans-1',
    category: 'transportation',
    korean: '여기로 가주세요',
    vietnamese: 'Đi đến đây',
    pronunciation: '디 덴 다이',
  },
  {
    id: 'trans-2',
    category: 'transportation',
    korean: '호텔로 가주세요',
    vietnamese: 'Đi đến khách sạn',
    pronunciation: '디 덴 칵 산',
  },
  {
    id: 'trans-3',
    category: 'transportation',
    korean: '얼마예요?',
    vietnamese: 'Bao nhiêu tiền?',
    pronunciation: '바오 니에우 띠엔?',
  },
  {
    id: 'trans-4',
    category: 'transportation',
    korean: '여기서 세워주세요',
    vietnamese: 'Dừng lại đây',
    pronunciation: '중 라이 다이',
  },
  {
    id: 'trans-5',
    category: 'transportation',
    korean: '공항으로 가주세요',
    vietnamese: 'Đi đến sân bay',
    pronunciation: '디 덴 산 바이',
  },

  // 긴급상황 (emergency)
  {
    id: 'emer-1',
    category: 'emergency',
    korean: '도와주세요!',
    vietnamese: 'Giúp tôi!',
    pronunciation: '줍 또이!',
  },
  {
    id: 'emer-2',
    category: 'emergency',
    korean: '병원 어디예요?',
    vietnamese: 'Bệnh viện ở đâu?',
    pronunciation: '벵 비엔 어 다우?',
  },
  {
    id: 'emer-3',
    category: 'emergency',
    korean: '경찰 불러주세요',
    vietnamese: 'Gọi cảnh sát',
    pronunciation: '고이 깐 삿',
  },
  {
    id: 'emer-4',
    category: 'emergency',
    korean: '아파요',
    vietnamese: 'Tôi bị đau',
    pronunciation: '또이 비 다우',
  },

  // 숙소 (accommodation)
  {
    id: 'hotel-1',
    category: 'accommodation',
    korean: '체크인하고 싶어요',
    vietnamese: 'Tôi muốn nhận phòng',
    pronunciation: '또이 무온 넌 퐁',
  },
  {
    id: 'hotel-2',
    category: 'accommodation',
    korean: '체크아웃하고 싶어요',
    vietnamese: 'Tôi muốn trả phòng',
    pronunciation: '또이 무온 짜 퐁',
  },
  {
    id: 'hotel-3',
    category: 'accommodation',
    korean: '와이파이 비밀번호가 뭐예요?',
    vietnamese: 'Mật khẩu wifi là gì?',
    pronunciation: '맛 카우 와이파이 라 지?',
  },
  {
    id: 'hotel-4',
    category: 'accommodation',
    korean: '조식이 포함되어 있나요?',
    vietnamese: 'Có bữa sáng không?',
    pronunciation: '꼬 부아 상 콩?',
  },

  // 길찾기 (directions)
  {
    id: 'dir-1',
    category: 'directions',
    korean: '어디예요?',
    vietnamese: 'Ở đâu?',
    pronunciation: '어 다우?',
  },
  {
    id: 'dir-2',
    category: 'directions',
    korean: '화장실 어디예요?',
    vietnamese: 'Nhà vệ sinh ở đâu?',
    pronunciation: '냐 베 신 어 다우?',
  },
  {
    id: 'dir-3',
    category: 'directions',
    korean: '왼쪽',
    vietnamese: 'Bên trái',
    pronunciation: '벤 짜이',
  },
  {
    id: 'dir-4',
    category: 'directions',
    korean: '오른쪽',
    vietnamese: 'Bên phải',
    pronunciation: '벤 파이',
  },
  {
    id: 'dir-5',
    category: 'directions',
    korean: '직진',
    vietnamese: 'Đi thẳng',
    pronunciation: '디 탕',
  },

  // 숫자 (numbers)
  {
    id: 'num-1',
    category: 'numbers',
    korean: '0',
    vietnamese: 'Không',
    pronunciation: '콩',
  },
  {
    id: 'num-2',
    category: 'numbers',
    korean: '1',
    vietnamese: 'Một',
    pronunciation: '못',
  },
  {
    id: 'num-3',
    category: 'numbers',
    korean: '2',
    vietnamese: 'Hai',
    pronunciation: '하이',
  },
  {
    id: 'num-4',
    category: 'numbers',
    korean: '3',
    vietnamese: 'Ba',
    pronunciation: '바',
  },
  {
    id: 'num-5',
    category: 'numbers',
    korean: '4',
    vietnamese: 'Bốn',
    pronunciation: '본',
  },
  {
    id: 'num-6',
    category: 'numbers',
    korean: '5',
    vietnamese: 'Năm',
    pronunciation: '남',
  },
  {
    id: 'num-7',
    category: 'numbers',
    korean: '10',
    vietnamese: 'Mười',
    pronunciation: '므어이',
  },
  {
    id: 'num-8',
    category: 'numbers',
    korean: '100',
    vietnamese: 'Một trăm',
    pronunciation: '못 짬',
  },
  {
    id: 'num-9',
    category: 'numbers',
    korean: '1,000',
    vietnamese: 'Một nghìn',
    pronunciation: '못 응인',
  },
  {
    id: 'num-10',
    category: 'numbers',
    korean: '10,000',
    vietnamese: 'Mười nghìn',
    pronunciation: '므어이 응인',
  },

  // 기본 표현 (basic)
  {
    id: 'basic-1',
    category: 'basic',
    korean: '네',
    vietnamese: 'Vâng',
    pronunciation: '벙',
  },
  {
    id: 'basic-2',
    category: 'basic',
    korean: '아니요',
    vietnamese: 'Không',
    pronunciation: '콩',
  },
  {
    id: 'basic-3',
    category: 'basic',
    korean: '괜찮아요',
    vietnamese: 'Không sao',
    pronunciation: '콩 싸오',
  },
  {
    id: 'basic-4',
    category: 'basic',
    korean: '알겠어요',
    vietnamese: 'Tôi hiểu',
    pronunciation: '또이 히에우',
  },
  {
    id: 'basic-5',
    category: 'basic',
    korean: '모르겠어요',
    vietnamese: 'Tôi không hiểu',
    pronunciation: '또이 콩 히에우',
  },
  {
    id: 'basic-6',
    category: 'basic',
    korean: '영어 할 수 있어요?',
    vietnamese: 'Bạn có nói tiếng Anh không?',
    pronunciation: '반 꼬 노이 띠엥 안 콩?',
  },
];

// 카테고리별 표현 개수
export function getCategoryPhraseCount(categoryId: string): number {
  return VIETNAMESE_PHRASES.filter(phrase => phrase.category === categoryId).length;
}

// 카테고리별 표현 가져오기
export function getPhrasesByCategory(categoryId: string): VietnamesePhrase[] {
  return VIETNAMESE_PHRASES.filter(phrase => phrase.category === categoryId);
}

// 검색 함수
export function searchPhrases(query: string): VietnamesePhrase[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  return VIETNAMESE_PHRASES.filter(phrase =>
    phrase.korean.toLowerCase().includes(lowerQuery) ||
    phrase.vietnamese.toLowerCase().includes(lowerQuery) ||
    phrase.pronunciation.toLowerCase().includes(lowerQuery)
  );
}
