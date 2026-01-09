'use client';

import { useState, useEffect } from 'react';

/**
 * 60초마다 업데이트되는 현재 시간을 반환하는 Hook
 * 테스트 모드: localStorage에 testDate가 있으면 그것을 사용
 * Hydration 불일치를 방지하기 위해 클라이언트에서만 초기화됩니다
 *
 * 성능 최적화: 1초 → 60초 간격으로 변경
 * - 여행 진행률은 분 단위면 충분함
 * - 매초 리렌더링으로 인한 성능 저하 방지
 */
export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => {
      // 테스트 모드 확인
      const testDateStr = localStorage.getItem('testDate');
      if (testDateStr) {
        setCurrentTime(new Date(testDateStr));
      } else {
        setCurrentTime(new Date());
      }
    };

    // 초기 시간 설정
    updateTime();

    // 60초마다 업데이트 (성능 최적화)
    const timer = setInterval(updateTime, 60000);

    // 클린업
    return () => clearInterval(timer);
  }, []);

  return currentTime;
}
