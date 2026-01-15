'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
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

// 커스텀 마커 SVG 아이콘 생성 함수
const createCustomMarkerIcon = (color: string, size: number, isCurrent: boolean = false): string => {
  // 색상별 진한 테두리 색상 매핑
  const borderColors: Record<string, string> = {
    red: '#991B1B',      // 빨강 - 매우 진한 빨강
    green: '#065F46',    // 초록 - 매우 진한 초록
    orange: '#9A3412',   // 주황 - 매우 진한 주황
    purple: '#581C87',   // 보라 - 매우 진한 보라
    blue: '#1E3A8A',     // 파랑 - 매우 진한 파랑
  };

  const fillColors: Record<string, string> = {
    red: '#EF4444',      // 밝은 빨강
    green: '#10B981',    // 밝은 초록
    orange: '#F97316',   // 밝은 주황
    purple: '#A855F7',   // 밝은 보라
    blue: '#3B82F6',     // 밝은 파랑
  };

  const borderColor = borderColors[color] || '#000000';
  const fillColor = fillColors[color] || color;

  // 현재 진행중이면 펄스 효과 링 추가
  const pulseRing = isCurrent ? `
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}"
      fill="none" stroke="${fillColor}" stroke-width="3" opacity="0.5">
      <animate attributeName="r" from="${size/2 - 2}" to="${size/2 + 5}"
        dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.5" to="0"
        dur="1.5s" repeatCount="indefinite"/>
    </circle>
  ` : '';

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      ${pulseRing}
      <!-- 외부 테두리 (진한 색) -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}"
        fill="${borderColor}" />
      <!-- 내부 원 (밝은 색) -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 5}"
        fill="${fillColor}" />
      <!-- 중앙 하이라이트 -->
      <circle cx="${size/2 - size/8}" cy="${size/2 - size/8}" r="${size/6}"
        fill="white" opacity="0.4" />
    </svg>
  `;

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

interface MapViewProps {
  showAmenities?: boolean;
  onAmenitySelect?: (amenity: Amenity) => void;
}

// React.memo로 불필요한 리렌더링 방지
export const MapView = memo(function MapView({ showAmenities = false, onAmenitySelect }: MapViewProps = {}) {
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
  }, [travelStatusRaw]); // travelStatusRaw 전체를 dependency로 포함

  // 여행 중일 때만 위치 추적 자동 시작
  const shouldTrackLocation = travelStatus?.status === 'IN_PROGRESS';
  const { position } = useLocation({ autoStart: shouldTrackLocation });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity & { date: string } | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [selectedTransitStop, setSelectedTransitStop] = useState<{
    name: string;
    lineName: string;
    lineColor?: string;
    type: 'departure' | 'arrival';
    location: { lat: number; lng: number };
  } | null>(null);
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

  // 표시할 날짜 범위 필터링 (전날 + 현재 + 다음날)
  const filteredLocations = useMemo(() => {
    if (!travelStatus) return allLocations;

    // 여행 전: 1일차만 표시
    if (travelStatus.status === 'BEFORE_TRIP') {
      return allLocations.filter(loc => loc.dayIndex === 0);
    }

    // 여행 완료: 모든 일정 표시
    if (travelStatus.status === 'COMPLETED') {
      return allLocations;
    }

    // 여행 중: 전날 + 현재 + 다음날만 표시
    if (!travelStatus.currentDay) return allLocations;

    const currentDayIndex = travelStatus.currentDay - 1;
    return allLocations.filter(loc => {
      // 바로 전날
      if (loc.dayIndex === currentDayIndex - 1) return true;

      // 현재 날짜
      if (loc.dayIndex === currentDayIndex) return true;

      // 다음 날짜
      if (loc.dayIndex === currentDayIndex + 1) return true;

      return false;
    });
  }, [allLocations, travelStatus]);

  // 대중교통 정류장 추출
  const transitStops = useMemo(() => {
    if (!directions) {
      console.log('🚏 No directions available');
      return [];
    }

    const stops: Array<{
      name: string;
      lineName: string;
      lineColor?: string;
      type: 'departure' | 'arrival';
      location: { lat: number; lng: number };
      stepIndex: number;
    }> = [];

    const leg = directions.routes[0]?.legs[0];
    if (!leg) {
      console.log('🚏 No leg data in directions');
      return [];
    }

    console.log('🚏 Analyzing directions steps:', {
      totalSteps: leg.steps.length,
      travelMode: directions.request?.travelMode,
    });

    leg.steps.forEach((step, index) => {
      console.log(`  Step ${index}:`, {
        travelMode: step.travel_mode,
        hasTransit: !!step.transit,
        instructions: step.instructions?.substring(0, 50),
      });

      if (step.transit) {
        // 승차 정류장
        stops.push({
          name: step.transit.departure_stop.name,
          lineName: step.transit.line.short_name || step.transit.line.name,
          lineColor: step.transit.line.color,
          type: 'departure',
          location: {
            lat: step.transit.departure_stop.location.lat(),
            lng: step.transit.departure_stop.location.lng(),
          },
          stepIndex: index,
        });

        // 하차 정류장
        stops.push({
          name: step.transit.arrival_stop.name,
          lineName: step.transit.line.short_name || step.transit.line.name,
          lineColor: step.transit.line.color,
          type: 'arrival',
          location: {
            lat: step.transit.arrival_stop.location.lat(),
            lng: step.transit.arrival_stop.location.lng(),
          },
          stepIndex: index,
        });
      }
    });

    console.log('🚏 Transit stops extracted:', stops.length, stops);
    return stops;
  }, [directions]);

  // 전체 여행 경로 (완료된 경로 vs 남은 경로) - 필터링된 위치 기준
  const routePaths = useMemo(() => {
    if (!travelStatus || filteredLocations.length === 0) {
      return { completed: [], remaining: [] };
    }

    const coordinates = filteredLocations.map(loc => ({
      lat: loc.activity.location!.latitude,
      lng: loc.activity.location!.longitude,
      id: loc.activity.id,
    }));

    // 현재 활동의 인덱스 찾기
    const currentIndex = coordinates.findIndex(
      coord => coord.id === travelStatus.currentActivity?.id
    );

    if (currentIndex === -1 || travelStatus.status === 'BEFORE_TRIP') {
      // 여행 전이거나 현재 활동을 찾을 수 없으면 모두 회색으로 표시
      return {
        completed: [],
        remaining: coordinates.map(c => ({ lat: c.lat, lng: c.lng })),
      };
    }

    if (travelStatus.status === 'COMPLETED') {
      // 여행 완료 시 모두 파란색으로 표시
      return {
        completed: coordinates.map(c => ({ lat: c.lat, lng: c.lng })),
        remaining: [],
      };
    }

    // 여행 중: 현재 활동까지는 파란색, 이후는 회색
    return {
      completed: coordinates.slice(0, currentIndex + 1).map(c => ({ lat: c.lat, lng: c.lng })),
      remaining: coordinates.slice(currentIndex).map(c => ({ lat: c.lat, lng: c.lng })),
    };
  }, [filteredLocations, travelStatus]);

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

    console.log('[MapView] 경로 계산 시도:', {
      origin: { lat: position.latitude, lng: position.longitude },
      destination,
      distance: `${distance.toFixed(2)}km`,
    });

    if (distance > 100) {
      console.log('[MapView] 거리가 100km를 초과하여 경로 계산 스킵:', distance);
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    // 한국 좌표 확인 (33-39 위도)
    const isKorea = position.latitude > 33 && position.latitude < 39;

    // 베트남 좌표 확인 (8-24 위도, 102-110 경도)
    const isVietnam =
      position.latitude > 8 && position.latitude < 24 &&
      position.longitude > 102 && position.longitude < 110;

    // 국내 여행 여부 (한국 또는 베트남)
    const isDomestic = isKorea || isVietnam;

    console.log('[MapView] 위치 분석:', {
      isKorea,
      isVietnam,
      isDomestic,
      position: { lat: position.latitude, lng: position.longitude },
    });

    // 경로 계산 시도 (국내: TRANSIT → DRIVING, 해외: DRIVING만)
    const tryDirections = (travelMode: google.maps.TravelMode, fallbackMode?: google.maps.TravelMode) => {
      const request: google.maps.DirectionsRequest = {
        origin: { lat: position.latitude, lng: position.longitude },
        destination: destination,
        travelMode: travelMode,
      };

      // TRANSIT 모드일 때 region 설정
      if (travelMode === google.maps.TravelMode.TRANSIT) {
        if (isKorea) {
          (request as any).region = 'KR';
        } else if (isVietnam) {
          (request as any).region = 'VN';
        }
      }

      // DRIVING 모드일 때만 실시간 교통 정보 추가
      if (travelMode === google.maps.TravelMode.DRIVING) {
        (request as any).drivingOptions = {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        };
      }

      directionsService.route(request, (result, status) => {
        console.log(`[MapView] Directions API 응답 (${travelMode}):`, status);

        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log(`[MapView] 경로 계산 성공 (${travelMode})`);
          setDirections(result);
        } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
          // fallback 모드가 있으면 시도
          if (fallbackMode) {
            console.warn(`[MapView] ${travelMode} 경로 없음 → ${fallbackMode} 시도`);
            tryDirections(fallbackMode);
          } else {
            console.error('[MapView] 모든 교통수단으로 경로를 찾을 수 없습니다');
            setDirections(null);
          }
        } else {
          console.error('[MapView] 경로 계산 실패:', {
            status,
            travelMode,
            origin: { lat: position.latitude, lng: position.longitude },
            destination,
            distance: `${distance.toFixed(2)}km`,
          });

          // fallback 모드가 있으면 재시도
          if (fallbackMode) {
            console.warn(`[MapView] ${travelMode} 실패 → ${fallbackMode} 재시도`);
            tryDirections(fallbackMode);
          } else {
            setDirections(null);
          }
        }
      });
    };

    // 국내 여행: TRANSIT 우선 시도 → DRIVING fallback
    // 해외 여행: DRIVING만 시도
    if (isDomestic) {
      console.log('[MapView] 🚆 국내 여행: TRANSIT 모드 우선 시도');
      tryDirections(google.maps.TravelMode.TRANSIT, google.maps.TravelMode.DRIVING);
    } else {
      console.log('[MapView] 🚗 해외 여행: DRIVING 모드만 시도');
      tryDirections(google.maps.TravelMode.DRIVING);
    }
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

    // 필터링된 위치 중 첫 번째 location이 있는 일정을 찾아서 센터 설정
    const firstLocation = filteredLocations.find(
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
  }, [map, travelStatus, filteredLocations]); // travelStatus 전체를 dependency로 포함

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
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      {/* 헤더 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-primary dark:text-primary-light" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            {travelStatus?.status === 'BEFORE_TRIP' ? '여행 일정 지도' : '실시간 지도'}
          </h3>
        </div>
        {travelStatus?.status === 'BEFORE_TRIP' && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
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
        {/* 전체 여행 경로 (Polyline) - Polarsteps 스타일 */}
        {routePaths.remaining.length > 0 && (
          <Polyline
            path={routePaths.remaining}
            options={{
              strokeColor: '#D1D5DB',
              strokeWeight: 3,
              strokeOpacity: 0.6,
              geodesic: true,
            }}
          />
        )}
        {routePaths.completed.length > 0 && (
          <Polyline
            path={routePaths.completed}
            options={{
              strokeColor: '#3B82F6',
              strokeWeight: 4,
              strokeOpacity: 0.9,
              geodesic: true,
            }}
          />
        )}

        {/* 현재 위치 마커 (여행 중일 때만) */}
        {position && travelStatus?.status === 'IN_PROGRESS' && (
          <Marker
            position={{ lat: position.latitude, lng: position.longitude }}
            icon={{
              url: createCustomMarkerIcon('blue', 40, false),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            }}
            title="현재 위치"
            zIndex={1100}
          />
        )}

        {/* 필터링된 여행 일정 마커 (완료 + 현재 + 다음 날짜) */}
        {filteredLocations.map((loc, index) => {
          const isCurrent = travelStatus?.currentActivity?.id === loc.activity.id;
          const position = {
            lat: loc.activity.location!.latitude,
            lng: loc.activity.location!.longitude,
          };

          // 현재 날짜 기준으로 어제/오늘/내일 구분
          const currentDayIndex = travelStatus?.currentDay ? travelStatus.currentDay - 1 : -1;
          const isYesterday = loc.dayIndex === currentDayIndex - 1;
          const isToday = loc.dayIndex === currentDayIndex;
          const isTomorrow = loc.dayIndex === currentDayIndex + 1;

          // 마커 색상: 현재 활동 > 오늘 > 어제 > 내일/기타
          // 색상을 명확하게 구분: 어제(보라) - 오늘(초록) - 내일(주황) - 현재(빨강)
          // 크기를 크게 하여 구분을 더 명확하게
          let markerColor: string;
          let markerSize: number;

          if (isCurrent) {
            // 현재 진행중인 활동: 빨간색, 가장 크게
            markerColor = 'red';
            markerSize = 50;
          } else if (isToday) {
            // 오늘의 다른 일정: 초록색 (진행 중)
            markerColor = 'green';
            markerSize = 44;
          } else if (isYesterday) {
            // 어제 완료된 일정: 보라색 (완료)
            markerColor = 'purple';
            markerSize = 38;
          } else if (isTomorrow) {
            // 내일 예정 일정: 주황색 (예정)
            markerColor = 'orange';
            markerSize = 42;
          } else {
            // 그 외: 일차별 색상
            markerColor = ['orange', 'yellow', 'green', 'purple', 'pink'][loc.dayIndex % 5];
            markerSize = 36;
          }

          return (
            <Marker
              key={`${loc.activity.id}-${index}`}
              position={position}
              icon={{
                url: createCustomMarkerIcon(markerColor, markerSize, isCurrent),
                scaledSize: new window.google.maps.Size(markerSize, markerSize),
                anchor: new window.google.maps.Point(markerSize / 2, markerSize / 2),
              }}
              title={loc.activity.title}
              onClick={() => setSelectedActivity({ ...loc.activity, date: loc.date })}
              zIndex={isCurrent ? 1000 : isToday ? 900 : isYesterday ? 800 : index}
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

        {/* 대중교통 정류장 마커 */}
        {transitStops.map((stop, index) => (
          <Marker
            key={`transit-stop-${index}`}
            position={stop.location}
            icon={{
              path: stop.type === 'departure'
                ? window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                : window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: stop.type === 'departure' ? '#10B981' : '#EF4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              rotation: stop.type === 'departure' ? 0 : 180,
            }}
            title={`${stop.type === 'departure' ? '승차' : '하차'}: ${stop.name}`}
            onClick={() => {
              setSelectedTransitStop(stop);
              setSelectedActivity(null);
              setSelectedAmenity(null);
            }}
            zIndex={600}
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

        {/* 대중교통 정류장 정보 창 */}
        {selectedTransitStop && (
          <InfoWindow
            position={selectedTransitStop.location}
            onCloseClick={() => setSelectedTransitStop(null)}
          >
            <div className="p-2 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {selectedTransitStop.type === 'departure' ? '🟢' : '🔴'}
                </span>
                <h3 className="font-bold text-gray-800">
                  {selectedTransitStop.type === 'departure' ? '승차 정류장' : '하차 정류장'}
                </h3>
              </div>
              <p className="text-sm font-medium text-gray-800 mb-2">{selectedTransitStop.name}</p>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold text-white"
                  style={{ backgroundColor: selectedTransitStop.lineColor || '#3B82F6' }}
                >
                  {selectedTransitStop.lineName}
                </span>
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
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          {travelStatus?.status === 'IN_PROGRESS' && (
            <>
              <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-blue-600" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">현재 위치</span>
              </div>
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-md border border-red-600" />
                <span className="text-gray-800 dark:text-gray-100 font-bold">진행중</span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                <div className="w-3.5 h-3.5 bg-green-500 rounded-full border border-green-600" />
                <span className="text-gray-800 dark:text-gray-100 font-semibold">오늘</span>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full border border-purple-600" />
                <span className="text-gray-700 dark:text-gray-200">어제</span>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                <div className="w-3.5 h-3.5 bg-orange-500 rounded-full border border-orange-600" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">내일</span>
              </div>
            </>
          )}
          {travelStatus?.status === 'BEFORE_TRIP' && (
            <>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-gray-300">여행 일정</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-300">1일차</span>
              </div>
            </>
          )}
          {travelStatus?.status === 'COMPLETED' && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-300">1일차</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-300">2일차</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-300">3일차</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-300">4일차</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-pink-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-300">5일차</span>
              </div>
            </>
          )}
          {showAmenities && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700" />
                <span className="text-gray-600 dark:text-gray-300">편의점</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-700" />
                <span className="text-gray-600 dark:text-gray-300">대형마트</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-700" />
                <span className="text-gray-600 dark:text-gray-300">카페</span>
              </div>
            </>
          )}
          {transitStops.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                <span className="text-sm">🟢</span>
                <span className="text-gray-700 dark:text-gray-200">승차 정류장</span>
              </div>
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                <span className="text-sm">🔴</span>
                <span className="text-gray-700 dark:text-gray-200">하차 정류장</span>
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
          💡 마커를 클릭하면 상세 정보를 볼 수 있습니다
        </p>
      </div>
    </motion.div>
  );
});
