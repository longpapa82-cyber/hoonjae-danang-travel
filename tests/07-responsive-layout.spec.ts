import { test, expect } from '@playwright/test';

/**
 * P1 - Important: 반응형 레이아웃 테스트
 *
 * 목적: 다양한 화면 크기에서 레이아웃이 올바르게 표시되는지 확인
 *
 * Group A: 순수 렌더링 (병렬 실행 가능)
 */

test.describe('반응형 레이아웃', () => {

  const viewports = {
    mobile_small: { width: 375, height: 667, name: 'iPhone SE' },
    mobile_medium: { width: 390, height: 844, name: 'iPhone 12' },
    mobile_large: { width: 430, height: 932, name: 'iPhone 14 Pro Max' },
    tablet: { width: 768, height: 1024, name: 'iPad' },
    desktop_small: { width: 1280, height: 720, name: 'Desktop Small' },
    desktop_large: { width: 1920, height: 1080, name: 'Desktop Large' },
  };

  Object.entries(viewports).forEach(([key, viewport]) => {
    test(`${viewport.name} (${viewport.width}x${viewport.height})에서 올바르게 렌더링되어야 함`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 헤더 표시 확인
      await expect(page.locator('h1')).toBeVisible();

      // 하단 네비게이션 표시 확인
      await expect(page.locator('[role="tablist"]')).toBeVisible();

      // 4개 탭 모두 표시 확인
      const tabs = await page.locator('[role="tab"]').count();
      expect(tabs).toBe(4);

      // 스크린샷 저장
      await page.screenshot({
        path: `/tmp/playwright-responsive-${key}.png`,
        fullPage: true
      });
    });
  });

  test('모바일에서 터치 타겟 크기가 충분해야 함 (44x44px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 탭 버튼들의 크기 확인
    const tabs = await page.locator('[role="tab"]').all();

    for (const tab of tabs) {
      const box = await tab.boundingBox();

      if (box) {
        // WCAG 2.5.5: 최소 터치 타겟 크기 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('모바일에서 가로 스크롤이 발생하지 않아야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // body의 스크롤 너비 확인
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    // 가로 스크롤이 없어야 함
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 1px 허용 오차
  });

  test('태블릿에서 레이아웃이 올바르게 조정되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 헤더와 컨텐츠 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[role="tablist"]')).toBeVisible();

    // 스크린샷
    await page.screenshot({
      path: '/tmp/playwright-tablet-layout.png',
      fullPage: true
    });
  });

  test('데스크톱에서 최대 너비가 제한되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 컨테이너의 최대 너비 확인
    const mainContainer = page.locator('.max-w-7xl, .container, main').first();

    if (await mainContainer.isVisible()) {
      const box = await mainContainer.boundingBox();

      if (box) {
        // 최대 너비가 화면 전체를 차지하지 않아야 함
        expect(box.width).toBeLessThan(1920);
      }
    }

    await page.screenshot({ path: '/tmp/playwright-desktop-layout.png' });
  });

  test('가로/세로 모드 전환이 동작해야 함', async ({ page }) => {
    // 세로 모드
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: '/tmp/playwright-portrait.png', fullPage: true });

    // 가로 모드
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[role="tablist"]')).toBeVisible();

    await page.screenshot({ path: '/tmp/playwright-landscape.png', fullPage: true });
  });

  test('텍스트가 작은 화면에서 잘리지 않아야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 헤더 텍스트 확인
    const header = page.locator('h1');
    const headerText = await header.textContent();

    expect(headerText).toBeTruthy();
    expect(headerText?.length).toBeGreaterThan(0);

    // 텍스트가 overflow되지 않는지 확인
    const overflowStyle = await header.evaluate(el =>
      window.getComputedStyle(el).overflow
    );

    // overflow가 hidden이거나 visible이어야 함 (scroll이면 안됨)
    expect(['hidden', 'visible', 'clip']).toContain(overflowStyle);
  });

  test('모바일에서 이미지가 반응형으로 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 탭으로 이동 (이미지가 많음)
    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await page.waitForTimeout(1000);

    // 이미지들 확인
    const images = await page.locator('img').all();

    for (const img of images.slice(0, 5)) { // 처음 5개만 확인
      const box = await img.boundingBox();

      if (box) {
        // 이미지가 화면을 넘어가지 않아야 함
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });
});
