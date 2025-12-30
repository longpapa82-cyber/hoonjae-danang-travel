'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, Check } from 'lucide-react';
import { locationService } from '@/lib/services/LocationService';

export function LocationPermissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const state = await locationService.checkPermission();
    setPermissionState(state);

    // 권한이 없으면 모달 표시
    if (state === 'prompt') {
      setIsOpen(true);
    }
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);

    try {
      const granted = await locationService.requestPermission();

      if (granted) {
        setPermissionState('granted');
        setIsOpen(false);

        // 위치 추적 시작
        locationService.startWatching();
      } else {
        setPermissionState('denied');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setPermissionState('denied');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeny = () => {
    setIsOpen(false);
    setPermissionState('denied');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* 모달 */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* 아이콘 헤더 */}
              <div className="bg-gradient-to-br from-primary to-blue-600 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4"
                >
                  <Navigation className="w-10 h-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  위치 권한이 필요합니다
                </h2>
                <p className="text-blue-100">
                  더 나은 여행 경험을 위해
                </p>
              </div>

              {/* 콘텐츠 */}
              <div className="p-6">
                {/* 기능 설명 */}
                <div className="space-y-4 mb-6">
                  <FeatureItem
                    icon={MapPin}
                    title="실시간 위치 추적"
                    description="현재 위치에서 다음 목적지까지의 거리와 경로를 확인하세요"
                  />
                  <FeatureItem
                    icon={Navigation}
                    title="자동 체크인"
                    description="목적지 도착 시 자동으로 체크인됩니다"
                  />
                  <FeatureItem
                    icon={Check}
                    title="배터리 효율"
                    description="하루 4% 미만의 배터리만 사용합니다"
                  />
                </div>

                {/* 권한 거부 안내 */}
                {permissionState === 'denied' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-red-800 mb-1">
                          위치 권한이 거부되었습니다
                        </p>
                        <p className="text-red-600">
                          브라우저 설정에서 위치 권한을 허용해주세요.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 버튼 */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDeny}
                    disabled={isRequesting}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200:bg-gray-600 transition-colors disabled:opacity-50 touch-manipulation"
                  >
                    나중에
                  </button>
                  <button
                    onClick={handleRequestPermission}
                    disabled={isRequesting}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
                  >
                    {isRequesting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>요청 중...</span>
                      </>
                    ) : (
                      '허용하기'
                    )}
                  </button>
                </div>

                {/* 개인정보 안내 */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  위치 정보는 기기에만 저장되며 서버로 전송되지 않습니다
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FeatureItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}
