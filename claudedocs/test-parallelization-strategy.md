# 테스트 병렬화 전략
## Playwright 테스트 의존성 분석 및 그룹화

---

## 📊 의존성 분석 요약

### 의존성 유형

| 의존성 타입 | 설명 | 영향 | 병렬 가능 여부 |
|------------|------|------|---------------|
| **순수 렌더링** | DOM 읽기만, 상태 변경 없음 | 없음 | ✅ 병렬 가능 |
| **UI 인터랙션** | 클릭/스크롤 등, 로컬 상태만 변경 | 낮음 | ✅ 병렬 가능 |
| **시간 의존** | Date.now() 모킹, 시스템 시간 변경 | 높음 | ⚠️ 격리 필요 |
| **전역 저장소** | localStorage/sessionStorage | 중간 | ⚠️ 격리 필요 |
| **브라우저 권한** | geolocation, notification 등 | 중간 | ⚠️ 격리 필요 |
| **네트워크 의존** | API 호출, 외부 리소스 | 낮음 | ✅ 병렬 가능 (캐시 주의) |

---

## 🎯 12개 테스트 시나리오 의존성 매트릭스

| # | 테스트 시나리오 | 우선순위 | 의존성 타입 | 전역 상태 변경 | 격리 필요 | 병렬 그룹 |
|---|----------------|---------|------------|-------------|----------|----------|
| 1 | 페이지 로딩 & 렌더링 | P0 | 순수 렌더링 | ❌ | ❌ | **Group A** |
| 2 | 탭 네비게이션 | P0 | UI 인터랙션 | ❌ | ❌ | **Group B** |
| 3 | 여행 진척도 계산 | P0 | 시간 의존 | ✅ Date | ✅ | **Group C** |
| 4 | 일정 데이터 표시 | P0 | 시간 의존 | ✅ Date | ✅ | **Group C** |
| 5 | 지도 기능 | P1 | 순수 렌더링 + API | ❌ | ❌ | **Group A** |
| 6 | 다크모드 | P1 | 전역 저장소 | ✅ localStorage | ✅ | **Group D** |
| 7 | 반응형 레이아웃 | P1 | 순수 렌더링 | ❌ | ❌ | **Group A** |
| 8 | 타임라인 인터랙션 | P1 | UI 인터랙션 | ❌ | ❌ | **Group B** |
| 9 | 위치 권한 | P2 | 브라우저 권한 | ✅ geolocation | ✅ | **Group E** |
| 10 | FAB 버튼 | P2 | UI 인터랙션 | ❌ | ❌ | **Group B** |
| 11 | 애니메이션 | P2 | 순수 렌더링 | ❌ | ❌ | **Group A** |
| 12 | 접근성 | P2 | 순수 렌더링 | ❌ | ❌ | **Group A** |

---

## 🚀 병렬 실행 그룹

### Group A: 순수 렌더링 그룹 (완전 병렬 가능)
**특징**: 상태 변경 없이 DOM 읽기만 수행

```yaml
테스트:
  - 01-page-load (페이지 로딩 & 렌더링)
  - 05-map-functionality (지도 기능)
  - 07-responsive-layout (반응형 레이아웃)
  - 11-animations (애니메이션)
  - 12-accessibility (접근성)

병렬 실행: ✅ 완전 가능
의존성: 없음
상태 격리: 불필요
예상 실행 시간: ~3-5초 (병렬)
```

**실행 명령:**
```bash
# Group A 전체 병렬 실행
npx playwright test tests/01-page-load.spec.ts tests/05-map-functionality.spec.ts tests/07-responsive-layout.spec.ts tests/11-animations.spec.ts tests/12-accessibility.spec.ts --workers=5
```

---

### Group B: UI 인터랙션 그룹 (완전 병렬 가능)
**특징**: 로컬 컴포넌트 상태만 변경, 전역 상태 영향 없음

