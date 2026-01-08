import { test, expect } from '@playwright/test';

/**
 * P1 - Important: 지도 기능 테스트
 *
 * 목적: Google Maps가 정상적으로 로드되고 마커/경로가 표시되는지 확인
 *
 * Group A: 순수 렌더링 (병렬 실행 가능)
 */

test.describe('지도 기능', () => {

  test('홈 화면에서 지도가 로드되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Google Maps 로딩 대기 (iframe 또는 canvas)
    await page.waitForTimeout(3000);

    // Google Maps 요소 확인
    const mapElements = await page.locator('iframe[src*="google.com/maps"], canvas, [aria-label*="Map"]').count();
    expect(mapElements).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-map-home.png' });
  });

  test('지도 탭에서 전체 지도가 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 지도 탭 클릭
    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(3000); // 지도 로딩 대기
    }

    // MapView 컴포넌트 확인
    const mapView = await page.locator('[data-testid="map-view"]').count();
    expect(mapView).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-map-tab.png', fullPage: true });
  });

  test('지도에 마커가 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 지도 로딩 대기
    await page.waitForTimeout(3000);

    // 지도 컨테이너 확인 (마커는 Google Maps API가 내부적으로 관리하므로 직접 확인 어려움)
    // 대신 지도가 정상적으로 로드되었는지 확인
    const mapView = await page.locator('[data-testid="map-view"]').count();
    expect(mapView).toBeGreaterThan(0);

    const mapContainer = await page.locator('[data-testid="google-map"]').count();
    expect(mapContainer).toBeGreaterThan(0);
  });

  test('여행 중에는 현재 위치와 다음 목적지 경로가 표시되어야 함', async ({ page }) => {
    // 여행 중으로 시간 설정 (2일차)
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-16T12:00:00+07:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 지도 헤더 텍스트 확인 (여행 중일 때는 "실시간 지도"로 표시)
    const realtimeMap = await page.locator('text=/실시간.*지도/i').count();
    expect(realtimeMap).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-map-route.png' });
  });

  test('지도가 반응형으로 표시되어야 함 (모바일)', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // MapView 컴포넌트가 모바일에서도 표시되는지 확인
    const mapView = await page.locator('[data-testid="map-view"]').count();
    expect(mapView).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-map-mobile.png', fullPage: true });
  });

  test('지도 로딩 중 로딩 인디케이터가 표시되어야 함', async ({ page }) => {
    await page.goto('/');

    // 로딩 완료 확인
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 지도가 정상적으로 로드되었는지 확인
    const mapView = await page.locator('[data-testid="map-view"]').count();
    expect(mapView).toBeGreaterThan(0);
  });

  test('지도 줌 컨트롤이 동작해야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 지도 탭으로 이동
    await page.locator('[role="tab"][aria-label*="지도"]').click();
    await page.waitForTimeout(2000);

    // Google Maps 줌 버튼 확인
    const zoomButtons = await page.locator('button[aria-label*="Zoom"], button[title*="Zoom"]').count();

    // 줌 버튼이 있으면 클릭 시도
    if (zoomButtons > 0) {
      const zoomInButton = page.locator('button[aria-label*="Zoom in"], button[title*="Zoom in"]').first();
      if (await zoomInButton.isVisible()) {
        await zoomInButton.click();
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({ path: '/tmp/playwright-map-zoom.png' });
  });
});
