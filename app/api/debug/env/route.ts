import { NextResponse } from 'next/server';

/**
 * DEBUG ONLY - 환경 변수 진단 API
 * 프로덕션에서 실제로 어떤 환경 변수가 사용 가능한지 확인
 *
 * ⚠️ 보안: 실제 값은 노출하지 않고, 존재 여부만 확인
 */
export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),

    // 환경 변수 존재 여부 확인
    envVars: {
      OPENWEATHERMAP_API_KEY: {
        exists: !!process.env.OPENWEATHERMAP_API_KEY,
        length: process.env.OPENWEATHERMAP_API_KEY?.length || 0,
        firstChar: process.env.OPENWEATHERMAP_API_KEY?.[0] || 'undefined',
        lastChar: process.env.OPENWEATHERMAP_API_KEY?.slice(-1) || 'undefined',
      },
      NEXT_PUBLIC_DANANG_LAT: {
        exists: !!process.env.NEXT_PUBLIC_DANANG_LAT,
        value: process.env.NEXT_PUBLIC_DANANG_LAT, // Public이므로 안전
      },
      NEXT_PUBLIC_DANANG_LON: {
        exists: !!process.env.NEXT_PUBLIC_DANANG_LON,
        value: process.env.NEXT_PUBLIC_DANANG_LON, // Public이므로 안전
      },
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: {
        exists: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        length: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.length || 0,
      },
    },

    // Next.js 환경 정보
    nextEnv: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
    },

    // 모든 환경 변수 키 목록 (값은 제외)
    allEnvKeys: Object.keys(process.env).filter(key =>
      !key.includes('VERCEL_OIDC') &&
      !key.includes('SECRET') &&
      !key.includes('TOKEN')
    ).sort(),
  };

  return NextResponse.json(envCheck, { status: 200 });
}
