'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { VietnamesePhrase } from '@/types/vietnamese';
import { PhraseCard } from './PhraseCard';

interface FavoritesListProps {
  phrases: VietnamesePhrase[];
  favorites: string[];
  onToggleFavorite: (phraseId: string) => void;
  maxDisplay?: number;
  onShowMore?: () => void;
}

export const FavoritesList = memo(function FavoritesList({
  phrases,
  favorites,
  onToggleFavorite,
  maxDisplay = 6,
  onShowMore
}: FavoritesListProps) {
  const favoritePhrases = phrases.filter(phrase => favorites.includes(phrase.id));
  const displayPhrases = favoritePhrases.slice(0, maxDisplay);
  const hasMore = favoritePhrases.length > maxDisplay;

  if (favoritePhrases.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          즐겨찾기한 표현이 없습니다
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          별 아이콘을 눌러 자주 쓰는 표현을 저장하세요
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            즐겨찾기
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({favoritePhrases.length})
          </span>
        </div>
      </div>

      {/* 즐겨찾기 목록 */}
      <div className="grid gap-3 md:grid-cols-2">
        {displayPhrases.map((phrase, index) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
            index={index}
          />
        ))}
      </div>

      {/* 더보기 버튼 */}
      {hasMore && onShowMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onShowMore}
          className="
            mt-4 w-full py-3 px-4
            bg-gray-100 dark:bg-gray-800
            hover:bg-gray-200 dark:hover:bg-gray-700
            border-2 border-gray-200 dark:border-gray-700
            rounded-xl
            flex items-center justify-center gap-2
            text-sm font-medium text-gray-700 dark:text-gray-300
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            touch-manipulation
          "
        >
          <span>더보기 ({favoritePhrases.length - maxDisplay}개)</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
});
