'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

/**
 * Glassmorphism 카드 컴포넌트 (2025-2026 디자인 트렌드)
 *
 * Apple iOS 26 Liquid Glass 스타일
 * 반투명 유리 효과 + Blur 배경
 *
 * @param variant - default: 기본, strong: 진한 효과, subtle: 은은한 효과
 * @param blur - 블러 강도 (sm, md, lg, xl)
 * @param animated - 페이드인 애니메이션 여부
 */
export function GlassCard({
  children,
  className = '',
  variant = 'default',
  blur = 'xl',
  animated = false,
}: GlassCardProps) {
  // Variant별 스타일
  const variantStyles = {
    default: 'bg-white/30 dark:bg-gray-800/30 border-white/18',
    strong: 'bg-white/40 dark:bg-gray-800/40 border-white/25',
    subtle: 'bg-white/20 dark:bg-gray-800/20 border-white/10',
  };

  // Blur 강도
  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const cardContent = (
    <div
      className={`
        ${blurStyles[blur]}
        ${variantStyles[variant]}
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]
        border
        rounded-2xl
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
