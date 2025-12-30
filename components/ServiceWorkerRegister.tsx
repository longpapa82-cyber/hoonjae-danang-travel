'use client';

import { useEffect } from 'react';

/**
 * Service Worker 등록 컴포넌트
 * PWA 오프라인 지원 및 캐싱 기능 제공
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);

          // 업데이트 확인
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log('[PWA] New Service Worker activated');

                  // 새 버전 알림 (선택사항)
                  if (confirm('새로운 버전이 있습니다. 페이지를 새로고침하시겠습니까?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
