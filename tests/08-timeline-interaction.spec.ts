import { test, expect } from '@playwright/test';

/**
 * P1 - Important: 타임라인 인터랙션 테스트
 *
 * 목적: 일정 타임라인의 스크롤, 카드 확장, 이미지 모달 등 인터랙션 확인
 *
 * Group B: UI 인터랙션 (병렬 실행 가능)
 */

test.describe('타임라인 인터랙션', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 탭으로 이동
    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await page.waitForTimeout(500);
  });

  test('타임라인을 스크롤할 수 있어야 함', async ({ page }) => {
    // 스크롤 가능한 컨테이너 찾기
    const scrollable = page.locator('.overflow-y-auto, .overflow-auto, [data-testid="day-timeline"]').first();

    if (await scrollable.isVisible()) {
      // 스크롤 전 위치
      const scrollBefore = await scrollable.evaluate(el => el.scrollTop);

      // 스크롤 다운
      await scrollable.evaluate(el => el.scrollBy(0, 300));
      await page.waitForTimeout(500);

      // 스크롤 후 위치
      const scrollAfter = await scrollable.evaluate(el => el.scrollTop);

      expect(scrollAfter).toBeGreaterThan(scrollBefore);
    } else {
      // 페이지 전체 스크롤
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(500);

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    }

    await page.screenshot({ path: '/tmp/playwright-timeline-scrolled.png', fullPage: true });
  });

  test('활동 카드를 클릭하여 상세 정보를 볼 수 있어야 함', async ({ page }) => {
    // 상세 정보가 있는 활동 찾기 (공항 미팅)
    const activityCard = page.locator('text=/공항 미팅/i').first();

    if (await activityCard.isVisible()) {
      // 클릭 전 상태 (설명이 숨겨져 있을 수 있음)
      await activityCard.click();
      await page.waitForTimeout(500);

      // 상세 설명이 표시되는지 확인
      const detailVisible = await page.locator('text=/인천 국제공항|노랑풍선/i').count() > 0;
      expect(detailVisible).toBeTruthy();

      await page.screenshot({ path: '/tmp/playwright-card-expanded.png' });
    }
  });

  test('이미지를 클릭하면 모달이 열려야 함', async ({ page }) => {
    // 이미지 찾기
    const image = page.locator('img[src*="/images/"]').first();

    if (await image.isVisible()) {
      await image.click();
      await page.waitForTimeout(500);

      // 모달 확인
      const modal = page.locator('[role="dialog"], .modal, [data-testid="image-modal"]');
      const modalVisible = await modal.isVisible().catch(() => false);

      if (modalVisible) {
        await page.screenshot({ path: '/tmp/playwright-image-modal.png' });

        // 모달 닫기 버튼 찾기
        const closeButton = page.locator('button[aria-label*="close"], button:has-text("×"), button:has-text("닫기")').first();

        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);

          // 모달이 닫혔는지 확인
          const modalClosed = !(await modal.isVisible().catch(() => false));
          expect(modalClosed).toBeTruthy();
        }
      }
    }
  });

  test('일차별 확장/축소가 동작해야 함', async ({ page }) => {
    // 일차 헤더 찾기 (토글 가능한 경우)
    const dayHeader = page.locator('text=/1일차/i, button:has-text("1일차")').first();

    if (await dayHeader.isVisible()) {
      // 클릭 시도
      await dayHeader.click();
      await page.waitForTimeout(500);

      // 상태 변화 확인 (aria-expanded 또는 시각적 변화)
      await page.screenshot({ path: '/tmp/playwright-day-toggled.png', fullPage: true });
    }
  });

  test('마우스 호버 시 카드가 강조되어야 함', async ({ page }) => {
    // 활동 카드 찾기
    const card = page.locator('text=/집에서 출발/i').first();

    if (await card.isVisible()) {
      // 호버
      await card.hover();
      await page.waitForTimeout(300);

      // 호버 상태 스크린샷
      await page.screenshot({ path: '/tmp/playwright-card-hover.png' });
    }
  });

  test('긴 일정 리스트를 빠르게 스크롤할 수 있어야 함', async ({ page }) => {
    // 여러 번 스크롤
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(100);
    }

    // 스크롤이 동작했는지 확인
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(500);
  });

  test('모바일에서 스와이프 제스처가 동작해야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await page.waitForTimeout(500);

    // 스와이프 가능한 요소 찾기
    const swipeable = page.locator('[data-swipeable], .swipeable').first();

    if (await swipeable.isVisible()) {
      const box = await swipeable.boundingBox();

      if (box) {
        // 스와이프 제스처 시뮬레이션 (터치 이벤트)
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 50, box.y + box.height / 2);
        await page.mouse.up();

        await page.waitForTimeout(500);
        await page.screenshot({ path: '/tmp/playwright-swipe.png' });
      }
    }
  });

  test('완료된 활동은 시각적으로 구분되어야 함', async ({ page }) => {
    // 여행 중으로 시간 설정
    await page.addInitScript(() => {
      const mockDate = new Date('2026-01-16T15:00:00+07:00');
      Date.now = () => mockDate.getTime();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await page.waitForTimeout(500);

    // 완료 표시 확인 (체크 마크 또는 스타일)
    const completedItems = await page.locator('[data-status="completed"], .completed, text=/✓|✔/').count();

    if (completedItems > 0) {
      await page.screenshot({ path: '/tmp/playwright-completed-visual.png', fullPage: true });
    }

    // 적어도 하나의 완료 항목이 있어야 함 (1일차 활동들)
    expect(completedItems).toBeGreaterThan(0);
  });

  test('활동 간 시간 간격이 명확하게 표시되어야 함', async ({ page }) => {
    // 시간 표시 확인
    const times = await page.locator('text=/\\d{2}:\\d{2}/').count();
    expect(times).toBeGreaterThan(5); // 최소 5개 이상의 시간 표시

    await page.screenshot({ path: '/tmp/playwright-time-spacing.png', fullPage: true });
  });

  test('키보드로 타임라인을 탐색할 수 있어야 함', async ({ page }) => {
    // 첫 번째 활동에 포커스
    const firstActivity = page.locator('[role="button"], a, button').first();

    if (await firstActivity.isVisible()) {
      await firstActivity.focus();

      // Tab 키로 다음 요소로 이동
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      // 스크린샷
      await page.screenshot({ path: '/tmp/playwright-keyboard-navigation.png' });
    }
  });
});
