'use client';

import { motion, AnimatePresence, PanInfo, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[]; // 0-100 백분율
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [90], // 기본 90% 높이
}: BottomSheetProps) {
  const y = useMotionValue(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // 아래로 200px 이상 드래그하면 닫기
    if (info.offset.y > 200 || info.velocity.y > 500) {
      onClose();
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
          >
            {/* 드래그 핸들 */}
            <div className="flex flex-col items-center pt-3 pb-2 px-4">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mb-4" />

              {/* 헤더 */}
              {title && (
                <div className="flex items-center justify-between w-full mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                    aria-label="닫기"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 overflow-y-auto px-4 pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
