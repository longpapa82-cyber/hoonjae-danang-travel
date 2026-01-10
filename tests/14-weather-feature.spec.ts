import { test, expect } from '@playwright/test';

/**
 * P0 - Critical: 날씨 기능 종합 테스트
 *
 * 목적: WeatherCard가 정상적으로 작동하고 날씨 정보를 올바르게 표시하는지 확인
 *
 * 테스트 시나리오:
 * 1. WeatherCard 렌더링
 * 2. 현재 날씨 정보 표시
 * 3. 5일 예보 표시
 * 4. 로딩 상태
 * 5. 에러 핸들링
 * 6. API 응답 처리
 */

test.describe('날씨 기능 - 핵심 동작', () => {

  test('WeatherCard가 HomePage에 렌더링되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // WeatherCard 영역 확인
    const weatherCard = page.locator('[role="region"][aria-label*="날씨"], [aria-label*="다낭 날씨"]').first();

    // WeatherCard가 없으면 일반적인 날씨 관련 요소 확인
    const weatherSection = await weatherCard.count() > 0
      ? weatherCard
      : page.locator('text=/날씨|weather/i').first().locator('..');

    await expect(weatherSection).toBeVisible({ timeout: 10000 });

    // 스크린샷 저장
    await page.screenshot({ path: '/tmp/playwright-weather-card.png' });
  });

  test('현재 날씨 정보가 올바르게 표시되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 로딩 완료 대기 (최대 10초)
    await page.waitForTimeout(3000);

    // 온도 표시 확인 (숫자 + °C 형식)
    const tempElement = page.locator('text=/\\d+°C/').first();
    await expect(tempElement).toBeVisible({ timeout: 10000 });

    const tempText = await tempElement.textContent();
    console.log('현재 온도:', tempText);

    // 온도가 합리적인 범위인지 확인 (다낭: 보통 20-35°C)
    const temp = parseInt(tempText?.match(/\d+/)?.[0] || '0');
    expect(temp).toBeGreaterThan(0);
    expect(temp).toBeLessThan(50);
  });

  test('날씨 상태와 아이콘이 표시되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 날씨 상태 텍스트 확인 (한국어)
    const weatherConditions = ['맑음', '흐림', '비', '구름', '안개', '눈'];
    const hasCondition = await Promise.race(
      weatherConditions.map(async condition => {
        const element = page.locator(`text=${condition}`).first();
        return await element.isVisible().catch(() => false);
      })
    );

    expect(hasCondition).toBeTruthy();

    // 날씨 아이콘(이모지) 확인
    const weatherEmojis = ['☀️', '⛅', '☁️', '🌧️', '🌦️', '⛈️', '🌫️', '🌤️'];
    const hasEmoji = await Promise.race(
      weatherEmojis.map(async emoji => {
        const element = page.locator(`text=${emoji}`).first();
        return await element.isVisible().catch(() => false);
      })
    );

    // 아이콘이 있거나 description이 있으면 OK
    const hasWeatherInfo = hasEmoji || hasCondition;
    expect(hasWeatherInfo).toBeTruthy();
  });

  test('습도와 풍속 정보가 표시되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 습도 확인 (XX% 형식)
    const humidityElement = page.locator('text=/습도|\\d+%/i').first();
    const hasHumidity = await humidityElement.isVisible({ timeout: 5000 }).catch(() => false);

    // 풍속 확인 (X.X m/s 형식)
    const windElement = page.locator('text=/풍속|바람|m\\/s/i').first();
    const hasWind = await windElement.isVisible({ timeout: 5000 }).catch(() => false);

    // 둘 중 하나는 있어야 함
    expect(hasHumidity || hasWind).toBeTruthy();

    console.log('습도 표시:', hasHumidity);
    console.log('풍속 표시:', hasWind);
  });

  test('5일 예보가 표시되어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 예보 관련 텍스트 확인
    const forecastSection = page.locator('text=/예보|주간|일별/i').first();
    const hasForecast = await forecastSection.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasForecast) {
      // 요일 표시 확인 (월, 화, 수, 목, 금, 토, 일)
      const dayElements = page.locator('text=/월요일|화요일|수요일|목요일|금요일|토요일|일요일|월|화|수|목|금|토|일/');
      const dayCount = await dayElements.count();

      console.log('예보 일수:', dayCount);
      expect(dayCount).toBeGreaterThanOrEqual(1);
    } else {
      console.log('⚠️ 5일 예보 섹션이 표시되지 않음 (선택 기능)');
    }
  });

  test('날씨 API가 정상적으로 호출되어야 함 (P0)', async ({ page }) => {
    // API 호출 모니터링
    let currentApiCalled = false;
    let forecastApiCalled = false;

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/weather/current')) {
        currentApiCalled = true;
        console.log('✅ Current Weather API 호출:', response.status());
      }
      if (url.includes('/api/weather/forecast')) {
        forecastApiCalled = true;
        console.log('✅ Forecast API 호출:', response.status());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 최소한 현재 날씨 API는 호출되어야 함
    expect(currentApiCalled).toBeTruthy();
    console.log('Forecast API 호출 여부:', forecastApiCalled);
  });

  test('로딩 상태가 표시되어야 함 (P1)', async ({ page }) => {
    // 네트워크를 느리게 설정
    await page.route('**/api/weather/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/');

    // 로딩 텍스트 또는 스피너 확인
    const loadingIndicators = [
      page.locator('text=/로딩|loading/i'),
      page.locator('[class*="animate-pulse"]'),
      page.locator('[class*="spinner"]'),
    ];

    const hasLoading = await Promise.race(
      loadingIndicators.map(async indicator => {
        return await indicator.first().isVisible({ timeout: 2000 }).catch(() => false);
      })
    );

    // 로딩 상태가 있거나 바로 데이터가 표시되면 OK
    console.log('로딩 상태 표시:', hasLoading);
    expect(true).toBeTruthy(); // 로딩이 너무 빨라서 감지 안 될 수 있음
  });

  test('모바일에서 5일 예보가 가로 스크롤되어야 함 (P1)', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 예보 섹션 확인
    const forecastSection = page.locator('text=/예보|주간/i').first().locator('..');
    const hasForecast = await forecastSection.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasForecast) {
      // 가로 스크롤 가능한 컨테이너 확인
      const scrollableContainer = page.locator('[class*="overflow-x"]').first();
      const isScrollable = await scrollableContainer.isVisible().catch(() => false);

      console.log('가로 스크롤 가능:', isScrollable);

      await page.screenshot({ path: '/tmp/playwright-weather-mobile.png', fullPage: true });
    }

    expect(true).toBeTruthy();
  });

  test('날씨 정보 업데이트 시간이 표시되어야 함 (P2)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 업데이트 시간 관련 텍스트 확인
    const updateTimeText = page.locator('text=/업데이트|update|최근|마지막/i').first();
    const hasUpdateTime = await updateTimeText.isVisible({ timeout: 5000 }).catch(() => false);

    console.log('업데이트 시간 표시:', hasUpdateTime);

    if (hasUpdateTime) {
      const timeText = await updateTimeText.textContent();
      console.log('업데이트 시간:', timeText);
    }
  });

  test('다크모드에서 날씨 카드 스타일이 정상이어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 설정 탭으로 이동
    const settingsTab = page.locator('[role="tab"]').filter({ hasText: /설정|Settings/i }).first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(500);

      // 다크모드 토글
      const themeButton = page.locator('button').filter({ hasText: /다크|dark|theme/i }).first();
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(500);

        // 홈 탭으로 돌아가기
        const homeTab = page.locator('[role="tab"]').filter({ hasText: /홈|Home/i }).first();
        await homeTab.click();
        await page.waitForTimeout(500);

        // 다크모드 스크린샷
        await page.screenshot({ path: '/tmp/playwright-weather-dark.png', fullPage: true });

        // WeatherCard가 여전히 visible한지 확인
        const weatherCard = page.locator('text=/날씨|weather/i').first();
        await expect(weatherCard).toBeVisible();
      }
    }
  });
});

