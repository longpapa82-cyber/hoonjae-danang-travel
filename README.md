# 🌴 다낭 여행 진척도 트래커

2026년 1월 다낭 여행의 실시간 진척도를 추적하는 Progressive Web App (PWA)입니다.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15-ff0055)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)

## 🚀 빠른 시작 (사용자용)

### 📱 PWA 앱으로 설치하기

#### Android (Chrome/Samsung Internet)
1. https://hoonjae-danang-travel.vercel.app 접속
2. 화면 하단에 나타나는 "앱으로 설치" 배너 클릭
3. 또는 브라우저 메뉴 (⋮) → "홈 화면에 추가"
4. 홈 화면에서 앱 아이콘으로 바로 실행

#### iOS (Safari)
1. https://hoonjae-danang-travel.vercel.app 접속
2. 공유 버튼 (□↑) 터치
3. "홈 화면에 추가" 선택
4. 홈 화면에서 앱 아이콘으로 실행

### 🌐 오프라인 모드 사용법

**앱을 설치하면 자동으로 오프라인에서도 사용 가능합니다!**

- **자동 캐싱**: 한 번 방문한 페이지는 자동으로 저장됩니다
- **오프라인 알림**: 인터넷 연결이 끊기면 화면 상단에 알림 표시
- **자동 복구**: 인터넷 연결이 복구되면 최신 데이터 자동 업데이트
- **날씨 캐시**: 마지막으로 확인한 날씨 정보를 오프라인에서도 확인 가능

### 🌦️ 현지 날씨 정보

**다낭 현지의 실시간 날씨를 확인하세요!**

- **실시간 날씨**: 현재 기온, 날씨 상태, 체감온도
- **일별 예보**: 여행 기간 동안의 5일 날씨 예보
- **스마트 캐싱**:
  - 5분 간격으로 자동 업데이트
  - 오프라인에서도 마지막 날씨 정보 확인 가능
  - 1000회/일 무료 API 할당량 내에서 최적화

## ✨ 주요 기능

### 🎯 실시간 진행 추적
- **1초마다 자동 업데이트**: 현재 시간 기준으로 여행 진척도를 실시간 계산
- **3가지 상태 자동 전환**:
  - 여행 전: 카운트다운 타이머 표시
  - 여행 중: 현재 활동 하이라이트 및 진행률 표시
  - 여행 완료: 전체 기록 보기 모드

### 📍 스마트 활동 추적
- **자동 상태 감지**: 완료/진행중/예정 활동 자동 구분
- **현재 활동 강조**: 진행 중인 활동을 한눈에 확인
- **일별 진행률**: 각 날짜별 완료율 실시간 계산
- **GPS 위치 추적**: 실시간 위치 기반 체크인 (배터리 최적화 적용)

### 🗺️ Google Maps 연동
- **실시간 지도**: 관광지 위치를 지도에서 확인
- **경로 안내**: 현재 위치에서 다음 목적지까지의 경로
- **주변 편의시설**: 호텔, 24시간 편의점, 대형마트, 카페 검색

### 🌍 타임존 자동 처리
- **위치 기반 시간 표시**: 한국(+9) / 베트남(+7) 시차 자동 반영
- **Hydration 불일치 방지**: 서버/클라이언트 시간 동기화

### 📱 PWA 기능
- **오프라인 지원**: 인터넷 없이도 일정 확인 가능
- **홈 화면 설치**: 네이티브 앱처럼 사용
- **푸시 알림**: 일정 시작 알림 (선택사항)
- **빠른 로딩**: Service Worker 기반 캐싱

### 🎨 세련된 UI/UX
- **다크모드 지원**: 시스템 설정 감지 및 수동 전환 가능
- **부드러운 애니메이션**: Framer Motion 기반 인터랙티브 효과
- **반응형 디자인**: 모바일/태블릿/데스크탑 최적화
- **이미지 갤러리**: 관광지 이미지 클릭 시 모달 확대 보기
- **접근성**: WCAG 2.1 AA 수준 준수, 키보드 네비게이션 지원

## 🚀 시작하기

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 Google Maps API 키 입력

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

### 접속

개발 서버: http://localhost:3000

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Google Maps API Key (필수)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# OpenWeatherMap API Key (필수)
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here
NEXT_PUBLIC_DANANG_LAT=16.0544
NEXT_PUBLIC_DANANG_LON=108.2022

# Next.js 설정
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 타임존 설정 (선택사항)
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Seoul
```

**Google Maps API 설정 방법**:
1. [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) 접속
2. Maps JavaScript API, Directions API, Geocoding API, Places API 활성화
3. API 키 생성 및 제한 설정 (HTTP 리퍼러 제한 권장)
4. `.env.local`에 API 키 추가

**OpenWeatherMap API 설정 방법**:
1. [OpenWeatherMap](https://openweathermap.org/api) 회원가입
2. API Keys 메뉴에서 무료 API 키 생성
3. `.env.local`에 API 키 추가
4. 무료 플랜: 1000회/일, 60회/분 (충분함)

## 🌐 Vercel 배포

### 1. Vercel 계정 연결

```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login

