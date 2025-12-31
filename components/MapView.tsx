'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow, Polyline } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, Loader, AlertCircle } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useTravelStatus } from '@/hooks/useTravelStatus';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { travelData } from '@/lib/travelData';
import { Activity } from '@/types/travel';

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
};

export function MapView() {
  const travelStatus = useTravelStatus();
  const { isLoaded, loadError } = useGoogleMaps();

  // 여행 중일 때만 위치 추적 자동 시작
  const shouldTrackLocation = travelStatus?.status === 'IN_PROGRESS';
  const { position } = useLocation({ autoStart: shouldTrackLocation });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedActivity, setSelectedActivity] = useState<Activity & { date: string } | null>(null);
  const [centerInitialized, setCenterInitialized] = useState(false);

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
    setMap(map);
    // 초기 center와 zoom 레벨만 설정, 이후 사용자가 자유롭게 조작 가능
    map.setCenter(center);
    map.setZoom(12);
  }, [center]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 지도 중심 설정 (초기 로딩 시에만, 이후에는 사용자가 자유롭게 조작)
  useEffect(() => {
    // 이미 초기화되었으면 건너뛰기
    if (centerInitialized) return;

    if (position) {
      setCenter({
        lat: position.latitude,
        lng: position.longitude,
      });
      setCenterInitialized(true);
    } else if (destination && travelStatus?.status === 'IN_PROGRESS') {
      // 현재 위치가 없지만 여행 중이면 목적지 근처로 중심 설정
      setCenter(destination);
      setCenterInitialized(true);
    }
  }, [position, destination, travelStatus?.status, centerInitialized]);

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
      console.log('MapView: 경로 계산 건너뛰기 - 여행 전 또는 완료');
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
      console.log(
        `MapView: 경로 계산 건너뛰기 - 거리가 너무 멀음 (${distance.toFixed(0)}km)`
      );
      setDirections(null);
      return;
    }

    console.log(`MapView: 경로 계산 시작 - 거리 ${distance.toFixed(1)}km`);
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
        } else {
          console.log(`MapView: 경로 계산 실패 - ${status}`);
        }
      }
    );
  }, [position, isLoaded, travelStatus, destination]);

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

  // 여행 전에는 다낭 중심으로 지도 표시
  useEffect(() => {
    if (travelStatus?.status === 'BEFORE_TRIP') {
      // 다낭 공항이나 다낭 지역 위치를 찾아서 센터 설정
      const danangLocation = allLocations.find(
        loc => loc.activity.location && loc.activity.location.latitude > 15 && loc.activity.location.latitude < 17
      );

      if (danangLocation?.activity.location) {
        setCenter({
          lat: danangLocation.activity.location.latitude,
          lng: danangLocation.activity.location.longitude,
        });
      } else {
        // 다낭 위치를 찾지 못하면 기본 다낭 중심 좌표 사용
        setCenter(defaultCenter);
      }
    }
  }, [travelStatus?.status, allLocations]);

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
      <GoogleMap
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

        {/* 정보 창 */}
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
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          마커를 클릭하면 상세 정보를 볼 수 있습니다
        </p>
      </div>
    </motion.div>
  );
}
