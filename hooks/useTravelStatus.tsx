'use client';

import { useMemo } from 'react';
import { TravelProgress } from '@/types/travel';
import { travelData } from '@/lib/travelData';
import { calculateTravelProgress } from '@/lib/progressCalculator';
import { useCurrentTime } from './useCurrentTime';

/**
 * 현재 여행 상태를 계산하여 반환하는 Hook
 */
export function useTravelStatus(): TravelProgress | null {
  const currentTime = useCurrentTime();

  const travelProgress = useMemo(() => {
    if (!currentTime) return null;
    return calculateTravelProgress(travelData, currentTime);
  }, [currentTime]);

  return travelProgress;
}
