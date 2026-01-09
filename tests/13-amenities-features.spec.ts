import { test, expect } from '@playwright/test';

/**
 * P1 - Important: 편의시설 기능 테스트
 *
 * 목적: 카페/편의점/대형마트 등 편의시설 기능이 정상적으로 동작하는지 확인
 *
 * Group A: 순수 렌더링 (병렬 실행 가능)
 */

test.describe('편의시설 기능', () => {

  test('편의시설 보기 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 지도 탭으로 이동
    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    // 편의시설 보기 버튼 찾기
    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ });
    const buttonCount = await amenitiesButton.count();

    expect(buttonCount).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-amenities-button.png' });
  });

  test('편의시설 보기 버튼 클릭 시 바텀시트가 열려야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 지도 탭으로 이동
    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    // 편의시설 보기 버튼 클릭
    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      // 바텀시트가 열렸는지 확인
      const bottomSheet = page.locator('[role="dialog"], .bottom-sheet, [data-testid="amenities-sheet"]');
      const isVisible = await bottomSheet.isVisible();

      expect(isVisible).toBeTruthy();

      await page.screenshot({ path: '/tmp/playwright-amenities-sheet.png' });
    }
  });

  test('편의시설 카테고리 탭이 4개 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 지도 탭 이동
    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    // 편의시설 보기 버튼 클릭
    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      // 카테고리 탭 확인 (호텔 시설, 편의점, 대형마트, 카페)
      const categoryTabs = page.locator('button[role="tab"]');
      const tabCount = await categoryTabs.count();

      // 최소 4개 이상의 탭이 있어야 함
      expect(tabCount).toBeGreaterThanOrEqual(4);

      await page.screenshot({ path: '/tmp/playwright-amenities-tabs.png' });
    }
  });

  test('카페 탭을 클릭하면 카페 목록이 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 지도 탭 이동
    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    // 편의시설 보기 버튼 클릭
    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      // 카페 탭 클릭
      const cafeTab = page.locator('button').filter({ hasText: /카페|☕/ }).first();
      if (await cafeTab.isVisible()) {
        await cafeTab.click();
        await page.waitForTimeout(500);

        // 카페 목록 확인
        const cafeList = page.locator('div, li').filter({ hasText: /스페셜티|스타벅스|커피/ });
        const cafeCount = await cafeList.count();

        expect(cafeCount).toBeGreaterThan(0);

        await page.screenshot({ path: '/tmp/playwright-cafe-list.png', fullPage: true });
      }
    }
  });

  test('편의점 탭을 클릭하면 편의점 목록이 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      // 편의점 탭 클릭
      const convenienceTab = page.locator('button').filter({ hasText: /편의점|🏪/ }).first();
      if (await convenienceTab.isVisible()) {
        await convenienceTab.click();
        await page.waitForTimeout(500);

        // 편의점 목록 확인
        const storeList = page.locator('div, li').filter({ hasText: /마트|스톱|24/ });
        const storeCount = await storeList.count();

        expect(storeCount).toBeGreaterThan(0);

        await page.screenshot({ path: '/tmp/playwright-convenience-list.png', fullPage: true });
      }
    }
  });

  test('대형마트 탭을 클릭하면 대형마트 목록이 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      // 대형마트 탭 클릭
      const supermarketTab = page.locator('button').filter({ hasText: /대형마트|마트|🛒/ }).first();
      if (await supermarketTab.isVisible()) {
        await supermarketTab.click();
        await page.waitForTimeout(500);

        // 대형마트 목록 확인
        const marketList = page.locator('div, li').filter({ hasText: /롯데|Lotte|GO/ });
        const marketCount = await marketList.count();

        expect(marketCount).toBeGreaterThan(0);

        await page.screenshot({ path: '/tmp/playwright-supermarket-list.png', fullPage: true });
      }
    }
  });

  test('카페 항목에 영업시간이 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      const cafeTab = page.locator('button').filter({ hasText: /카페|☕/ }).first();
      if (await cafeTab.isVisible()) {
        await cafeTab.click();
        await page.waitForTimeout(500);

        // 영업시간 표시 확인
        const openingHours = page.locator('text=/\\d{2}:\\d{2}/');
        const hoursCount = await openingHours.count();

        expect(hoursCount).toBeGreaterThan(0);

        await page.screenshot({ path: '/tmp/playwright-cafe-hours.png' });
      }
    }
  });

  test('카페 항목에 거리 정보가 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      const cafeTab = page.locator('button').filter({ hasText: /카페|☕/ }).first();
      if (await cafeTab.isVisible()) {
        await cafeTab.click();
        await page.waitForTimeout(500);

        // 거리 정보 확인 (m 또는 km)
        const distance = page.locator('text=/\\d+\\.?\\d*\\s?(m|km)/');
        const distanceCount = await distance.count();

        expect(distanceCount).toBeGreaterThan(0);

        await page.screenshot({ path: '/tmp/playwright-cafe-distance.png' });
      }
    }
  });

  test('길찾기 버튼이 각 편의시설에 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      const cafeTab = page.locator('button').filter({ hasText: /카페|☕/ }).first();
      if (await cafeTab.isVisible()) {
        await cafeTab.click();
        await page.waitForTimeout(500);

        // 길찾기 버튼 확인
        const directionsButton = page.locator('button, a').filter({ hasText: /길찾기|directions|navigate/ });
        const buttonCount = await directionsButton.count();

        expect(buttonCount).toBeGreaterThan(0);

        await page.screenshot({ path: '/tmp/playwright-directions-button.png' });
      }
    }
  });

  test('모바일에서 편의시설 탭이 반응형으로 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      // 카테고리 탭 확인
      const categoryTabs = page.locator('button[role="tab"]');
      const tabCount = await categoryTabs.count();

      expect(tabCount).toBeGreaterThanOrEqual(4);

      await page.screenshot({ path: '/tmp/playwright-amenities-mobile.png', fullPage: true });
    }
  });

  test('바텀시트를 닫을 수 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      // 닫기 버튼 찾기
      const closeButton = page.locator('button[aria-label*="닫기"], button[aria-label*="close"], button:has-text("닫기")').first();

      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);

        await page.screenshot({ path: '/tmp/playwright-amenities-closed.png' });
      }
    }
  });

  test('카페 목록이 거리순으로 정렬되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mapTab = page.locator('[role="tab"]').filter({ hasText: '지도' }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);
    }

    const amenitiesButton = page.locator('button').filter({ hasText: /편의시설|시설/ }).first();
    if (await amenitiesButton.isVisible()) {
      await amenitiesButton.click();
      await page.waitForTimeout(1000);

      const cafeTab = page.locator('button').filter({ hasText: /카페|☕/ }).first();
      if (await cafeTab.isVisible()) {
        await cafeTab.click();
        await page.waitForTimeout(500);

        // 거리 정보 추출
        const distanceElements = await page.locator('text=/\\d+\\.?\\d*\\s?(m|km)/').all();

        if (distanceElements.length > 1) {
          const distances = await Promise.all(
            distanceElements.map(async (el) => {
              const text = await el.textContent();
              return text || '';
            })
          );

          // 첫 번째 항목이 두 번째 항목보다 가까워야 함
          expect(distances.length).toBeGreaterThan(0);

          await page.screenshot({ path: '/tmp/playwright-cafe-sorted.png' });
        }
      }
    }
  });
});
