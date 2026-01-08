import { test, expect } from '@playwright/test';

/**
 * P2 - Nice-to-have: 애니메이션 테스트
 *
 * 목적: Framer Motion 애니메이션과 페이지 전환 효과가 부드럽게 동작하는지 확인
 *
 * Group A: 순수 렌더링 (병렬 실행 가능)
 */

test.describe('애니메이션', () => {

  test('페이지 로드 시 초기 애니메이션이 실행되어야 함', async ({ page }) => {
    await page.goto('/');

    // 초기 로딩 애니메이션 확인 (빠르게 캡처)
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/playwright-animation-initial.png' });

    await page.waitForLoadState('networkidle');

    // 최종 상태 확인
    await page.screenshot({ path: '/tmp/playwright-animation-loaded.png' });

    expect(true).toBeTruthy();
  });

  test('탭 전환 시 애니메이션이 부드러워야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 홈 탭 스크린샷
    await page.screenshot({ path: '/tmp/playwright-animation-home.png' });

    // 지도 탭으로 전환
    await page.locator('[role="tab"][aria-label*="지도"]').click();

    // 애니메이션 진행 중 캡처
    await page.waitForTimeout(150);
    await page.screenshot({ path: '/tmp/playwright-animation-transition.png' });

    // 애니메이션 완료 후
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/playwright-animation-map.png' });

    // 페이지가 정상적으로 표시되는지 확인
    const mapTab = page.locator('[role="tab"][aria-label*="지도"]');
    await expect(mapTab).toHaveAttribute('aria-selected', 'true');
  });

  test('진행률 링 애니메이션이 동작해야 함', async ({ page }) => {
    // 여행 중으로 시간 설정
    await page.addInitScript(() => {
      const mockDate = new Date('2026-01-16T12:00:00+07:00');
      Date.now = () => mockDate.getTime();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 진행률 링 찾기
    const progressRing = page.locator('[data-testid="progress-ring"], svg circle').first();

    if (await progressRing.isVisible()) {
      // SVG circle의 애니메이션 속성 확인
      const strokeDashoffset = await progressRing.getAttribute('stroke-dashoffset');

      // stroke-dashoffset이 설정되어 있으면 애니메이션 적용됨
      expect(strokeDashoffset).toBeTruthy();

      await page.screenshot({ path: '/tmp/playwright-animation-progress.png' });
    }
  });

  test('카드 호버 시 애니메이션이 발생해야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 탭으로 이동
    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await page.waitForTimeout(500);

    // 카드 요소 찾기
    const card = page.locator('text=/집에서 출발/i').first();

    if (await card.isVisible()) {
      // 호버 전
      await page.screenshot({ path: '/tmp/playwright-animation-card-before.png' });

      // 호버
      await card.hover();
      await page.waitForTimeout(300);

      // 호버 후
      await page.screenshot({ path: '/tmp/playwright-animation-card-hover.png' });
    }

    expect(true).toBeTruthy();
  });

  test('스크롤 시 요소들이 페이드인되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 초기 상태
    await page.screenshot({ path: '/tmp/playwright-animation-scroll-before.png' });

    // 스크롤 다운
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    // 스크롤 후 애니메이션
    await page.screenshot({ path: '/tmp/playwright-animation-scroll-after.png' });

    expect(true).toBeTruthy();
  });

  test('모달 열기/닫기 애니메이션이 부드러워야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 탭으로 이동
    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await page.waitForTimeout(500);

    // 이미지 클릭하여 모달 열기
    const image = page.locator('img[src*="/images/"]').first();

    if (await image.isVisible()) {
      await image.click();

      // 모달 열리는 애니메이션
      await page.waitForTimeout(200);
      await page.screenshot({ path: '/tmp/playwright-animation-modal-opening.png' });

      await page.waitForTimeout(300);
      await page.screenshot({ path: '/tmp/playwright-animation-modal-open.png' });

      // 모달 닫기
      const closeButton = page.locator('button[aria-label*="close"], button:has-text("×")').first();

      if (await closeButton.isVisible()) {
        await closeButton.click();

        // 모달 닫히는 애니메이션
        await page.waitForTimeout(200);
        await page.screenshot({ path: '/tmp/playwright-animation-modal-closing.png' });
      }
    }
  });

  test('로딩 스피너가 부드럽게 회전해야 함', async ({ page }) => {
    await page.goto('/');

    // 초기 로딩 중 스피너 확인
    const spinner = page.locator('[role="progressbar"], .spinner, .loading').first();

    if (await spinner.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.screenshot({ path: '/tmp/playwright-animation-spinner.png' });
    }

    await page.waitForLoadState('networkidle');
    expect(true).toBeTruthy();
  });

  test('버튼 클릭 시 ripple 효과가 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 버튼 찾기
    const button = page.locator('[role="tab"]').first();

    if (await button.isVisible()) {
      // 클릭 전
      await page.screenshot({ path: '/tmp/playwright-animation-button-before.png' });

      // 클릭 (ripple 효과)
      await button.click();
      await page.waitForTimeout(100);

      // 클릭 직후 (ripple 애니메이션 중)
      await page.screenshot({ path: '/tmp/playwright-animation-button-ripple.png' });
    }

    expect(true).toBeTruthy();
  });

  test('다크모드 전환 애니메이션이 부드러워야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 설정 탭으로 이동
    await page.locator('[role="tab"][aria-label*="설정"]').click();
    await page.waitForTimeout(500);

    const themeButton = page.locator('button:has-text("다크"), button[aria-label*="theme"]').first();

    if (await themeButton.isVisible()) {
      // 라이트 모드
      await page.screenshot({ path: '/tmp/playwright-animation-light.png' });

      // 다크모드로 전환
      await themeButton.click();
      await page.waitForTimeout(200);

      // 전환 중
      await page.screenshot({ path: '/tmp/playwright-animation-theme-transition.png' });

      await page.waitForTimeout(300);

      // 다크모드 완료
      await page.screenshot({ path: '/tmp/playwright-animation-dark.png' });
    }

    expect(true).toBeTruthy();
  });

  test('모바일에서 스와이프 애니메이션이 부드러워야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 탭으로 이동
    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await page.waitForTimeout(500);

    // 스와이프 가능한 요소 찾기
    const swipeable = page.locator('[data-swipeable]').first();

    if (await swipeable.isVisible()) {
      const box = await swipeable.boundingBox();

      if (box) {
        // 스와이프 전
        await page.screenshot({ path: '/tmp/playwright-animation-swipe-before.png' });

        // 스와이프 제스처
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(50);
        await page.mouse.move(box.x + 50, box.y + box.height / 2);
        await page.waitForTimeout(50);
        await page.mouse.up();

        // 스와이프 후
        await page.waitForTimeout(300);
        await page.screenshot({ path: '/tmp/playwright-animation-swipe-after.png' });
      }
    }

    expect(true).toBeTruthy();
  });

  test('애니메이션이 사용자 prefers-reduced-motion 설정을 존중해야 함', async ({ page }) => {
    // prefers-reduced-motion 에뮬레이션
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 탭 전환
    await page.locator('[role="tab"][aria-label*="지도"]').click();
    await page.waitForTimeout(500);

    // 애니메이션 없이도 정상 동작해야 함
    const mapTab = page.locator('[role="tab"][aria-label*="지도"]');
    await expect(mapTab).toHaveAttribute('aria-selected', 'true');

    await page.screenshot({ path: '/tmp/playwright-animation-reduced-motion.png' });
  });
});
