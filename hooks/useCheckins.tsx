'use client';

import { useState, useEffect } from 'react';

/**
 * 체크인 상태를 관리하는 Hook
 * LocalStorage를 사용하여 상태 유지
 */
export function useCheckins() {
  const [checkins, setCheckins] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // 클라이언트에서만 LocalStorage 로드
  useEffect(() => {
    const storedCheckins = localStorage.getItem('travel-checkins');
    if (storedCheckins) {
      try {
        const parsed = JSON.parse(storedCheckins);
        setCheckins(new Set(parsed));
      } catch (error) {
        console.error('Failed to parse checkins from localStorage:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // checkins 변경 시 LocalStorage에 저장
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('travel-checkins', JSON.stringify(Array.from(checkins)));
    }
  }, [checkins, isHydrated]);

  const toggleCheckin = (activityId: string) => {
    setCheckins((prev) => {
      const newCheckins = new Set(prev);
      if (newCheckins.has(activityId)) {
        newCheckins.delete(activityId);
      } else {
        newCheckins.add(activityId);
      }
      return newCheckins;
    });
  };

  const isCheckedIn = (activityId: string) => {
    return checkins.has(activityId);
  };

  const clearAllCheckins = () => {
    setCheckins(new Set());
    localStorage.removeItem('travel-checkins');
  };

  const getCheckinCount = () => {
    return checkins.size;
  };

  return {
    checkins,
    toggleCheckin,
    isCheckedIn,
    clearAllCheckins,
    getCheckinCount,
    isHydrated,
  };
}