# 프로젝트 연결
vercel link
```

### 2. 환경 변수 설정

Vercel 대시보드에서 환경 변수 추가 (Settings → Environment Variables):

**필수 변수**:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API 키
- `OPENWEATHERMAP_API_KEY`: OpenWeatherMap API 키
- `NEXT_PUBLIC_DANANG_LAT`: `16.0544`
- `NEXT_PUBLIC_DANANG_LON`: `108.2022`
- `NEXT_PUBLIC_BASE_URL`: 배포된 도메인 (예: `https://your-app.vercel.app`)

**중요**: 환경 변수 변경 후 반드시 **Redeploy** 실행!

### 3. 배포

```bash
# 프로덕션 배포
vercel --prod

# 또는 Git push만으로 자동 배포
git push origin main
```

### 4. 도메인 설정

Vercel 대시보드에서 커스텀 도메인 설정 가능

### 배포 설정 (vercel.json)

```json
{
  "regions": ["icn1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 🏗️ 기술 스택

### 프레임워크 & 언어
- **Next.js 15.5**: React 기반 풀스택 프레임워크 (App Router)
- **TypeScript 5.7**: 타입 안정성 및 개발 생산성
- **React 19**: 최신 React 기능 활용

### 스타일링 & 애니메이션
- **Tailwind CSS 3.4**: 유틸리티 기반 CSS 프레임워크
- **Framer Motion 11**: 선언적 애니메이션 라이브러리
- **Lucide React**: 모던 아이콘 세트

### PWA & 오프라인
- **Service Worker**: 오프라인 캐싱 및 백그라운드 동기화
- **Web App Manifest**: PWA 메타데이터
- **IndexedDB (idb 8.0)**: 클라이언트 측 데이터베이스
- **Workbox**: Service Worker 최적화 도구

### 지도 & 위치
- **@react-google-maps/api 2.20**: Google Maps 연동
- **Geolocation API**: GPS 위치 추적 (배터리 최적화)
- **Google Places API**: 주변 편의시설 검색

### 날씨 & API
- **OpenWeatherMap API**: 실시간 날씨 및 5일 예보
- **3-Tier Caching**: 서버 메모리 → 클라이언트 메모리 → LocalStorage

### 날짜/시간 처리
- **date-fns 4.1**: 가볍고 빠른 날짜 라이브러리
- **date-fns-tz 3.2**: 타임존 지원 확장

### 분석 & 모니터링
- **Vercel Analytics**: 사용자 분석 및 인사이트
- **Vercel Speed Insights**: 실시간 성능 모니터링

### 테스팅
- **Playwright 1.57**: E2E 테스트 (60개 테스트, 100% 통과)
- **Lighthouse**: PWA 품질 검증 (Performance: 78/100)

## 📁 프로젝트 구조

```
travelPlan/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 루트 레이아웃 (PWA, Analytics)
│   ├── page.tsx                   # 메인 페이지
│   ├── globals.css                # 전역 스타일
│   └── api/                       # API Routes
│       └── weather/               # 날씨 API
│           ├── current/route.ts   # 현재 날씨
│           └── forecast/route.ts  # 5일 예보
│
├── components/                    # React 컴포넌트
│   ├── TravelProgress.tsx         # 메인 진행률 컴포넌트
│   ├── CountdownTimer.tsx         # 카운트다운 타이머
│   ├── ProgressRing.tsx           # 원형 진행률 링
│   ├── DayTimeline.tsx            # 일별 타임라인
│   ├── ActivityCard.tsx           # 활동 카드
│   ├── StatusBadge.tsx            # 상태 배지
│   ├── ImageModal.tsx             # 이미지 모달
│   ├── ThemeToggle.tsx            # 다크모드 토글
│   ├── LoadingSkeleton.tsx        # 로딩 스켈레톤
│   ├── MapView.tsx                # Google Maps 지도
│   ├── BottomNavigation.tsx       # 하단 탭 네비게이션
│   ├── WeatherWidget.tsx          # 날씨 위젯
│   ├── ServiceWorkerRegister.tsx  # Service Worker 등록
│   ├── NetworkStatusIndicator.tsx # 오프라인 알림
│   ├── PWAInstallPrompt.tsx       # PWA 설치 프롬프트
│   └── AmenitiesBottomSheet.tsx   # 편의시설 검색
│
├── hooks/                         # Custom React Hooks
│   ├── useCurrentTime.tsx         # 실시간 시간 훅
│   ├── useTravelStatus.tsx        # 여행 상태 훅
│   ├── useTimezone.tsx            # 타임존 감지 훅
│   ├── useWeather.tsx             # 날씨 API 훅
│   └── useGeolocation.tsx         # GPS 위치 훅
│
├── lib/                           # 유틸리티 & 데이터
│   ├── travelData.ts              # 여행 일정 데이터
│   ├── timeUtils.ts               # 시간 처리 유틸리티
│   ├── progressCalculator.ts      # 진행률 계산 로직
│   └── amenities.ts               # 편의시설 데이터
│
├── types/                         # TypeScript 타입 정의
│   ├── travel.ts                  # 여행 관련 타입
│   ├── weather.ts                 # 날씨 API 타입
│   └── amenity.ts                 # 편의시설 타입
│
├── contexts/                      # React Context
│   └── ThemeContext.tsx           # 다크모드 컨텍스트
│
├── public/                        # 정적 파일
│   ├── manifest.json              # PWA 매니페스트
│   ├── sw.js                      # Service Worker
│   ├── icons/                     # PWA 아이콘 (9개)
│   └── images/                    # 관광지 이미지 (16장)
│
├── tests/                         # Playwright 테스트
│   ├── 14-weather-feature.spec.ts # 날씨 기능 테스트
│   ├── 18-offline-pwa-battery.spec.ts # 오프라인/PWA 테스트
│   ├── 19-ux-enhancements.spec.ts # UX 개선 테스트
│   └── final-validation.spec.ts   # 최종 검증 테스트
│
└── claudedocs/                    # 프로젝트 문서
    ├── production-deployment-report.md
    ├── mobile-testing-guide.md
    └── next-steps-priority.md
