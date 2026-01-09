'use client';

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Map, MapPin, Navigation, Target, Store } from 'lucide-react';
import { CurrentLocationCard } from '@/components/CurrentLocationCard';
import { RouteInfoCard } from '@/components/RouteInfoCard';
import { NextActivityCard } from '@/components/NextActivityCard';
import { AmenitiesBottomSheet } from '@/components/AmenitiesBottomSheet';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { Amenity } from '@/types/amenity';
import dynamic from 'next/dynamic';

// 동적 import로 MapView 로드 (지도 탭에서만 필요)
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

// React.memo로 불필요한 리렌더링 방지
export const MapPage = memo(function MapPage() {
  const { isTracking, startTracking, stopTracking, permission } = useLocation({ autoStart: false });
  const travelStatus = useTravelStatus();
  const [showAmenities, setShowAmenities] = useState(false);
  const [showAmenitiesSheet, setShowAmenitiesSheet] = useState(false);

  const handleLocationToggle = async () => {
    if (isTracking) {
      stopTracking();
    } else {
      if (permission !== 'granted') {
        // 권한 요청은 LocationPermissionModal에서 처리
        alert('위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.');
        return;
      }
      startTracking();
    }
  };

  const handleAmenitiesToggle = () => {
    setShowAmenities(!showAmenities);
    if (!showAmenities) {
      setShowAmenitiesSheet(true);
    }
  };

  const handleAmenitySelect = (amenity: Amenity) => {
    console.log('선택된 편의시설:', amenity);
    // 지도가 해당 위치로 이동하고 InfoWindow가 열림
  };

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 mb-6 text-white"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">여행 지도</h1>
              <p className="text-sm text-blue-100">실시간 위치 및 경로 안내</p>
            </div>
          </div>

          {/* 위치 추적 토글 버튼 */}
          {travelStatus?.status === 'IN_PROGRESS' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLocationToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 ${
                isTracking
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-600 text-white border-2 border-white'
              }`}
              aria-label={isTracking ? '위치 추적 중지' : '위치 추적 시작'}
              aria-pressed={isTracking}
            >
              <Target className={`w-4 h-4 ${isTracking ? 'animate-pulse' : ''}`} aria-hidden="true" />
              <span className="text-sm">{isTracking ? '추적 중' : '위치 추적'}</span>
            </motion.button>
          )}
        </div>

        {/* 편의시설 토글 버튼 */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAmenitiesToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 ${
              showAmenities
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-blue-400/50 text-white hover:bg-blue-400/70'
            }`}
            aria-label={showAmenities ? '편의시설 숨기기' : '편의시설 보기'}
            aria-pressed={showAmenities}
          >
            <Store className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">
              {showAmenities ? '편의시설 숨기기' : '편의시설 보기'}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* 현재 위치 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <CurrentLocationCard />
      </motion.div>

      {/* 다음 일정 및 ETA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <NextActivityCard />
      </motion.div>

      {/* 경로 안내 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <RouteInfoCard />
      </motion.div>

      {/* 지도 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MapView
          showAmenities={showAmenities}
          onAmenitySelect={handleAmenitySelect}
        />
      </motion.div>

      {/* 편의시설 목록 Bottom Sheet */}
      <AmenitiesBottomSheet
        isOpen={showAmenitiesSheet}
        onClose={() => {
          setShowAmenitiesSheet(false);
          setShowAmenities(false);
        }}
        onAmenitySelect={handleAmenitySelect}
      />
    </div>
  );
});
