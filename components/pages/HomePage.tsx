'use client';

import { CurrentLocationCard } from '@/components/CurrentLocationCard';
import { RouteInfoCard } from '@/components/RouteInfoCard';
import { TravelProgress } from '@/components/TravelProgress';
import dynamic from 'next/dynamic';
import { Map } from 'lucide-react';

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

export function HomePage() {
  return (
    <>
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
}
