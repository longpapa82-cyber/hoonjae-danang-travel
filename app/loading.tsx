'use client';

import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* 비행기 애니메이션 */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mb-6"
        >
          <Plane className="w-16 h-16 text-primary mx-auto" />
        </motion.div>

        {/* 로딩 텍스트 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            여행 정보 로딩 중...
          </h2>
        </motion.div>

        {/* 로딩 바 */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto mt-4">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </div>
  );
}
