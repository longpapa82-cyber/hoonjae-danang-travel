'use client';

import { useState, useEffect } from 'react';
import { getUserTimezone } from '@/lib/timeUtils';

/**
 * 사용자의 타임존을 감지하는 Hook
 */
export function useTimezone() {
  const [timezone, setTimezone] = useState<string | null>(null);

  useEffect(() => {
    setTimezone(getUserTimezone());
  }, []);

  return timezone;
}
