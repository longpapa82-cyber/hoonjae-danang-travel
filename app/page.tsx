'use client';

import { useState } from 'react';
import { MobileLayout } from '@/components/MobileLayout';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';
import { BottomNavigation, TabType } from '@/components/BottomNavigation';
import { HomePage } from '@/components/pages/HomePage';
import { MapPage } from '@/components/pages/MapPage';
import { SchedulePage } from '@/components/pages/SchedulePage';
import { SettingsPage } from '@/components/pages/SettingsPage';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4">
          {/* 홈 탭에만 공통 헤더 표시 */}
          {activeTab === 'home' && (
            <header className="text-center mb-6 pt-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                🌴 훈재의 여행 계획표
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                2026.01.15 (목) - 01.19 (월)
              </p>
            </header>
          )}

          {/* 탭별 컨텐츠 */}
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'map' && <MapPage />}
          {activeTab === 'schedule' && <SchedulePage />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>

        {/* 하단 네비게이션 */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* FAB - 탭 변경 기능 연결 */}
        <FloatingActionButton onTabChange={setActiveTab} />

        {/* 위치 권한 모달 */}
        <LocationPermissionModal />
      </div>
    </MobileLayout>
  );
}
