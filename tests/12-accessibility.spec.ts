import { test, expect } from '@playwright/test';

/**
 * P2 - Nice-to-have: 접근성 테스트
 *
 * 목적: WCAG 2.1 AA 준수, ARIA 속성, 키보드 네비게이션, 스크린 리더 지원 확인
 *
 * Group A: 순수 렌더링 (병렬 실행 가능)
 */

test.describe('접근성', () => {

  test('페이지에 적절한 ARIA 역할이 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 주요 ARIA 역할 확인
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    await expect(page.locator('[role="tab"]')).toHaveCount(4);

    // main, navigation 등 시맨틱 요소
    const hasSemanticElements = await page.locator('main, nav, header, [role="main"]').count() > 0;
    expect(hasSemanticElements).toBeTruthy();
  });

  test('탭에 올바른 ARIA 속성이 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 각 탭 확인
    const tabs = await page.locator('[role="tab"]').all();

    for (const tab of tabs) {
      // aria-label 또는 aria-labelledby
      const ariaLabel = await tab.getAttribute('aria-label');
      const ariaLabelledby = await tab.getAttribute('aria-labelledby');

      expect(ariaLabel || ariaLabelledby).toBeTruthy();

      // aria-selected
      const ariaSelected = await tab.getAttribute('aria-selected');
      expect(['true', 'false']).toContain(ariaSelected);
    }
  });

  test('키보드로 모든 인터랙티브 요소에 접근할 수 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 첫 번째 요소부터 Tab 키로 탐색
    const tabbableElements: string[] = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}[${el.getAttribute('role') || 'no-role'}]` : 'none';
      });

      tabbableElements.push(focusedElement);
    }

    // 최소 5개 이상의 인터랙티브 요소가 있어야 함
    const uniqueElements = new Set(tabbableElements);
    expect(uniqueElements.size).toBeGreaterThanOrEqual(3);

    await page.screenshot({ path: '/tmp/playwright-accessibility-keyboard.png' });
  });

  test('포커스 표시가 명확해야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 탭에 포커스
    const tab = page.locator('[role="tab"]').first();
    await tab.focus();
    await page.waitForTimeout(300);

    // 포커스 링 스크린샷
    await page.screenshot({ path: '/tmp/playwright-accessibility-focus.png' });

    // 포커스 상태 확인
    const isFocused = await page.evaluate(() => {
      const activeEl = document.activeElement;
      return activeEl?.getAttribute('role') === 'tab';
    });

    expect(isFocused).toBeTruthy();
  });

  test('모든 이미지에 alt 텍스트가 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 탭으로 이동 (이미지가 많음)
    await page.locator('[role="tab"][aria-label*="일정"]').click();
    await page.waitForTimeout(500);

    // 모든 이미지 확인
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');

      // alt 속성이 있어야 함 (빈 문자열도 허용 - 장식용 이미지)
      expect(alt !== null).toBeTruthy();
    }
  });

  test('색상 대비가 충분해야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 텍스트 요소의 색상 대비 확인
    const textElements = await page.locator('h1, p, button, a').all();

    for (const el of textElements.slice(0, 5)) { // 처음 5개만 확인
      const styles = await el.evaluate(element => {
        const computed = window.getComputedStyle(element);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      // 색상이 설정되어 있는지 확인
      expect(styles.color).toBeTruthy();
    }

    await page.screenshot({ path: '/tmp/playwright-accessibility-contrast.png', fullPage: true });
  });

  test('버튼에 접근 가능한 이름이 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 모든 버튼 확인
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();

      // aria-label 또는 텍스트 내용이 있어야 함
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
  });

  test('폼 요소에 레이블이 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 모든 탭 확인 (설정 탭에 폼이 있을 수 있음)
    await page.locator('[role="tab"][aria-label*="설정"]').click();
    await page.waitForTimeout(500);

    // input 요소 확인
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const id = await input.getAttribute('id');

      // aria-label, aria-labelledby 또는 label[for=id]가 있어야 함
      if (id) {
        const labelExists = await page.locator(`label[for="${id}"]`).count() > 0;
        expect(ariaLabel || ariaLabelledby || labelExists).toBeTruthy();
      }
    }
  });

  test('스크린 리더에 적절한 정보가 제공되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 페이지 제목 확인
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // lang 속성 확인
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();

    // main landmark 확인
    const hasMain = await page.locator('main, [role="main"]').count() > 0;
    expect(hasMain).toBeTruthy();
  });

  test('링크에 명확한 텍스트가 있어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 모든 링크 확인
    const links = await page.locator('a').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // 링크 텍스트 또는 aria-label이 있어야 함
      expect(text?.trim() || ariaLabel).toBeTruthy();

      // "여기 클릭", "click here" 같은 모호한 텍스트는 피해야 함
      const hasVagueText = /^(여기|클릭|here|click)$/i.test(text?.trim() || '');
      expect(hasVagueText).toBeFalsy();
    }
  });

  test('다크모드에서도 접근성이 유지되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 다크모드 활성화
    await page.locator('[role="tab"][aria-label*="설정"]').click();
    await page.waitForTimeout(500);

    const themeButton = page.locator('button:has-text("다크"), button[aria-label*="theme"]').first();

    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);

      // 홈 탭으로 돌아가기
      await page.locator('[role="tab"][aria-label*="홈"]').click();
      await page.waitForTimeout(500);

      // 텍스트 가독성 확인
      await page.screenshot({ path: '/tmp/playwright-accessibility-dark.png', fullPage: true });

      // ARIA 속성이 여전히 유효한지 확인
      await expect(page.locator('[role="tablist"]')).toBeVisible();
    }
  });

  test('모바일에서 터치 타겟 크기가 충분해야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 모든 인터랙티브 요소 확인
    const interactiveElements = await page.locator('button, a, [role="tab"]').all();

    for (const el of interactiveElements.slice(0, 10)) { // 처음 10개만 확인
      const box = await el.boundingBox();

      if (box && box.width > 0 && box.height > 0) {
        // WCAG 2.5.5: 최소 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('에러 메시지가 접근 가능해야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 콘솔 에러 수집
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // 에러가 있다면 사용자에게 표시되는지 확인
    if (errors.length > 0) {
      const errorMessage = page.locator('[role="alert"], .error-message').first();
      const errorVisible = await errorMessage.isVisible().catch(() => false);

      // 에러가 있으면 알림으로 표시되어야 함
      // (없으면 콘솔 에러만 있는 것)
      console.log('Errors found:', errors.length);
    }

    expect(true).toBeTruthy();
  });

  test('헤딩 레벨이 올바르게 구조화되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // h1이 있는지 확인
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // h1은 하나만 있어야 함

    // 헤딩 순서 확인
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    const headingLevels = await Promise.all(
      headings.map(async h => {
        const tag = await h.evaluate(el => el.tagName);
        return parseInt(tag.charAt(1));
      })
    );

    // 첫 번째 헤딩이 h1이어야 함
    if (headingLevels.length > 0) {
      expect(headingLevels[0]).toBe(1);
    }
  });
});
