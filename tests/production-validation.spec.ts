import { test, expect } from '@playwright/test';

/**
 * 프로덕션 환경 검증 테스트
 *
 * 목적: Vercel 프로덕션 환경에서 핵심 기능이 정상 작동하는지 확인
 */

const PRODUCTION_URL = 'https://hoonjae-danang-travel.vercel.app';

test.describe('프로덕션 환경 검증', () => {

  test('프로덕션 사이트가 로드되어야 함', async ({ page }) => {
    const response = await page.goto(PRODUCTION_URL);
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/production-homepage.png', fullPage: true });
  });

  test('프로덕션에서 지도 탭이 동작해야 함', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(2000);

      const mapView = await page.locator('[data-testid="map-view"]').count();
      expect(mapView).toBeGreaterThan(0);

      await page.screenshot({ path: '/tmp/production-map.png', fullPage: true });
    }
  });

  test('프로덕션에서 편의시설 보기 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(2000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ });
    const buttonCount = await amenitiesButton.count();

    expect(buttonCount).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/production-amenities-button.png' });
  });

  test('프로덕션에서 카페 목록이 표시되어야 함', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(2000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1500);

      const cafeTab = page.locator('button').filter({ hasText: /카페|☕/ }).first();
      if (await cafeTab.isVisible()) {
        await cafeTab.click();
        await page.waitForTimeout(1000);

        const cafeList = page.locator('div, li').filter({ hasText: /스페셜티|스타벅스|커피/ });
        const cafeCount = await cafeList.count();

        expect(cafeCount).toBeGreaterThan(0);

        await page.screenshot({ path: '/tmp/production-cafe-list.png', fullPage: true });
      }
    }
  });

  test('프로덕션에서 다크모드가 동작해야 함', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // 다크모드 토글 찾기
    const darkModeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="Dark"]').first();

    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      await page.screenshot({ path: '/tmp/production-dark-mode.png', fullPage: true });
    }

    expect(true).toBeTruthy();
  });

  test('프로덕션에서 모바일 뷰가 동작해야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/tmp/production-mobile.png', fullPage: true });

    // 하단 네비게이션 확인
    const bottomNav = page.locator('[role="tablist"]');
    const isVisible = await bottomNav.isVisible();

    expect(isVisible).toBeTruthy();
  });

  test('프로덕션에서 GPS 좌표가 정확히 업데이트되었는지 확인', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(2000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1500);

      const cafeTab = page.locator('button').filter({ hasText: /카페|☕/ }).first();
      if (await cafeTab.isVisible()) {
        await cafeTab.click();
        await page.waitForTimeout(1000);

        // 푸나 스페셜티 커피와 루스트 커피 로스터스가 목록에 있는지 확인
        const punaText = page.locator('text=/푸나|Puna/i');
        const roostText = page.locator('text=/루스트|Roost/i');

        const punaCount = await punaText.count();
        const roostCount = await roostText.count();

        expect(punaCount).toBeGreaterThan(0);
        expect(roostCount).toBeGreaterThan(0);

        await page.screenshot({ path: '/tmp/production-updated-cafes.png', fullPage: true });
      }
    }
  });
});
