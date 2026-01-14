# 베트남어 표현 기능 설계 문서

## 1. 개요

### 1.1 목적
한국인 여행자가 다낭 여행 중 자주 사용하는 베트남어 표현을 빠르게 찾아 사용할 수 있도록 지원

### 1.2 핵심 요구사항
- ✅ 카테고리별 분류 (인사, 식당, 쇼핑, 교통, 긴급상황 등)
- ✅ 한글 발음 표기 포함
- ✅ 빠른 접근 UI/UX
- ✅ 오프라인 지원 (PWA)
- ✅ 모바일 최적화
- ✅ 기존 디자인 일관성 유지
- ✅ 접근성 (WCAG 2.1 AA)

---

## 2. 데이터 구조 설계

### 2.1 타입 정의 (`types/vietnamese.ts`)

```typescript
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
  icon: string;             // lucide-react 아이콘 이름
  color: string;            // Tailwind 색상
  description: string;
}
```

### 2.2 데이터 구조 (`lib/vietnameseData.ts`)

```typescript
export const VIETNAMESE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'greetings',
    label: '인사',
    icon: 'Smile',
    color: 'blue',
    description: '인사 및 기본 예의 표현'
  },
  {
    id: 'restaurant',
    label: '식당',
    icon: 'UtensilsCrossed',
    color: 'orange',
    description: '음식 주문 및 식당 이용'
  },
  {
    id: 'shopping',
    label: '쇼핑',
    icon: 'ShoppingBag',
    color: 'purple',
    description: '가격 문의 및 구매'
  },
  {
    id: 'transportation',
    label: '교통',
    icon: 'Car',
    color: 'green',
    description: '택시, 그랩 등 교통수단'
  },
  {
    id: 'emergency',
    label: '긴급상황',
    icon: 'AlertTriangle',
    color: 'red',
    description: '도움 요청 및 응급 상황'
  },
  {
    id: 'accommodation',
    label: '숙소',
    icon: 'Hotel',
    color: 'indigo',
    description: '호텔 체크인/아웃'
  },
  {
    id: 'directions',
    label: '길찾기',
    icon: 'Navigation',
    color: 'teal',
    description: '방향 및 위치 문의'
  },
  {
    id: 'numbers',
    label: '숫자',
    icon: 'Hash',
    color: 'gray',
    description: '숫자 읽기'
  },
  {
    id: 'basic',
    label: '기본 표현',
    icon: 'MessageCircle',
    color: 'pink',
    description: '자주 쓰는 기본 문장'
  }
];

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
    korean: '(호텔 이름)으로 가주세요',
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
```

---

## 3. UI/UX 아키텍처 설계

### 3.1 네비게이션 전략

**Option A: 5번째 탭 추가 (권장)**
- Bottom Navigation에 "베트남어" 탭 추가
- 장점: 빠른 접근, 독립된 페이지, 전체 화면 활용
- 단점: 탭이 5개로 증가 (모바일에서 다소 좁아짐)

**Option B: Floating Action Button (FAB) 트리거**
- 기존 FAB에 베트남어 표현 열기 기능 추가
- BottomSheet로 표시
- 장점: 기존 네비게이션 유지, 어디서든 빠른 접근
- 단점: 전체 기능 제공에 제한적

**Option C: 설정 탭 내 통합**
- Settings 페이지 내 메뉴 항목으로 추가
- 장점: 기존 구조 유지
- 단점: 접근성 낮음 (2번 클릭 필요)

**→ 최종 선택: Option A + Option B 하이브리드**
- 5번째 탭으로 추가 (주요 접근)
- FAB에서도 빠른 접근 가능 (보조 접근)

### 3.2 화면 구조

```
VietnamesePage
├─ 상단: 검색 바 (Search Input)
├─ 중간: 카테고리 그리드 (9개 카테고리)
│   ├─ 각 카테고리 카드: 아이콘 + 이름 + 개수
│   └─ 클릭 시 → 해당 카테고리 표현 목록 (BottomSheet)
├─ 하단: 즐겨찾기 표현 목록 (Quick Access)
│   └─ 최대 6개 표시, "더보기" 버튼
└─ Floating: 검색 결과 오버레이
```

### 3.3 컴포넌트 계층 구조

```
components/
├─ pages/
│   └─ VietnamesePage.tsx              # 메인 페이지
├─ vietnamese/
│   ├─ CategoryGrid.tsx                # 카테고리 그리드
│   ├─ CategoryCard.tsx                # 개별 카테고리 카드
│   ├─ PhraseList.tsx                  # 표현 목록
│   ├─ PhraseCard.tsx                  # 개별 표현 카드
│   ├─ SearchBar.tsx                   # 검색 바
│   ├─ FavoritesList.tsx               # 즐겨찾기 목록
│   └─ CategoryBottomSheet.tsx         # 카테고리별 표현 시트
└─ ui/
    └─ (기존 공통 컴포넌트 재사용)
```

