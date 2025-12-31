'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Globe,
  MapPin,
  Info,
  ChevronRight,
} from 'lucide-react';

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white"
      >
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold">설정</h1>
            <p className="text-sm text-blue-50">앱 환경설정</p>
          </div>
        </div>
      </motion.div>

      {/* 설정 항목들 */}
      <div className="space-y-4">
        {/* 알림 설정 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  알림
                </h3>
                <p className="text-sm text-gray-500">
                  일정 알림 받기
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notifications
                  ? 'bg-primary'
                  : 'bg-gray-300'
              }`}
            >
              <motion.div
                layout
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ left: notifications ? '30px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </motion.div>

        {/* 위치 추적 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  위치 추적
                </h3>
                <p className="text-sm text-gray-500">
                  실시간 위치 공유
                </p>
              </div>
            </div>
            <button
              onClick={() => setLocationTracking(!locationTracking)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                locationTracking
                  ? 'bg-primary'
                  : 'bg-gray-300'
              }`}
            >
              <motion.div
                layout
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ left: locationTracking ? '30px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </motion.div>

        {/* 언어 설정 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <button className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">
                  언어
                </h3>
                <p className="text-sm text-gray-500">
                  한국어
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </motion.div>

        {/* 앱 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Info className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                앱 정보
              </h3>
              <p className="text-sm text-gray-500">
                버전 1.0.0
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
