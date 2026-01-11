'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 네트워크 상태 표시기
 * 
 * 오프라인/온라인 상태를 실시간으로 감지하여 사용자에게 알림
 * - 오프라인 전환 시: 경고 메시지 표시
 * - 온라인 복구 시: 성공 메시지 및 자동 동기화 안내
 */
export default function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // 초기 상태 설정
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setShowNotification(true);

      // 3초 후 재연결 알림 자동 숨김
      setTimeout(() => {
        setShowNotification(false);
        setJustReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    // 이벤트 리스너 등록
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && !isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div className="bg-amber-500 dark:bg-amber-600 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <WifiOff className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  오프라인 모드
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  인터넷 연결이 끊어졌습니다. 캐시된 데이터로 계속 사용할 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-white hover:bg-amber-600 dark:hover:bg-amber-700 rounded px-2 py-1 text-xs pointer-events-auto"
              >
                닫기
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showNotification && justReconnected && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div className="bg-green-500 dark:bg-green-600 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <Wifi className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  온라인 복구됨
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  인터넷에 다시 연결되었습니다. 최신 정보를 불러오는 중...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
