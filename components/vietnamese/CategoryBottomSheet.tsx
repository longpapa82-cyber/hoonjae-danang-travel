'use client';

import { memo } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { CategoryInfo, VietnamesePhrase } from '@/types/vietnamese';
import { PhraseList } from './PhraseList';
import { getPhrasesByCategory } from '@/lib/vietnameseData';

interface CategoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryInfo | null;
  favorites: string[];
  onToggleFavorite: (phraseId: string) => void;
}

export const CategoryBottomSheet = memo(function CategoryBottomSheet({
  isOpen,
  onClose,
  category,
  favorites,
  onToggleFavorite
}: CategoryBottomSheetProps) {
  if (!category) return null;

  const phrases = getPhrasesByCategory(category.id);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`${category.label} (${phrases.length}개)`}
    >
      <div className="pb-8">
        {/* 카테고리 설명 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {category.description}
        </p>

        {/* 표현 목록 */}
        <PhraseList
          phrases={phrases}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </BottomSheet>
  );
});
