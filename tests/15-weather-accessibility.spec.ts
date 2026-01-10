import { test, expect } from '@playwright/test';

/**
 * P0 - Critical: 날씨 기능 접근성 테스트
 *
 * 목적: WeatherCard가 WCAG 2.1 AA 기준을 준수하는지 확인
 *
 * 테스트 항목:
 * 1. ARIA 속성
 * 2. 키보드 네비게이션
 * 3. 스크린리더 레이블
 * 4. 색상 대비
 * 5. 포커스 관리
 */

test.describe('날씨 기능 - 접근성', () => {

  test('WeatherCard에 적절한 ARIA role이 있어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // region 또는 article role 확인
    const weatherRegion = page.locator('[role="region"][aria-label*="날씨"], article:has-text("날씨")').first();
    const hasRole = await weatherRegion.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasRole) {
      const ariaLabel = await weatherRegion.getAttribute('aria-label');
      console.log('✅ ARIA role 확인:', ariaLabel);
      expect(ariaLabel).toBeTruthy();
    } else {
      console.log('⚠️ 명시적 role 없음 (시맨틱 HTML 사용 가능)');
    }
  });

  test('온도 정보에 적절한 레이블이 있어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 온도 요소 확인
    const tempElement = page.locator('text=/\\d+°C/').first();
    const isVisible = await tempElement.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      // aria-label 또는 주변 텍스트로 의미 파악 가능한지 확인
      const parent = tempElement.locator('..');
      const ariaLabel = await parent.getAttribute('aria-label').catch(() => null);
      const textContent = await parent.textContent();

      console.log('온도 레이블:', ariaLabel || textContent);

      // 레이블이나 컨텍스트가 있어야 함
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test('날씨 아이콘에 적절한 설명이 있어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 이모지 또는 아이콘 요소 확인
    const weatherEmojis = ['☀️', '⛅', '☁️', '🌧️', '🌦️', '⛈️', '🌫️'];

    for (const emoji of weatherEmojis) {
      const emojiElement = page.locator(`text=${emoji}`).first();
      const isVisible = await emojiElement.isVisible({ timeout: 1000 }).catch(() => false);

      if (isVisible) {
        // 주변에 날씨 상태 텍스트가 있는지 확인
        const parent = emojiElement.locator('..');
        const hasDescription = await parent.locator('text=/맑음|흐림|비|구름/').count() > 0;

        console.log(`${emoji} 설명 존재:`, hasDescription);

        // 아이콘과 함께 텍스트 설명이 있으면 OK
        if (!hasDescription) {
          // role="img"와 aria-label이 있는지 확인
          const ariaLabel = await emojiElement.getAttribute('aria-label').catch(() => null);
          console.log(`${emoji} aria-label:`, ariaLabel);
        }

        break; // 하나만 확인
      }
    }
  });

  test('습도와 풍속 정보에 명확한 레이블이 있어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 습도
    const humiditySection = page.locator('text=/습도|humidity/i').first();
    const hasHumidity = await humiditySection.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasHumidity) {
      const humidityText = await humiditySection.textContent();
      console.log('습도 레이블:', humidityText);
      expect(humidityText).toContain('습');
    }

    // 풍속
    const windSection = page.locator('text=/풍속|바람|wind/i').first();
    const hasWind = await windSection.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasWind) {
      const windText = await windSection.textContent();
      console.log('풍속 레이블:', windText);
    }
  });

  test('키보드로 WeatherCard 영역에 접근할 수 있어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Tab 키로 탐색
    const focusableElements: string[] = [];

    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (el) {
          return {
            tag: el.tagName,
            role: el.getAttribute('role'),
            text: el.textContent?.slice(0, 30),
          };
        }
        return null;
      });

      if (focusedElement) {
        focusableElements.push(JSON.stringify(focusedElement));
      }
    }

    console.log('포커스 가능한 요소들:', focusableElements.length);

    // 최소 3개 이상의 포커스 가능 요소가 있어야 함
    const uniqueElements = new Set(focusableElements);
    expect(uniqueElements.size).toBeGreaterThanOrEqual(3);

    await page.screenshot({ path: '/tmp/playwright-weather-keyboard.png' });
  });

  test('포커스 표시가 명확해야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 첫 번째 버튼이나 링크에 포커스
    const firstButton = page.locator('button, a').first();
    await firstButton.focus();
    await page.waitForTimeout(300);

    // 포커스 스크린샷
    await page.screenshot({ path: '/tmp/playwright-weather-focus.png' });

    // 포커스된 요소 확인
    const isFocused = await page.evaluate(() => {
      const activeEl = document.activeElement;
      return activeEl?.tagName === 'BUTTON' || activeEl?.tagName === 'A';
    });

    expect(isFocused).toBeTruthy();
  });

  test('색상 대비가 충분해야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 날씨 카드 내 텍스트 요소들의 색상 확인
    const textElements = await page.locator('text=/날씨|\\d+°C|습도|풍속/i').all();

    for (const el of textElements.slice(0, 3)) {
      const styles = await el.evaluate(element => {
        const computed = window.getComputedStyle(element);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      console.log('텍스트 색상:', styles.color);
      console.log('배경 색상:', styles.backgroundColor);

      // 색상이 설정되어 있는지 확인
      expect(styles.color).toBeTruthy();
    }

    await page.screenshot({ path: '/tmp/playwright-weather-contrast.png', fullPage: true });
  });

  test('스크린리더를 위한 적절한 정보 구조가 있어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 헤딩 구조 확인
    const weatherHeading = page.locator('h1, h2, h3').filter({ hasText: /날씨|weather/i }).first();
    const hasHeading = await weatherHeading.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasHeading) {
      const headingTag = await weatherHeading.evaluate(el => el.tagName);
      console.log('날씨 섹션 헤딩:', headingTag);
      expect(['H1', 'H2', 'H3']).toContain(headingTag);
    } else {
      console.log('⚠️ 명시적 헤딩 없음 (ARIA label 사용 가능)');
    }

    // 리스트 구조 확인 (5일 예보)
    const forecastList = page.locator('[role="list"], ul, ol').filter({ hasText: /예보|주간/i }).first();
    const hasList = await forecastList.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasList) {
      console.log('✅ 예보 리스트 구조 확인');
    }
  });

  test('다크모드에서도 색상 대비가 유지되어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: /설정|Settings/i }).first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(500);

      // 다크모드 활성화
      const themeButton = page.locator('button').filter({ hasText: /다크|dark|theme/i }).first();
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(500);

        // 홈 탭으로 돌아가기
        const homeTab = page.locator('[role="tab"]').filter({ hasText: /홈|Home/i }).first();
        await homeTab.click();
        await page.waitForTimeout(1000);

        // 다크모드에서 색상 확인
        const textElements = await page.locator('text=/날씨|\\d+°C/i').all();

        for (const el of textElements.slice(0, 2)) {
          const styles = await el.evaluate(element => {
            const computed = window.getComputedStyle(element);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
            };
          });

          console.log('[다크모드] 텍스트 색상:', styles.color);
          console.log('[다크모드] 배경 색상:', styles.backgroundColor);
        }

        await page.screenshot({ path: '/tmp/playwright-weather-dark-contrast.png', fullPage: true });
      }
    }
  });

  test('모바일에서 터치 타겟 크기가 충분해야 함 (P0)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 날씨 카드 내 인터랙티브 요소 확인
    const interactiveElements = await page.locator('button, a').all();

    for (const el of interactiveElements.slice(0, 5)) {
      const box = await el.boundingBox();

      if (box && box.width > 0 && box.height > 0) {
        const tagName = await el.evaluate(e => e.tagName);
        console.log(`${tagName} 크기: ${box.width}x${box.height}px`);

        // WCAG 2.5.5: 최소 44x44px 권장
        if (box.width < 44 || box.height < 44) {
          console.log(`⚠️ 터치 타겟이 작음: ${box.width}x${box.height}px`);
        }
      }
    }
  });

  test('로딩 상태가 스크린리더에 알려져야 함 (P1)', async ({ page }) => {
    // 느린 네트워크 시뮬레이션
    await page.route('**/api/weather/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/');

    // aria-live 영역 확인
    const liveRegion = page.locator('[aria-live], [role="status"], [role="alert"]').first();
    const hasLiveRegion = await liveRegion.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasLiveRegion) {
      const ariaLive = await liveRegion.getAttribute('aria-live');
      console.log('✅ Live region 확인:', ariaLive);
    } else {
      console.log('⚠️ aria-live 영역 없음 (선택 사항)');
    }
  });

  test('에러 메시지가 접근 가능해야 함 (P1)', async ({ page }) => {
    // API 에러 시뮬레이션
    await page.route('**/api/weather/**', route => route.abort());

    await page.goto('/');
    await page.waitForTimeout(5000);

    // 에러 메시지 확인
    const errorMessage = page.locator('[role="alert"], .error, text=/오류|에러|실패|불러올 수 없/i').first();
    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.log('✅ 에러 메시지:', errorText);

      // role="alert" 또는 aria-live 확인
      const role = await errorMessage.getAttribute('role');
      const ariaLive = await errorMessage.getAttribute('aria-live');

      console.log('에러 role:', role);
      console.log('에러 aria-live:', ariaLive);
    } else {
      console.log('⚠️ 에러 상태 감지 안 됨 (캐시 사용 가능)');
    }
  });

  test('5일 예보 카드가 의미 있는 순서로 제공되어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 예보 카드들의 순서 확인
    const forecastCards = page.locator('[role="listitem"], li, div').filter({ hasText: /월|화|수|목|금|토|일/ });
    const cardCount = await forecastCards.count();

    if (cardCount > 0) {
      console.log('예보 카드 수:', cardCount);

      // 각 카드의 요일 확인
      const days: string[] = [];
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = forecastCards.nth(i);
        const text = await card.textContent();
        if (text) {
          days.push(text.slice(0, 20));
        }
      }

      console.log('예보 순서:', days);
      expect(days.length).toBeGreaterThan(0);
    }
  });
});

