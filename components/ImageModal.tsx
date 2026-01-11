'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Download, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ImageModalProps {
  imageUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ imageUrl, title, isOpen, onClose }: ImageModalProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1); // 모달 열 때 줌 초기화
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 이미지 다운로드
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('이미지 다운로드 실패:', error);
    }
  };

  // 이미지 공유
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `다낭 여행 - ${title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    }
  };

  // 줌 인/아웃
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* 상단 툴바 */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
              <h3 id="image-modal-title" className="text-lg font-bold text-white truncate flex-1">
                {title}
              </h3>
              <button
                onClick={onClose}
                aria-label="이미지 닫기"
                className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ml-4"
              >
                <X className="w-6 h-6 text-gray-800" aria-hidden="true" />
              </button>
            </div>

            {/* 이미지 영역 */}
            <div className="relative w-full h-[70vh] overflow-hidden bg-gray-100 dark:bg-gray-800">
              <motion.div
                style={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full h-full"
              >
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  priority
                />
              </motion.div>
            </div>

            {/* 하단 툴바 */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/50 to-transparent">
              {/* 줌 컨트롤 */}
              <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-full p-2">
                <button
                  onClick={handleZoomOut}
                  aria-label="축소"
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-5 h-5 text-gray-800 dark:text-white" />
                </button>
                <span className="text-sm font-medium text-gray-800 dark:text-white min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  aria-label="확대"
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-5 h-5 text-gray-800 dark:text-white" />
                </button>
              </div>

              {/* 다운로드 버튼 */}
              <button
                onClick={handleDownload}
                aria-label="이미지 다운로드"
                className="p-3 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Download className="w-5 h-5 text-gray-800 dark:text-white" />
              </button>

              {/* 공유 버튼 (Web Share API 지원 시) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleShare}
                  aria-label="이미지 공유"
                  className="p-3 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Share2 className="w-5 h-5 text-gray-800 dark:text-white" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
