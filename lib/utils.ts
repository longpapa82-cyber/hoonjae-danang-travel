import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스명 병합 유틸리티
 *
 * clsx와 tailwind-merge를 조합하여
 * 중복되는 Tailwind 클래스를 제거하고 병합합니다.
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
