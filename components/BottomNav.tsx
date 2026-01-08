'use client';

import { Home, Map, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

type NavItem = 'home' | 'map' | 'timeline' | 'settings';

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home' as NavItem, icon: Home, label: '홈' },
    { id: 'map' as NavItem, icon: Map, label: '지도' },
    { id: 'timeline' as NavItem, icon: Calendar, label: '일정' },
    { id: 'settings' as NavItem, icon: Settings, label: '설정' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[64px] touch-manipulation"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* 활성 상태 인디케이터 */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* 아이콘 */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#3B82F6' : '#6B7280',
                }}
                transition={{ duration: 0.2 }}
                className="mb-1"
              >
                <Icon className="w-6 h-6" />
              </motion.div>

              {/* 라벨 */}
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