```yaml
테스트:
  - 02-tab-navigation (탭 네비게이션)
  - 08-timeline-interaction (타임라인 인터랙션)
  - 10-fab-button (FAB 버튼)

병렬 실행: ✅ 완전 가능
의존성: 없음
상태 격리: 불필요
예상 실행 시간: ~4-6초 (병렬)
```

**실행 명령:**
```bash
# Group B 전체 병렬 실행
npx playwright test tests/02-tab-navigation.spec.ts tests/08-timeline-interaction.spec.ts tests/10-fab-button.spec.ts --workers=3
```

---

### Group C: 시간 의존 그룹 (순차 실행 권장)
**특징**: Date.now() 모킹으로 시스템 시간 변경

```yaml
테스트:
  - 03-travel-progress (여행 진척도 계산)
  - 04-schedule-display (일정 데이터 표시)

병렬 실행: ⚠️ 격리 필요 (순차 권장)
의존성: 시간 모킹 충돌 가능
상태 격리: 필수
해결 방법:
  1. 순차 실행 (--workers=1)
  2. 또는 별도 브라우저 컨텍스트 사용
예상 실행 시간: ~8-12초 (순차)
```

**실행 명령:**
```bash
# Group C 순차 실행 (안전)
npx playwright test tests/03-travel-progress.spec.ts tests/04-schedule-display.spec.ts --workers=1

# 또는 별도로 실행
npx playwright test tests/03-travel-progress.spec.ts
npx playwright test tests/04-schedule-display.spec.ts
```

**병렬 실행을 원할 경우:**
```typescript
// 각 테스트에서 독립적인 브라우저 컨텍스트 사용
test.describe('여행 진척도', () => {
  test.use({
    contextOptions: {
      timezoneId: 'Asia/Seoul',
    }
  });

  test('여행 전 테스트', async ({ page, context }) => {
    await context.addInitScript(() => {
      Date.now = () => new Date('2026-01-10T12:00:00+09:00').getTime();
    });
    // ...
  });
});
```

---

### Group D: 전역 저장소 그룹 (격리 필요)
**특징**: localStorage/sessionStorage 읽기/쓰기

```yaml
테스트:
  - 06-dark-mode (다크모드)

병렬 실행: ⚠️ 격리 필요
의존성: localStorage 공유 가능
상태 격리: 필수
해결 방법:
  1. 테스트 전/후 localStorage.clear()
  2. 또는 incognito/별도 브라우저 컨텍스트
예상 실행 시간: ~3-5초
```

**실행 명령:**
```bash
# Group D 단독 실행
npx playwright test tests/06-dark-mode.spec.ts
```

**병렬 실행을 원할 경우:**
```typescript
// 각 테스트 전후로 storage 초기화
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});
```

---

### Group E: 브라우저 권한 그룹 (격리 필요)
**특징**: geolocation, notifications 등 브라우저 권한

```yaml
테스트:
  - 09-location-permission (위치 권한)

병렬 실행: ⚠️ 격리 필요
의존성: 브라우저 권한 상태
상태 격리: 필수
해결 방법:
  1. 각 테스트마다 새 브라우저 컨텍스트
  2. 권한 설정은 컨텍스트 레벨에서 격리됨
예상 실행 시간: ~3-5초
```

**실행 명령:**
```bash
# Group E 단독 실행
npx playwright test tests/09-location-permission.spec.ts
```

---

## 📊 최적 실행 전략

### 전략 1: 완전 병렬 실행 (가장 빠름, 권장)

**Phase 1**: Group A + Group B 병렬 실행 (8개 테스트)
```bash
npx playwright test \
  tests/01-page-load.spec.ts \
  tests/02-tab-navigation.spec.ts \
  tests/05-map-functionality.spec.ts \
  tests/07-responsive-layout.spec.ts \
  tests/08-timeline-interaction.spec.ts \
  tests/10-fab-button.spec.ts \
  tests/11-animations.spec.ts \
  tests/12-accessibility.spec.ts \
  --workers=8
```
⏱️ **예상 시간**: 5-8초

