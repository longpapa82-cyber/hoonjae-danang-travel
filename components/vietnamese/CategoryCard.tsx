'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { CategoryInfo } from '@/types/vietnamese';
import { getCategoryPhraseCount } from '@/lib/vietnameseData';
import * as Icons from 'lucide-react';

interface CategoryCardProps {
  category: CategoryInfo;
  onClick: () => void;
  index: number;
}

// 색상 매핑
const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-700',
    text: 'text-orange-700 dark:text-orange-300',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    text: 'text-green-700 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-700',
    text: 'text-indigo-700 dark:text-indigo-300',
    icon: 'text-indigo-600 dark:text-indigo-400'
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-700',
    text: 'text-teal-700 dark:text-teal-300',
    icon: 'text-teal-600 dark:text-teal-400'
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    icon: 'text-gray-600 dark:text-gray-400'
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-200 dark:border-pink-700',
    text: 'text-pink-700 dark:text-pink-300',
    icon: 'text-pink-600 dark:text-pink-400'
  }
};

export const CategoryCard = memo(function CategoryCard({
  category,
  onClick,
  index
}: CategoryCardProps) {
  const Icon = (Icons as any)[category.iconName] || Icons.Circle;
  const phraseCount = getCategoryPhraseCount(category.id);
  const colors = colorClasses[category.color] || colorClasses.gray;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${colors.bg} ${colors.border}
        border-2 rounded-xl p-4
        hover:shadow-lg transition-all
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        touch-manipulation
      `}
      aria-label={`${category.label} 카테고리 열기, ${phraseCount}개 표현`}
    >
      {/* 아이콘 */}
      <div className="flex justify-center mb-2">
        <div className={`${colors.icon} p-3 rounded-full bg-white/50 dark:bg-black/20`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>

      {/* 카테고리 이름 */}
      <h3 className={`text-sm font-bold mb-1 ${colors.text}`}>
        {category.label}
      </h3>

      {/* 표현 개수 */}
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {phraseCount}개
      </p>
    </motion.button>
  );
});
