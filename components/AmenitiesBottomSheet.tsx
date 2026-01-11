'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Clock, MapPin, Building } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Amenity, AmenityCategory } from '@/types/amenity';
import { AMENITIES, AMENITY_CATEGORIES, sortAmenitiesByDistance } from '@/lib/amenities';
import { LOCATIONS } from '@/lib/locations';
import { navigateToLocation, NavigationApp, formatDistance, estimateWalkingTime, NAVIGATION_APPS } from '@/lib/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
  const [activeCategory, setActiveCategory] = useState<AmenityCategory>('HOTEL_FACILITY');
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // 호텔 위치 기준으로 편의시설 정렬 (호텔 내부 시설은 정렬 불필요)
  const sortedAmenities = useMemo(() => {
    const filtered = AMENITIES.filter((a) => a.category === activeCategory);

    // 호텔 내부 시설은 거리 정렬 없이 그대로 반환
    if (activeCategory === 'HOTEL_FACILITY') {
      return filtered;
    }

    // 외부 시설은 거리순으로 정렬
    return sortAmenitiesByDistance(filtered, LOCATIONS.DANANG_HOTEL);
  }, [activeCategory]);

  const handleNavigateClick = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setShowNavigationModal(true);
  };

  const handleNavigationAppSelect = (app: NavigationApp) => {
    if (selectedAmenity && selectedAmenity.location) {
      navigateToLocation(app, selectedAmenity.location, selectedAmenity.nameKo);
      setShowNavigationModal(false);
      setSelectedAmenity(null);
    }
  };

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="🏪 편의시설">
        {/* 카테고리 탭 */}
        <div className="grid grid-cols-2 sm:flex gap-2 mb-4 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10" role="tablist" aria-label="편의시설 카테고리">
          {AMENITY_CATEGORIES.map((category) => (
            <button
              key={category.key}
              role="tab"
              aria-selected={activeCategory === category.key}
              aria-controls={`${category.key}-panel`}
              aria-label={`${category.label} 카테고리`}
              onClick={() => setActiveCategory(category.key)}
              className={`flex items-center justify-center gap-2 py-3 px-3 sm:px-4 min-h-[44px] sm:flex-1 rounded-xl font-medium transition-all duration-200 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
                activeCategory === category.key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">{category.icon}</span>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                <span className="sm:hidden">{category.labelShort}</span>
                <span className="hidden sm:inline">{category.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* 편의시설 목록 */}
        <div
          className="space-y-3 pb-6"
          role="tabpanel"
          id={`${activeCategory}-panel`}
          aria-labelledby={`${activeCategory}-tab`}
        >
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

                  {/* 호텔 시설: 층 정보 / 외부 시설: 거리 및 시간 */}
                  {amenity.category === 'HOTEL_FACILITY' && amenity.hotelFacility ? (
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <div className="flex items-center gap-1 text-purple-600">
                        <Building className="w-4 h-4" />
                        <span className="font-medium">{amenity.hotelFacility.floor}층</span>
                      </div>
                      {amenity.hotelFacility.zone && (
                        <span className="text-gray-600">{amenity.hotelFacility.zone}</span>
                      )}
                    </div>
                  ) : (
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
                  )}

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
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {amenity.description}
                    </p>
                  )}

                  {/* 호텔 시설 특징 태그 */}
                  {amenity.category === 'HOTEL_FACILITY' && amenity.hotelFacility?.features && (
                    <div className="flex flex-wrap gap-1.5">
                      {amenity.hotelFacility.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 우측 길찾기 버튼 (외부 시설만 표시) */}
                {amenity.category !== 'HOTEL_FACILITY' && (
                  <button
                    onClick={() => handleNavigateClick(amenity)}
                    className="flex flex-col items-center justify-center gap-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-md touch-manipulation shrink-0"
                    aria-label="길찾기"
                  >
                    <Navigation className="w-5 h-5" />
                    <span className="text-xs font-medium">길찾기</span>
                  </button>
                )}
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
          aria-hidden="true"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="nav-modal-title"
            initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 id="nav-modal-title" className="text-xl font-bold text-gray-800 dark:text-white mb-2">
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
                  aria-label={`${app.name}으로 ${selectedAmenity.nameKo} 길찾기`}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="text-2xl" aria-hidden="true">{app.icon}</span>
                  <span className="font-medium text-gray-800 dark:text-white">{app.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNavigationModal(false)}
              aria-label="길찾기 앱 선택 모달 닫기"
              className="w-full mt-4 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              취소
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
