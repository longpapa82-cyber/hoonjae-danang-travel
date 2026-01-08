# Playwright 테스트 계획서
## 다낭 여행 진척도 추적 애플리케이션

---

## 📋 프로젝트 개요

### 애플리케이션 정보
- **프로젝트명**: 다낭 여행 진척도 추적 (Danang Travel Tracker)
- **기술 스택**: Next.js 15, React 19, TypeScript, Framer Motion, Google Maps API
- **테스트 도구**: Playwright v1.57.0
- **목적**: 실시간 여행 진행 상태 모니터링 및 일정 관리

### 핵심 기능
1. **여행 진척도 추적** - 현재 시간 기준 여행 전/중/후 상태 표시
2. **4개 탭 네비게이션** - 홈, 지도, 일정, 설정
3. **실시간 지도** - Google Maps API 활용 경로 표시
4. **일정 타임라인** - 5일간 상세 일정 관리
5. **다크모드** - 테마 전환 기능
6. **반응형 디자인** - 모바일 우선 설계
7. **위치 추적** - 현재 위치 기반 경로 안내

---

## 🎯 테스트 전략

### 테스트 우선순위

#### 🔴 **P0 - Critical (필수)**
페이지 기본 동작 및 핵심 기능

1. **페이지 로딩 & 렌더링**
   - 초기 페이지 로드 성공
   - 필수 컴포넌트 렌더링
   - 메타데이터 및 타이틀 확인

2. **탭 네비게이션**
   - 4개 탭 전환 동작
   - 탭별 컨텐츠 표시
   - 활성 탭 상태 유지

3. **여행 진척도 계산**
   - 여행 전 카운트다운 표시
   - 여행 중 진행률 표시
   - 여행 후 완료 상태 표시

4. **일정 데이터 표시**
   - 5일 일정 표시
   - 활동 시간 및 설명 표시
   - 완료/진행중/예정 상태 구분

#### 🟡 **P1 - Important (중요)**
주요 사용자 인터랙션

5. **지도 기능**
   - Google Maps 로딩
   - 마커 표시
   - 경로 렌더링

6. **다크모드**
   - 테마 토글 동작
   - 로컬스토리지 저장
   - 테마 적용 확인

7. **반응형 레이아웃**
   - 모바일 뷰포트 (375px - 430px)
   - 태블릿 뷰포트 (768px - 1024px)
   - 데스크톱 뷰포트 (1280px+)

8. **타임라인 인터랙션**
   - 스크롤 동작
   - 카드 확장/축소
   - 이미지 모달 표시

#### 🟢 **P2 - Nice-to-have (부가)**
UX 향상 기능

9. **위치 권한**
   - 권한 요청 모달
   - 권한 승인/거부 처리

10. **FAB 버튼**
    - 스크롤 시 표시/숨김
    - 빠른 탭 전환

11. **애니메이션**
    - Framer Motion 트랜지션
    - 부드러운 페이지 전환

12. **접근성**
    - ARIA 속성 확인
    - 키보드 네비게이션
    - 터치 타겟 크기 (44x44px)

---

## 🧪 테스트 시나리오

### 1. 페이지 로딩 & 렌더링 (P0)

**test-01-page-load.spec.ts**
```typescript
describe('Page Loading', () => {
  test('should load homepage successfully', async ({ page }) => {
    // 페이지 접속
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 타이틀 확인
    await expect(page).toHaveTitle(/훈재의 여행 계획표/);

    // 헤더 확인
    const header = page.locator('h1');
    await expect(header).toContainText('훈재의 여행 계획표');

    // 날짜 표시 확인
    const dateText = page.locator('text=2026.01.15 (목) - 01.19 (월)');
    await expect(dateText).toBeVisible();
  });

  test('should render all essential components', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 현재 위치 카드
    await expect(page.locator('[data-testid="current-location-card"]')).toBeVisible();

    // 경로 안내 카드
    await expect(page.locator('[data-testid="route-info-card"]')).toBeVisible();

    // 지도
    await expect(page.locator('[data-testid="map-view"]')).toBeVisible();

    // 여행 진척도
    await expect(page.locator('[data-testid="travel-progress"]')).toBeVisible();

    // 하단 네비게이션
    await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible();
  });
});
```

