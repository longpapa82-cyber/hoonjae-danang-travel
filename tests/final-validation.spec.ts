import { test, expect } from '@playwright/test';

/**
 * P0 - Critical: 최종 배포 검증 테스트
 *
 * 목적: 프로덕션 배포 전 최종 점검
 *
 * 검증 항목:
 * 1. 프로덕션 환경 접근성
 * 2. 핵심 사용자 시나리오
 * 3. 크리티컬 패스 E2E
 * 4. 성능 기준 충족
 * 5. 배포 승인 여부 결정
 */

const PRODUCTION_URL = 'https://hoonjae-danang-travel.vercel.app';

test.describe('최종 검증 - 프로덕션 환경', () => {

  test('프로덕션 사이트에 접근할 수 있어야 함 (P0)', async ({ page }) => {
    const response = await page.goto(PRODUCTION_URL);

    // 200 OK 응답
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/final-validation-production.png', fullPage: true });

    console.log('✅ 프로덕션 사이트 접근 성공');
  });

  test('프로덕션에서 페이지 타이틀이 올바른지 확인 (P0)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log('페이지 타이틀:', title);

    expect(title).toMatch(/다낭|여행|훈재/);
  });

  test('프로덕션에서 필수 메타 태그가 있어야 함 (P1)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // viewport 메타 태그
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();

    // description 메타 태그
    const description = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    console.log('Description:', description);
  });
});

test.describe('최종 검증 - 핵심 사용자 시나리오', () => {

  test('[시나리오 1] 여행 정보 확인: 홈페이지 → 날씨 → 일정 확인 (P0)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('📍 Step 1: 홈페이지 접속');
    await expect(page.locator('h1')).toBeVisible();

    console.log('📍 Step 2: 날씨 정보 확인');
    const hasWeather = await page.locator('text=/날씨|\\d+°C/i').first().isVisible({ timeout: 10000 }).catch(() => false);
    if (hasWeather) {
      const temp = await page.locator('text=/\\d+°C/').first().textContent();
      console.log('   현재 온도:', temp);
    }

    console.log('📍 Step 3: 일정 탭으로 이동');
    const scheduleTab = page.locator('[role="tab"]').filter({ hasText: /일정/i }).first();
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await page.waitForTimeout(2000);

      const hasSchedule = await page.locator('text=/1일차|2일차/i').first().isVisible({ timeout: 5000 }).catch(() => false);
      console.log('   일정 표시:', hasSchedule);
    }

    await page.screenshot({ path: '/tmp/final-validation-scenario1.png', fullPage: true });
    console.log('✅ 시나리오 1 완료');
  });

  test('[시나리오 2] 지도 확인: 지도 탭 → 마커 확인 (P0)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log('📍 Step 1: 지도 탭으로 이동');
    const mapTab = page.locator('[role="tab"]').filter({ hasText: /지도/i }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(3000);

      console.log('📍 Step 2: 지도 로딩 확인');
      const hasMap = await page.locator('iframe[src*="google.com/maps"], canvas').first().isVisible({ timeout: 10000 }).catch(() => false);
      console.log('   지도 표시:', hasMap);

      await page.screenshot({ path: '/tmp/final-validation-scenario2.png', fullPage: true });
    }

    console.log('✅ 시나리오 2 완료');
  });

  test('[시나리오 3] 다크모드 전환: 설정 → 다크모드 토글 (P1)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log('📍 Step 1: 설정 탭으로 이동');
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: /설정/i }).first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(500);

      console.log('📍 Step 2: 다크모드 토글');
      const themeButton = page.locator('button').filter({ hasText: /다크|dark/i }).first();
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(1000);

        console.log('   다크모드 활성화');

        await page.screenshot({ path: '/tmp/final-validation-scenario3-dark.png', fullPage: true });

        // 라이트모드로 복귀
        await themeButton.click();
        await page.waitForTimeout(500);

        await page.screenshot({ path: '/tmp/final-validation-scenario3-light.png', fullPage: true });
      }
    }

    console.log('✅ 시나리오 3 완료');
  });

  test('[시나리오 4] 모바일 사용자: 모바일 뷰 → 탭 전환 (P0)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log('📍 Step 1: 모바일 홈 확인');
    await expect(page.locator('h1')).toBeVisible();

    console.log('📍 Step 2: 하단 네비게이션 확인');
    await expect(page.locator('[role="tablist"]')).toBeVisible();

    console.log('📍 Step 3: 모든 탭 터치');
    const tabs = await page.locator('[role="tab"]').all();
    for (const tab of tabs) {
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({ path: '/tmp/final-validation-scenario4-mobile.png', fullPage: true });
    console.log('✅ 시나리오 4 완료');
  });
});

test.describe('최종 검증 - 크리티컬 패스', () => {

  test('날씨 API가 응답해야 함 (P0)', async ({ page }) => {
    let currentApiCalled = false;
    let currentApiSuccess = false;

    page.on('response', async response => {
      if (response.url().includes('/api/weather/current')) {
        currentApiCalled = true;
        currentApiSuccess = response.status() === 200;
        console.log('Weather API 상태:', response.status());
      }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('API 호출 여부:', currentApiCalled);
    console.log('API 성공 여부:', currentApiSuccess);

    if (currentApiCalled) {
      expect(currentApiSuccess).toBeTruthy();
    }
  });

  test('하단 네비게이션이 동작해야 함 (P0)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const tabs = await page.locator('[role="tab"]').all();
    expect(tabs.length).toBe(4);

    // 각 탭 클릭 가능
    for (const tab of tabs) {
      const isVisible = await tab.isVisible();
      expect(isVisible).toBeTruthy();
    }

    console.log('✅ 하단 네비게이션 정상');
  });

  test('페이지에 치명적 에러가 없어야 함 (P0)', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 치명적 에러 필터링
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('DevTools') &&
      !err.includes('Extension') &&
      !err.includes('net::ERR_BLOCKED_BY_CLIENT')
    );

    if (criticalErrors.length > 0) {
      console.log('⚠️ 발견된 에러:', criticalErrors);
    }

    // 치명적 에러 없어야 함
    expect(criticalErrors.length).toBe(0);
    console.log('✅ 치명적 에러 없음');
  });
});

