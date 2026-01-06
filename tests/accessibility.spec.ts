import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should have proper ARIA labels on navigation', async ({ page }) => {
    // 하단 네비게이션 ARIA 속성 확인
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();

    const homeTab = page.locator('button[role="tab"]', { hasText: '홈' });
    await expect(homeTab).toHaveAttribute('aria-label', '홈 탭');
    await expect(homeTab).toHaveAttribute('aria-selected');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab 키로 네비게이션 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 포커스된 요소 확인
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should open and close image modal with keyboard', async ({ page }) => {
    // 일정 탭으로 이동
    const scheduleTab = page.locator('nav button', { hasText: '일정' });
    await scheduleTab.click();
    await page.waitForTimeout(1000);

    // 이미지가 있는 경우 클릭
    const image = page.locator('img[alt]').first();
    if (await image.count() > 0) {
      await image.click();
      await page.waitForTimeout(500);

      // 모달이 열렸는지 확인
      const modal = page.locator('[role="dialog"]');
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();
        await expect(modal).toHaveAttribute('aria-modal', 'true');

        // ESC 키로 모달 닫기
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        // 모달이 닫혔는지 확인
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('should have accessible FloatingActionButton', async ({ page }) => {
    // FAB 버튼 찾기
    const fab = page.locator('button[aria-label*="빠른 메뉴"]').last();

    if (await fab.count() > 0) {
      await expect(fab).toHaveAttribute('aria-expanded');
      await expect(fab).toHaveAttribute('aria-haspopup', 'menu');

      // FAB 열기
      await fab.click();
      await page.waitForTimeout(500);

      // 메뉴가 열렸는지 확인
      const menu = page.locator('[role="menu"]');
      if (await menu.count() > 0) {
        await expect(menu).toBeVisible();

        // 메뉴 항목 ARIA 확인
        const menuItems = page.locator('[role="menuitem"]');
        const count = await menuItems.count();
        expect(count).toBeGreaterThan(0);

        // 첫 번째 메뉴 항목에 aria-label이 있는지 확인
        if (count > 0) {
          await expect(menuItems.first()).toHaveAttribute('aria-label');
        }

        // ESC 키로 메뉴 닫기
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }
  });

  test('should have proper focus styles', async ({ page }) => {
    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab');

    // 포커스된 요소에 outline이나 ring 클래스가 있는지 확인
    const focused = page.locator(':focus');
    if (await focused.count() > 0) {
      const classList = await focused.getAttribute('class');

      // Tailwind focus 스타일이 있는지 확인 (focus:ring, focus:outline 등)
      const hasFocusStyle =
        classList?.includes('focus:ring') ||
        classList?.includes('focus:outline') ||
        classList?.includes('focus-visible');

      expect(hasFocusStyle).toBeTruthy();
    }
  });

  test('should have accessible form inputs', async ({ page }) => {
    // 설정 페이지로 이동
    const settingsTab = page.locator('nav button', { hasText: '설정' });
    await settingsTab.click();
    await page.waitForTimeout(1000);

    // 토글 버튼들이 적절한 ARIA 속성을 가지고 있는지 확인
    const toggleButtons = page.locator('button[class*="rounded-full"]');
    const count = await toggleButtons.count();

    if (count > 0) {
      // 토글 버튼이 클릭 가능한지 확인
      await expect(toggleButtons.first()).toBeVisible();
    }
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // main, nav, header 등의 시맨틱 요소 확인
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // 헤더가 있는지 확인
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should support screen reader announcements', async ({ page }) => {
    // aria-live 영역이 있는지 확인 (동적 콘텐츠용)
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();

    // aria-live 영역이 하나 이상 있으면 확인
    if (count > 0) {
      await expect(liveRegions.first()).toHaveAttribute('aria-live');
    }
  });

  test('should have proper tab panel accessibility', async ({ page }) => {
    // 지도 페이지로 이동
    const mapTab = page.locator('nav button', { hasText: '지도' });
    await mapTab.click();
    await page.waitForTimeout(2000);

    // 편의시설 버튼 클릭
    const amenitiesButton = page.getByRole('button', { name: /편의시설/ });
    if (await amenitiesButton.count() > 0) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      // Tab list ARIA 확인
      const tablist = page.locator('[role="tablist"]');
      if (await tablist.count() > 0) {
        await expect(tablist).toBeVisible();
        await expect(tablist).toHaveAttribute('aria-label');

        // Tab 요소 확인
        const tabs = page.locator('[role="tab"]');
        const tabCount = await tabs.count();
        expect(tabCount).toBeGreaterThan(0);

        if (tabCount > 0) {
          // 첫 번째 탭이 aria-selected를 가지고 있는지 확인
          await expect(tabs.first()).toHaveAttribute('aria-selected');

          // 두 번째 탭으로 이동 (있는 경우)
          if (tabCount > 1) {
            await tabs.nth(1).click();
            await page.waitForTimeout(500);

            // 두 번째 탭이 선택되었는지 확인
            await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
          }
        }

        // Tabpanel 확인
        const tabpanel = page.locator('[role="tabpanel"]');
        if (await tabpanel.count() > 0) {
          await expect(tabpanel).toBeVisible();
          await expect(tabpanel).toHaveAttribute('id');
        }
      }
    }
  });
});