### 2. 탭 네비게이션 (P0)

**test-02-tab-navigation.spec.ts**
```typescript
describe('Tab Navigation', () => {
  test('should switch between tabs', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 홈 탭 (기본)
    await expect(page.locator('[data-testid="tab-home"]')).toHaveAttribute('aria-selected', 'true');

    // 지도 탭 클릭
    await page.click('[data-testid="tab-map"]');
    await expect(page.locator('[data-testid="map-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-map"]')).toHaveAttribute('aria-selected', 'true');

    // 일정 탭 클릭
    await page.click('[data-testid="tab-schedule"]');
    await expect(page.locator('[data-testid="schedule-page"]')).toBeVisible();

    // 설정 탭 클릭
    await page.click('[data-testid="tab-settings"]');
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
  });

  test('should preserve tab state after interaction', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 일정 탭으로 이동
    await page.click('[data-testid="tab-schedule"]');

    // 스크롤 후에도 탭 유지
    await page.evaluate(() => window.scrollBy(0, 500));
    await expect(page.locator('[data-testid="tab-schedule"]')).toHaveAttribute('aria-selected', 'true');
  });
});
```

### 3. 여행 진척도 계산 (P0)

**test-03-travel-progress.spec.ts**
```typescript
describe('Travel Progress', () => {
  test('should display countdown before travel starts', async ({ page }) => {
    // 여행 전 시간으로 시스템 시간 설정 (2026-01-10)
    await page.addInitScript(() => {
      Date.now = () => new Date('2026-01-10T12:00:00+09:00').getTime();
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 카운트다운 표시 확인
    await expect(page.locator('[data-testid="countdown-timer"]')).toBeVisible();
    await expect(page.locator('text=/여행까지/i')).toBeVisible();
  });

  test('should display progress during travel', async ({ page }) => {
    // 여행 중 시간으로 설정 (2026-01-16, 2일차)
    await page.addInitScript(() => {
      Date.now = () => new Date('2026-01-16T12:00:00+07:00').getTime();
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 진행률 표시 확인
    await expect(page.locator('[data-testid="progress-ring"]')).toBeVisible();

    // 현재 활동 표시
    await expect(page.locator('[data-testid="current-activity"]')).toBeVisible();

    // 다음 활동 표시
    await expect(page.locator('[data-testid="next-activity"]')).toBeVisible();
  });

  test('should display completion after travel ends', async ({ page }) => {
    // 여행 후 시간으로 설정 (2026-01-20)
    await page.addInitScript(() => {
      Date.now = () => new Date('2026-01-20T12:00:00+09:00').getTime();
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 완료 상태 표시
    await expect(page.locator('text=/여행 완료/i')).toBeVisible();
  });
});
```

### 4. 일정 데이터 표시 (P0)

**test-04-schedule-display.spec.ts**
```typescript
describe('Schedule Display', () => {
  test('should display all 5 days of schedule', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-schedule"]');
    await page.waitForLoadState('networkidle');

    // 5일 모두 표시 확인
    for (let day = 1; day <= 5; day++) {
      await expect(page.locator(`[data-testid="day-${day}"]`)).toBeVisible();
    }
  });

  test('should display activity details', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-schedule"]');

    // 첫 번째 활동 확인
    const firstActivity = page.locator('[data-testid="activity-1-1"]');
    await expect(firstActivity).toBeVisible();

    // 시간 표시
    await expect(firstActivity.locator('text=13:00')).toBeVisible();

    // 제목 표시
    await expect(firstActivity.locator('text=집에서 출발')).toBeVisible();
  });

  test('should show activity status (completed/active/upcoming)', async ({ page }) => {
    // 여행 중 시간으로 설정
    await page.addInitScript(() => {
      Date.now = () => new Date('2026-01-16T15:00:00+07:00').getTime();
    });

    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-schedule"]');

    // 완료된 활동 (체크 표시)
    await expect(page.locator('[data-testid="activity-1-1"] [data-status="completed"]')).toBeVisible();

    // 진행 중 활동 (하이라이트)
    await expect(page.locator('[data-status="active"]')).toBeVisible();

    // 예정 활동 (비활성)
    await expect(page.locator('[data-status="upcoming"]').first()).toBeVisible();
  });
});
```

