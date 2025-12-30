# 🚀 다낭 여행 트래커 V2.0 고도화 계획

## 개요

현재 V1.0에서 V2.0으로 업그레이드하여 다음 핵심 기능을 추가합니다:

1. **모바일 퍼스트 반응형 웹 개발**
2. **UI/UX 전면 개편 및 디자인 고도화**
3. **GPS + Google Maps Routes API 통합**
4. **실시간 위치 기반 경로 및 소요시간 제공**

---

## 📊 벤치마킹 분석

### 글로벌 여행 트래커 앱 분석

| 앱 | 핵심 기능 | 우리 앱에 적용 |
|----|----------|--------------|
| **Polarsteps** | GPS 자동 추적 (배터리 4%/일), 친구 실시간 공유 | ✅ 배터리 효율 GPS 추적 |
| **Wanderlog** | 협업 일정, AI 지도 뷰, 예약 자동 가져오기 | ✅ 지도 통합, 일정 최적화 |
| **TripIt** | 이메일 자동 일정 생성, 실시간 항공편 알림 | ✅ 자동 체크인, 알림 |

### 도입할 핵심 패턴

```
Polarsteps 방식: 백그라운드 GPS 추적 (4% 배터리 사용/일)
    ↓
Wanderlog 방식: 지도 중심 인터페이스 + 일정 통합
    ↓
TripIt 방식: 실시간 상태 업데이트 + 알림
```

---

## 🏗️ 아키텍처 개선

### 새로운 시스템 구조

```
[모바일 클라이언트 (PWA)]
         ↓
[상태 관리: Zustand + React Query]
         ↓
    ┌────┴────┐
    ↓         ↓
[GPS API]  [Google Maps Routes API]
    ↓         ↓
[실시간 위치] [경로/ETA]
         ↓
[Geofencing → 자동 체크인]
         ↓
[오프라인 캐시 (IndexedDB)]
```

---

## 📱 모바일 퍼스트 UI/UX 재설계

### 새로운 화면 구성

```
홈 화면
├─ 위치 헤더 (현재 위치 표시)
├─ 진행률 히어로 (대형 원형 링)
├─ 실시간 지도 카드 ⭐ 신규
│  ├─ 현재 위치 → 다음 목적지
│  ├─ 경로 표시
│  └─ ETA + 거리
├─ 빠른 액션 (체크인, 사진, 메모)
├─ 스와이프 타임라인 ⭐ 신규
└─ 하단 네비게이션 (홈/지도/일정/설정)
```

### 터치 최적화

- **최소 터치 영역**: 44x44px (Apple HIG 준수)
- **제스처 지원**:
  - 좌/우 스와이프: 이전/다음 활동
  - 위로 스와이프: 상세 정보
  - 아래로 스와이프: 닫기
  - 롱 프레스: 빠른 메뉴
- **햅틱 피드백**: 체크인 완료, 도착 알림

---

## 🗺️ Google Maps Routes API 통합

### 2025년 최신 API 사용

```typescript
// Routes API v2 (2025년 3월 1일부터)
const API_CONFIG = {
  endpoint: 'https://routes.googleapis.com/directions/v2:computeRoutes',
  features: [
    'TRAFFIC_AWARE',     // 실시간 교통
    'TOLL_PASSES',       // 통행료
    'FUEL_EFFICIENT',    // 연료 효율
  ],
  modes: ['DRIVE', 'WALK', 'TWO_WHEELER'],
};
```

### 핵심 기능

1. **실시간 경로 계산**
   - 현재 위치 → 다음 활동 경로
   - 실시간 교통 정보 반영
   - 대안 경로 제안 (최대 3개)

2. **ETA 자동 업데이트**
   - 30초마다 위치 업데이트
   - 교통 상황 반영한 도착 시간
   - 지연 시 알림

3. **거리 계산**
   - 남은 거리 표시
   - 이동 수단별 시간 비교
   - 통행료 정보 제공

### 비용 최적화

```yaml
무료 한도 활용:
  - Routes API: 28,500 요청/월
  - Maps JavaScript API: 28,000 로드/월
  - Distance Matrix: 40,000 요소/월

최적화 전략:
  - 5분 캐싱 → API 호출 50% 감소
  - 배치 요청 → 효율성 3배 증가
  - 오프라인 폴백 → 불필요한 요청 차단

예상 비용: $0/월 (무료 범위 내)
```

---

## 📍 GPS 위치 추적

### LocationService 설계

```typescript
class LocationService {
  // 실시간 위치 스트림 (30초 업데이트)
  watchPosition(): Observable<Position>;

  // 배경 추적 (PWA)
  startBackgroundTracking(): void;

  // 배터리 절약 모드
  enableBatterySaver(): void; // 업데이트 빈도 감소

  // 위치 권한 관리
  requestPermission(): Promise<PermissionStatus>;
}
```

### Geofencing (자동 체크인)