```

## 🎯 핵심 기능 상세

### 1. 실시간 시간 추적

```typescript
// 1초마다 업데이트되는 현재 시간
const currentTime = useCurrentTime();

// Hydration 불일치 방지
useEffect(() => {
  setCurrentTime(new Date());
  const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  return () => clearInterval(timer);
}, []);
```

### 2. 여행 상태 계산

```typescript
// 현재 시간 기준으로 여행 상태 자동 판별
const travelProgress = calculateTravelProgress(travelData, currentTime);

// 상태: BEFORE_TRIP | IN_PROGRESS | COMPLETED
// 현재 활동, 완료 개수, 진행률 등 계산
```

### 3. 타임존 처리

```typescript
// 사용자 위치에 따른 시간 표시
const koreaTime = formatInTimeZone(date, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
const vietnamTime = formatInTimeZone(date, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm');
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#3B82F6` (하늘색)
- **Success**: `#10B981` (완료 상태)
- **Warning**: `#F59E0B` (진행 중)
- **Neutral**: `#6B7280` (예정)

### 반응형 브레이크포인트
- **Mobile**: < 640px
- **Tablet**: 640px ~ 1024px
- **Desktop**: > 1024px

## 📝 여행 일정 수정

`lib/travelData.ts` 파일을 수정하여 여행 일정을 변경할 수 있습니다.

```typescript
export const travelData: TravelData = {
  title: '다낭 여행',
  startDate: '2025-01-15T13:00:00+09:00',
  endDate: '2025-01-19T08:00:00+09:00',
  days: [
    // 일정 데이터...
  ],
};
```

## 🎬 데모 시나리오

### 여행 전 (현재 < 2025-01-15 13:00)
- 큰 카운트다운 타이머 표시
- "여행 시작까지 X일 X시간 X분 X초"
- 전체 일정 미리보기 (접기/펼치기 가능)

### 여행 중 (2025-01-15 13:00 ~ 2025-01-19 08:00)
- 원형 진행률 링 (퍼센티지)
- 현재 진행 중인 활동 강조 표시
- 완료된 활동: 흐림 + 체크 표시
- 예정된 활동: 일반 카드

### 여행 완료 (현재 > 2025-01-19 08:00)
- "여행이 완료되었습니다!" 메시지
- 100% 진행률 표시
- 전체 기록 보기 모드

## 🔧 최적화

### 성능
- Next.js 자동 코드 스플리팅
- 이미지 자동 최적화 (WebP, AVIF)
- Lazy loading 적용
- Service Worker 캐싱 (오프라인 지원)
- 3-Tier 날씨 API 캐싱 (5분 간격)

### SEO
- 메타데이터 최적화
- 시맨틱 HTML 구조
- 접근성 (ARIA) 지원
- PWA manifest.json

### 접근성 (WCAG 2.1 AA)
- 키보드 네비게이션 (Tab, Enter, Escape)
- 스크린 리더 지원 (ARIA 라벨)
- 색상 대비율 4.5:1 이상
- 터치 타겟 최소 44x44px

## ✈️ 여행 준비 체크리스트

### 📱 출발 전날 (D-1)
- [ ] PWA 앱 설치 (Android/iOS)
- [ ] 오프라인 모드 테스트
- [ ] 날씨 정보 확인 (자동 캐시됨)
- [ ] GPS 권한 허용 설정
- [ ] 다크모드 설정 (필요시)

### 🌐 인터넷 환경
- [ ] 공항 WiFi 연결 시 앱 실행 (캐시 갱신)
- [ ] 호텔 WiFi 연결 시 날씨 업데이트
- [ ] 로밍/현지 SIM 구매 시 자동 업데이트

### 🔋 배터리 절약 팁
- [ ] GPS 추적은 필요할 때만 활성화
- [ ] 다크모드 사용 (OLED 화면에서 30% 절약)
- [ ] 오프라인 모드에서는 캐시된 데이터 사용

### 📍 현지 도착 후
- [ ] 현재 위치 권한 허용
- [ ] 날씨 정보 자동 업데이트 확인
- [ ] Google Maps 경로 안내 테스트
- [ ] 주변 편의시설 검색 테스트

## 🛠️ 문제 해결 (Troubleshooting)

### PWA 설치가 안 돼요
**Android**:
- Chrome 브라우저 사용 확인 (Samsung Internet도 지원)
- 브라우저 설정 → 사이트 설정 → 팝업 허용 확인
- 브라우저 메뉴 (⋮) → "홈 화면에 추가" 직접 선택

**iOS**:
- Safari 브라우저 사용 필수 (Chrome 불가)
- 공유 버튼 (□↑) → "홈 화면에 추가"
- iOS 16.4 이상 권장

### 오프라인 모드가 작동 안 해요
1. 한 번 이상 앱을 온라인에서 실행했는지 확인
2. 브라우저 설정 → 저장공간 확인 (최소 50MB 필요)
3. 시크릿 모드가 아닌지 확인 (시크릿 모드는 캐시 미지원)
4. Service Worker 등록 확인:
   - 개발자 도구 (F12) → Application → Service Workers
   - 활성화 상태 확인

### 날씨 정보가 안 나와요
1. **인터넷 연결 확인**: 처음 로드 시 인터넷 필요
2. **API 할당량 확인**: 1000회/일 무료 (충분함)
3. **캐시된 날씨 보기**: 오프라인에서는 마지막 날씨 표시
4. **5분 대기**: 캐시 만료 후 자동 업데이트

### Google Maps가 안 보여요
1. **API 키 확인**: 개발자 콘솔에서 에러 메시지 확인
2. **API 활성화**: Maps JavaScript API, Places API 활성화 필요
3. **할당량 확인**: 무료 플랜 $200/월 크레딧 (충분함)
4. **네트워크 확인**: 지도는 온라인 필수 (오프라인 미지원)

### GPS 위치가 부정확해요
1. **위치 서비스 활성화**: 휴대폰 설정 → 위치 → 켜기
2. **고정밀도 모드**: 위치 모드 → 고정밀도 (GPS + WiFi + 모바일)
3. **실외에서 사용**: 건물 내부는 GPS 신호 약함
4. **베트남 도착 후**: 현지 GPS 위성 연결 시간 필요 (1-2분)

### 배터리 소모가 심해요
1. **GPS 추적 끄기**: 필요할 때만 위치 확인
2. **다크모드 사용**: 설정 → 다크모드 활성화
3. **백그라운드 새로고침 제한**: 휴대폰 설정에서 제한
4. **화면 밝기 조절**: 자동 밝기 사용 권장

### 앱이 느려요
1. **캐시 정리**: 브라우저 설정 → 캐시 삭제 후 재설치
2. **백그라운드 앱 종료**: 다른 앱 정리
3. **업데이트 확인**: 앱 재설치 (최신 버전 자동 적용)
4. **저사양 기기**: 애니메이션 끄기 (설정에서 모션 감소)

### 문제가 계속되면?
- **개발자 도구 확인**: F12 → Console 탭에서 에러 메시지 확인
- **브라우저 재시작**: 브라우저 완전 종료 후 재실행
- **앱 재설치**: 홈 화면에서 앱 삭제 → 재설치
- **다른 브라우저 시도**: Chrome ↔ Samsung Internet (Android), Safari (iOS)

## 📄 라이선스

이 프로젝트는 개인 사용을 위한 것입니다.

## 🙏 감사

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [date-fns](https://date-fns.org/)
- [Lucide Icons](https://lucide.dev/)

---

**만든이**: 2025년 다낭 여행을 위한 맞춤 트래커 🌴✈️
# Force rebuild: Sat Jan 10 18:52:05 KST 2026
