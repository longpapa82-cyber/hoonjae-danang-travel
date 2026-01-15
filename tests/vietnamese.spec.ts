import { test, expect } from '@playwright/test';

test.describe('베트남어 표현 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test('베트남어 탭이 표시되고 클릭 가능', async ({ page }) => {
    // 베트남어 탭 찾기
    const vietnameseTab = page.getByRole('tab', { name: /베트남어/ });

    // 탭이 표시되는지 확인
    await expect(vietnameseTab).toBeVisible();

    // 탭 클릭
    await vietnameseTab.click();

    // 베트남어 페이지 헤더 확인
    await expect(page.getByRole('heading', { name: '베트남어 표현' })).toBeVisible();
  });

  test('카테고리 그리드가 9개 표시됨', async ({ page }) => {
    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // 카테고리 헤더 확인
    await expect(page.getByRole('heading', { name: '카테고리' })).toBeVisible();

    // 9개 카테고리 버튼 확인
    const categoryButtons = page.getByRole('button').filter({ hasText: /인사|식당|쇼핑|교통|긴급|숙소|길|숫자|기본/ });

    // 최소 9개의 카테고리가 있는지 확인
    const count = await categoryButtons.count();
    expect(count).toBeGreaterThanOrEqual(9);
  });

  test('검색 바가 표시되고 입력 가능', async ({ page }) => {
    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // 검색 입력창 찾기
    const searchInput = page.getByRole('textbox', { name: /베트남어 표현 검색/ });

    // 검색창 표시 확인
    await expect(searchInput).toBeVisible();

    // 검색어 입력
    await searchInput.fill('안녕');

    // 입력된 값 확인
    await expect(searchInput).toHaveValue('안녕');

    // 검색 결과 대기 (debounce 300ms)
    await page.waitForTimeout(500);

    // 검색 결과 헤더 확인
    await expect(page.getByRole('heading', { name: /검색 결과/ })).toBeVisible();
  });

  test('검색 기능이 작동함', async ({ page }) => {
    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // 검색어 입력
    const searchInput = page.getByRole('textbox', { name: /베트남어 표현 검색/ });
    await searchInput.fill('감사');

    // 검색 결과 대기
    await page.waitForTimeout(500);

    // 검색 결과에 "감사합니다" 또는 "Cảm ơn" 포함 확인
    const searchResults = page.locator('article').filter({ hasText: /감사|Cảm ơn/ });
    await expect(searchResults.first()).toBeVisible();
  });

  test('검색어 지우기 버튼이 작동함', async ({ page }) => {
    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // 검색어 입력
    const searchInput = page.getByRole('textbox', { name: /베트남어 표현 검색/ });
    await searchInput.fill('안녕');

    // 지우기 버튼 클릭
    const clearButton = page.getByRole('button', { name: /검색어 지우기/ });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // 입력창이 비워졌는지 확인
    await expect(searchInput).toHaveValue('');

    // 카테고리 그리드가 다시 표시되는지 확인
    await expect(page.getByRole('heading', { name: '카테고리' })).toBeVisible();
  });

  test('카테고리 클릭 시 바텀시트가 열림', async ({ page }) => {
    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // "인사" 카테고리 클릭
    const greetingCategory = page.getByRole('button', { name: /인사 카테고리/ });
    await greetingCategory.click();

    // 바텀시트 다이얼로그 확인
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 바텀시트 제목 확인
    await expect(dialog.getByRole('heading', { name: /인사/ })).toBeVisible();

    // 표현 카드가 표시되는지 확인
    const phraseCards = dialog.locator('article');
    const cardCount = await phraseCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('바텀시트 닫기 버튼이 작동함', async ({ page }) => {
    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // 카테고리 클릭
    await page.getByRole('button', { name: /인사 카테고리/ }).click();

    // 다이얼로그 표시 확인
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 닫기 버튼 클릭
    const closeButton = dialog.getByRole('button', { name: /닫기/ });
    await closeButton.click();

    // 다이얼로그가 사라졌는지 확인
    await expect(dialog).not.toBeVisible();
  });

  test('즐겨찾기 버튼이 작동함', async ({ page }) => {
    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // "인사" 카테고리 열기
    await page.getByRole('button', { name: /인사 카테고리/ }).click();

    // 다이얼로그 내에서 첫 번째 표현 카드 찾기
    const dialog = page.getByRole('dialog');
    const firstPhraseCard = dialog.locator('article').first();

    // 즐겨찾기 버튼 클릭
    const favoriteButton = firstPhraseCard.getByRole('button', { name: /즐겨찾기/ }).first();
    await favoriteButton.click();

    // 별 아이콘이 채워졌는지 확인 (색상 변경)
    // localStorage에 저장되었는지 확인
    const favorites = await page.evaluate(() => {
      const stored = localStorage.getItem('vietnameseFavorites');
      return stored ? JSON.parse(stored) : null;
    });

    expect(favorites).not.toBeNull();
    expect(favorites.phraseIds).toBeDefined();
    expect(favorites.phraseIds.length).toBeGreaterThan(0);
  });

  test('즐겨찾기 목록이 표시됨', async ({ page }) => {
    // localStorage에 즐겨찾기 추가
    await page.evaluate(() => {
      localStorage.setItem('vietnameseFavorites', JSON.stringify({
        phraseIds: ['greet-1', 'rest-1'],
        updatedAt: new Date().toISOString()
      }));
    });

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // 즐겨찾기 헤더 확인
    await expect(page.getByRole('heading', { name: /즐겨찾기/ })).toBeVisible();

    // 즐겨찾기 카드가 표시되는지 확인
    const favoriteCards = page.locator('article').filter({ hasText: /Xin chào|Cho tôi/ });
    const count = await favoriteCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('표현 카드에 모든 정보가 표시됨', async ({ page }) => {
    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // "인사" 카테고리 열기
    await page.getByRole('button', { name: /인사 카테고리/ }).click();

    // 다이얼로그 내 첫 번째 표현 카드
    const dialog = page.getByRole('dialog');
    const firstCard = dialog.locator('article').first();

    // 한국어 텍스트 확인
    await expect(firstCard.getByRole('heading')).toBeVisible();

    // 베트남어 텍스트 확인 (Xin chào 등)
    await expect(firstCard).toContainText(/Xin|Cảm|Tạm/);

    // 발음 정보 확인
    await expect(firstCard).toContainText(/발음:/);
  });

  test('다크모드에서도 정상 작동', async ({ page }) => {
    // 다크모드 활성화
    await page.emulateMedia({ colorScheme: 'dark' });

    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // 페이지가 정상적으로 표시되는지 확인
    await expect(page.getByRole('heading', { name: '베트남어 표현' })).toBeVisible();

    // 카테고리 그리드 확인
    await expect(page.getByRole('heading', { name: '카테고리' })).toBeVisible();
  });

  test('모바일 뷰포트에서도 정상 작동', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    // 베트남어 탭 클릭
    await page.getByRole('tab', { name: /베트남어/ }).click();

    // 페이지 확인
    await expect(page.getByRole('heading', { name: '베트남어 표현' })).toBeVisible();

    // 카테고리 그리드 확인
    await expect(page.getByRole('heading', { name: '카테고리' })).toBeVisible();

    // 카테고리 클릭
    await page.getByRole('button', { name: /인사 카테고리/ }).click();

    // 바텀시트 확인
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
