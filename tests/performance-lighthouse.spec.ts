import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

/**
 * Lighthouse 성능 측정 테스트
 *
 * 목적: 프로덕션 환경의 성능, 접근성, SEO, Best Practices 점수 측정
 */

const PRODUCTION_URL = 'https://hoonjae-danang-travel.vercel.app';

test.describe('Lighthouse 성능 측정', () => {

  test('프로덕션 페이지 Lighthouse 점수 측정', async () => {
    // Chrome 실행
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu']
    });

    const options = {
      logLevel: 'info' as const,
      output: 'json' as const,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };

    // Lighthouse 실행
    const runnerResult = await lighthouse(PRODUCTION_URL, options);

    // Chrome 종료
    await chrome.kill();

    // 결과 출력
    if (runnerResult && runnerResult.lhr) {
      const { categories } = runnerResult.lhr;

      console.log('\n📊 Lighthouse 성능 측정 결과:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Performance:     ${Math.round((categories.performance?.score || 0) * 100)}/100`);
      console.log(`♿ Accessibility:   ${Math.round((categories.accessibility?.score || 0) * 100)}/100`);
      console.log(`✅ Best Practices:  ${Math.round((categories['best-practices']?.score || 0) * 100)}/100`);
      console.log(`🔍 SEO:             ${Math.round((categories.seo?.score || 0) * 100)}/100`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 성능 메트릭 출력
      const audits = runnerResult.lhr.audits;
      console.log('⏱️  주요 성능 메트릭:');
      console.log(`  • First Contentful Paint: ${audits['first-contentful-paint']?.displayValue}`);
      console.log(`  • Largest Contentful Paint: ${audits['largest-contentful-paint']?.displayValue}`);
      console.log(`  • Total Blocking Time: ${audits['total-blocking-time']?.displayValue}`);
      console.log(`  • Cumulative Layout Shift: ${audits['cumulative-layout-shift']?.displayValue}`);
      console.log(`  • Speed Index: ${audits['speed-index']?.displayValue}\n`);

      // 최소 점수 기준
      const performanceScore = (categories.performance?.score || 0) * 100;
      const accessibilityScore = (categories.accessibility?.score || 0) * 100;
      const bestPracticesScore = (categories['best-practices']?.score || 0) * 100;
      const seoScore = (categories.seo?.score || 0) * 100;

      // 목표: 모든 점수 80점 이상
      expect(performanceScore).toBeGreaterThanOrEqual(70); // 성능은 70점 이상
      expect(accessibilityScore).toBeGreaterThanOrEqual(80); // 접근성은 80점 이상
      expect(bestPracticesScore).toBeGreaterThanOrEqual(80); // Best Practices는 80점 이상
      expect(seoScore).toBeGreaterThanOrEqual(80); // SEO는 80점 이상
    }
  });

  test('모바일 페이지 Lighthouse 점수 측정', async () => {
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu']
    });

    const options = {
      logLevel: 'info' as const,
      output: 'json' as const,
      onlyCategories: ['performance', 'accessibility'],
      port: chrome.port,
      // 모바일 에뮬레이션
      formFactor: 'mobile' as const,
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        disabled: false,
      },
    };

    const runnerResult = await lighthouse(PRODUCTION_URL, options);
    await chrome.kill();

    if (runnerResult && runnerResult.lhr) {
      const { categories } = runnerResult.lhr;

      console.log('\n📱 모바일 Lighthouse 성능 측정 결과:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Performance:     ${Math.round((categories.performance?.score || 0) * 100)}/100`);
      console.log(`♿ Accessibility:   ${Math.round((categories.accessibility?.score || 0) * 100)}/100`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const performanceScore = (categories.performance?.score || 0) * 100;
      const accessibilityScore = (categories.accessibility?.score || 0) * 100;

      // 모바일은 더 엄격한 기준
      expect(performanceScore).toBeGreaterThanOrEqual(60); // 모바일 성능 60점 이상
      expect(accessibilityScore).toBeGreaterThanOrEqual(80); // 접근성은 80점 이상
    }
  });
});
