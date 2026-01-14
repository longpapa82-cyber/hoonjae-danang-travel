'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = memo(function SearchBar({
  onSearch,
  placeholder = '한국어, 베트남어, 발음으로 검색...'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="relative">
      <div
        className={`
          relative flex items-center gap-2
          bg-white dark:bg-gray-800
          border-2 rounded-xl
          transition-all
          ${isFocused
            ? 'border-primary dark:border-blue-400 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 shadow-sm'
          }
        `}
      >
        {/* 검색 아이콘 */}
        <Search
          className={`
            absolute left-3 w-5 h-5 transition-colors
            ${isFocused
              ? 'text-primary dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-500'
            }
          `}
          aria-hidden="true"
        />

        {/* 입력 필드 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-10 py-3
            bg-transparent
            text-gray-800 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none
          "
          aria-label="베트남어 표현 검색"
        />

        {/* 지우기 버튼 */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="
                absolute right-3
                p-1 rounded-lg
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors
                touch-manipulation
              "
              aria-label="검색어 지우기"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 검색 결과 카운트 */}
      {query && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <span className="sr-only">검색 중:</span> &quot;{query}&quot;
        </motion.p>
      )}
    </div>
  );
});
