'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, X } from 'lucide-react';

export type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

interface InteractiveButtonProps {
  children: ReactNode;
  onClick: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

/**
 * Interactive Button with Microinteractions
 *
 * 2025-2026 트렌드: Button Feedback Animations
 * - Success: Scale + Green background
 * - Error: Shake + Red background
 * - Loading: Spinner animation
 *
 * 사용 예시:
 * <InteractiveButton onClick={async () => await saveData()}>
 *   저장하기
 * </InteractiveButton>
 */
export function InteractiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: InteractiveButtonProps) {
  const [status, setStatus] = useState<ButtonStatus>('idle');

  const handleClick = async () => {
    if (status === 'loading' || disabled) return;

    setStatus('loading');

    try {
      await onClick();
      setStatus('success');

      // 2초 후 idle로 복귀
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');

      // 2초 후 idle로 복귀
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  // Variant별 스타일
  const variantStyles = {
    primary: 'bg-primary hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-success hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  // Size별 스타일
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Status별 배경색
  const statusColor =
    status === 'success'
      ? '#10B981'
      : status === 'error'
      ? '#EF4444'
      : undefined;

  return (
    <motion.button
      whileTap={status === 'idle' ? { scale: 0.95 } : {}}
      animate={
        status === 'success'
          ? {
              scale: [1, 1.05, 1],
              backgroundColor: statusColor,
            }
          : status === 'error'
          ? {
              x: [-10, 10, -10, 10, 0],
              backgroundColor: statusColor,
            }
          : {}
      }
      transition={{
        duration: status === 'success' ? 0.5 : status === 'error' ? 0.4 : 0.2,
      }}
      onClick={handleClick}
      disabled={disabled || status === 'loading'}
      className={`
        relative
        rounded-xl
        font-semibold
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-primary
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {/* 로딩 상태 */}
      {status === 'loading' && (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>처리 중...</span>
        </span>
      )}

      {/* 성공 상태 */}
      {status === 'success' && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>완료!</span>
        </motion.span>
      )}

      {/* 에러 상태 */}
      {status === 'error' && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          <span>실패</span>
        </motion.span>
      )}

      {/* 기본 상태 */}
      {status === 'idle' && children}
    </motion.button>
  );
}