```typescript
// 목적지 100m 반경 진입 시 자동 체크인
geofenceService.onEnter((activity) => {
  sendNotification(`${activity.title}에 도착했습니다!`);
  autoCheckIn(activity);
  playHaptic('success');
});
```

---

## 💾 오프라인 지원 (PWA)

### 캐싱 전략

```yaml
Service Worker:
  지도: cache-first          # 오프라인 우선
  API: network-first         # 최신 데이터 우선
  이미지: cache-first        # 로컬 우선
  일정: stale-while-revalidate # 오래된 것 사용하되 백그라운드 업데이트
```

### IndexedDB 저장

- 일정 데이터 로컬 저장
- 진행률 오프라인 기록
- 지도 타일 캐싱 (주요 경로)
- 네트워크 복구 시 자동 동기화

---

## 🎯 구현 로드맵 (8주)

### Sprint 1-2: 모바일 UI 리팩토링 (2주)
```
✅ PWA 설정 (manifest, service worker)
✅ 모바일 컴포넌트 재설계
✅ 터치 최적화 (44px 버튼, 제스처)
✅ 하단 네비게이션
✅ SwipeableTimeline, BottomSheet, FAB
```

### Sprint 3-4: GPS & 위치 서비스 (2주)
```
📍 LocationService 구현
📍 실시간 위치 추적
🎯 GeofenceService 구현
🎯 자동 체크인 시스템
🔔 도착 알림
```

### Sprint 5-6: Google Maps 통합 (2주)
```
🗺️ Routes API 통합
🗺️ 실시간 경로 계산
🗺️ LiveMapCard 컴포넌트
🚗 ETA 자동 업데이트
🚗 교통 정보 표시
```

### Sprint 7: 오프라인 & 최적화 (1주)
```
💾 오프라인 지원
💾 지도 캐싱
⚡ 성능 최적화
⚡ 배터리 효율화
```

### Sprint 8: 폴리싱 & QA (1주)
```
📸 사진 업로드
📝 메모 기능
🐛 버그 수정
📱 디바이스 테스트
```

---

## 🆕 신규 기능 목록

### 1단계: 필수 기능
- ✅ GPS 실시간 위치 추적
- ✅ Google Maps 경로 안내
- ✅ 자동 체크인 (Geofencing)
- ✅ 실시간 ETA 업데이트
- ✅ 오프라인 지도 지원

### 2단계: 편의 기능
- ⭐ 사진 촬영 및 위치 태그
- ⭐ 활동별 메모 작성
- ⭐ 친구와 실시간 위치 공유
- ⭐ 여행 통계 (총 이동 거리 등)

### 3단계: 고급 기능
- 🚀 AR 내비게이션 (카메라 오버레이)
- 🚀 음성 안내 (턴바이턴)
- 🚀 주변 추천 장소
- 🚀 다국어 지원

---

## 📊 성공 지표

### 성능 목표
```yaml
Lighthouse Score:
  Performance: > 90
  Accessibility: > 95
  PWA: 100

Core Web Vitals:
  LCP: < 2.5s
  FID: < 100ms
  CLS: < 0.1

모바일 성능:
  초기 로드: < 3s (3G)
  배터리 사용: < 5%/일
```

### 사용자 경험
```yaml
GPS 정확도: > 90% (10m 이내)
ETA 정확도: > 85% (±5분)
자동 체크인 성공률: > 95%
오프라인 사용 가능: > 24시간
```

### 비용 효율
```yaml
Google Maps API: $0/월 (무료 범위)
호스팅 (Vercel): $0/월 (Free)
총 운영 비용: $0/월
```

---

## 🛠️ 기술 스택 업그레이드

### 신규 라이브러리
```json
{
  "@googlemaps/js-api-loader": "^1.16.8",
  "@react-google-maps/api": "^2.19.3",
  "@turf/turf": "^7.2.0",
  "zustand": "^4.5.0",
  "workbox-webpack-plugin": "^7.3.0",
  "react-use-gesture": "^10.3.1",
  "idb": "^8.0.2",
  "react-query": "^5.59.0"
}
```

---

## 🔐 보안 & 프라이버시

### 위치 데이터 보호
- 위치 정보는 로컬에만 저장 (서버 전송 X)
- 민감 데이터 암호화 (IndexedDB)
- HTTPS 강제 적용

### 사용자 권한
- 위치 권한: 명시적 요청 + 이유 설명
- 알림 권한: 선택 사항
- 카메라 권한: 사진 촬영 시에만

---

## 📝 다음 단계

### 즉시 시작 가능한 작업
1. **PWA 설정**: manifest.json, service worker 생성
2. **Google Maps API 키**: 발급 및 설정
3. **모바일 UI 시작**: 하단 네비게이션 구현
4. **LocationService**: GPS 권한 요청 UI

### 의사 결정 필요 사항
- [ ] Google Maps API 예산 승인
- [ ] PWA vs Native App 최종 결정
- [ ] 위치 공유 기능 포함 여부
- [ ] 다국어 지원 범위

---

**작성일**: 2025-12-29
**버전**: V2.0 설계 문서
**상태**: 승인 대기
