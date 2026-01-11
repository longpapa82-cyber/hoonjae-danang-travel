'use client';

import { useEffect, useState } from 'react';

/**
 * prefers-reduced-motion 미디어 쿼리를 감지하는 훅
 *
 * WCAG 2.3.3: Animation from Interactions (Level AAA)
 * 전정 장애(vestibular disorders) 사용자를 위한 애니메이션 비활성화
 *
 * @returns {boolean} prefersReducedMotion - 사용자가 애니메이션 감소를 선호하는지 여부
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { scale: 1.2 }}
 *   transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring' }}
 * />
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // 서버 사이드 렌더링 환경 체크
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 초기 값 설정
    setPrefersReducedMotion(mediaQuery.matches);

    // 미디어 쿼리 변경 감지
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // 이벤트 리스너 등록 (Safari 호환성을 위해 addListener도 체크)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      // @ts-ignore - Safari 구버전 지원
      mediaQuery.addListener(listener);
    }

    // 클린업
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        // @ts-ignore - Safari 구버전 지원
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  return prefersReducedMotion;
}