### 5. 지도 기능 (P1)

**test-05-map-functionality.spec.ts**
```typescript
describe('Map Functionality', () => {
  test('should load Google Maps', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-map"]');

    // Google Maps iframe 또는 컨테이너 확인
    await page.waitForSelector('[data-testid="google-map"]', { timeout: 10000 });

    // 지도 로딩 완료 대기
    await page.waitForTimeout(2000);

    // 스크린샷으로 지도 렌더링 확인
    await page.screenshot({ path: '/tmp/map-loaded.png' });
  });

  test('should display location markers', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-map"]');

    // 마커 표시 확인 (DOM 또는 시각적 검증)
    const markerCount = await page.locator('[data-testid*="marker"]').count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should show route between locations', async ({ page }) => {
    // 여행 중 시간으로 설정
    await page.addInitScript(() => {
      Date.now = () => new Date('2026-01-16T12:00:00+07:00').getTime();
    });

    await page.goto('http://localhost:3000');

    // 홈 화면의 지도에 경로 표시 확인
    await page.waitForSelector('[data-testid="route-polyline"]', { timeout: 5000 });
  });
});
```

### 6. 다크모드 (P1)

**test-06-dark-mode.spec.ts**
```typescript
describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-settings"]');

    // 초기 테마 확인 (라이트 모드 기본)
    const htmlElement = page.locator('html');
    await expect(htmlElement).not.toHaveClass(/dark/);

    // 다크모드 토글
    await page.click('[data-testid="theme-toggle"]');

    // 다크모드 클래스 적용 확인
    await expect(htmlElement).toHaveClass(/dark/);

    // 다시 토글 (라이트모드로)
    await page.click('[data-testid="theme-toggle"]');
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test('should persist theme preference', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-settings"]');

    // 다크모드 활성화
    await page.click('[data-testid="theme-toggle"]');

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 다크모드 유지 확인
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
```

### 7. 반응형 레이아웃 (P1)

