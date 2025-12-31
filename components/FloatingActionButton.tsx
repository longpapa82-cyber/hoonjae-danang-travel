'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, Map, Calendar, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { TabType } from './BottomNavigation';

interface FABAction {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
}

interface FloatingActionButtonProps {
  onTabChange: (tab: TabType) => void;
}

export function FloatingActionButton({ onTabChange }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: FABAction[] = [
    {
      id: 'home',
      icon: Home,
      label: '홈으로',
      color: 'bg-primary',
      onClick: () => {
        onTabChange('home');
        setIsOpen(false);
      },
    },
    {
      id: 'map',
      icon: Map,
      label: '지도 보기',
      color: 'bg-blue-500',
      onClick: () => {
        onTabChange('map');
        setIsOpen(false);
      },
    },
    {
      id: 'schedule',
      icon: Calendar,
      label: '일정 보기',
      color: 'bg-indigo-500',
      onClick: () => {
        onTabChange('schedule');
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      {/* 배경 오버레이 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* FAB 메뉴 */}
      <div className="fixed right-4 bottom-20 z-50 safe-area-bottom" role="region" aria-label="빠른 메뉴">
        {/* 액션 버튼들 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col gap-3 mb-3"
              role="menu"
              aria-orientation="vertical"
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    role="menuitem"
                    aria-label={action.label}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={action.onClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        action.onClick();
                      } else if (e.key === 'Escape') {
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-center gap-3 ${action.color} text-white rounded-full px-4 py-3 shadow-lg hover:scale-105 transition-transform touch-manipulation focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2`}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {action.label}
                    </span>
                    <Icon className="w-5 h-5" />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 메인 FAB 버튼 */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            } else if (e.key === 'Escape' && isOpen) {
              setIsOpen(false);
            }
          }}
          aria-label={isOpen ? '빠른 메뉴 닫기' : '빠른 메뉴 열기'}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            isOpen
              ? 'bg-gray-800'
              : 'bg-primary hover:bg-blue-600'
          }`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Plus className="w-6 h-6 text-white" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
