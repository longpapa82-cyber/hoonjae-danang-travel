import { test, expect } from '@playwright/test';

/**
 * P0 - Critical: 페이지 로딩 & 렌더링 테스트
 *
 * 목적: 페이지가 정상적으로 로드되고 필수 요소들이 렌더링되는지 확인
 */

test.describe('페이지 로딩 & 렌더링', () => {

  test('홈페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 배포된 사이트로 접속
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/다낭 여행|훈재의 여행/);

    // 스크린샷 저장 (실패 시 디버깅용)
    await page.screenshot({ path: '/tmp/playwright-homepage.png' });
  });

  test('헤더가 올바르게 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // H1 헤더 확인
    const header = page.locator('h1');
    await expect(header).toContainText('훈재의 여행 계획표');

    // 날짜 표시 확인 (형식: 2026.01.15 (목) - 01.19 (월))
    await expect(page.locator('p:has-text("2026.01.15")')).toBeVisible();
    await expect(page.locator('text=/01.*19.*월/i').first()).toBeVisible();
  });

  test('모든 필수 컴포넌트가 렌더링되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 하단 네비게이션 확인
    const bottomNav = page.locator('[role="tablist"]');
    await expect(bottomNav).toBeVisible();

    // 4개 탭 버튼 확인
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(4);

    // 각 탭 레이블 확인
    await expect(page.locator('[role="tab"][aria-label*="홈"]')).toBeVisible();
    await expect(page.locator('[role="tab"][aria-label*="지도"]')).toBeVisible();
    await expect(page.locator('[role="tab"][aria-label*="일정"]')).toBeVisible();
    await expect(page.locator('[role="tab"][aria-label*="설정"]')).toBeVisible();
  });

  test('Google Maps가 로드되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Google Maps iframe 또는 지도 컨테이너 확인
    // Google Maps는 다양한 방식으로 렌더링될 수 있으므로 여러 셀렉터 시도
    const mapLoaded = await page.locator('iframe[src*="google.com/maps"], [aria-label*="Map"], canvas').count() > 0;
    expect(mapLoaded).toBeTruthy();
  });

  test('모바일 뷰포트에서 올바르게 렌더링되어야 함', async ({ page }) => {
    // 모바일 뷰포트 설정 (iPhone 12 크기)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 헤더 확인
    await expect(page.locator('h1')).toBeVisible();

    // 하단 네비게이션 확인
    await expect(page.locator('[role="tablist"]')).toBeVisible();

    // 모바일 스크린샷
    await page.screenshot({
      path: '/tmp/playwright-mobile.png',
      fullPage: true
    });
  });

  test('페이지 로딩 성능이 기준을 충족해야 함', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 로딩 시간이 5초 이내여야 함 (네트워크 상황 고려)
    expect(loadTime).toBeLessThan(5000);

    console.log(`페이지 로딩 시간: ${loadTime}ms`);
  });
});
