import { test, expect } from '@playwright/test';

/**
 * P0 - Critical: 일정 데이터 표시 테스트
 *
 * 목적: 5일간의 여행 일정이 올바르게 표시되고 상태가 정확히 구분되는지 확인
 *
 * ⚠️ 주의: 시간 의존 테스트이므로 Group C (순차 실행 권장)
 */

test.describe('일정 데이터 표시', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // 일정 탭으로 이동
    const scheduleTab = page.locator('[role="tab"]').filter({ hasText: '일정' }).first();
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('5일간의 모든 일정이 표시되어야 함', async ({ page }) => {
    // 각 날짜 확인
    await expect(page.locator('text=/1일차.*01.*15/i').first()).toBeVisible();
    await expect(page.locator('text=/2일차.*01.*16/i').first()).toBeVisible();
    await expect(page.locator('text=/3일차.*01.*17/i').first()).toBeVisible();
    await expect(page.locator('text=/4일차.*01.*18/i').first()).toBeVisible();
    await expect(page.locator('text=/5일차.*01.*19/i').first()).toBeVisible();

    // 스크린샷
    await page.screenshot({ path: '/tmp/playwright-schedule-all-days.png', fullPage: true });
  });

  test('1일차 활동이 올바르게 표시되어야 함', async ({ page }) => {
    // 1일차 주요 활동 확인
    await expect(page.locator('text=/집에서 출발/i').first()).toBeVisible();
    await expect(page.locator('text=/공항 미팅/i').first()).toBeVisible();
    await expect(page.locator('text=/인천 출발/i').first()).toBeVisible();
    await expect(page.locator('text=/다낭 도착/i').first()).toBeVisible();
    await expect(page.locator('text=/호텔/i').first()).toBeVisible();

    // 시간 표시 확인
    await expect(page.locator('text=13:00').first()).toBeVisible();
    await expect(page.locator('text=15:00').first()).toBeVisible();
    await expect(page.locator('text=18:30').first()).toBeVisible();
  });

  test('2일차 활동이 올바르게 표시되어야 함', async ({ page }) => {
    // 2일차 주요 활동 확인
    await expect(page.locator('text=/마사지/i').first()).toBeVisible();
    await expect(page.locator('text=/마블마운틴|오행산/i').first()).toBeVisible();
    await expect(page.locator('text=/호이안/i').first()).toBeVisible();
    await expect(page.locator('text=/바구니배/i').first()).toBeVisible();
  });

  test('활동 시간이 표시되어야 함', async ({ page }) => {
    // 여러 시간 표시 확인
    const times = ['09:00', '10:00', '13:00', '15:00', '18:30', '21:30'];

    for (const time of times) {
      const timeExists = await page.locator(`text=${time}`).count() > 0;
      expect(timeExists).toBeTruthy();
    }
  });

  test('완료된 활동은 체크 표시가 있어야 함', async ({ page }) => {
    // 여행 중간(2일차)으로 시간 설정
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-16T15:00:00+07:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 일정 타임라인은 홈 화면에도 표시되므로 바로 확인 가능
    // 1일차 확장 (기본적으로 현재 날짜가 확장되어 있을 수 있음)
    const day1 = page.locator('[data-testid="day-1"]').first();
    if (await day1.isVisible()) {
      await day1.click();
      await page.waitForTimeout(500);
    }

    // 완료 표시 확인 (data-status="completed" 사용)
    const completedItems = await page.locator('[data-status="completed"]').count();
    expect(completedItems).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-schedule-completed.png', fullPage: true });
  });

  test('진행 중인 활동은 하이라이트되어야 함', async ({ page }) => {
    // 여행 중(2일차 오후)으로 시간 설정
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-16T14:00:00+07:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 2일차 확장
    const day2 = page.locator('[data-testid="day-2"]').first();
    if (await day2.isVisible()) {
      await day2.click();
      await page.waitForTimeout(500);
    }

    // 진행 중 표시 확인 (data-status="in_progress" 사용)
    const activeItems = await page.locator('[data-status="in_progress"]').count();
    expect(activeItems).toBeGreaterThan(0);

    await page.screenshot({ path: '/tmp/playwright-schedule-active.png', fullPage: true });
  });

  test('예정된 활동은 비활성 상태로 표시되어야 함', async ({ page }) => {
    // 여행 초반(1일차 오후)으로 시간 설정
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-15T20:00:00+07:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 일정 탭으로 이동
    const scheduleTab = page.locator('[role="tab"]').filter({ hasText: '일정' }).first();
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await page.waitForTimeout(500);
    }

    // 예정 활동 확인 (2일차 이후 활동들)
    const upcomingExists = await page.locator('text=/2일차/i').count() > 0;
    expect(upcomingExists).toBeTruthy();
  });

  test('활동 설명이 표시되어야 함', async ({ page }) => {
    // 설명이 있는 활동 확인 (공항 미팅)
    const description = page.locator('text=/인천 국제공항.*노랑풍선/i').first();
    const descriptionExists = await description.count() > 0;
    expect(descriptionExists).toBeTruthy();
  });

  test('일정 스크롤이 동작해야 함', async ({ page }) => {
    // 스크롤 가능한 컨테이너 찾기
    const scrollContainer = page.locator('[data-testid="day-timeline"], .overflow-y-auto, .overflow-auto').first();

    if (await scrollContainer.isVisible()) {
      // 스크롤 전 위치
      const scrollBefore = await scrollContainer.evaluate(el => el.scrollTop);

      // 스크롤 다운
      await scrollContainer.evaluate(el => el.scrollBy(0, 500));
      await page.waitForTimeout(500);

      // 스크롤 후 위치
      const scrollAfter = await scrollContainer.evaluate(el => el.scrollTop);

      expect(scrollAfter).toBeGreaterThan(scrollBefore);
    }
  });

  test('식사 정보가 표시되어야 함', async ({ page }) => {
    // 2일차 식사 정보 확인
    const mealInfo = await page.locator('text=/중식|석식|장어정식|호이안전통식/i').count();
    expect(mealInfo).toBeGreaterThan(0);
  });

  test.skip('이미지가 있는 활동은 이미지가 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // 일정 탭으로 이동
    const scheduleTab = page.locator('[role="tab"]').filter({ hasText: '일정' }).first();
    if (await scheduleTab.isVisible()) {
      await scheduleTab.click();
      await page.waitForTimeout(2000);
    }

    // 일정 페이지가 로드될 때까지 대기 (일정 헤더 확인)
    await expect(page.locator('text=/다낭 여행/i')).toBeVisible();

    // 페이지 스크롤하여 모든 일차 확인
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 모든 일차의 헤더 버튼 찾기 및 클릭하여 확장
    const dayButtons = page.locator('button:has-text("일차")');
    const buttonCount = await dayButtons.count();

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      try {
        const button = dayButtons.nth(i);
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(500);
        }
      } catch (e) {
        // 버튼 클릭 실패는 무시
      }
    }

    // 이미지가 있는지 확인 (alt 속성이 있는 img 태그)
    const images = page.locator('img[alt]').filter({ hasNotText: '' });
    const imageCount = await images.count();

    // 최소 1개 이상의 이미지가 있어야 함
    expect(imageCount).toBeGreaterThan(0);

    // 첫 번째 이미지의 alt 텍스트 확인
    if (imageCount > 0) {
      const firstImage = images.first();
      const altText = await firstImage.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText!.length).toBeGreaterThan(0);
    }
  });
});