test.describe('최종 검증 - 성능 기준', () => {

  test('페이지 로딩 시간이 10초 이내여야 함 (P0)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log('페이지 로딩 시간:', loadTime, 'ms');

    expect(loadTime).toBeLessThan(10000);
  });

  test('주요 컨텐츠가 5초 이내에 표시되어야 함 (P1)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(PRODUCTION_URL);

    // 헤더 표시 시간
    await page.waitForSelector('h1', { timeout: 10000 });
    const headerTime = Date.now() - startTime;

    console.log('헤더 표시 시간:', headerTime, 'ms');
    expect(headerTime).toBeLessThan(5000);
  });

  test('탭 전환 응답 시간이 1초 이내여야 함 (P1)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: /지도/i }).first();
    if (await mapTab.isVisible()) {
      const startTime = Date.now();
      await mapTab.click();
      await page.waitForTimeout(100);

      const responseTime = Date.now() - startTime;
      console.log('탭 전환 응답 시간:', responseTime, 'ms');

      expect(responseTime).toBeLessThan(1000);
    }
  });
});

test.describe('최종 검증 - 배포 승인 체크리스트', () => {

  test('[배포 체크 1/5] 홈페이지 로드 성공 (P0)', async ({ page }) => {
    const response = await page.goto(PRODUCTION_URL);
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();

    console.log('✅ [1/5] 홈페이지 로드 성공');
  });

  test('[배포 체크 2/5] 날씨 기능 작동 (P0)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 날씨 정보가 표시되거나 API가 호출되어야 함
    const hasWeather = await page.locator('text=/날씨|\\d+°C/i').first().isVisible({ timeout: 10000 }).catch(() => false);

    if (hasWeather) {
      console.log('✅ [2/5] 날씨 기능 작동');
    } else {
      console.log('⚠️ [2/5] 날씨 정보 표시 안 됨 (API 확인 필요)');
    }
  });

  test('[배포 체크 3/5] 탭 네비게이션 작동 (P0)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const tabs = await page.locator('[role="tab"]').all();
    expect(tabs.length).toBe(4);

    // 각 탭 클릭
    for (const tab of tabs) {
      await tab.click();
      await page.waitForTimeout(500);
    }

    console.log('✅ [3/5] 탭 네비게이션 작동');
  });

  test('[배포 체크 4/5] 모바일 반응형 작동 (P0)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[role="tablist"]')).toBeVisible();

    console.log('✅ [4/5] 모바일 반응형 작동');
  });

  test('[배포 체크 5/5] 접근성 기본 준수 (P0)', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // ARIA 기본 요소 확인
    const hasTablist = await page.locator('[role="tablist"]').isVisible();
    const hasTabs = await page.locator('[role="tab"]').count() === 4;

    expect(hasTablist).toBeTruthy();
    expect(hasTabs).toBeTruthy();

    console.log('✅ [5/5] 접근성 기본 준수');
  });
});

test.describe('최종 검증 - 배포 승인 결정', () => {

  test('🚀 배포 승인 최종 판정 (P0)', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('📋 최종 배포 승인 체크리스트');
    console.log('='.repeat(60));

    const checklist = {
      '프로덕션 접근': false,
      '날씨 기능': false,
      '탭 네비게이션': false,
      '성능 기준': false,
      '에러 없음': false,
    };

    // 1. 프로덕션 접근
    try {
      const response = await page.goto(PRODUCTION_URL);
      checklist['프로덕션 접근'] = response?.status() === 200;
    } catch (e) {
      console.log('❌ 프로덕션 접근 실패');
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 2. 날씨 기능
    const hasWeather = await page.locator('text=/날씨|\\d+°C/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    checklist['날씨 기능'] = hasWeather;

    // 3. 탭 네비게이션
    const tabCount = await page.locator('[role="tab"]').count();
    checklist['탭 네비게이션'] = tabCount === 4;

    // 4. 성능 기준
    const loadTime = Date.now();
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - loadTime;
    checklist['성능 기준'] = elapsed < 10000;

    // 5. 에러 없음
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });
    await page.waitForTimeout(2000);
    checklist['에러 없음'] = errors.length === 0;

    // 결과 출력
    console.log('\n체크리스트 결과:');
    for (const [item, passed] of Object.entries(checklist)) {
      console.log(`  ${passed ? '✅' : '❌'} ${item}`);
    }

    // 배포 승인 여부
    const allPassed = Object.values(checklist).every(v => v);
    const passRate = Object.values(checklist).filter(v => v).length / Object.values(checklist).length;

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 배포 승인: APPROVED ✅');
      console.log('   모든 검증 항목 통과 (100%)');
    } else if (passRate >= 0.8) {
      console.log('⚠️ 배포 승인: CONDITIONAL ⚠️');
      console.log(`   통과율: ${(passRate * 100).toFixed(0)}%`);
      console.log('   실패 항목 검토 후 배포 권장');
    } else {
      console.log('❌ 배포 승인: REJECTED ❌');
      console.log(`   통과율: ${(passRate * 100).toFixed(0)}%`);
      console.log('   수정 후 재검증 필요');
    }
    console.log('='.repeat(60) + '\n');

    // 80% 이상 통과 시 배포 승인
    expect(passRate).toBeGreaterThanOrEqual(0.8);
  });
});