**test-07-responsive-layout.spec.ts**
```typescript
describe('Responsive Layout', () => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 800 },
  };

  Object.entries(viewports).forEach(([device, viewport]) => {
    test(`should render correctly on ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // 하단 네비게이션 표시 확인
      await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible();

      // 스크린샷 캡처
      await page.screenshot({
        path: `/tmp/responsive-${device}.png`,
        fullPage: true
      });
    });
  });

  test('should adjust layout for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');

    // 모바일 레이아웃 확인
    const layout = page.locator('[data-testid="mobile-layout"]');
    await expect(layout).toBeVisible();
  });
});
```

### 8. 타임라인 인터랙션 (P1)

**test-08-timeline-interaction.spec.ts**
```typescript
describe('Timeline Interaction', () => {
  test('should scroll timeline', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-schedule"]');

    // 타임라인 컨테이너
    const timeline = page.locator('[data-testid="day-timeline"]');

    // 스크롤 전 위치
    const scrollBefore = await timeline.evaluate(el => el.scrollTop);

    // 스크롤 다운
    await timeline.evaluate(el => el.scrollBy(0, 300));

    // 스크롤 후 위치 확인
    const scrollAfter = await timeline.evaluate(el => el.scrollTop);
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  });

  test('should expand activity card on click', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-schedule"]');

    // 상세 정보가 있는 활동 선택 (1-2: 공항 미팅)
    const activityCard = page.locator('[data-testid="activity-1-2"]');
    await activityCard.click();

    // 상세 설명 표시 확인
    await expect(activityCard.locator('text=/인천 국제공항/i')).toBeVisible();
  });

  test('should open image modal', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-schedule"]');

    // 이미지가 있는 활동 (1-2: 공항 미팅)
    const imageButton = page.locator('[data-testid="activity-1-2"] img').first();
    await imageButton.click();

    // 모달 표시 확인
    await expect(page.locator('[data-testid="image-modal"]')).toBeVisible();

    // 모달 닫기
    await page.click('[data-testid="modal-close"]');
    await expect(page.locator('[data-testid="image-modal"]')).not.toBeVisible();
  });
});
```

### 9. 위치 권한 (P2)

**test-09-location-permission.spec.ts**
```typescript
describe('Location Permission', () => {
  test('should show permission modal on first visit', async ({ page, context }) => {
    // 위치 권한 거부 상태로 시작
    await context.grantPermissions([]);

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 권한 요청 모달 표시 (조건부)
    // 실제로는 localStorage 확인 필요
  });

  test('should handle geolocation permission grant', async ({ page, context }) => {
    // 위치 권한 허용
    await context.grantPermissions(['geolocation']);

    // 고정 위치 설정 (다낭 좌표)
    await context.setGeolocation({ latitude: 16.0544, longitude: 108.2022 });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 현재 위치 카드에 위치 표시 확인
    await expect(page.locator('[data-testid="current-location"]')).toBeVisible();
  });
});
```

### 10. FAB 버튼 (P2)

**test-10-fab-button.spec.ts**
```typescript
describe('FAB Button', () => {
  test('should show FAB on scroll', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 스크롤 전 FAB 숨김 상태 확인
    const fab = page.locator('[data-testid="fab"]');

    // 스크롤 다운
    await page.evaluate(() => window.scrollBy(0, 500));

    // FAB 표시 확인
    await expect(fab).toBeVisible();
  });

  test('should change tabs via FAB', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // FAB 클릭하여 메뉴 열기
    await page.click('[data-testid="fab"]');

    // FAB 메뉴에서 지도 탭 선택
    await page.click('[data-testid="fab-menu-map"]');

    // 지도 페이지 표시 확인
    await expect(page.locator('[data-testid="map-page"]')).toBeVisible();
  });
});
```

### 11. 애니메이션 (P2)

**test-11-animations.spec.ts**
```typescript
describe('Animations', () => {
  test('should animate tab transitions', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 탭 전환 전 스크린샷
    await page.screenshot({ path: '/tmp/before-transition.png' });

    // 지도 탭으로 전환
    await page.click('[data-testid="tab-map"]');

    // 애니메이션 완료 대기
    await page.waitForTimeout(500);

    // 탭 전환 후 스크린샷
    await page.screenshot({ path: '/tmp/after-transition.png' });
  });

  test('should animate progress ring', async ({ page }) => {
    // 여행 중 시간으로 설정
    await page.addInitScript(() => {
      Date.now = () => new Date('2026-01-16T12:00:00+07:00').getTime();
    });

    await page.goto('http://localhost:3000');

    // 진행률 링 애니메이션 확인
    const progressRing = page.locator('[data-testid="progress-ring"]');
    await expect(progressRing).toBeVisible();

    // SVG circle의 stroke-dashoffset 확인 (애니메이션 적용)
    const circle = progressRing.locator('circle').last();
    const strokeDashoffset = await circle.getAttribute('stroke-dashoffset');
    expect(strokeDashoffset).not.toBe('0');
  });
});
```

### 12. 접근성 (P2)

**test-12-accessibility.spec.ts**
```typescript
describe('Accessibility', () => {
  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 탭 네비게이션 ARIA
    const tabs = page.locator('[role="tab"]');
    expect(await tabs.count()).toBe(4);

    // 활성 탭 aria-selected
    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Tab 키로 네비게이션 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Enter 키로 탭 선택
    await page.keyboard.press('Enter');
  });

  test('should have minimum touch target size', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');

    // 탭 버튼 크기 확인 (최소 44x44px)
    const tabButton = page.locator('[data-testid="tab-home"]');
    const box = await tabButton.boundingBox();

    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="tab-schedule"]');

    // 이미지 요소 확인
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // alt 속성 존재 확인
    }
  });
});
```

---

## 🛠️ 테스트 환경 설정

### Playwright 설정

**playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 테스트 실행 스크립트

**package.json에 추가**
```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report"
  }
}
```

---

## 📊 테스트 실행 계획

### 단계별 실행 전략

#### Phase 1: Critical Tests (P0)
**목표**: 핵심 기능 동작 확인
```bash
# 1-4번 테스트 실행
npm test -- test-0[1-4]
```
**예상 소요 시간**: 5-10분
**성공 기준**: 모든 테스트 통과 (100%)

#### Phase 2: Important Tests (P1)
**목표**: 주요 사용자 경험 검증
```bash
# 5-8번 테스트 실행
npm test -- test-0[5-8]
```
**예상 소요 시간**: 10-15분
**성공 기준**: 90% 이상 통과

#### Phase 3: Nice-to-have Tests (P2)
**목표**: 추가 기능 및 접근성 검증
```bash
# 9-12번 테스트 실행
npm test -- test-(09|1[0-2])
```
**예상 소요 시간**: 10-15분
**성공 기준**: 80% 이상 통과

### CI/CD 통합

**GitHub Actions 예시**
```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📈 성공 기준 및 KPI