**Phase 2**: Group C 순차 실행 (2개 테스트)
```bash
npx playwright test \
  tests/03-travel-progress.spec.ts \
  tests/04-schedule-display.spec.ts \
  --workers=1
```
⏱️ **예상 시간**: 8-12초

**Phase 3**: Group D + Group E 격리 실행 (2개 테스트)
```bash
npx playwright test tests/06-dark-mode.spec.ts
npx playwright test tests/09-location-permission.spec.ts
```
⏱️ **예상 시간**: 6-10초 (병렬 가능)

**총 실행 시간**: ~15-25초 (순차 실행 시 60-80초)

---

### 전략 2: 우선순위 기반 실행

**Step 1**: P0 테스트 먼저 (4개 시나리오)
```bash
# 병렬 가능한 P0
npx playwright test tests/01-page-load.spec.ts tests/02-tab-navigation.spec.ts --workers=2

# 격리 필요한 P0
npx playwright test tests/03-travel-progress.spec.ts tests/04-schedule-display.spec.ts --workers=1
```

**Step 2**: P1 테스트 (4개 시나리오)
```bash
# 병렬 가능한 P1
npx playwright test tests/05-map-functionality.spec.ts tests/07-responsive-layout.spec.ts tests/08-timeline-interaction.spec.ts --workers=3

# 격리 필요한 P1
npx playwright test tests/06-dark-mode.spec.ts
```

**Step 3**: P2 테스트 (4개 시나리오)
```bash
npx playwright test tests/09-location-permission.spec.ts tests/10-fab-button.spec.ts tests/11-animations.spec.ts tests/12-accessibility.spec.ts --workers=4
```

---

### 전략 3: CI/CD 최적화 (GitHub Actions 예시)

```yaml
name: Playwright Tests (Parallelized)

on: [push, pull_request]

jobs:
  # Job 1: 순수 렌더링 그룹 (Group A)
  test-group-a:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install chromium
      - run: |
          npx playwright test \
            tests/01-page-load.spec.ts \
            tests/05-map-functionality.spec.ts \
            tests/07-responsive-layout.spec.ts \
            tests/11-animations.spec.ts \
            tests/12-accessibility.spec.ts \
            --workers=5

  # Job 2: UI 인터랙션 그룹 (Group B)
  test-group-b:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install chromium
      - run: |
          npx playwright test \
            tests/02-tab-navigation.spec.ts \
            tests/08-timeline-interaction.spec.ts \
            tests/10-fab-button.spec.ts \
            --workers=3

  # Job 3: 시간 의존 그룹 (Group C)
  test-group-c:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install chromium
      - run: |
          npx playwright test \
            tests/03-travel-progress.spec.ts \
            tests/04-schedule-display.spec.ts \
            --workers=1  # 순차 실행

  # Job 4: 격리 필요 그룹 (Group D + E)
  test-group-de:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install chromium
      - run: npx playwright test tests/06-dark-mode.spec.ts
      - run: npx playwright test tests/09-location-permission.spec.ts
```

**CI/CD 총 실행 시간**: ~10-15초 (4개 Job 병렬 실행)

---

## 🔍 의존성 상세 분석

### 1. 페이지 로딩 & 렌더링 (Group A)
```yaml
읽기: DOM, 네트워크 (초기 로드)
쓰기: 없음
전역 상태: 없음
격리 필요: ❌
병렬 가능: ✅
이유: 순수 렌더링 테스트, 상태 변경 없음
```

### 2. 탭 네비게이션 (Group B)
```yaml
읽기: DOM, ARIA 속성
쓰기: React 로컬 상태 (activeTab)
전역 상태: 없음
격리 필요: ❌
병렬 가능: ✅
이유: 로컬 상태만 변경, 전역 영향 없음
```

### 3. 여행 진척도 계산 (Group C)
```yaml
읽기: 시스템 시간 (Date.now())
쓰기: Date.now() 모킹
전역 상태: ✅ 시간
격리 필요: ✅
병렬 가능: ⚠️ (격리 시에만)
이유: Date.now() 모킹이 다른 테스트에 영향 가능
충돌 가능 테스트: 04-schedule-display
```

