import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');

    // 페이지 제목 확인 (브라우저 탭 제목)
    await expect(page).toHaveTitle(/다낭 여행 트래커/);

    // 주요 요소가 로드되었는지 확인 (페이지 내 h1 헤더)
    await expect(page.locator('h1').filter({ hasText: '훈재의 여행 계획표' })).toBeVisible({ timeout: 10000 });
  });

  test('should display countdown or travel status', async ({ page }) => {
    await page.goto('/');

    // 카운트다운 또는 여행 상태가 표시되는지 확인
    const hasCountdown = await page.locator('text=/일|시간|분|초/').count() > 0;
    const hasTravelStatus = await page.locator('text=/진행|완료|예정/').count() > 0;

    expect(hasCountdown || hasTravelStatus).toBeTruthy();
  });

  test('should have working bottom navigation', async ({ page }) => {
    await page.goto('/');

    // 하단 네비게이션이 표시되는지 확인
    const navButtons = page.locator('nav button, nav a');
    await expect(navButtons.first()).toBeVisible({ timeout: 5000 });

    // 네비게이션 버튼 개수 확인 (홈, 일정, 지도, 사진, 설정)
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Map Page', () => {
  test('should navigate to map page', async ({ page }) => {
    await page.goto('/');

    // 하단 네비게이션 버튼 로드 대기
    await page.waitForTimeout(2000);

    // 하단 네비게이션의 지도 버튼 찾기 (네비게이션 내부의 버튼만 선택)
    const mapButton = page.locator('nav button, nav a').getByText('지도');

    // 버튼이 존재하고 클릭 가능한지 확인
    await expect(mapButton).toBeVisible({ timeout: 5000 });
    await mapButton.click();

    // 지도 페이지 로드 대기
    await page.waitForTimeout(2000);

    // 지도 페이지 헤더 확인
    await expect(page.locator('h1').filter({ hasText: '여행 지도' })).toBeVisible();
  });
});

test.describe('Amenities Feature', () => {
  test('should display amenities button on map page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // 지도 페이지로 이동
    const mapButton = page.locator('nav button, nav a').getByText('지도');
    await expect(mapButton).toBeVisible({ timeout: 5000 });
    await mapButton.click();
    await page.waitForTimeout(2000);

    // 편의시설 버튼 확인 (정확한 텍스트로 검색)
    const amenitiesButton = page.getByRole('button', { name: /편의시설 보기|편의시설 숨기기/ });
    await expect(amenitiesButton).toBeVisible({ timeout: 5000 });

    // 편의시설 버튼 클릭 테스트
    await amenitiesButton.click();
    await page.waitForTimeout(1000);

    // 버튼 텍스트가 변경되었는지 확인
    await expect(page.getByRole('button', { name: /편의시설 숨기기/ })).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 페이지가 정상적으로 로드되는지 확인 (h1 태그로 특정)
    await expect(page.locator('h1').filter({ hasText: '훈재의 여행 계획표' })).toBeVisible({ timeout: 10000 });

    // 하단 네비게이션이 모바일에서도 표시되는지 확인
    const navButtons = page.locator('nav button, nav a');
    await expect(navButtons.first()).toBeVisible({ timeout: 5000 });
  });
});
