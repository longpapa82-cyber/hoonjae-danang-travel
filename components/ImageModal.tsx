'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ImageModalProps {
  imageUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ imageUrl, title, isOpen, onClose }: ImageModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6 text-gray-800 dark:text-gray-100" />
            </button>

            <div className="relative w-full h-[70vh]">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority
              />
            </div>

            <div className="p-4 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {title}
              </h3>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
