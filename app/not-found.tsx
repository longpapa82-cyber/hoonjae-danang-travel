'use client';

import { motion } from 'framer-motion';
import { Home, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* 404 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <MapPin className="w-32 h-32 text-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-primary">404</span>
            </div>
          </div>
        </motion.div>

        {/* 메시지 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            길을 잃으셨나요?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            요청하신 페이지를 찾을 수 없습니다.
          </p>
        </motion.div>

        {/* 홈으로 돌아가기 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/">
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl mx-auto">
              <Home className="w-5 h-5" />
              <span>홈으로 돌아가기</span>
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
          다낭 여행 일정을 확인하시려면 홈 화면으로 이동해주세요
        </motion.p>
      </motion.div>
    </div>
  );
}
