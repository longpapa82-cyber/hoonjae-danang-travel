'use client';

import { motion } from 'framer-motion';
import { Home, Map, Calendar, Settings } from 'lucide-react';
import { useState } from 'react';

export type TabType = 'home' | 'map' | 'schedule' | 'settings';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'home' as TabType, label: '홈', icon: Home },
  { id: 'map' as TabType, label: '지도', icon: Map },
  { id: 'schedule' as TabType, label: '일정', icon: Calendar },
  { id: 'settings' as TabType, label: '설정', icon: Settings },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-1 py-2 px-4 relative"
              >
                {/* 활성 표시 */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* 아이콘 */}
                <Icon
                  className={`w-6 h-6 relative z-10 transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />

                {/* 라벨 */}
                <span
                  className={`text-xs font-medium relative z-10 transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