### 4. 일정 데이터 표시 (Group C)
```yaml
읽기: 시스템 시간, 여행 데이터
쓰기: Date.now() 모킹
전역 상태: ✅ 시간
격리 필요: ✅
병렬 가능: ⚠️ (격리 시에만)
이유: 현재 시간 기반 상태 계산 (완료/진행중/예정)
충돌 가능 테스트: 03-travel-progress
```

### 5. 지도 기능 (Group A)
```yaml
읽기: DOM, Google Maps API
쓰기: 없음 (지도 렌더링은 격리됨)
전역 상태: 없음
격리 필요: ❌
병렬 가능: ✅
이유: Google Maps는 컴포넌트별 독립 인스턴스
```

### 6. 다크모드 (Group D)
```yaml
읽기: localStorage (theme), DOM 클래스
쓰기: localStorage (theme 키)
전역 상태: ✅ localStorage
격리 필요: ✅
병렬 가능: ⚠️ (격리 시에만)
이유: localStorage는 origin 전체에서 공유
해결: 테스트 전후 localStorage.clear()
```

### 7. 반응형 레이아웃 (Group A)
```yaml
읽기: DOM, viewport 크기
쓰기: viewport 설정 (page.setViewportSize)
전역 상태: 없음
격리 필요: ❌
병렬 가능: ✅
이유: viewport는 페이지별 독립 설정
```

### 8. 타임라인 인터랙션 (Group B)
```yaml
읽기: DOM, 스크롤 위치
쓰기: 스크롤, 모달 상태 (로컬)
전역 상태: 없음
격리 필요: ❌
병렬 가능: ✅
이유: 로컬 UI 상태만 변경
```

### 9. 위치 권한 (Group E)
```yaml
읽기: geolocation permission 상태
쓰기: context.grantPermissions(['geolocation'])
전역 상태: ✅ 브라우저 권한
격리 필요: ✅
병렬 가능: ✅ (컨텍스트별 격리)
이유: 권한은 브라우저 컨텍스트 레벨에서 관리
해결: 각 테스트마다 새 컨텍스트 생성 (Playwright 기본)
```

### 10. FAB 버튼 (Group B)
```yaml
읽기: DOM, 스크롤 위치
쓰기: 스크롤, 버튼 상태 (로컬)
전역 상태: 없음
격리 필요: ❌
병렬 가능: ✅
이유: 로컬 UI 상태만 변경
```

### 11. 애니메이션 (Group A)
```yaml
읽기: DOM, CSS 애니메이션 상태
쓰기: 없음
전역 상태: 없음
격리 필요: ❌
병렬 가능: ✅
이유: 순수 시각적 검증, 상태 변경 없음
```

### 12. 접근성 (Group A)
```yaml
읽기: DOM, ARIA 속성, 키보드 이벤트
쓰기: 키보드 입력 (로컬)
전역 상태: 없음
격리 필요: ❌
병렬 가능: ✅
이유: 순수 검증 테스트, 전역 영향 없음
```

---

## 📈 성능 비교

| 실행 방식 | 총 테스트 | 병렬 수준 | 예상 시간 | 개선율 |
|----------|----------|----------|----------|--------|
| **순차 실행** | 12개 | workers=1 | 60-80초 | 기준 |
| **부분 병렬** | 12개 | workers=4 | 30-40초 | 50% ↓ |
| **최적 병렬** | 12개 | 그룹별 최적화 | 15-25초 | 70% ↓ |
| **CI/CD 병렬** | 12개 | 4개 Job 병렬 | 10-15초 | 80% ↓ |

---

## 🛠️ 구현 가이드

### package.json 스크립트 추가

