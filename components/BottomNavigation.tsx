'use client';

import { motion } from 'framer-motion';
import { Home, Map, Calendar, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
  const tabRefs = useRef<Record<TabType, HTMLButtonElement | null>>({
    home: null,
    map: null,
    schedule: null,
    settings: null,
  });

  // 화살표 키 네비게이션 핸들러 (ARIA Authoring Practices)
  const handleKeyDown = (e: React.KeyboardEvent, currentTab: TabType) => {
    const currentIndex = tabs.findIndex(t => t.id === currentTab);
    let targetIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        targetIndex = (currentIndex + 1) % tabs.length; // 순환
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length; // 순환
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onTabChange(currentTab);
        return;
      default:
        return;
    }

    // 타겟 탭으로 포커스 이동 및 활성화
    const targetTab = tabs[targetIndex];
    onTabChange(targetTab.id);
    tabRefs.current[targetTab.id]?.focus();
  };
  return (
    <motion.nav
      data-testid="bottom-navigation"
      role="navigation"
      aria-label="주요 메뉴"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-t border-white/20 dark:border-gray-700/50 z-50 transition-all shadow-[0_-4px_16px_0_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_16px_0_rgba(0,0,0,0.3)]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                data-testid={`tab-${tab.id}`}
                role="tab"
                aria-label={`${tab.label} 탭`}
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={0}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="flex flex-col items-center gap-1 py-2 px-4 relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
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
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  aria-hidden="true"
                />

                {/* 라벨 */}
                <span
                  className={`text-xs font-medium relative z-10 transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
