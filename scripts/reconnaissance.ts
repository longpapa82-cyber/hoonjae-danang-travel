/**
 * 실제 배포된 사이트의 DOM 구조를 파악하는 reconnaissance 스크립트
 */

import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 배포된 사이트 접속
    console.log('🌐 배포 사이트 접속 중...');
    await page.goto('https://hoonjae-danang-travel.vercel.app/');
    await page.waitForLoadState('networkidle');

    console.log('✅ 페이지 로드 완료');

    // 1. 페이지 타이틀 확인
    const title = await page.title();
    console.log(`\n📄 페이지 타이틀: ${title}`);

    // 2. 전체 페이지 스크린샷
    console.log('\n📸 스크린샷 촬영 중...');
    await page.screenshot({ path: '/tmp/site-full.png', fullPage: true });
    console.log('   저장: /tmp/site-full.png');

    // 3. 주요 헤더 요소 확인
    console.log('\n🔍 헤더 요소 탐색:');
    const h1Elements = await page.locator('h1').all();
    for (let i = 0; i < h1Elements.length; i++) {
      const text = await h1Elements[i].textContent();
      console.log(`   H1[${i}]: ${text}`);
    }

    // 4. 하단 네비게이션 버튼 확인
    console.log('\n🧭 네비게이션 버튼 탐색:');
    const buttons = await page.locator('button').all();
    console.log(`   총 버튼 개수: ${buttons.length}`);
    for (let i = 0; i < Math.min(buttons.length, 15); i++) {
      const text = await buttons[i].textContent();
      const ariaLabel = await buttons[i].getAttribute('aria-label');
      const role = await buttons[i].getAttribute('role');
      console.log(`   Button[${i}]: text='${text?.trim()}', aria-label='${ariaLabel}', role='${role}'`);
    }

    // 5. 모바일 뷰포트로 변경하여 확인
    console.log('\n📱 모바일 뷰포트로 변경 (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/site-mobile.png', fullPage: true });
    console.log('   저장: /tmp/site-mobile.png');

    // 6. 탭 네비게이션 시도
    console.log('\n🔄 탭 전환 테스트:');
    console.log('   현재: 홈 탭');

    // 지도 탭 클릭 시도 (다양한 셀렉터 시도)
    const selectorsToTry = [
      'button:has-text("지도")',
      'button[aria-label*="지도"]',
      '[role="tab"]:has-text("지도")',
      'button >> text=/지도/i',
    ];

    for (const selector of selectorsToTry) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`   ✅ 발견: ${selector} (${count}개)`);
          await page.locator(selector).first().click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: '/tmp/site-map-tab.png' });
          console.log('      지도 탭 클릭 성공, 스크린샷: /tmp/site-map-tab.png');
          break;
        }
      } catch (e: any) {
        console.log(`   ❌ 실패: ${selector} - ${e.message}`);
      }
    }

    // 7. 모든 링크와 이미지 확인
    console.log('\n🔗 링크 개수:', await page.locator('a').count());
    console.log('🖼️  이미지 개수:', await page.locator('img').count());

    // 8. data-testid 속성 확인
    console.log('\n🏷️  data-testid 속성 확인:');
    const elementsWithTestId = await page.locator('[data-testid]').all();
    if (elementsWithTestId.length > 0) {
      console.log(`   발견된 data-testid: ${elementsWithTestId.length}개`);
      for (let i = 0; i < Math.min(elementsWithTestId.length, 10); i++) {
        const testId = await elementsWithTestId[i].getAttribute('data-testid');
        console.log(`   - ${testId}`);
      }
    } else {
      console.log('   ⚠️  data-testid 속성이 없습니다. 테스트 ID 추가 필요!');
    }

    // 9. 클래스명 패턴 분석 (Tailwind CSS)
    console.log('\n🎨 클래스명 패턴 분석:');
    const bodyClass = await page.locator('body').getAttribute('class');
    console.log(`   Body 클래스: ${bodyClass}`);

    const mainDiv = await page.locator('div').first().getAttribute('class');
    console.log(`   첫 번째 div 클래스: ${mainDiv}`);

    // 10. 콘솔 로그 수집
    console.log('\n📝 브라우저 콘솔 로그:');
    page.on('console', msg => console.log(`   [${msg.type()}] ${msg.text()}`));

    // 11. 실제 DOM 구조 샘플 출력
    console.log('\n🏗️  주요 DOM 구조:');
    const mainContent = await page.locator('main, [role="main"], body > div').first().innerHTML();
    console.log(mainContent.substring(0, 1000));
    console.log('   ...');

    console.log('\n✅ Reconnaissance 완료!');
    console.log('📊 결과:');
    console.log('   - 전체 스크린샷: /tmp/site-full.png');
    console.log('   - 모바일 스크린샷: /tmp/site-mobile.png');
    console.log('   - 지도 탭 스크린샷: /tmp/site-map-tab.png');
    console.log('\n💡 다음 단계:');
    console.log('   1. data-testid 속성 추가 필요');
    console.log('   2. 실제 셀렉터 기반으로 테스트 코드 작성');
    console.log('   3. 스크린샷으로 시각적 확인');

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
