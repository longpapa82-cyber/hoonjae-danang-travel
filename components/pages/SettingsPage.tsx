'use client';

import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Globe,
  MapPin,
  Info,
  ChevronRight,
  Calendar,
  RotateCcw,
  Moon,
  Sun,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

// React.memo로 불필요한 리렌더링 방지
export const SettingsPage = memo(function SettingsPage() {
  const { mode, activeTheme, setMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [testDate, setTestDate] = useState('');

  // 테스트 모드 상태 로드
  useEffect(() => {
    const savedTestDate = localStorage.getItem('testDate');
    if (savedTestDate) {
      setTestMode(true);
      setTestDate(savedTestDate);
    }
  }, []);

  // 테스트 날짜 설정
  const setTestDateTime = (dateStr: string) => {
    localStorage.setItem('testDate', dateStr);
    setTestDate(dateStr);
    setTestMode(true);
    window.location.reload(); // 페이지 새로고침으로 모든 컴포넌트 업데이트
  };

  // 테스트 모드 해제
  const resetTestMode = () => {
    localStorage.removeItem('testDate');
    setTestMode(false);
    setTestDate('');
    window.location.reload();
  };

  // 빠른 설정 함수
  const setQuickTest = (scenario: string) => {
    const scenarios: Record<string, string> = {
      '1일차-시작': '2026-01-15T10:00:00+09:00',
      '1일차-공항': '2026-01-15T15:00:00+09:00',
      '1일차-도착': '2026-01-15T22:00:00+09:00',
      '2일차-아침': '2026-01-16T09:00:00+09:00',
      '2일차-마사지': '2026-01-16T10:30:00+09:00',
      '2일차-오행산': '2026-01-16T13:30:00+09:00',
      '2일차-호이안': '2026-01-16T18:00:00+09:00',
      '3일차-바나힐스': '2026-01-17T10:00:00+09:00',
      '3일차-미케비치': '2026-01-17T16:00:00+09:00',
      '4일차-대성당': '2026-01-18T13:00:00+09:00',
      '5일차-귀국': '2026-01-19T05:35:00+09:00',
    };

    const dateStr = scenarios[scenario];
    if (dateStr) {
      setTestDateTime(dateStr);
    }
  };

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
        {/* 테마 설정 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              {activeTheme === 'dark' ? (
                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                테마
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === 'auto' ? '자동 (시간대별)' : mode === 'dark' ? '다크 모드' : '라이트 모드'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMode('light')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                mode === 'light'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs font-medium">라이트</span>
            </button>

            <button
              onClick={() => setMode('dark')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                mode === 'dark'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs font-medium">다크</span>
            </button>

            <button
              onClick={() => setMode('auto')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                mode === 'auto'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-medium">자동</span>
            </button>
          </div>

          {mode === 'auto' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg"
            >
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                💡 18:00 ~ 06:00 시간대에는 자동으로 다크 모드가 활성화됩니다.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* 알림 설정 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  알림
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  일정 알림 받기
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notifications
                  ? 'bg-primary'
                  : 'bg-gray-300 dark:bg-gray-600'
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
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  위치 추적
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  실시간 위치 공유
                </p>
              </div>
            </div>
            <button
              onClick={() => setLocationTracking(!locationTracking)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                locationTracking
                  ? 'bg-primary'
                  : 'bg-gray-300 dark:bg-gray-600'
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
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <button className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  언어
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  한국어
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </motion.div>

        {/* 테스트 모드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                테스트 모드
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {testMode ? '활성화됨' : '비활성화됨'}
              </p>
            </div>
          </div>

          {testMode && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                현재 시간: {new Date(testDate).toLocaleString('ko-KR')}
              </p>
              <button
                onClick={resetTestMode}
                className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                실제 시간으로 복구
              </button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">빠른 테스트:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setQuickTest('1일차-시작')}
                className="px-3 py-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                1일차 시작
              </button>
              <button
                onClick={() => setQuickTest('1일차-도착')}
                className="px-3 py-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                1일차 도착
              </button>
              <button
                onClick={() => setQuickTest('2일차-마사지')}
                className="px-3 py-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              >
                2일차 마사지
              </button>
              <button
                onClick={() => setQuickTest('2일차-호이안')}
                className="px-3 py-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              >
                2일차 호이안
              </button>
              <button
                onClick={() => setQuickTest('3일차-바나힐스')}
                className="px-3 py-2 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
              >
                3일차 바나힐스
              </button>
              <button
                onClick={() => setQuickTest('4일차-대성당')}
                className="px-3 py-2 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-lg text-sm hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
              >
                4일차 대성당
              </button>
            </div>
          </div>
        </motion.div>

        {/* 데이터 초기화 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                데이터 초기화
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                앱 데이터 삭제
              </p>
            </div>
          </div>

          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              ⚠️ 여행 진행 상태, 즐겨찾기 등 모든 저장된 데이터가 삭제됩니다.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('정말로 모든 데이터를 삭제하시겠습니까?\n\n삭제된 데이터는 복구할 수 없습니다.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            모든 데이터 삭제
          </button>
        </motion.div>

        {/* 앱 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Info className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                앱 정보
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                버전 1.0.0
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});
