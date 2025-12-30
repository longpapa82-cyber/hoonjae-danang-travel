'use client';

import { CurrentLocationCard } from '@/components/CurrentLocationCard';
import { RouteInfoCard } from '@/components/RouteInfoCard';
import { MapView } from '@/components/MapView';
import { TravelProgress } from '@/components/TravelProgress';

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
