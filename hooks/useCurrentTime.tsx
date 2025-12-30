'use client';

import { useState, useEffect } from 'react';

/**
 * 1초마다 업데이트되는 현재 시간을 반환하는 Hook
 * Hydration 불일치를 방지하기 위해 클라이언트에서만 초기화됩니다
 */
export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // 초기 시간 설정
    setCurrentTime(new Date());

    // 1초마다 업데이트
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 클린업
    return () => clearInterval(timer);
  }, []);

  return currentTime;
}
