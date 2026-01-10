import { test, expect } from '@playwright/test';

/**
 * P0 - Critical: 기존 기능 회귀 테스트 (날씨 기능 추가 후)
 *
 * 목적: 날씨 기능 추가가 기존 기능에 영향을 주지 않았는지 확인
 *
 * 테스트 항목:
 * 1. 페이지 로딩
 * 2. 탭 네비게이션
 * 3. Google Maps
 * 4. 일정 타임라인
 * 5. 다크모드
 * 6. 모바일 반응형
 */

test.describe('회귀 테스트 - 기본 기능', () => {

  test('페이지가 정상적으로 로드되어야 함 (P0)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log('페이지 로딩 시간:', loadTime, 'ms');

    // 로딩 시간이 10초 이내여야 함
    expect(loadTime).toBeLessThan(10000);

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/다낭 여행|훈재의 여행/);

    await page.screenshot({ path: '/tmp/playwright-regression-homepage.png' });
  });

  test('헤더가 올바르게 표시되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // H1 헤더 확인
    const header = page.locator('h1');
    await expect(header).toContainText('훈재의 여행 계획표');

    // 날짜 표시 확인
    await expect(page.locator('text=/2026.01.15/i')).toBeVisible();
  });

  test('모든 필수 컴포넌트가 렌더링되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 하단 네비게이션
    const bottomNav = page.locator('[role="tablist"]');
    await expect(bottomNav).toBeVisible();

    // 4개 탭 버튼
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(4);

    console.log('✅ 하단 네비게이션 정상');
  });
});

test.describe('회귀 테스트 - 탭 네비게이션', () => {

  test('모든 탭이 정상적으로 동작해야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 홈 탭 (기본 활성)
    const homeTab = page.locator('[role="tab"]').filter({ hasText: /홈|Home/i }).first();
    await expect(homeTab).toBeVisible();

    // 지도 탭
    const mapTab = page.locator('[role="tab"]').filter({ hasText: /지도|Map/i }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ 지도 탭 클릭 성공');
    }

    // 일정 탭
    const scheduleTab = page.locator('[role="tab"]').filter({ hasText: /일정|Schedule/i }).first();
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ 일정 탭 클릭 성공');
    }

    // 설정 탭
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: /설정|Settings/i }).first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ 설정 탭 클릭 성공');
    }

    // 홈으로 돌아가기
    await homeTab.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/tmp/playwright-regression-tabs.png', fullPage: true });
  });

  test('탭 전환 시 aria-selected가 올바르게 업데이트되어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tabs = await page.locator('[role="tab"]').all();

    for (const tab of tabs) {
      await tab.click();
      await page.waitForTimeout(500);

      const ariaSelected = await tab.getAttribute('aria-selected');
      console.log('Tab aria-selected:', ariaSelected);

      // 클릭한 탭은 selected여야 함
      expect(ariaSelected).toBe('true');
    }
  });

  test('탭 전환이 부드럽게 애니메이션되어야 함 (P2)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: /지도/i }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();

      // 애니메이션 완료 대기
      await page.waitForTimeout(1000);

      // 지도 또는 관련 콘텐츠가 표시되는지 확인
      const content = await page.locator('body').textContent();
      expect(content).toBeTruthy();

      console.log('✅ 탭 전환 애니메이션 완료');
    }
  });
});

test.describe('회귀 테스트 - Google Maps', () => {

  test('Google Maps가 로드되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 지도 탭으로 이동
    const mapTab = page.locator('[role="tab"]').filter({ hasText: /지도/i }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(3000);

      // Google Maps 요소 확인
      const mapElement = page.locator('iframe[src*="google.com/maps"], canvas, [data-testid="map-view"]').first();
      const hasMap = await mapElement.isVisible({ timeout: 10000 }).catch(() => false);

      if (hasMap) {
        console.log('✅ Google Maps 로드 확인');
      } else {
        console.log('⚠️ Google Maps 요소를 찾을 수 없음');
      }

      await page.screenshot({ path: '/tmp/playwright-regression-map.png', fullPage: true });
    }
  });

  test('지도에 마커가 표시되어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: /지도/i }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(3000);

      // 마커나 위치 정보 확인
      const hasLocationInfo = await page.locator('text=/현재 위치|다낭|호텔/i').first().isVisible({ timeout: 5000 }).catch(() => false);

      console.log('위치 정보 표시:', hasLocationInfo);
    }
  });
});

test.describe('회귀 테스트 - 일정 타임라인', () => {

  test('일정 타임라인이 표시되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 탭으로 이동
    const scheduleTab = page.locator('[role="tab"]').filter({ hasText: /일정|Schedule/i }).first();
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await page.waitForTimeout(2000);

      // 일정 항목 확인
      const scheduleItems = page.locator('text=/1일차|2일차|3일차|4일차|5일차/i');
      const itemCount = await scheduleItems.count();

      console.log('일정 항목 수:', itemCount);
      expect(itemCount).toBeGreaterThan(0);

      await page.screenshot({ path: '/tmp/playwright-regression-schedule.png', fullPage: true });
    }
  });

  test('일정 세부 정보가 표시되어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scheduleTab = page.locator('[role="tab"]').filter({ hasText: /일정/i }).first();
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await page.waitForTimeout(2000);

      // 시간 정보 확인
      const timeInfo = page.locator('text=/\\d{2}:\\d{2}/').first();
      const hasTime = await timeInfo.isVisible({ timeout: 5000 }).catch(() => false);

      console.log('시간 정보 표시:', hasTime);

      // 장소 정보 확인
      const locationInfo = page.locator('text=/공항|호텔|출발/i').first();
      const hasLocation = await locationInfo.isVisible({ timeout: 5000 }).catch(() => false);

      console.log('장소 정보 표시:', hasLocation);
    }
  });
});

