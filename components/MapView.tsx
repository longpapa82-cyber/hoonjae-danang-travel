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
  const { position } = useLocation({ autoStart: false });
  const travelStatus = useTravelStatus();
  const { isLoaded, loadError } = useGoogleMaps();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedActivity, setSelectedActivity] = useState<Activity & { date: string } | null>(null);

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

  // 현재 활동의 목적지 좌표
  const destination = travelStatus?.currentActivity?.location
    ? {
        lat: travelStatus.currentActivity.location.latitude,
        lng: travelStatus.currentActivity.location.longitude,
      }
    : null;

  // 지도 로드 시
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 현재 위치로 지도 중심 이동
  useEffect(() => {
    if (position) {
      setCenter({
        lat: position.latitude,
        lng: position.longitude,
      });
    }
  }, [position]);

  // 경로 계산 (여행 중일 때만)
  useEffect(() => {
    // 여행 상태가 없거나, 여행 중이 아니면 실행 안 함
    if (!travelStatus || travelStatus.status !== 'IN_PROGRESS') {
      console.log('경로 계산 건너뛰기: 여행 전 또는 완료');
      return;
    }

    if (!position || !isLoaded || !window.google || !destination) {
      return;
    }

    console.log('경로 계산 시작: 여행 중');
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
          console.log('경로 계산 실패:', status, '- 정상 (여행 전)');
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
        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 shadow-lg border border-yellow-200 dark:border-yellow-800"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Google Maps API 키가 필요합니다
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              지도를 표시하려면 Google Maps API 키를 .env.local에 설정해주세요.
            </p>
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
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
        className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-800"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              지도 로딩 실패
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loadError.message}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 여행 전이면 안내 메시지 표시
  if (travelStatus?.status === 'BEFORE_TRIP') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
              실시간 지도
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              여행이 시작되면 현재 위치와 목적지를 지도에서 확인할 수 있습니다.
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
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          실시간 지도
        </h3>
      </div>

      {/* 지도 */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* 현재 위치 마커 */}
        {position && (
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
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">현재 위치</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">진행중</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">1일차</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">2일차</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">3일차</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">4일차</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-pink-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">5일차</span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-2">
          마커를 클릭하면 상세 정보를 볼 수 있습니다
        </p>
      </div>
    </motion.div>
  );
}
