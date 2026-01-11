'use client';

import { useEffect } from 'react';

/**
 * Service Worker 등록 컴포넌트
 *
 * PWA 오프라인 지원을 위해 Service Worker를 등록합니다.
 * - 정적 자산 캐싱 (아이콘, manifest 등)
 * - 런타임 캐싱 (동적 콘텐츠)
 * - 오프라인 fallback 지원
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Service Worker API 지원 확인
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Service Worker 등록
      // 개발 모드와 프로덕션 모드 모두에서 등록 (테스트 및 PWA 기능 검증을 위해)
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[SW] Service Worker 등록 성공:', registration.scope);

            // 업데이트 확인
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[SW] 새 버전 사용 가능. 새로고침하여 업데이트하세요.');
                    // 선택사항: 사용자에게 새로고침 안내
                    // if (confirm('새 버전이 있습니다. 지금 업데이트하시겠습니까?')) {
                    //   window.location.reload();
                    // }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[SW] Service Worker 등록 실패:', error);
          });
      });

      // Service Worker 활성화 확인
      navigator.serviceWorker.ready.then((registration) => {
        console.log('[SW] Service Worker 활성화됨:', registration);
      });
    } else {
      console.warn('[SW] 이 브라우저는 Service Worker를 지원하지 않습니다.');
    }
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
