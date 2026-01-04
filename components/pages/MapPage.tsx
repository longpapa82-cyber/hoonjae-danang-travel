'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, MapPin, Navigation, Target, Store } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { CurrentLocationCard } from '@/components/CurrentLocationCard';
import { RouteInfoCard } from '@/components/RouteInfoCard';
import { AmenitiesBottomSheet } from '@/components/AmenitiesBottomSheet';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { Amenity } from '@/types/amenity';

export function MapPage() {
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isTracking
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-600 text-white border-2 border-white'
              }`}
            >
              <Target className={`w-4 h-4 ${isTracking ? 'animate-pulse' : ''}`} />
              <span className="text-sm">{isTracking ? '추적 중' : '위치 추적'}</span>
            </motion.button>
          )}
        </div>

        {/* 편의시설 토글 버튼 */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAmenitiesToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              showAmenities
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-blue-400/50 text-white hover:bg-blue-400/70'
            }`}
          >
            <Store className="w-4 h-4" />
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

      {/* 경로 안내 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
}