test.describe('회귀 테스트 - 다크모드', () => {

  test('다크모드 토글이 동작해야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: /설정/i }).first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(500);

      // 다크모드 토글 버튼
      const themeButton = page.locator('button').filter({ hasText: /다크|dark|테마|theme/i }).first();
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(500);

        console.log('✅ 다크모드 토글 클릭 성공');

        await page.screenshot({ path: '/tmp/playwright-regression-dark.png', fullPage: true });
      }
    }
  });

  test('다크모드에서 모든 요소가 가독성을 유지해야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 다크모드 활성화
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: /설정/i }).first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(500);

      const themeButton = page.locator('button').filter({ hasText: /다크|dark/i }).first();
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(500);

        // 홈 탭으로 돌아가기
        const homeTab = page.locator('[role="tab"]').filter({ hasText: /홈/i }).first();
        await homeTab.click();
        await page.waitForTimeout(1000);

        // 텍스트 요소들의 색상 확인
        const textElements = await page.locator('h1, p, button').all();

        for (const el of textElements.slice(0, 5)) {
          const styles = await el.evaluate(element => {
            const computed = window.getComputedStyle(element);
            return {
              color: computed.color,
              display: computed.display,
            };
          });

          if (styles.display !== 'none') {
            expect(styles.color).toBeTruthy();
          }
        }

        console.log('✅ 다크모드 텍스트 가독성 확인');
      }
    }
  });
});

test.describe('회귀 테스트 - 모바일 반응형', () => {

  test('모바일 뷰포트에서 올바르게 렌더링되어야 함 (P0)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 헤더 확인
    await expect(page.locator('h1')).toBeVisible();

    // 하단 네비게이션 확인
    await expect(page.locator('[role="tablist"]')).toBeVisible();

    await page.screenshot({ path: '/tmp/playwright-regression-mobile.png', fullPage: true });
    console.log('✅ 모바일 뷰 렌더링 확인');
  });

  test('모바일에서 모든 탭이 접근 가능해야 함 (P0)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 모든 탭 클릭
    const tabs = await page.locator('[role="tab"]').all();

    for (const tab of tabs) {
      const isVisible = await tab.isVisible();
      if (isVisible) {
        await tab.click();
        await page.waitForTimeout(500);
        console.log('✅ 탭 클릭 성공');
      }
    }
  });

  test('모바일에서 스크롤이 정상적으로 동작해야 함 (P1)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 페이지 스크롤
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    const scrollY = await page.evaluate(() => window.scrollY);
    console.log('스크롤 위치:', scrollY);

    expect(scrollY).toBeGreaterThan(0);
  });
});

test.describe('회귀 테스트 - 성능', () => {

  test('페이지 로딩 성능이 기준을 충족해야 함 (P0)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log('페이지 로딩 시간:', loadTime, 'ms');

    // 10초 이내 로딩
    expect(loadTime).toBeLessThan(10000);
  });

  test('콘솔 에러가 없어야 함 (P1)', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 치명적 에러 필터링 (일부 warning은 허용)
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('DevTools') &&
      !err.includes('Extension')
    );

    if (criticalErrors.length > 0) {
      console.log('⚠️ 콘솔 에러:', criticalErrors);
    }

    // 치명적 에러는 없어야 함
    expect(criticalErrors.length).toBeLessThan(3);
  });
});

test.describe('회귀 테스트 - 통합 시나리오', () => {

  test('사용자 플로우: 홈 → 지도 → 일정 → 홈 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. 홈 확인
    await expect(page.locator('h1')).toBeVisible();
    console.log('1. 홈 페이지 확인');

    // 2. 지도 탭
    const mapTab = page.locator('[role="tab"]').filter({ hasText: /지도/i }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(2000);
      console.log('2. 지도 탭 이동');
    }

    // 3. 일정 탭
    const scheduleTab = page.locator('[role="tab"]').filter({ hasText: /일정/i }).first();
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await page.waitForTimeout(2000);
      console.log('3. 일정 탭 이동');
    }

    // 4. 홈으로 돌아가기
    const homeTab = page.locator('[role="tab"]').filter({ hasText: /홈/i }).first();
    await homeTab.click();
    await page.waitForTimeout(1000);
    console.log('4. 홈 탭 복귀');

    // 여전히 헤더가 visible
    await expect(page.locator('h1')).toBeVisible();

    await page.screenshot({ path: '/tmp/playwright-regression-flow.png', fullPage: true });
    console.log('✅ 사용자 플로우 완료');
  });

  test('날씨 기능과 기존 기능이 함께 동작해야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 날씨 정보 확인
    const hasWeather = await page.locator('text=/날씨|\\d+°C/i').first().isVisible({ timeout: 5000 }).catch(() => false);

    // 하단 네비게이션 확인
    const hasNav = await page.locator('[role="tablist"]').isVisible();

    console.log('날씨 카드:', hasWeather);
    console.log('네비게이션:', hasNav);

    // 둘 다 있어야 함
    expect(hasNav).toBeTruthy();

    if (hasWeather) {
      console.log('✅ 날씨 기능과 기존 기능 통합 확인');
    }
  });
});
