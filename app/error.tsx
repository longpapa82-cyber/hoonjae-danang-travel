'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* 에러 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-8"
        >
          <AlertTriangle className="w-24 h-24 text-orange-500 mx-auto" />
        </motion.div>

        {/* 메시지 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            문제가 발생했습니다
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            일시적인 오류가 발생했습니다.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            {error.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
        </motion.div>

        {/* 액션 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            <span>다시 시도</span>
          </button>

          <Link href="/">
            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto">
              <Home className="w-5 h-5" />
              <span>홈으로</span>
            </button>
          </Link>
        </motion.div>

        {/* 추가 안내 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-sm text-gray-500 dark:text-gray-500"
        >
          문제가 계속되면 페이지를 새로고침하거나 나중에 다시 시도해주세요
        </motion.p>
      </motion.div>
    </div>
  );
}
