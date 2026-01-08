import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정
 *
 * 배포된 사이트와 로컬 개발 서버 모두 테스트 가능하도록 설정
 *
 * 사용법:
 * - 배포 사이트 테스트: npm test (기본)
 * - 로컬 서버 테스트: PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npm test
 */
export default defineConfig({
  testDir: './tests',

  /* 병렬 실행 */
  fullyParallel: true,

  /* CI 환경에서는 test.only 금지 */
  forbidOnly: !!process.env.CI,

  /* CI에서만 재시도 */
  retries: process.env.CI ? 2 : 0,

  /* CI에서는 단일 워커 */
  workers: process.env.CI ? 1 : undefined,

  /* 리포터 설정 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  /* 공통 설정 */
  use: {
    /* 베이스 URL - 환경변수로 오버라이드 가능 */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://hoonjae-danang-travel.vercel.app',

    /* 실패 시 trace 수집 */
    trace: 'on-first-retry',

    /* 실패 시 스크린샷 */
    screenshot: 'only-on-failure',

    /* 타임아웃 설정 */
    actionTimeout: 10000,
    navigationTimeout: 30000,

    /* 위치 권한 자동 허용 (모달 방지) */
    permissions: ['geolocation'],
    geolocation: { latitude: 16.0544, longitude: 108.2022 }, // 다낭 좌표
  },

  /* 브라우저별 프로젝트 */
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'mobile-chrome',
      use: {
        ...devices['iPhone 12'],
      },
    },

    // 추가 브라우저 (필요 시 활성화)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* 로컬 개발 서버 (옵션 - 필요 시 활성화) */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: true,
  //   timeout: 120000,
  // },
});
