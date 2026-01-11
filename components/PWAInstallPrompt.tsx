'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PWA 설치 안내 프롬프트
 * 
 * beforeinstallprompt 이벤트를 캡처하여 사용자에게 앱 설치 안내
 * - Android Chrome: 자동 프롬프트 표시
 * - 설치 후: 환영 메시지
 * - localStorage로 "나중에" 선택 기억
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 이미 설치되었거나 "나중에" 선택한 경우 표시하지 않음
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (dismissed || isStandalone) {
      setIsInstalled(true);
      return;
    }

    // beforeinstallprompt 이벤트 캡처
    const handleBeforeInstallPrompt = (e: Event) => {
      // 브라우저 기본 프롬프트 방지
      e.preventDefault();
      
      // 나중에 사용하기 위해 이벤트 저장
      setDeferredPrompt(e);
      
      // 2초 후 커스텀 프롬프트 표시
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    // 앱 설치 성공 이벤트
    const handleAppInstalled = () => {
      console.log('[PWA] 앱이 설치되었습니다!');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 선택 결과 대기
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] 사용자 선택: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('[PWA] 설치 수락됨');
    } else {
      console.log('[PWA] 설치 거부됨');
    }

    // 프롬프트 숨김
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 24시간 동안 표시하지 않음
    const dismissUntil = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-dismissed', dismissUntil.toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && !isInstalled && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Download className="w-5 h-5" />
                <h3 className="font-semibold text-sm">앱으로 설치하기</h3>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 rounded p-1"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                홈 화면에 추가하면 앱처럼 빠르게 실행할 수 있습니다.
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-green-500">✓</span>
                  <span>오프라인에서도 사용 가능</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-green-500">✓</span>
                  <span>빠른 실행 (홈 화면 바로가기)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-green-500">✓</span>
                  <span>전체 화면 경험</span>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  설치
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  나중에
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
