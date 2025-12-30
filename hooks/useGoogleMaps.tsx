'use client';

import { useJsApiLoader } from '@react-google-maps/api';
import { useEffect } from 'react';
import { routeService } from '@/lib/services/RouteService';

const libraries: ('places' | 'geometry' | 'drawing')[] = ['places', 'geometry'];

/**
 * Google Maps API 로딩 Hook
 */
export function useGoogleMaps() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // RouteService 초기화
  useEffect(() => {
    if (isLoaded && window.google) {
      routeService.initialize(window.google);
    }
  }, [isLoaded]);

  return {
    isLoaded,
    loadError,
  };
}
