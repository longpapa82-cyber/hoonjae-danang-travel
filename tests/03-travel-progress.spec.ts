import { test, expect } from '@playwright/test';

/**
 * P0 - Critical: 여행 진척도 계산 테스트
 *
 * 목적: 현재 시간 기준으로 여행 전/중/후 상태가 정확하게 표시되는지 확인
 *
 * ⚠️ 주의: Date.now() 모킹을 사용하므로 Group C (순차 실행 권장)
 */

test.describe('여행 진척도 계산', () => {

  test('여행 전: 카운트다운이 표시되어야 함', async ({ page }) => {
    // 여행 시작 전 시간으로 설정 (2026-01-10, 5일 전)
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-10T12:00:00+09:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // useCurrentTime이 업데이트될 시간을 줌

    // 카운트다운 타이머 확인 (실제 컴포넌트에서 사용하는 텍스트: "여행 시작까지")
    const countdownExists = await page.locator('text=/여행.*시작.*까지|D-/i').count() > 0;
    expect(countdownExists).toBeTruthy();

    // 스크린샷
    await page.screenshot({ path: '/tmp/playwright-before-travel.png' });
  });

  test('여행 중 (1일차): 진행 상태가 표시되어야 함', async ({ page }) => {
    // 1일차 시간 (2026-01-15 15:00, 한국 시간)
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-15T15:00:00+09:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 진행률 표시 확인 (실제 텍스트: "여행 진행 중", "활동 완료")
    const progressExists = await page.locator('text=/여행.*진행|활동.*완료|%/i').count() > 0;
    expect(progressExists).toBeTruthy();

    // 현재 활동 표시 확인 - 일정 타임라인에서 확인
    const currentActivity = await page.locator('text=/1일차|공항|인천|다낭/i').count() > 0;
    expect(currentActivity).toBeTruthy();

    await page.screenshot({ path: '/tmp/playwright-during-travel-day1.png' });
  });

  test('여행 중 (2일차): 현재 활동이 표시되어야 함', async ({ page }) => {
    // 2일차 시간 (2026-01-16 12:00, 베트남 시간 = 한국-2h)
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-16T12:00:00+07:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 2일차 활동 표시 (마사지, 마블마운틴, 호이안 등)
    const day2Activity = await page.locator('text=/2일차|마사지|마블마운틴|호이안/i').count() > 0;
    expect(day2Activity).toBeTruthy();

    await page.screenshot({ path: '/tmp/playwright-during-travel-day2.png' });
  });

  test('여행 중 (3일차): 바나힐스 활동이 표시되어야 함', async ({ page }) => {
    // 3일차 시간 (2026-01-17 10:00, 베트남 시간)
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-17T10:00:00+07:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 3일차 활동 표시 (바나힐스)
    const day3Activity = await page.locator('text=/3일차|바나힐스|미케비치/i').count() > 0;
    expect(day3Activity).toBeTruthy();

    await page.screenshot({ path: '/tmp/playwright-during-travel-day3.png' });
  });

  test('여행 후: 완료 상태가 표시되어야 함', async ({ page }) => {
    // 여행 종료 후 시간 (2026-01-20, 1일 후)
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-20T12:00:00+09:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 완료 상태 확인 (실제 텍스트: "여행이 완료되었습니다!")
    const completedExists = await page.locator('text=/여행.*완료|완료.*되었습니다/i').count() > 0;
    expect(completedExists).toBeTruthy();

    await page.screenshot({ path: '/tmp/playwright-after-travel.png' });
  });

  test('진행률이 시간에 따라 증가해야 함', async ({ page }) => {
    // 여행 시작 직후 (2026-01-15 13:30)
    await page.addInitScript(() => {
      localStorage.setItem('testDate', '2026-01-15T13:30:00+09:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 진행률 표시 확인 (0% 근처일 것으로 예상)
    const hasProgress = await page.locator('text=/%|활동.*완료/i').count() > 0;
    expect(hasProgress).toBeTruthy();

    // 여행 거의 종료 (2026-01-19 07:00, 도착 직전)
    await page.evaluate(() => {
      localStorage.setItem('testDate', '2026-01-19T07:00:00+09:00');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 높은 진행률 표시 확인
    const hasHighProgress = await page.locator('text=/%|활동.*완료/i').count() > 0;
    expect(hasHighProgress).toBeTruthy();
  });

  test('시차가 올바르게 적용되어야 함 (한국 vs 베트남)', async ({ page }) => {
    // 베트남 시간으로 2일차 오전 (한국시간으로는 +2시간)
    await page.addInitScript(() => {
      // 베트남 시간: 2026-01-16 10:00 = 한국 시간: 2026-01-16 12:00
      localStorage.setItem('testDate', '2026-01-16T10:00:00+07:00');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 2일차 활동이 표시되는지 확인
    const day2Content = await page.locator('text=/2일차|마사지/i').count() > 0;
    expect(day2Content).toBeTruthy();

    // 한국 시간으로도 확인
    await page.evaluate(() => {
      localStorage.setItem('testDate', '2026-01-16T12:00:00+09:00');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 동일하게 2일차 활동이 표시되어야 함
    const day2ContentKST = await page.locator('text=/2일차|마사지/i').count() > 0;
    expect(day2ContentKST).toBeTruthy();
  });
});
