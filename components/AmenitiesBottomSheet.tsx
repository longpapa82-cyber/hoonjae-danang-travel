'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Clock, MapPin } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Amenity, AmenityCategory } from '@/types/amenity';
import { AMENITIES, AMENITY_CATEGORIES, sortAmenitiesByDistance } from '@/lib/amenities';
import { LOCATIONS } from '@/lib/locations';
import { navigateToLocation, NavigationApp, formatDistance, estimateWalkingTime, NAVIGATION_APPS } from '@/lib/navigation';

interface AmenitiesBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAmenitySelect?: (amenity: Amenity) => void;
}

export function AmenitiesBottomSheet({
  isOpen,
  onClose,
  onAmenitySelect,
}: AmenitiesBottomSheetProps) {
  const [activeCategory, setActiveCategory] = useState<AmenityCategory>('CONVENIENCE_STORE');
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  // 호텔 위치 기준으로 편의시설 정렬
  const sortedAmenities = useMemo(() => {
    const filtered = AMENITIES.filter((a) => a.category === activeCategory);
    return sortAmenitiesByDistance(filtered, LOCATIONS.DANANG_HOTEL);
  }, [activeCategory]);

  const handleNavigateClick = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setShowNavigationModal(true);
  };

  const handleNavigationAppSelect = (app: NavigationApp) => {
    if (selectedAmenity) {
      navigateToLocation(app, selectedAmenity.location, selectedAmenity.nameKo);
      setShowNavigationModal(false);
      setSelectedAmenity(null);
    }
  };

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="🏪 편의시설">
        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-4 sticky top-0 bg-white py-2 z-10">
          {AMENITY_CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all touch-manipulation ${
                activeCategory === category.key
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm">{category.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 편의시설 목록 */}
        <div className="space-y-3 pb-6">
          {sortedAmenities.map((amenity, index) => (
            <motion.div
              key={amenity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                {/* 좌측 정보 */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onAmenitySelect?.(amenity)}
                >
                  <h3 className="font-bold text-gray-800 mb-1 text-lg">
                    {amenity.nameKo}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{amenity.name}</p>

                  {/* 거리 및 시간 */}
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <div className="flex items-center gap-1 text-blue-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">
                        {amenity.distance ? formatDistance(amenity.distance) : 'N/A'}
                      </span>
                    </div>
                    {amenity.distance && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{estimateWalkingTime(amenity.distance)}</span>
                      </div>
                    )}
                  </div>

                  {/* 영업시간 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        amenity.openingHours === '24시간'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {amenity.openingHours}
                    </span>
                  </div>

                  {/* 설명 */}
                  {amenity.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {amenity.description}
                    </p>
                  )}
                </div>

                {/* 우측 길찾기 버튼 */}
                <button
                  onClick={() => handleNavigateClick(amenity)}
                  className="flex flex-col items-center justify-center gap-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-md touch-manipulation shrink-0"
                  aria-label="길찾기"
                >
                  <Navigation className="w-5 h-5" />
                  <span className="text-xs font-medium">길찾기</span>
                </button>
              </div>
            </motion.div>
          ))}

          {sortedAmenities.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">편의시설 정보가 없습니다</p>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* 길찾기 앱 선택 모달 */}
      {showNavigationModal && selectedAmenity && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowNavigationModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              길찾기 앱 선택
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {selectedAmenity.nameKo}까지 안내
            </p>

            <div className="space-y-3">
              {NAVIGATION_APPS.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleNavigationAppSelect(app.id)}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation"
                >
                  <span className="text-2xl">{app.icon}</span>
                  <span className="font-medium text-gray-800">{app.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNavigationModal(false)}
              className="w-full mt-4 py-3 text-gray-600 font-medium"
            >
              취소
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