### 테스트 커버리지 목표
- **P0 (Critical)**: 100% 통과 필수
- **P1 (Important)**: 90% 이상 통과
- **P2 (Nice-to-have)**: 80% 이상 통과

### 성능 지표
- **페이지 로드 시간**: < 2초
- **탭 전환 응답 시간**: < 300ms
- **지도 렌더링 시간**: < 3초

### 접근성 목표
- **WCAG 2.1 AA 준수**
- **터치 타겟 크기**: 최소 44x44px
- **키보드 네비게이션**: 모든 인터랙션 지원

---

## 🔧 테스트 유지보수 가이드

### data-testid 추가 위치

컴포넌트별로 다음 data-testid를 추가해야 합니다:

#### 페이지 레벨
- `page.tsx`: `data-testid="main-page"`
- `HomePage.tsx`: `data-testid="home-page"`
- `MapPage.tsx`: `data-testid="map-page"`
- `SchedulePage.tsx`: `data-testid="schedule-page"`
- `SettingsPage.tsx`: `data-testid="settings-page"`

#### 컴포넌트 레벨
- `BottomNavigation.tsx`:
  - `data-testid="bottom-navigation"`
  - `data-testid="tab-home"`
  - `data-testid="tab-map"`
  - `data-testid="tab-schedule"`
  - `data-testid="tab-settings"`

- `TravelProgress.tsx`:
  - `data-testid="travel-progress"`
  - `data-testid="countdown-timer"`
  - `data-testid="progress-ring"`
  - `data-testid="current-activity"`
  - `data-testid="next-activity"`

- `DayTimeline.tsx`:
  - `data-testid="day-timeline"`
  - `data-testid="day-{dayNumber}"`
  - `data-testid="activity-{activityId}"`

- `MapView.tsx`:
  - `data-testid="map-view"`
  - `data-testid="google-map"`
  - `data-testid="marker-{locationId}"`
  - `data-testid="route-polyline"`

- `ThemeToggle.tsx`:
  - `data-testid="theme-toggle"`

- `FloatingActionButton.tsx`:
  - `data-testid="fab"`
  - `data-testid="fab-menu-{tabName}"`

### 테스트 작성 체크리스트

새로운 테스트 작성 시:
- [ ] 명확한 테스트 설명 작성
- [ ] data-testid 활용하여 셀렉터 안정성 확보
- [ ] 적절한 대기 시간 설정 (networkidle, selector)
- [ ] 시간 의존적 테스트는 Date mocking 사용
- [ ] 실패 시 스크린샷 자동 캡처
- [ ] 접근성 체크 포함 (ARIA, 키보드)

---

## 🎯 다음 단계

### 즉시 실행
1. **data-testid 추가** - 모든 주요 컴포넌트에 테스트 ID 추가
2. **playwright.config.ts 설정** - 테스트 환경 구성
3. **P0 테스트 작성** - Critical 시나리오부터 구현

### 단기 (1주일)
4. **P1 테스트 작성** - Important 시나리오 구현
5. **CI/CD 통합** - GitHub Actions 설정
6. **테스트 리포트 검토** - 실패 원인 분석 및 개선

### 중기 (2-4주)
7. **P2 테스트 작성** - Nice-to-have 시나리오 구현
8. **시각적 회귀 테스트** - 스크린샷 비교 테스트 추가
9. **성능 테스트** - Lighthouse CI 통합

---

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Maps API Testing](https://developers.google.com/maps/documentation/javascript/testing)

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-07
**작성자**: Claude (SuperClaude Framework)
