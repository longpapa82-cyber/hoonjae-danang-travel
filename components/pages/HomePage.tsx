'use client';

import { memo } from 'react';
import { CurrentLocationCard } from '@/components/CurrentLocationCard';
import { RouteInfoCard } from '@/components/RouteInfoCard';
import { TravelProgress } from '@/components/TravelProgress';
import dynamic from 'next/dynamic';
import { Map, Cloud } from 'lucide-react';

// 동적 import로 MapView 로드 (초기 로드 성능 개선)
const MapView = dynamic(() => import('@/components/MapView').then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <Map className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse" />
        <p className="text-gray-500">지도 로딩 중...</p>
      </div>
    </div>
  ),
});

// 동적 import로 WeatherCard 로드 (초기 로드 성능 개선)
const WeatherCard = dynamic(() => import('@/components/WeatherCard').then(mod => ({ default: mod.WeatherCard })), {
  ssr: false,
  loading: () => (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 shadow-lg border border-blue-100">
      <div className="flex items-center justify-center gap-3 py-8">
        <Cloud className="w-5 h-5 text-blue-500 animate-pulse" />
        <p className="text-gray-600">날씨 정보 로딩 중...</p>
      </div>
    </div>
  ),
});

// React.memo로 불필요한 리렌더링 방지
export const HomePage = memo(function HomePage() {
  return (
    <>
      {/* 다낭 날씨 */}
      <div className="mb-6">
        <WeatherCard />
      </div>

      {/* 현재 위치 카드 */}
      <div className="mb-6">
        <CurrentLocationCard />
      </div>

      {/* 실시간 경로 안내 */}
      <div className="mb-6">
        <RouteInfoCard />
      </div>

      {/* 지도 */}
      <div className="mb-6">
        <MapView />
      </div>

      {/* 여행 진행 상황 */}
      <div className="mb-24">
        <TravelProgress />
      </div>
    </>
  );
});
