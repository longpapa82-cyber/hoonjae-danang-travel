'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow, Polyline } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, Loader, AlertCircle } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { travelData } from '@/lib/travelData';
import { Activity } from '@/types/travel';
import { Amenity } from '@/types/amenity';
import { AMENITIES, sortAmenitiesByDistance } from '@/lib/amenities';
import { LOCATIONS } from '@/lib/locations';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
};

const defaultCenter = {
  lat: 16.0544, // 다낭 중심
  lng: 108.2022,
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy', // 스크롤 시 바로 지도 줌 가능 (ctrl 불필요)
};

interface MapViewProps {
  showAmenities?: boolean;
  onAmenitySelect?: (amenity: Amenity) => void;
}

export function MapView({ showAmenities = false, onAmenitySelect }: MapViewProps = {}) {
  const travelStatusRaw = useTravelStatus();
  const { isLoaded, loadError } = useGoogleMaps();

  // travelStatus에서 실제 필요한 값만 추출하여 memoization
  // 이렇게 하면 매초 travelStatus 객체가 바뀌어도, 실제 값이 같으면 리렌더링 안 됨
  const travelStatus = useMemo(() => {
    if (!travelStatusRaw) return null;
    return {
      status: travelStatusRaw.status,
      currentDay: travelStatusRaw.currentDay,
      currentActivity: travelStatusRaw.currentActivity,
      // 다른 필요한 필드들만 추가
    };
  }, [
    travelStatusRaw?.status,
    travelStatusRaw?.currentDay,
    travelStatusRaw?.currentActivity?.id, // id만 비교
  ]);

  // 여행 중일 때만 위치 추적 자동 시작
  const shouldTrackLocation = travelStatus?.status === 'IN_PROGRESS';
  const { position } = useLocation({ autoStart: shouldTrackLocation });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity & { date: string } | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [centerInitialized, setCenterInitialized] = useState(false);
  const mapInitialized = useRef(false);

  // 편의시설 목록 (지도에 표시할 외부 시설만, 호텔 기준 거리순 정렬)
  const sortedAmenities = useMemo(() => {
    if (!showAmenities) return [];
    // 호텔 내부 시설은 GPS 위치가 없으므로 지도에서 제외
    const externalAmenities = AMENITIES.filter(a => a.category !== 'HOTEL_FACILITY' && a.location);
    return sortAmenitiesByDistance(externalAmenities, LOCATIONS.DANANG_HOTEL);
  }, [showAmenities]);

  // 모든 여행 일정의 위치 수집
  const allLocations = useMemo(() => {
    const locations: Array<{ activity: Activity; date: string; dayIndex: number }> = [];

    travelData.days.forEach((day, dayIndex) => {
      day.activities.forEach((activity) => {
        if (activity.location) {
          locations.push({
            activity,
            date: day.date,
            dayIndex,
          });
        }
      });
    });

    return locations;
  }, []);

  // 현재 활동의 목적지 좌표 (현재 활동에 location이 없으면 다음 활동 찾기)
  const destination = useMemo(() => {
    if (!travelStatus || travelStatus.status !== 'IN_PROGRESS') return null;

    // 현재 활동에 location이 있으면 사용
    if (travelStatus.currentActivity?.location) {
      return {
        lat: travelStatus.currentActivity.location.latitude,
        lng: travelStatus.currentActivity.location.longitude,
      };
    }

    // 현재 활동에 location이 없으면 다음 활동 찾기
    const currentDay = travelData.days.find(day => day.day === travelStatus.currentDay);
    if (!currentDay) return null;

    const currentActivityIndex = currentDay.activities.findIndex(
      a => a.id === travelStatus.currentActivity?.id
    );

    // 같은 날의 다음 활동 중 location이 있는 것 찾기
    for (let i = currentActivityIndex + 1; i < currentDay.activities.length; i++) {
      const activity = currentDay.activities[i];
      if (activity.location) {
        return {
          lat: activity.location.latitude,
          lng: activity.location.longitude,
        };
      }
    }

    return null;
  }, [travelStatus]);

  // 지도 로드 시 (초기 center와 zoom 레벨 설정)
  const onLoad = useCallback((map: google.maps.Map) => {
    // 이미 초기화되었으면 건너뛰기 (리마운트 방지)
    if (mapInitialized.current) {
      return;
    }

    setMap(map);

    // 초기 center는 기본 다낭 중심, 이후 useEffect에서 실제 위치로 업데이트
    // 여기서는 그냥 기본값으로 설정하고, zoom만 설정
    map.setCenter(defaultCenter);
    map.setZoom(12);

    mapInitialized.current = true;
  }, []); // dependencies 완전 제거!

  const onUnmount = useCallback(() => {
    setMap(null);
    mapInitialized.current = false;
  }, []);

  // 지도 중심 업데이트 (map 객체를 직접 조작, state 업데이트 없음)
  useEffect(() => {
    if (!map || centerInitialized) return;

    if (position) {
      map.setCenter({
        lat: position.latitude,
        lng: position.longitude,
      });
      setCenterInitialized(true);
    } else if (destination && travelStatus?.status === 'IN_PROGRESS') {
      map.setCenter(destination);
      setCenterInitialized(true);
    }
  }, [map, position, destination, travelStatus?.status, centerInitialized]);

  // 두 좌표 간 직선 거리 계산 (km)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 경로 계산 (여행 중일 때만)
  useEffect(() => {
    // 여행 상태가 없거나, 여행 중이 아니면 실행 안 함
    if (!travelStatus || travelStatus.status !== 'IN_PROGRESS') {
      return;
    }

    if (!position || !isLoaded || !window.google || !destination) {
      return;
    }

    // 거리 체크: 현재 위치와 목적지가 100km 이상 떨어져 있으면 경로 계산하지 않음
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      destination.lat,
      destination.lng
    );

    if (distance > 100) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: position.latitude, lng: position.longitude },
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [position, isLoaded, travelStatus, destination]);

  // 여행 전 또는 여행 시작 시점에는 첫 번째 일정 위치로 지도 표시 (map 객체 직접 조작)
  useEffect(() => {
    if (!map || !travelStatus) return;

    // 여행 전 OR 여행 시작 직후 (1일차 첫 활동)인지 확인
    const isTripStart = travelStatus.status === 'BEFORE_TRIP' ||
      (travelStatus.status === 'IN_PROGRESS' &&
       travelStatus.currentDay === 1 &&
       travelStatus.currentActivity?.id === travelData.days[0].activities[0].id);

    if (!isTripStart) return;

    // 첫 번째 location이 있는 일정을 찾아서 센터 설정
    const firstLocation = allLocations.find(
      loc => loc.activity.location
    );

    if (firstLocation?.activity.location) {
      map.setCenter({
        lat: firstLocation.activity.location.latitude,
        lng: firstLocation.activity.location.longitude,
      });
      // 한국(인천공항)인 경우 줌 레벨 조정
      const isKorea = firstLocation.activity.location.latitude > 33 && firstLocation.activity.location.latitude < 39;
      map.setZoom(isKorea ? 10 : 12);
    } else {
      map.setCenter(defaultCenter);
    }
  }, [map, travelStatus?.status, travelStatus?.currentDay, travelStatus?.currentActivity?.id, allLocations]);

  // API 키 누락
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 rounded-2xl p-6 shadow-lg border border-yellow-200"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Google Maps API 키가 필요합니다
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              지도를 표시하려면 Google Maps API 키를 .env.local에 설정해주세요.
            </p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
            </code>
          </div>
        </div>
      </motion.div>
    );
  }

  // 로딩 에러
  if (loadError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 rounded-2xl p-6 shadow-lg border border-red-200"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-gray-800">
              지도 로딩 실패
            </h3>
            <p className="text-sm text-gray-600">
              {loadError.message}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 로딩 중
  if (!isLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              지도 로딩 중...
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      data-testid="map-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200"
    >
      {/* 헤더 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-800">
            {travelStatus?.status === 'BEFORE_TRIP' ? '여행 일정 지도' : '실시간 지도'}
          </h3>
        </div>
        {travelStatus?.status === 'BEFORE_TRIP' && (
          <p className="text-sm text-gray-600">
            다낭 여행의 전체 일정을 미리 확인하세요
          </p>
        )}
      </div>

      {/* 지도 */}
      <div data-testid="google-map">
        <GoogleMap
          key="travel-map"
          mapContainerStyle={mapContainerStyle}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
        {/* 현재 위치 마커 (여행 중일 때만) */}
        {position && travelStatus?.status === 'IN_PROGRESS' && (
          <Marker
            position={{ lat: position.latitude, lng: position.longitude }}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            title="현재 위치"
          />
        )}

        {/* 모든 여행 일정 마커 */}
        {allLocations.map((loc, index) => {
          const isCurrent = travelStatus?.currentActivity?.id === loc.activity.id;
          const position = {
            lat: loc.activity.location!.latitude,
            lng: loc.activity.location!.longitude,
          };

          // 마커 색상: 현재 활동은 빨간색, 나머지는 일차별 색상
          const markerColor = isCurrent
            ? 'red'
            : ['orange', 'yellow', 'green', 'purple', 'pink'][loc.dayIndex % 5];

          return (
            <Marker
              key={`${loc.activity.id}-${index}`}
              position={position}
              icon={{
                url: `https://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`,
                scaledSize: new window.google.maps.Size(isCurrent ? 45 : 35, isCurrent ? 45 : 35),
              }}
              title={loc.activity.title}
              onClick={() => setSelectedActivity({ ...loc.activity, date: loc.date })}
              zIndex={isCurrent ? 1000 : index}
            />
          );
        })}

        {/* 편의시설 마커 (GPS 위치가 있는 외부 시설만) */}
        {showAmenities && sortedAmenities.filter(a => a.location).map((amenity) => (
          <Marker
            key={`amenity-${amenity.id}`}
            position={{
              lat: amenity.location!.latitude,
              lng: amenity.location!.longitude,
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: amenity.category === 'CAFE' ? '#F59E0B'
                : amenity.category === 'CONVENIENCE_STORE' ? '#10B981'
                : '#3B82F6',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title={amenity.nameKo}
            onClick={() => {
              setSelectedAmenity(amenity);
              setSelectedActivity(null);
              onAmenitySelect?.(amenity);
            }}
            zIndex={500}
          />
        ))}

        {/* 여행 일정 정보 창 */}
        {selectedActivity && selectedActivity.location && (
          <InfoWindow
            position={{
              lat: selectedActivity.location.latitude,
              lng: selectedActivity.location.longitude,
            }}
            onCloseClick={() => setSelectedActivity(null)}
          >
            <div className="p-2">
              <h3 className="font-bold text-gray-800 mb-1">{selectedActivity.title}</h3>
              {selectedActivity.time && (
                <p className="text-sm text-gray-600 mb-1">시간: {selectedActivity.time}</p>
              )}
              {selectedActivity.description && (
                <p className="text-sm text-gray-600 mb-1">{selectedActivity.description}</p>
              )}
              <p className="text-xs text-gray-500">{selectedActivity.location.address}</p>
            </div>
          </InfoWindow>
        )}

        {/* 편의시설 정보 창 (GPS 위치가 있는 경우만) */}
        {selectedAmenity && selectedAmenity.location && (
          <InfoWindow
            position={{
              lat: selectedAmenity.location.latitude,
              lng: selectedAmenity.location.longitude,
            }}
            onCloseClick={() => setSelectedAmenity(null)}
          >
            <div className="p-2 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {selectedAmenity.category === 'CAFE' ? '☕'
                    : selectedAmenity.category === 'CONVENIENCE_STORE' ? '🏪'
                    : '🛒'}
                </span>
                <h3 className="font-bold text-gray-800">{selectedAmenity.nameKo}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{selectedAmenity.name}</p>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  <strong>영업시간:</strong> {selectedAmenity.openingHours}
                </p>
                {selectedAmenity.distance && (
                  <p className="text-xs text-gray-500">
                    <strong>거리:</strong> {selectedAmenity.distance < 1000
                      ? `${Math.round(selectedAmenity.distance)}m`
                      : `${(selectedAmenity.distance / 1000).toFixed(1)}km`}
                  </p>
                )}
                {selectedAmenity.description && (
                  <p className="text-xs text-gray-600 mt-1">{selectedAmenity.description}</p>
                )}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* 경로 표시 (여행 중일 때만) */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3B82F6',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
        </GoogleMap>
      </div>

      {/* 범례 */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          {travelStatus?.status === 'IN_PROGRESS' && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-gray-600">현재 위치</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-gray-600">진행중</span>
              </div>
            </>
          )}
          {travelStatus?.status === 'BEFORE_TRIP' && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-gray-600" />
              <span className="text-gray-600">여행 일정</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-600">1일차</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-600">2일차</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600">3일차</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-gray-600">4일차</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-pink-500 rounded-full" />
            <span className="text-gray-600">5일차</span>
          </div>
          {showAmenities && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                <span className="text-gray-600">편의점</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                <span className="text-gray-600">대형마트</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                <span className="text-gray-600">카페</span>
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          마커를 클릭하면 상세 정보를 볼 수 있습니다
        </p>
      </div>
    </motion.div>
  );
}