---

## 4. 주요 기능 설계

### 4.1 검색 기능

**검색 범위:**
- 한국어 (korean)
- 베트남어 (vietnamese)
- 한글 발음 (pronunciation)

**검색 로직:**
```typescript
function searchPhrases(query: string, phrases: VietnamesePhrase[]): VietnamesePhrase[] {
  const lowerQuery = query.toLowerCase();
  return phrases.filter(phrase =>
    phrase.korean.toLowerCase().includes(lowerQuery) ||
    phrase.vietnamese.toLowerCase().includes(lowerQuery) ||
    phrase.pronunciation.toLowerCase().includes(lowerQuery)
  );
}
```

**UI 동작:**
- 입력 즉시 필터링 (debounce 300ms)
- 검색 결과를 카테고리별로 그룹화하여 표시
- 결과 없을 시 "검색 결과가 없습니다" 안내

### 4.2 즐겨찾기 기능

**저장 위치:** localStorage (`vietnameseFavorites`)

**데이터 구조:**
```typescript
interface FavoritesStorage {
  phraseIds: string[];  // 즐겨찾기한 표현 ID 목록
  updatedAt: string;    // 마지막 업데이트 시간
}
```

**Custom Hook:**
```typescript
// hooks/useVietnameseFavorites.ts
export function useVietnameseFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // localStorage에서 로드
  useEffect(() => {
    const stored = localStorage.getItem('vietnameseFavorites');
    if (stored) {
      const data: FavoritesStorage = JSON.parse(stored);
      setFavorites(data.phraseIds);
    }
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = (phraseId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(phraseId)
        ? prev.filter(id => id !== phraseId)
        : [...prev, phraseId];

      // localStorage 저장
      localStorage.setItem('vietnameseFavorites', JSON.stringify({
        phraseIds: updated,
        updatedAt: new Date().toISOString()
      }));

      return updated;
    });
  };

  // 즐겨찾기 여부 확인
  const isFavorite = (phraseId: string) => favorites.includes(phraseId);

  return { favorites, toggleFavorite, isFavorite };
}
```

### 4.3 TTS (Text-to-Speech) 기능 (선택적)

**브라우저 Web Speech API 사용:**
```typescript
function speakVietnamese(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN'; // 베트남어
    utterance.rate = 0.8;     // 천천히 발음
    speechSynthesis.speak(utterance);
  }
}
```

**UI:**
- 각 PhraseCard에 스피커 아이콘 버튼
- 클릭 시 베트남어 발음 재생

---

## 5. 접근성 설계

### 5.1 WCAG 2.1 AA 준수

- **키보드 네비게이션**: 모든 카드/버튼 focus 가능
- **스크린 리더**: ARIA 레이블 및 역할 명시
- **색상 대비**: 4.5:1 이상 (텍스트)
- **터치 타겟**: 최소 44x44px
- **Reduced Motion**: prefers-reduced-motion 지원

### 5.2 ARIA 속성

```tsx
<div role="region" aria-label="베트남어 표현">
  <button
    aria-label={`${category.label} 카테고리 열기`}
    aria-expanded={isOpen}
  >
    {/* 카테고리 카드 */}
  </button>

  <article aria-label={`${phrase.korean} 표현`}>
    <button
      aria-label={`${phrase.korean} 즐겨찾기 ${isFavorite ? '해제' : '추가'}`}
      onClick={toggleFavorite}
    >
      {/* 즐겨찾기 버튼 */}
    </button>
  </article>
</div>
```

---

## 6. 성능 최적화

### 6.1 정적 데이터 (오프라인 지원)

- 모든 베트남어 표현 데이터는 정적 파일로 번들에 포함
- PWA Service Worker로 오프라인 캐싱
- 외부 API 호출 없음

### 6.2 렌더링 최적화

```typescript
// 가상화 (Virtualization) - 긴 목록 성능 개선
import { Virtualizer } from '@tanstack/react-virtual';

// Memo화 - 불필요한 재렌더링 방지
export const PhraseCard = memo(function PhraseCard({ phrase }: Props) {
  // ...
});

// Lazy Loading - 카테고리 시트는 클릭 시에만 로드
const CategoryBottomSheet = dynamic(() =>
  import('./CategoryBottomSheet').then(mod => ({ default: mod.CategoryBottomSheet }))
, { ssr: false });
```

### 6.3 검색 최적화

```typescript
// Debounce 적용
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    setSearchResults(searchPhrases(query, VIETNAMESE_PHRASES));
  }, 300),
  []
);
```

---

## 7. 다크 모드 지원

