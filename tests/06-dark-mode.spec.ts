import { test, expect } from '@playwright/test';

/**
 * P1 - Important: 다크모드 테스트
 *
 * 목적: 테마 전환 기능이 정상 동작하고 설정이 유지되는지 확인
 *
 * ⚠️ Group D: localStorage 사용 (격리 필요)
 */

test.describe('다크모드', () => {

  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // ThemeToggle 렌더링 대기
  });

  test.afterEach(async ({ page }) => {
    // 테스트 후 localStorage 정리
    await page.evaluate(() => localStorage.clear());
  });

  test('설정 탭에 테마 토글이 있어야 함', async ({ page }) => {
    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: '설정' }).first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // 테마 버튼 확인 (라이트, 다크, 자동)
    const lightButton = await page.locator('button:has-text("라이트")').count();
    const darkButton = await page.locator('button:has-text("다크")').count();
    expect(lightButton + darkButton).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-theme-toggle.png' });
  });

  test('다크모드를 활성화할 수 있어야 함', async ({ page }) => {
    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: '설정' }).first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // 초기 상태 확인 (라이트 모드)
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');
    const isDarkInitially = initialClass?.includes('dark') || false;

    // 다크 모드 버튼 클릭
    const darkButton = page.locator('button:has-text("다크")').first();
    await darkButton.click();
    await page.waitForTimeout(500);

    // 다크모드 클래스 확인
    const afterClass = await htmlElement.getAttribute('class');
    const isDarkAfter = afterClass?.includes('dark') || false;

    // 상태가 변경되었는지 확인
    expect(isDarkAfter).not.toBe(isDarkInitially);

    await page.screenshot({ path: '/tmp/playwright-dark-mode-enabled.png', fullPage: true });
  });

  test('다크모드와 라이트모드를 토글할 수 있어야 함', async ({ page }) => {
    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: '설정' }).first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    const htmlElement = page.locator('html');
    const darkButton = page.locator('button:has-text("다크")').first();
    const lightButton = page.locator('button:has-text("라이트")').first();

    // 초기 상태
    const initialClass = await htmlElement.getAttribute('class');

    // 다크 모드로 전환
    await darkButton.click();
    await page.waitForTimeout(300);
    const afterFirstToggle = await htmlElement.getAttribute('class');

    // 라이트 모드로 전환
    await lightButton.click();
    await page.waitForTimeout(300);
    const afterSecondToggle = await htmlElement.getAttribute('class');

    // 변경 확인
    expect(afterFirstToggle).not.toBe(initialClass);
    expect(afterSecondToggle).not.toBe(afterFirstToggle);
  });

  test('다크모드 설정이 localStorage에 저장되어야 함', async ({ page }) => {
    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: '설정' }).first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // 다크모드 활성화
    const darkButton = page.locator('button:has-text("다크")').first();
    await darkButton.click();
    await page.waitForTimeout(500);

    // localStorage 확인
    const themeMode = await page.evaluate(() => localStorage.getItem('themeMode'));
    expect(themeMode).toBeTruthy();
  });

  test('페이지 새로고침 후에도 테마가 유지되어야 함', async ({ page }) => {
    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: '설정' }).first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    const htmlElement = page.locator('html');

    // 다크모드 활성화
    const darkButton = page.locator('button:has-text("다크")').first();
    await darkButton.click();
    await page.waitForTimeout(500);

    const classBeforeReload = await htmlElement.getAttribute('class');

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const classAfterReload = await htmlElement.getAttribute('class');

    // 테마가 유지되어야 함 (dark 클래스가 포함되어 있는지 확인)
    expect(classAfterReload).toContain('dark');
  });

  test('다크모드에서 텍스트가 읽기 쉬워야 함', async ({ page }) => {
    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: '설정' }).first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // 다크모드 활성화
    const darkButton = page.locator('button:has-text("다크")').first();
    await darkButton.click();
    await page.waitForTimeout(500);

    // 스크린샷으로 시각적 확인
    await page.screenshot({
      path: '/tmp/playwright-dark-mode-readability.png',
      fullPage: true
    });

    // HTML에 dark 클래스가 있는지 확인
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
  });

  test('다크모드에서 모든 탭을 순회해도 일관성이 유지되어야 함', async ({ page }) => {
    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: '설정' }).first();
    await settingsTab.click();
    await page.waitForTimeout(500);

    // 다크모드 활성화
    const darkButton = page.locator('button:has-text("다크")').first();
    await darkButton.click();
    await page.waitForTimeout(500);

    const htmlElement = page.locator('html');

    // 모든 탭 순회
    const tabs = ['홈', '지도', '일정', '설정'];

    for (const tabName of tabs) {
      const tab = page.locator('[role="tab"]').filter({ hasText: tabName }).first();
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(300);

        const currentClass = await htmlElement.getAttribute('class');
        expect(currentClass).toContain('dark');
      }
    }
  });
});