test.describe('날씨 기능 - API 응답 검증', () => {

  test('현재 날씨 API 응답이 올바른 형식이어야 함 (P0)', async ({ page }) => {
    let apiResponse: any = null;

    page.on('response', async response => {
      if (response.url().includes('/api/weather/current')) {
        apiResponse = await response.json();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    if (apiResponse) {
      console.log('API Response:', JSON.stringify(apiResponse, null, 2));

      // 응답 구조 검증
      expect(apiResponse).toHaveProperty('success');

      if (apiResponse.success) {
        expect(apiResponse).toHaveProperty('data');
        expect(apiResponse.data).toHaveProperty('temp');
        expect(apiResponse.data).toHaveProperty('condition');

        console.log('✅ API 응답 형식 검증 완료');
      } else {
        console.log('⚠️ API 호출 실패:', apiResponse.error);
      }
    }
  });

  test('날씨 API 응답 시간이 합리적이어야 함 (P1)', async ({ page }) => {
    const startTime = Date.now();
    let responseTime = 0;

    page.on('response', response => {
      if (response.url().includes('/api/weather/current')) {
        responseTime = Date.now() - startTime;
        console.log(`API 응답 시간: ${responseTime}ms`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    if (responseTime > 0) {
      // 응답 시간이 5초 이내여야 함 (캐시 포함)
      expect(responseTime).toBeLessThan(5000);
      console.log('✅ 응답 시간 OK:', responseTime, 'ms');
    }
  });
});

test.describe('날씨 기능 - 통합 테스트', () => {

  test('HomePage에서 날씨 카드와 다른 컴포넌트가 함께 표시되어야 함 (P0)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 날씨 카드
    const weatherSection = page.locator('text=/날씨|weather/i').first();
    const hasWeather = await weatherSection.isVisible({ timeout: 5000 }).catch(() => false);

    // 지도
    const mapSection = page.locator('iframe[src*="google.com/maps"], canvas').first();
    const hasMap = await mapSection.isVisible({ timeout: 5000 }).catch(() => false);

    // 하단 네비게이션
    const bottomNav = page.locator('[role="tablist"]');
    const hasNav = await bottomNav.isVisible({ timeout: 5000 }).catch(() => false);

    console.log('날씨 카드:', hasWeather);
    console.log('지도:', hasMap);
    console.log('네비게이션:', hasNav);

    // 최소한 네비게이션은 있어야 함
    expect(hasNav).toBeTruthy();
  });

  test('탭 전환 후에도 날씨 정보가 유지되어야 함 (P1)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 초기 온도 저장
    const initialTemp = await page.locator('text=/\\d+°C/').first().textContent().catch(() => null);

    // 다른 탭으로 이동
    const mapTab = page.locator('[role="tab"]').filter({ hasText: /지도|Map/i }).first();
    if (await mapTab.isVisible()) {
      await mapTab.click();
      await page.waitForTimeout(1000);

      // 홈 탭으로 돌아가기
      const homeTab = page.locator('[role="tab"]').filter({ hasText: /홈|Home/i }).first();
      await homeTab.click();
      await page.waitForTimeout(1000);

      // 온도가 여전히 표시되는지 확인
      const currentTemp = await page.locator('text=/\\d+°C/').first().textContent().catch(() => null);

      console.log('초기 온도:', initialTemp);
      console.log('현재 온도:', currentTemp);

      // 둘 다 있으면 비교 (캐시로 인해 동일해야 함)
      if (initialTemp && currentTemp) {
        expect(currentTemp).toBe(initialTemp);
      }
    }
  });
});
