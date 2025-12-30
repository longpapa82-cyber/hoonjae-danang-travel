// Service Worker for 다낭 여행 트래커
const CACHE_NAME = 'danang-travel-v1';
const RUNTIME_CACHE = 'danang-runtime-v1';

// 캐시할 정적 파일 목록
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 설치 이벤트 - 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // 새 SW를 즉시 활성화
  self.skipWaiting();
});

// 활성화 이벤트 - 오래된 캐시 제거
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // 모든 클라이언트에서 즉시 제어권 획득
  return self.clients.claim();
});

// Fetch 이벤트 - 네트워크 우선 전략
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 외부 API 요청 제외
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Google Maps API 요청 제외
  if (url.href.includes('maps.googleapis.com') || url.href.includes('maps.gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 응답이 유효하면 런타임 캐시에 저장
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 제공
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // 페이지 요청이면 오프라인 페이지 제공
          if (request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});

// 푸시 알림 (선택사항)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification('다낭 여행 트래커', options)
  );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
