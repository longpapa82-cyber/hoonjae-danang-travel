# 🌴 다낭 여행 진척도 트래커

2025년 1월 다낭 여행의 실시간 진척도를 추적하는 인터랙티브 웹 애플리케이션입니다.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15-ff0055)

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

### 🌍 타임존 자동 처리
- **위치 기반 시간 표시**: 한국(+9) / 베트남(+7) 시차 자동 반영
- **Hydration 불일치 방지**: 서버/클라이언트 시간 동기화

### 🎨 세련된 UI/UX
- **다크모드 지원**: 시스템 설정 감지 및 수동 전환 가능
- **부드러운 애니메이션**: Framer Motion 기반 인터랙티브 효과
- **반응형 디자인**: 모바일/태블릿/데스크탑 최적화
- **이미지 갤러리**: 관광지 이미지 클릭 시 모달 확대 보기

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

# Next.js 설정
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 타임존 설정 (선택사항)
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Seoul
```

**Google Maps API 설정 방법**:
1. [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) 접속
2. Maps JavaScript API, Directions API, Geocoding API 활성화
3. API 키 생성 및 제한 설정
4. `.env.local`에 API 키 추가

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

Vercel 대시보드에서 환경 변수 추가:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_BASE_URL` (배포된 도메인)

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

### 날짜/시간 처리
- **date-fns 4.1**: 가볍고 빠른 날짜 라이브러리
- **date-fns-tz 3.2**: 타임존 지원 확장

## 📁 프로젝트 구조

```
travelPlan/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 메인 페이지
│   └── globals.css          # 전역 스타일
│
├── components/              # React 컴포넌트
│   ├── TravelProgress.tsx   # 메인 진행률 컴포넌트
│   ├── CountdownTimer.tsx   # 카운트다운 타이머
│   ├── ProgressRing.tsx     # 원형 진행률 링
│   ├── DayTimeline.tsx      # 일별 타임라인
│   ├── ActivityCard.tsx     # 활동 카드
│   ├── StatusBadge.tsx      # 상태 배지
│   ├── ImageModal.tsx       # 이미지 모달
│   ├── ThemeToggle.tsx      # 다크모드 토글
│   └── LoadingSkeleton.tsx  # 로딩 스켈레톤
│
├── hooks/                   # Custom React Hooks
│   ├── useCurrentTime.tsx   # 실시간 시간 훅
│   ├── useTravelStatus.tsx  # 여행 상태 훅
│   └── useTimezone.tsx      # 타임존 감지 훅
│
├── lib/                     # 유틸리티 & 데이터
│   ├── travelData.ts        # 여행 일정 데이터
│   ├── timeUtils.ts         # 시간 처리 유틸리티
│   └── progressCalculator.ts # 진행률 계산 로직
│
├── types/                   # TypeScript 타입 정의
│   └── travel.ts            # 여행 관련 타입
│
└── public/images/           # 관광지 이미지 (16장)
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

### SEO
- 메타데이터 최적화
- 시맨틱 HTML 구조
- 접근성 (ARIA) 지원

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