모든 컴포넌트에 dark: 변형 클래스 적용

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
  {/* 카테고리별 색상 */}
  <div className={`
    bg-${category.color}-50 dark:bg-${category.color}-900/20
    border-${category.color}-200 dark:border-${category.color}-700
  `}>
    {/* 내용 */}
  </div>
</div>
```

---

## 8. 구현 단계

### Phase 1: 기본 구조 (1-2시간)
1. ✅ 타입 정의 (`types/vietnamese.ts`)
2. ✅ 데이터 생성 (`lib/vietnameseData.ts`)
3. ✅ Bottom Navigation 탭 추가 (5번째 탭)
4. ✅ VietnamesePage 기본 레이아웃

### Phase 2: 카테고리 UI (1-2시간)
1. ✅ CategoryGrid 컴포넌트
2. ✅ CategoryCard 컴포넌트
3. ✅ CategoryBottomSheet 컴포넌트
4. ✅ PhraseList 및 PhraseCard 컴포넌트

### Phase 3: 검색 및 즐겨찾기 (1-2시간)
1. ✅ SearchBar 컴포넌트
2. ✅ useVietnameseFavorites 훅
3. ✅ FavoritesList 컴포넌트
4. ✅ 검색 로직 구현

### Phase 4: 접근성 및 최적화 (1시간)
1. ✅ ARIA 속성 추가
2. ✅ 키보드 네비게이션
3. ✅ 다크 모드 스타일링
4. ✅ 성능 최적화 (memo, lazy loading)

### Phase 5: 테스트 및 배포 (30분)
1. ✅ 모바일 반응형 테스트
2. ✅ 오프라인 동작 확인
3. ✅ 빌드 및 배포

**총 예상 시간: 4-6시간**

---

## 9. 향후 개선 사항 (Optional)

### 9.1 Phase 2 기능
- TTS (발음 듣기) 기능
- 사용 빈도 추적 (인기 표현)
- 사용자 커스텀 표현 추가
- 카테고리 필터 조합 (예: 식당 + 긴급상황)

### 9.2 Phase 3 기능
- 베트남어 학습 모드 (플래시 카드)
- 발음 연습 기능 (음성 인식)
- 상황별 대화 시나리오
- 다른 언어 지원 (영어, 중국어)

---

## 10. 디자인 시안

### 10.1 카테고리 그리드 (3x3)

```
┌──────────────────────────────────────┐
│  🔍 [검색 바]                         │
├──────────────────────────────────────┤
│                                      │
│  ┌────┐  ┌────┐  ┌────┐            │
│  │😊  │  │🍴  │  │🛍️  │            │
│  │인사│  │식당│  │쇼핑│            │
│  │ 6  │  │ 7  │  │ 6  │            │
│  └────┘  └────┘  └────┘            │
│                                      │
│  ┌────┐  ┌────┐  ┌────┐            │
│  │🚗  │  │⚠️  │  │🏨  │            │
│  │교통│  │긴급│  │숙소│            │
│  │ 5  │  │ 4  │  │ 4  │            │
│  └────┘  └────┘  └────┘            │
│                                      │
│  ┌────┐  ┌────┐  ┌────┐            │
│  │🧭  │  │#   │  │💬  │            │
│  │길  │  │숫자│  │기본│            │
│  │ 5  │  │10  │  │ 6  │            │
│  └────┘  └────┘  └────┘            │
│                                      │
├──────────────────────────────────────┤
│  ⭐ 즐겨찾기 (6개)                    │
│  ┌──────────────────────────┐       │
│  │ 안녕하세요 | Xin chào     │  ⭐   │
│  │ 신 짜오                   │       │
│  └──────────────────────────┘       │
│  ...                                 │
└──────────────────────────────────────┘
```

### 10.2 표현 카드

```
┌──────────────────────────────────────┐
│  안녕하세요                           │  ⭐
│  Xin chào                            │  🔊
│  [신 짜오]                            │
│                                      │
│  💡 아침/점심/저녁 구분 없이 사용      │
└──────────────────────────────────────┘
```

---

## 11. 결론

### 핵심 설계 결정
1. **네비게이션**: 5번째 탭 추가 (주) + FAB 연동 (보조)
2. **데이터**: 정적 데이터로 오프라인 지원
3. **검색**: 한국어/베트남어/발음 통합 검색
4. **즐겨찾기**: localStorage 기반 개인화
5. **UI**: 카테고리 그리드 + BottomSheet 조합
6. **접근성**: WCAG 2.1 AA 준수

### 기대 효과
- 🚀 여행 중 빠른 베트남어 표현 접근
- 💾 오프라인에서도 완벽 작동
- ⭐ 개인화된 즐겨찾기로 자주 쓰는 표현 관리
- 📱 모바일 최적화된 직관적 UI/UX
- ♿ 접근성 보장으로 모든 사용자 지원

### 다음 단계
→ `/sc:implement` 명령으로 구현 진행
