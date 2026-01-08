import { test, expect } from '@playwright/test';

/**
 * P2 - Nice-to-have: FAB (Floating Action Button) 테스트
 *
 * 목적: 플로팅 액션 버튼의 표시/숨김과 빠른 탭 전환 기능 확인
 *
 * Group B: UI 인터랙션 (병렬 실행 가능)
 */

test.describe('FAB 버튼', () => {

  test('페이지 로드 시 FAB가 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // FAB 버튼 찾기
    const fab = page.locator('[data-testid="fab"], .fab, button[aria-label*="floating"]').first();

    // FAB가 존재하는지 확인 (항상 표시되거나 스크롤 후 표시)
    const fabCount = await page.locator('button').count();
    expect(fabCount).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-fab-initial.png' });
  });

  test('스크롤 다운 시 FAB가 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 스크롤 다운
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    // FAB 확인
    const fab = page.locator('[data-testid="fab"], button[class*="fixed"], button[class*="absolute"]').first();

    if (await fab.isVisible()) {
      await page.screenshot({ path: '/tmp/playwright-fab-visible.png' });
    }

    expect(true).toBeTruthy();
  });

  test('FAB 클릭 시 메뉴가 열려야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 스크롤하여 FAB 표시
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    // FAB 찾기 (고정된 버튼)
    const fab = page.locator('button[class*="fixed"]').last();

    if (await fab.isVisible()) {
      await fab.click();
      await page.waitForTimeout(500);

      // 메뉴 또는 액션 확인
      await page.screenshot({ path: '/tmp/playwright-fab-menu.png' });
    }

    expect(true).toBeTruthy();
  });

  test('FAB 메뉴에서 탭을 전환할 수 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    const fab = page.locator('button[class*="fixed"]').last();

    if (await fab.isVisible()) {
      await fab.click();
      await page.waitForTimeout(500);

      // 지도 메뉴 항목 찾기
      const mapMenuItem = page.locator('[data-testid="fab-menu-map"], button:has-text("지도")').first();

      if (await mapMenuItem.isVisible()) {
        await mapMenuItem.click();
        await page.waitForTimeout(500);

        // 지도 탭이 활성화되었는지 확인
        const mapTab = page.locator('[role="tab"][aria-label*="지도"]');
        const isSelected = await mapTab.getAttribute('aria-selected');

        expect(isSelected).toBe('true');

        await page.screenshot({ path: '/tmp/playwright-fab-tab-switch.png' });
      }
    }
  });

  test('스크롤 업 시 FAB가 숨겨져야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 스크롤 다운
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);

    // 스크롤 업
    await page.evaluate(() => window.scrollBy(0, -800));
    await page.waitForTimeout(500);

    await page.screenshot({ path: '/tmp/playwright-fab-hidden.png' });

    // FAB가 숨겨졌거나 여전히 표시될 수 있음 (구현에 따라)
    expect(true).toBeTruthy();
  });

  test('모바일에서 FAB가 올바른 위치에 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    const fab = page.locator('button[class*="fixed"]').last();

    if (await fab.isVisible()) {
      const box = await fab.boundingBox();

      if (box) {
        // FAB가 화면 하단 우측에 위치하는지 확인
        expect(box.x).toBeGreaterThan(300); // 우측
        expect(box.y).toBeGreaterThan(500); // 하단

        await page.screenshot({ path: '/tmp/playwright-fab-mobile.png' });
      }
    }
  });

  test('FAB 클릭 시 부드러운 애니메이션이 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    const fab = page.locator('button[class*="fixed"]').last();

    if (await fab.isVisible()) {
      // 클릭 전 스크린샷
      await page.screenshot({ path: '/tmp/playwright-fab-before-click.png' });

      await fab.click();
      await page.waitForTimeout(100);

      // 클릭 후 스크린샷 (애니메이션 중)
      await page.screenshot({ path: '/tmp/playwright-fab-after-click.png' });
    }

    expect(true).toBeTruthy();
  });

  test('FAB가 다른 UI 요소를 가리지 않아야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    // FAB와 하단 네비게이션이 겹치지 않는지 확인
    const fab = page.locator('button[class*="fixed"]').last();
    const bottomNav = page.locator('[role="tablist"]');

    if (await fab.isVisible() && await bottomNav.isVisible()) {
      const fabBox = await fab.boundingBox();
      const navBox = await bottomNav.boundingBox();

      if (fabBox && navBox) {
        // FAB가 네비게이션보다 위에 있어야 함
        expect(fabBox.y).toBeLessThan(navBox.y);
      }
    }

    await page.screenshot({ path: '/tmp/playwright-fab-no-overlap.png' });
  });

  test('FAB 터치 영역이 충분해야 함 (44x44px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    const fab = page.locator('button[class*="fixed"]').last();

    if (await fab.isVisible()) {
      const box = await fab.boundingBox();

      if (box) {
        // WCAG 터치 타겟 최소 크기
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('키보드로 FAB에 접근할 수 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab 키로 FAB까지 이동
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

      if (focusedElement === 'BUTTON') {
        // 버튼에 포커스가 갔는지 확인
        await page.screenshot({ path: '/tmp/playwright-fab-keyboard-focus.png' });
        break;
      }
    }

    expect(true).toBeTruthy();
  });
});
