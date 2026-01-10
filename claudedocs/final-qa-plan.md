# 다낭 여행 추적 앱 최종 검수 계획

**작성일**: 2026-01-10
**목적**: 날씨 기능 추가 후 Playwright를 이용한 종합 품질 검증
**버전**: 1.0

---

## 📋 목차

1. [검수 개요](#검수-개요)
2. [검수 범위](#검수-범위)
3. [테스트 전략](#테스트-전략)
4. [테스트 시나리오](#테스트-시나리오)
5. [테스트 구조](#테스트-구조)
6. [실행 계획](#실행-계획)
7. [체크리스트](#체크리스트)
8. [품질 기준](#품질-기준)

---

## 검수 개요

### 배경
- 날씨 기능(OpenWeatherMap API 연동)이 새로 추가됨
- HomePage에 WeatherCard 컴포넌트 통합
- 3-Tier 캐싱 전략 구현 (서버 메모리 → 클라이언트 메모리 → LocalStorage)

### 목표
1. **기능 검증**: 날씨 정보가 정확하게 표시되는지 확인
2. **통합 검증**: 기존 기능과의 호환성 확인
3. **성능 검증**: Lighthouse 점수 유지 (Performance 78+, Accessibility 95+)
4. **안정성 검증**: 에러 핸들링 및 오프라인 대응
5. **접근성 검증**: WCAG 2.1 AA 준수

### 검수 환경
- **브라우저**: Chromium (Desktop), Mobile Chrome (iPhone 12)
- **환경**: 프로덕션 (https://hoonjae-danang-travel.vercel.app)
- **도구**: Playwright v1.57.0
- **Node**: >=20.x

---

## 검수 범위

### In-Scope (검증 대상)

#### 1. 날씨 기능 (신규)
- ✅ WeatherCard 컴포넌트 렌더링
- ✅ 현재 날씨 정보 표시 (온도, 날씨 상태, 습도, 풍속)
- ✅ 5일 예보 표시
- ✅ 날씨 아이콘 및 이모지
- ✅ 로딩 상태 UI
- ✅ 에러 상태 UI
- ✅ 자동 갱신 (5분마다)
- ✅ 캐싱 동작 (서버/클라이언트/LocalStorage)
- ✅ 오프라인 모드 (LocalStorage fallback)

#### 2. 기존 기능 (회귀 테스트)
- ✅ 페이지 로딩 성능
- ✅ 탭 네비게이션 (홈/지도/일정/설정)
- ✅ Google Maps 표시
- ✅ 여행 진행률 표시
- ✅ 일정 타임라인
- ✅ 다크모드
- ✅ 접근성 (ARIA, 키보드 네비게이션)
- ✅ 모바일 반응형

#### 3. 통합 시나리오
- ✅ HomePage 전체 레이아웃 (WeatherCard + 기존 컴포넌트)
- ✅ 여러 탭 간 이동 시 상태 유지
- ✅ 리프레시 후 캐시 복원

### Out-of-Scope (제외)
- ❌ API 키 보안 (별도 보안 감사 필요)
- ❌ OpenWeatherMap API 자체의 정확성
- ❌ 네트워크 지연 시뮬레이션 (별도 성능 테스트 필요)
- ❌ 브라우저 호환성 (Firefox, Safari는 별도 테스트)

---

## 테스트 전략

### 우선순위 분류

| 우선순위 | 설명 | 실패 시 조치 |
|---------|------|------------|
| **P0** | Critical - 배포 차단 | 즉시 수정 필요 |
| **P1** | High - 주요 기능 | 수정 후 배포 |
| **P2** | Medium - 개선 사항 | 다음 배포에 포함 |
| **P3** | Low - Nice-to-have | 백로그 추가 |

### 테스트 레벨

```
Level 1: Unit Tests (개별 컴포넌트)
  └─ WeatherCard 렌더링
  └─ useWeather Hook 로직

Level 2: Integration Tests (API 통합)
  └─ /api/weather/current 응답
  └─ /api/weather/forecast 응답
  └─ 캐싱 동작

Level 3: E2E Tests (사용자 시나리오)
  └─ 페이지 로드 → 날씨 표시
  └─ 탭 전환 → 상태 유지
  └─ 에러 → Fallback

Level 4: Visual Regression (UI 일관성)
  └─ 스크린샷 비교
  └─ 다크모드 스타일

Level 5: Performance Tests (성능 영향)
  └─ Lighthouse 점수
  └─ 로딩 시간
```

### 테스트 병렬화 전략

- **독립 테스트**: 병렬 실행 (렌더링, 접근성, 스타일)
- **순차 테스트**: 순차 실행 (캐싱, 상태 변경)

---

## 테스트 시나리오

### 시나리오 1: 날씨 카드 기본 렌더링 (P0)

**목적**: WeatherCard가 정상적으로 로드되고 필수 정보가 표시되는지 확인

**Steps**:
1. HomePage 접속
2. WeatherCard 컴포넌트 확인
3. 현재 온도 표시 확인
4. 날씨 상태 텍스트 확인
5. 날씨 아이콘(이모지) 확인
6. 습도, 풍속 정보 확인
7. 5일 예보 섹션 확인

**Expected**:
- WeatherCard가 visible
- 온도가 숫자 + "°C" 형식
- 날씨 상태가 한국어 (예: "맑음", "흐림")
- 이모지 아이콘이 표시됨 (☀️, ☁️, 🌧️ 등)
- 습도가 "XX%" 형식
- 풍속이 "X.X m/s" 형식
- 5개의 일별 예보 카드 존재

---

### 시나리오 2: 날씨 API 응답 처리 (P0)

**목적**: API 호출이 성공하고 올바른 데이터를 받아오는지 확인

**Steps**:
1. 네트워크 요청 모니터링 시작
2. HomePage 접속
3. `/api/weather/current` 요청 확인
4. `/api/weather/forecast` 요청 확인
5. 응답 상태 코드 확인 (200 OK)
6. 응답 데이터 구조 검증

**Expected**:
- 두 API 모두 200 OK 응답
- current API: `{ success: true, data: {...} }` 형식
- forecast API: `{ success: true, data: [...] }` 형식
- 응답 시간 < 3초

---

### 시나리오 3: 로딩 상태 UI (P1)

**목적**: 데이터 로딩 중 적절한 UI가 표시되는지 확인

**Steps**:
1. 네트워크를 느린 3G로 설정
2. HomePage 접속
3. 로딩 스켈레톤 확인
4. 로딩 완료 후 실제 데이터 표시 확인

**Expected**:
- 로딩 중: "날씨 정보 로딩 중..." 텍스트 또는 스피너
- 로딩 완료 후: WeatherCard에 실제 데이터 표시

---

### 시나리오 4: 에러 핸들링 (P0)

**목적**: API 실패 시 적절한 에러 메시지와 Fallback이 작동하는지 확인

**Steps**:
1. API 요청을 차단 (네트워크 오프라인 시뮬레이션)
2. HomePage 접속
3. 에러 메시지 확인
4. LocalStorage에 캐시된 데이터가 있다면 표시되는지 확인

**Expected**:
- 에러 UI 표시: "날씨 정보를 불러올 수 없습니다" 또는 유사 메시지
- 캐시가 있으면: 마지막 날씨 데이터 표시 + 경고 메시지
- 캐시가 없으면: 에러 상태만 표시

---

### 시나리오 5: 캐싱 동작 (P1)

**목적**: 3-Tier 캐싱이 올바르게 작동하는지 확인

**Steps**:
1. HomePage 첫 방문 (캐시 없음)
2. API 호출 확인
3. 페이지 새로고침
4. API 호출이 스킵되고 캐시 사용 확인
5. 5분 대기 (또는 시간 시뮬레이션)
6. 캐시 만료 후 재호출 확인

**Expected**:
- 첫 방문: API 호출 발생
- 5분 이내 재방문: API 호출 없음 (캐시 사용)
- 5분 경과 후: API 재호출
- LocalStorage에 `weather_current`, `weather_forecast` 키 존재

---

### 시나리오 6: 5일 예보 가로 스크롤 (P1)

**목적**: 모바일에서 5일 예보가 가로 스크롤되는지 확인

**Steps**:
1. 모바일 뷰포트 설정 (375x667)
2. HomePage 접속
3. WeatherCard의 5일 예보 섹션 확인
4. 가로 스크롤 동작 확인

**Expected**:
- 5개의 예보 카드가 가로로 나열
- 좌우 스크롤 가능
- 각 카드: 요일, 아이콘, 최고/최저 온도 표시

---

### 시나리오 7: 접근성 (P0)

**목적**: WCAG 2.1 AA 준수 확인

**Steps**:
1. HomePage 접속
2. WeatherCard의 ARIA 속성 확인
3. 키보드로 WeatherCard 내 요소 탐색
4. 스크린리더 레이블 확인
5. 색상 대비 검증

**Expected**:
- `role="region"` 또는 `<article>` 사용
- `aria-label="다낭 날씨 정보"` 또는 유사
- 온도, 날씨 상태에 적절한 레이블
- 키보드로 새로고침 버튼 (있다면) 접근 가능
- 텍스트 대비율 > 4.5:1

---

### 시나리오 8: 다크모드 지원 (P1)

**목적**: 다크모드에서 WeatherCard 스타일이 올바른지 확인

**Steps**:
1. HomePage 접속
2. 설정 탭으로 이동
3. 다크모드 활성화
4. 홈 탭으로 돌아가기
5. WeatherCard 스타일 확인

**Expected**:
- 배경색이 어두운 톤으로 변경
- 텍스트 색상이 밝은 톤으로 변경
- 가독성 유지 (대비율 > 4.5:1)

---

### 시나리오 9: 페이지 성능 영향 (P0)

**목적**: 날씨 기능 추가가 성능에 미치는 영향 확인

**Steps**:
1. Lighthouse 실행 (Desktop, Mobile)
2. Performance 점수 확인
3. FCP, LCP 메트릭 확인
4. 총 번들 크기 확인

**Expected**:
- Performance: 78+ (기존 유지)
- Accessibility: 95+ (기존 유지)
- FCP < 2초
- LCP < 3초
- 번들 크기 증가 < 50KB

---

### 시나리오 10: 기존 기능 회귀 테스트 (P0)

**목적**: 날씨 기능 추가 후 기존 기능이 영향받지 않았는지 확인

**Steps**:
1. 탭 네비게이션 (홈 → 지도 → 일정 → 설정)
2. Google Maps 로딩 확인
3. 일정 타임라인 표시 확인
4. 하단 네비게이션 동작 확인

**Expected**:
- 모든 탭 정상 동작
- 지도 렌더링 정상
- 일정 표시 정상
- 네비게이션 애니메이션 정상

---

## 테스트 구조

### 파일 구조

```
tests/
├── 14-weather-feature.spec.ts       # 날씨 기능 종합 테스트 (신규)
├── 15-weather-accessibility.spec.ts # 날씨 접근성 테스트 (신규)
├── 16-weather-performance.spec.ts   # 날씨 성능 영향 테스트 (신규)
├── 17-regression-with-weather.spec.ts # 회귀 테스트 (신규)
└── final-validation.spec.ts         # 최종 종합 검증 (신규)
```

### 테스트 파일별 역할

#### 14-weather-feature.spec.ts
- **우선순위**: P0
- **목적**: 날씨 기능 핵심 동작 검증
- **테스트**:
  - WeatherCard 렌더링
  - 현재 날씨 정보 표시
  - 5일 예보 표시
  - 로딩 상태
  - 에러 핸들링
  - 캐싱 동작

#### 15-weather-accessibility.spec.ts
- **우선순위**: P0
- **목적**: WCAG 2.1 AA 준수 확인
- **테스트**:
  - ARIA 속성
  - 키보드 네비게이션
  - 스크린리더 레이블
  - 색상 대비
  - 포커스 관리

#### 16-weather-performance.spec.ts
- **우선순위**: P1
- **목적**: 성능 영향 측정
- **테스트**:
  - Lighthouse 점수
  - 로딩 시간
  - 번들 크기
  - 메모리 사용량

#### 17-regression-with-weather.spec.ts
- **우선순위**: P0
- **목적**: 기존 기능 회귀 방지
- **테스트**:
  - 탭 네비게이션
  - 지도 기능
  - 일정 표시
  - 다크모드
  - 모바일 반응형

#### final-validation.spec.ts
- **우선순위**: P0
- **목적**: 배포 전 최종 점검
- **테스트**:
  - 프로덕션 환경 검증
  - 주요 사용자 시나리오
  - 크리티컬 패스 E2E

---

## 실행 계획

### Phase 1: 테스트 작성 (예상 2-3시간)

```bash
# 1. 날씨 기능 테스트 작성
touch tests/14-weather-feature.spec.ts
touch tests/15-weather-accessibility.spec.ts
touch tests/16-weather-performance.spec.ts
touch tests/17-regression-with-weather.spec.ts
touch tests/final-validation.spec.ts

# 2. 각 파일에 테스트 시나리오 구현
# - describe/test 구조
# - 명확한 테스트 이름
# - 주석으로 목적 명시
```

### Phase 2: 로컬 실행 (예상 30분)

```bash
# Playwright 브라우저 설치 (최초 1회)
npx playwright install chromium

# 로컬 개발 서버 실행
npm run dev

# 로컬 환경 테스트 (병렬)
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npx playwright test --project=chromium-desktop

# 특정 파일만 실행
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npx playwright test tests/14-weather-feature.spec.ts

# UI 모드로 디버깅
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npx playwright test --ui
```

### Phase 3: 프로덕션 검증 (예상 30분)

```bash
# 프로덕션 환경 테스트 (기본 URL)
npx playwright test

# 특정 우선순위만 실행 (grep)
npx playwright test --grep "P0"

# 모바일 + 데스크톱 동시 실행
npx playwright test --project=chromium-desktop --project=mobile-chrome

# 리포트 생성
npx playwright test --reporter=html
npx playwright show-report
```

### Phase 4: 결과 분석 및 수정 (예상 1-2시간)

1. **테스트 결과 검토**
   - 실패한 테스트 분류 (P0/P1/P2)
   - 스크린샷 확인 (/tmp/playwright-*.png)
   - 에러 메시지 분석

2. **우선순위별 조치**
   - P0 실패 → 즉시 수정 필요
   - P1 실패 → 수정 후 배포
   - P2 실패 → 백로그 추가

3. **수정 후 재테스트**
   ```bash
   # 실패한 테스트만 재실행
   npx playwright test --last-failed

   # 전체 재실행
   npx playwright test
   ```

### Phase 5: 최종 검증 및 배포 승인 (예상 30분)

```bash
# 최종 종합 테스트
npx playwright test tests/final-validation.spec.ts

# Lighthouse 점수 확인
npx playwright test tests/performance-lighthouse.spec.ts

# 전체 테스트 성공 시 배포 승인
# ✅ All tests passed → 배포 GO
# ❌ Any P0 failed → 배포 NO-GO
```

---

## 체크리스트

### Pre-Test 체크리스트

- [ ] `.env.local`에 `OPENWEATHERMAP_API_KEY` 설정
- [ ] Playwright 브라우저 설치 (`npx playwright install chromium`)
- [ ] 프로덕션 배포 완료 및 URL 확인
- [ ] 로컬 개발 서버 정상 작동 확인 (`npm run dev`)
- [ ] package.json에 Playwright 의존성 확인

### 날씨 기능 검증 체크리스트

#### 렌더링
- [ ] WeatherCard가 HomePage에 표시됨
- [ ] 현재 온도가 표시됨 (숫자 + °C)
- [ ] 날씨 상태 텍스트가 한국어로 표시됨
- [ ] 날씨 아이콘(이모지)이 표시됨
- [ ] 습도가 표시됨 (%)
- [ ] 풍속이 표시됨 (m/s)
- [ ] 5일 예보가 표시됨 (5개 카드)
- [ ] 각 예보 카드에 요일, 아이콘, 온도 표시됨

#### API 통합
- [ ] `/api/weather/current` 호출 성공 (200 OK)
- [ ] `/api/weather/forecast` 호출 성공 (200 OK)
- [ ] 응답 데이터 구조 검증 (`success: true, data: {...}`)
- [ ] 응답 시간 < 3초

#### 상태 관리
- [ ] 로딩 상태 UI 표시 ("로딩 중...")
- [ ] 로딩 완료 후 실제 데이터 표시
- [ ] 에러 발생 시 에러 메시지 표시
- [ ] LocalStorage에 캐시 저장 확인
- [ ] 캐시 만료 후 재호출 확인

#### UI/UX
- [ ] 모바일에서 5일 예보 가로 스크롤
- [ ] 다크모드에서 스타일 정상
- [ ] 터치 타겟 크기 충분 (44x44px)
- [ ] 반응형 레이아웃 정상

### 접근성 검증 체크리스트

- [ ] `role="region"` 또는 시맨틱 요소 사용
- [ ] ARIA 레이블 존재 (`aria-label` 또는 `aria-labelledby`)
- [ ] 키보드로 요소 접근 가능
- [ ] 포커스 표시 명확
- [ ] 색상 대비 > 4.5:1
- [ ] 스크린리더 지원 (적절한 레이블)
- [ ] 이미지에 alt 텍스트 (없으면 decorative로 마크)

### 성능 검증 체크리스트

- [ ] Lighthouse Performance: 78+
- [ ] Lighthouse Accessibility: 95+
- [ ] FCP < 2초
- [ ] LCP < 3초
- [ ] 페이지 로딩 시간 < 5초
- [ ] 번들 크기 증가 < 50KB

### 회귀 테스트 체크리스트

- [ ] 홈 탭 정상 작동
- [ ] 지도 탭 정상 작동
- [ ] 일정 탭 정상 작동
- [ ] 설정 탭 정상 작동
- [ ] 탭 전환 애니메이션 정상
- [ ] Google Maps 렌더링 정상
- [ ] 일정 타임라인 표시 정상
- [ ] 다크모드 토글 정상
- [ ] 하단 네비게이션 정상

### Post-Test 체크리스트

- [ ] 모든 P0 테스트 통과
- [ ] 모든 P1 테스트 통과 (또는 백로그 등록)
- [ ] 테스트 리포트 생성 (`playwright-report/`)
- [ ] 스크린샷 검토 완료
- [ ] 실패한 테스트 수정 완료
- [ ] 재테스트 통과 확인
- [ ] 배포 승인 여부 결정

---

## 품질 기준

### 배포 승인 기준 (Pass/Fail)

#### PASS 조건 (모두 충족 시 배포 GO)
1. **P0 테스트**: 100% 통과
2. **P1 테스트**: ≥ 90% 통과
3. **Lighthouse Performance**: ≥ 78
4. **Lighthouse Accessibility**: ≥ 95
5. **페이지 로딩 시간**: < 5초
6. **콘솔 에러**: 0건 (warning은 허용)

#### FAIL 조건 (하나라도 해당 시 배포 NO-GO)
1. **P0 테스트 실패**: 1건 이상
2. **Lighthouse Performance**: < 75
3. **Lighthouse Accessibility**: < 90
4. **페이지 로딩 실패**: 1회 이상
5. **크리티컬 콘솔 에러**: 1건 이상

### 성능 목표

| 메트릭 | 목표 | 현재 | 상태 |
|--------|------|------|------|
| **Lighthouse Performance** | 78+ | TBD | 🔍 측정 예정 |
| **Lighthouse Accessibility** | 95+ | TBD | 🔍 측정 예정 |
| **FCP (First Contentful Paint)** | < 2초 | TBD | 🔍 측정 예정 |
| **LCP (Largest Contentful Paint)** | < 3초 | TBD | 🔍 측정 예정 |
| **페이지 로딩 시간** | < 5초 | TBD | 🔍 측정 예정 |
| **번들 크기 증가** | < 50KB | TBD | 🔍 측정 예정 |

### 접근성 목표

| 항목 | 목표 | 검증 방법 |
|------|------|----------|
| **WCAG Level** | AA | Playwright 접근성 테스트 |
| **색상 대비** | > 4.5:1 | 자동 검증 |
| **키보드 네비게이션** | 100% | 수동 검증 |
| **ARIA 속성** | 필수 요소에 적용 | 자동 검증 |
| **스크린리더** | 적절한 레이블 | 수동 검증 |

---

## 테스트 실행 명령어 요약

```bash
# 1. 로컬 개발 서버 테스트
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npx playwright test

# 2. 프로덕션 테스트 (기본)
npx playwright test

# 3. 날씨 기능만 테스트
npx playwright test tests/14-weather-feature.spec.ts

# 4. 접근성만 테스트
npx playwright test tests/15-weather-accessibility.spec.ts

# 5. 성능만 테스트
npx playwright test tests/16-weather-performance.spec.ts

# 6. 회귀 테스트
npx playwright test tests/17-regression-with-weather.spec.ts

# 7. 최종 검증
npx playwright test tests/final-validation.spec.ts

# 8. P0 테스트만 실행
npx playwright test --grep "P0"

# 9. 모바일만 테스트
npx playwright test --project=mobile-chrome

# 10. 데스크톱만 테스트
npx playwright test --project=chromium-desktop

# 11. UI 모드로 디버깅
npx playwright test --ui

# 12. 실패한 테스트만 재실행
npx playwright test --last-failed

# 13. HTML 리포트 생성 및 열기
npx playwright test --reporter=html
npx playwright show-report
```

---

## 예상 타임라인

| Phase | 작업 | 소요 시간 | 담당 |
|-------|------|----------|------|
| 1 | 테스트 파일 작성 | 2-3시간 | QA/Dev |
| 2 | 로컬 실행 및 디버깅 | 30분 | QA/Dev |
| 3 | 프로덕션 검증 | 30분 | QA |
| 4 | 결과 분석 및 수정 | 1-2시간 | Dev |
| 5 | 최종 검증 및 승인 | 30분 | QA/Lead |
| **합계** | | **5-6.5시간** | |

---

## 리스크 및 대응

### 리스크 1: API 키 누락
- **증상**: 날씨 API 호출 실패 (500 에러)
- **대응**: `.env.local` 및 Vercel 환경 변수 확인

### 리스크 2: OpenWeatherMap API 제한
- **증상**: 429 Too Many Requests
- **대응**: 캐싱 TTL 확인, API 호출 빈도 조정

### 리스크 3: 네트워크 지연
- **증상**: 테스트 타임아웃
- **대응**: `timeout` 설정 증가 (playwright.config.ts)

### 리스크 4: 성능 저하
- **증상**: Lighthouse 점수 하락
- **대응**:
  - WeatherCard를 dynamic import로 변경 (이미 적용됨)
  - 불필요한 리렌더링 방지 (React.memo)
  - 번들 크기 분석 (`npm run build` 후 .next/analyze)

### 리스크 5: 기존 기능 충돌
- **증상**: 탭 전환 시 레이아웃 깨짐
- **대응**: CSS 충돌 확인, z-index 조정

---

## 다음 단계

### 테스트 작성 후
1. 테스트 파일 작성 완료
2. 로컬 실행 및 검증
3. Pull Request 생성
4. 코드 리뷰

### 배포 승인 후
1. Vercel 프로덕션 배포
2. 프로덕션 환경 테스트 재실행
3. 모니터링 (에러율, 응답 시간)
4. 사용자 피드백 수집

### 향후 개선
1. 시간별 예보 추가 (Phase 7+)
2. 날씨 알림 기능 (악천후 시 Push)
3. 날씨 기반 일정 추천
4. Visual Regression Testing (Percy, Chromatic)

---

**문서 버전**: 1.0
**최종 업데이트**: 2026-01-10
**작성자**: Claude Code (SuperClaude)
**승인 필요**: QA Lead, Tech Lead