```json
{
  "scripts": {
    "test": "playwright test",
    "test:group-a": "playwright test tests/01-page-load.spec.ts tests/05-map-functionality.spec.ts tests/07-responsive-layout.spec.ts tests/11-animations.spec.ts tests/12-accessibility.spec.ts --workers=5",
    "test:group-b": "playwright test tests/02-tab-navigation.spec.ts tests/08-timeline-interaction.spec.ts tests/10-fab-button.spec.ts --workers=3",
    "test:group-c": "playwright test tests/03-travel-progress.spec.ts tests/04-schedule-display.spec.ts --workers=1",
    "test:group-d": "playwright test tests/06-dark-mode.spec.ts",
    "test:group-e": "playwright test tests/09-location-permission.spec.ts",
    "test:parallel": "npm run test:group-a && npm run test:group-b && npm run test:group-c && npm run test:group-d && npm run test:group-e",
    "test:p0": "playwright test tests/01-page-load.spec.ts tests/02-tab-navigation.spec.ts tests/03-travel-progress.spec.ts tests/04-schedule-display.spec.ts",
    "test:p1": "playwright test tests/05-map-functionality.spec.ts tests/06-dark-mode.spec.ts tests/07-responsive-layout.spec.ts tests/08-timeline-interaction.spec.ts",
    "test:p2": "playwright test tests/09-location-permission.spec.ts tests/10-fab-button.spec.ts tests/11-animations.spec.ts tests/12-accessibility.spec.ts"
  }
}
```

### playwright.config.ts 설정 (프로젝트별 그룹)

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ... 기존 설정

  projects: [
    // Group A: 순수 렌더링
    {
      name: 'group-a-rendering',
      testMatch: /(01-page-load|05-map|07-responsive|11-animations|12-accessibility)\.spec\.ts/,
      use: {
        // 병렬 실행 최적화
      },
    },

    // Group B: UI 인터랙션
    {
      name: 'group-b-interaction',
      testMatch: /(02-tab-navigation|08-timeline|10-fab)\.spec\.ts/,
    },

    // Group C: 시간 의존
    {
      name: 'group-c-time',
      testMatch: /(03-travel-progress|04-schedule-display)\.spec\.ts/,
      use: {
        // 순차 실행 강제
      },
    },

    // Group D: 저장소
    {
      name: 'group-d-storage',
      testMatch: /06-dark-mode\.spec\.ts/,
    },

    // Group E: 권한
    {
      name: 'group-e-permission',
      testMatch: /09-location-permission\.spec\.ts/,
    },
  ],
});
```

---

## ✅ 체크리스트

### 병렬 실행 전 확인사항
- [ ] 각 테스트가 전역 상태를 변경하는지 확인
- [ ] localStorage/sessionStorage 사용 여부 확인
- [ ] Date.now() 또는 시간 모킹 사용 여부 확인
- [ ] 브라우저 권한 설정 여부 확인
- [ ] 네트워크 요청 공유/캐싱 여부 확인

### 격리 필요 판단 기준
- [ ] 전역 객체 (window, document) 수정
- [ ] 브라우저 저장소 (localStorage, sessionStorage, IndexedDB) 변경
- [ ] 시스템 API 모킹 (Date, Math.random, setTimeout 등)
- [ ] 브라우저 권한 (geolocation, notifications 등)
- [ ] 공유 리소스 (파일, 데이터베이스)

---

## 📝 요약

### 병렬 실행 가능 (8개 테스트)
✅ Group A (5개): 01, 05, 07, 11, 12
✅ Group B (3개): 02, 08, 10

### 격리/순차 필요 (4개 테스트)
⚠️ Group C (2개): 03, 04 - 시간 모킹
⚠️ Group D (1개): 06 - localStorage
⚠️ Group E (1개): 09 - 브라우저 권한

### 권장 실행 방법
```bash
# 최적 병렬 실행 (권장)
npm run test:group-a & npm run test:group-b & wait
npm run test:group-c
npm run test:group-d & npm run test:group-e & wait
```

**총 실행 시간**: ~15-25초 (순차 대비 70% 단축)

---

**문서 버전**: 1.0.0
**최종 수정**: 2026-01-07
**작성자**: Claude (SuperClaude Framework)