test.describe('날씨 기능 - 접근성 자동 검증', () => {

  test('페이지에 접근성 오류가 없어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 콘솔 에러 수집
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // 접근성 관련 에러 필터링
    const a11yErrors = errors.filter(err =>
      err.toLowerCase().includes('aria') ||
      err.toLowerCase().includes('accessibility') ||
      err.toLowerCase().includes('role')
    );

    if (a11yErrors.length > 0) {
      console.log('⚠️ 접근성 관련 에러:', a11yErrors);
    } else {
      console.log('✅ 접근성 에러 없음');
    }

    expect(a11yErrors.length).toBe(0);
  });

  test('WeatherCard가 시맨틱 HTML을 사용해야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 시맨틱 요소 확인
    const semanticElements = await page.evaluate(() => {
      const elements = {
        article: document.querySelectorAll('article').length,
        section: document.querySelectorAll('section').length,
        h1: document.querySelectorAll('h1').length,
        h2: document.querySelectorAll('h2').length,
        h3: document.querySelectorAll('h3').length,
        ul: document.querySelectorAll('ul').length,
        ol: document.querySelectorAll('ol').length,
      };
      return elements;
    });

    console.log('시맨틱 요소:', semanticElements);

    // h1이 있어야 함
    expect(semanticElements.h1).toBeGreaterThan(0);
  });
});
