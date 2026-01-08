import { test, expect } from '@playwright/test';

/**
 * P0 - Critical: 탭 네비게이션 테스트
 *
 * 목적: 4개 탭 간 전환이 정상적으로 동작하는지 확인
 */

test.describe('탭 네비게이션', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 위치 권한 모달이 있다면 닫기
    const modalCloseButton = page.locator('button:has-text("나중에")');
    if (await modalCloseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalCloseButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('홈 탭이 기본으로 선택되어 있어야 함', async ({ page }) => {
    const homeTab = page.locator('[role="tab"][aria-label*="홈"]');

    await expect(homeTab).toHaveAttribute('aria-selected', 'true');
  });

  test('지도 탭으로 전환할 수 있어야 함', async ({ page }) => {
    // 지도 탭 클릭
    const mapTab = page.locator('[role="tab"][aria-label*="지도"]');
    await mapTab.click();

    // 선택 상태 확인
    await expect(mapTab).toHaveAttribute('aria-selected', 'true');

    // 스크린샷
    await page.screenshot({ path: '/tmp/playwright-map-tab.png' });
  });

  test('일정 탭으로 전환할 수 있어야 함', async ({ page }) => {
    // 일정 탭 클릭
    const scheduleTab = page.locator('[role="tab"][aria-label*="일정"]');
    await scheduleTab.click();

    // 선택 상태 확인
    await expect(scheduleTab).toHaveAttribute('aria-selected', 'true');

    // 스크린샷
    await page.screenshot({ path: '/tmp/playwright-schedule-tab.png' });
  });

  test('설정 탭으로 전환할 수 있어야 함', async ({ page }) => {
    // 설정 탭 클릭
    const settingsTab = page.locator('[role="tab"][aria-label*="설정"]');
    await settingsTab.click();

    // 선택 상태 확인
    await expect(settingsTab).toHaveAttribute('aria-selected', 'true');

    // 스크린샷
    await page.screenshot({ path: '/tmp/playwright-settings-tab.png' });
  });

  test('모든 탭을 순환하며 전환할 수 있어야 함', async ({ page }) => {
    const tabs = [
      { selector: '[role="tab"][aria-label*="홈"]', name: '홈' },
      { selector: '[role="tab"][aria-label*="지도"]', name: '지도' },
      { selector: '[role="tab"][aria-label*="일정"]', name: '일정' },
      { selector: '[role="tab"][aria-label*="설정"]', name: '설정' },
    ];

    for (const tab of tabs) {
      await page.locator(tab.selector).click();
      await page.waitForTimeout(300); // 애니메이션 대기

      await expect(page.locator(tab.selector)).toHaveAttribute('aria-selected', 'true');

      console.log(`✓ ${tab.name} 탭 전환 성공`);
    }
  });

  test('탭 전환 후 상태가 유지되어야 함', async ({ page }) => {
    // 일정 탭으로 이동
    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await expect(page.locator('[role="tab"][aria-label*="일정"]')).toHaveAttribute('aria-selected', 'true');

    // 스크롤
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    // 여전히 일정 탭이 선택되어 있어야 함
    await expect(page.locator('[role="tab"][aria-label*="일정"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('키보드로 탭 네비게이션이 가능해야 함', async ({ page }) => {
    // 첫 번째 탭에 포커스
    await page.locator('[role="tab"]').first().focus();

    // Tab 키로 다음 탭으로 이동
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Enter 키로 탭 선택
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // 두 번째 탭(지도)이 선택되었는지 확인
    const selectedTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(selectedTab).toHaveAttribute('aria-label', /지도/);
  });
});
